import dbConnect from '../../../lib/mongodb';
import Product from '../../../models/Product';

export default async function handler(req, res) {
  await dbConnect();

  switch (req.method) {
    case 'GET':
      try {
        const showAll = req.query.admin === 'true';
        
        // --- 1. Definir Paginación/Límite Condicionalmente ---
        // Si es admin, establecemos un límite de 0 (o un número grande) y skip en 0 para obtener todos.
        // Si no es admin (vista pública), usamos los valores de la query o los valores por defecto (12).
        const limit = showAll ? 0 : (parseInt(req.query.limit) || 12);
        const page = parseInt(req.query.page) || 1;
        const skip = showAll ? 0 : (page - 1) * limit;
        
        // --- 2. Definir Filtro Condicionalmente ---
        // Si es admin, no hay filtro ({}). Si no, solo productos activos.
        const filter = showAll ? {} : { activo: true };
        
        // --- 3. Construir la Consulta ---
        let query = Product.find(filter);

        // Aplicar skip y limit SOLO si no es una solicitud de 'showAll' o si se especificó paginación.
        // Mongoose ignora .limit(0) pero lo incluimos para claridad.
        if (limit > 0) {
            query = query.skip(skip).limit(limit);
        }

        // Definir la ordenación (Admin puede querer orden alfabético; Público, los más recientes)
        if (showAll) {
            query = query.sort({ codigo: 1 }); // Por ejemplo, ordenar por código ascendente para el Admin
        } else {
            query = query.sort({ createdAt: -1 }); // Por ejemplo, ordenar por fecha de creación (últimos) para el público
        }
        
        // --- 4. Ejecutar la Consulta y Conteo ---
        const products = await query.exec();
        
        // Obtener el total de productos (sin paginación)
        const totalProducts = await Product.countDocuments(filter);
        
        // --- 5. Calcular Datos de Paginación para la Respuesta ---
        const finalLimit = showAll ? totalProducts : limit; // El límite final es el total si es admin
        const totalPages = finalLimit > 0 ? Math.ceil(totalProducts / finalLimit) : 1;
        const hasMore = showAll ? false : (skip + products.length < totalProducts);
        
        res.status(200).json({ 
          success: true, 
          data: products,
          pagination: {
            page: showAll ? 1 : page,
            limit: finalLimit,
            total: totalProducts,
            hasMore,
            totalPages
          }
        });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'POST':
      try {
        // Validación de código duplicado
        if (req.body.codigo) {
          const existingProduct = await Product.findOne({ codigo: req.body.codigo });
          if (existingProduct) {
            return res.status(400).json({ 
              success: false, 
              error: 'Ya existe un producto con este código' 
            });
          }
        }

        const product = await Product.create(req.body);
        res.status(201).json({ success: true, data: product });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.status(405).json({ success: false, message: 'Método no permitido' });
  }
}
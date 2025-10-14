import dbConnect from '../../../lib/mongodb';
import Product from '../../../models/Product';

export default async function handler(req, res) {
  await dbConnect();

  switch (req.method) {
    case 'GET':
      try {
        // Para la tienda principal, solo mostrar productos activos
        // Para el admin, mostrar todos
        const showAll = req.query.admin === 'true';
        
        const filter = showAll ? {} : { activo: true };
        
        const products = await Product.find(filter);
        res.status(200).json({ success: true, data: products });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'POST':
      try {
        console.log('Datos recibidos para crear producto:', req.body);
        
        // Validar que no exista un producto con el mismo código
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
        console.error('Error creando producto:', error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.status(405).json({ success: false, message: 'Método no permitido' });
  }
}
import dbConnect from '../../../lib/mongodb';
import Category from '../../../models/Category';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  console.log('=== API categories/index ===');
  console.log('Method:', req.method);
  
  await dbConnect();

  switch (req.method) {
    case 'GET':
      try {
        const showAll = req.query.admin === 'true';
        const filter = showAll ? {} : { activa: true };
        
        console.log('GET categories, showAll:', showAll, 'filter:', filter);
        
        const categories = await Category.find(filter).sort({ nombre: 1 });
        console.log('✅ Categorías encontradas:', categories.length);
        res.status(200).json({ success: true, data: categories });
      } catch (error) {
        console.log('❌ Error GET:', error.message);
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'POST':
      // Verificar autenticación
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        console.log('❌ Token no proporcionado');
        return res.status(401).json({ success: false, message: 'Token no proporcionado' });
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
        console.log('✅ Token válido, usuario:', decoded.email, 'rol:', decoded.rol);
        
        if (decoded.rol !== 'admin') {
          console.log('❌ Usuario no es admin');
          return res.status(403).json({ success: false, message: 'Acceso denegado - Se requiere rol admin' });
        }

        const { nombre, descripcion, imagen } = req.body;
        console.log('POST datos:', { nombre, descripcion, imagen });

        if (!nombre || nombre.trim() === '') {
          console.log('❌ Nombre vacío');
          return res.status(400).json({ 
            success: false, 
            message: 'El nombre es requerido' 
          });
        }

        // Validar que no exista una categoría con el mismo nombre
        const existingCategory = await Category.findOne({ 
          nombre: { $regex: new RegExp(`^${nombre.trim()}$`, 'i') }
        });

        if (existingCategory) {
          console.log('❌ Categoría duplicada:', nombre);
          return res.status(400).json({ 
            success: false, 
            message: 'Ya existe una categoría con este nombre' 
          });
        }

        const category = await Category.create({
          nombre: nombre.trim(),
          descripcion: descripcion || '',
          imagen: imagen || '/images/category-placeholder.jpg',
          activa: true
        });

        console.log('✅ Categoría creada:', category.nombre);
        res.status(201).json({ success: true, data: category });
      } catch (error) {
        if (error.name === 'JsonWebTokenError') {
          console.log('❌ Token inválido');
          return res.status(401).json({ success: false, message: 'Token inválido' });
        }
        console.log('❌ Error POST:', error.message);
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      console.log('❌ Método no permitido:', req.method);
      res.status(405).json({ success: false, message: 'Método no permitido' });
  }
}
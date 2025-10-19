import dbConnect from '../../../lib/mongodb';
import Category from '../../../models/Category';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  const { id } = req.query;
  
  console.log('=== API categories/[id] ===');
  console.log('Method:', req.method);
  console.log('ID:', id);
  
  await dbConnect();

  // Verificar autenticación para todos los métodos
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
  } catch (error) {
    console.log('❌ Token inválido:', error.message);
    return res.status(401).json({ success: false, message: 'Token inválido' });
  }

  switch (req.method) {
    case 'GET':
      try {
        const category = await Category.findById(id);
        if (!category) {
          console.log('❌ Categoría no encontrada');
          return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
        }
        console.log('✅ Categoría encontrada:', category.nombre);
        res.status(200).json({ success: true, data: category });
      } catch (error) {
        console.log('❌ Error GET:', error.message);
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'PUT':
      try {
        console.log('Body recibido:', req.body);
        const updateData = { ...req.body };
        
        // Si se está cambiando el nombre, verificar que no exista otra categoría con ese nombre
        if (updateData.nombre) {
          const existingCategory = await Category.findOne({ 
            nombre: { $regex: new RegExp(`^${updateData.nombre.trim()}$`, 'i') },
            _id: { $ne: id } // Excluir la categoría actual
          });

          if (existingCategory) {
            console.log('❌ Nombre duplicado');
            return res.status(400).json({ 
              success: false, 
              message: 'Ya existe otra categoría con este nombre' 
            });
          }
          
          updateData.nombre = updateData.nombre.trim();
        }

        const category = await Category.findByIdAndUpdate(id, updateData, {
          new: true,
          runValidators: true,
        });
        
        if (!category) {
          console.log('❌ Categoría no encontrada para actualizar');
          return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
        }
        
        console.log('✅ Categoría actualizada:', category.nombre);
        res.status(200).json({ success: true, data: category });
      } catch (error) {
        console.log('❌ Error PUT:', error.message);
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'DELETE':
      try {
        const deletedCategory = await Category.findByIdAndDelete(id);
        if (!deletedCategory) {
          console.log('❌ Categoría no encontrada para eliminar');
          return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
        }
        console.log('✅ Categoría eliminada:', deletedCategory.nombre);
        res.status(200).json({ success: true, message: 'Categoría eliminada exitosamente' });
      } catch (error) {
        console.log('❌ Error DELETE:', error.message);
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      console.log('❌ Método no permitido:', req.method);
      res.status(405).json({ success: false, message: 'Método no permitido' });
  }
}
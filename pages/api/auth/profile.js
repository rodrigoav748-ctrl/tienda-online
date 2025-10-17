import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== 'PUT') {
    return res.status(405).json({ success: false, message: 'Método no permitido' });
  }

  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    const { nombre, email, telefono, direccion } = req.body;
    
    user.nombre = nombre || user.nombre;
    user.email = email || user.email;
    user.telefono = telefono || user.telefono;
    user.direccion = direccion || user.direccion;

    await user.save();

    const userResponse = {
      _id: user._id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      telefono: user.telefono,
      direccion: user.direccion,
      fecha_registro: user.fecha_registro
    };

    res.status(200).json({
      success: true,
      user: userResponse
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error del servidor',
      error: error.message 
    });
  }
}
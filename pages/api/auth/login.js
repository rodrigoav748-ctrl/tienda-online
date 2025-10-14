import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método no permitido' });
  }

  await dbConnect();

  try {
    const { email, password } = req.body;

    // Buscar usuario
    const user = await User.findOne({ email, activo: true });
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      });
    }

    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: 'Contraseña incorrecta' 
      });
    }

    // Crear token
    const token = jwt.sign(
      { userId: user._id, email: user.email, rol: user.rol },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    // Devolver usuario (sin password)
    const userResponse = {
      _id: user._id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      fecha_registro: user.fecha_registro
    };

    res.status(200).json({
      success: true,
      token,
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
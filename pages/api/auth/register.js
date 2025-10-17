import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método no permitido' });
  }

  await dbConnect();

  try {
    const { nombre, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'El email ya está registrado' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      nombre,
      email,
      password: hashedPassword,
      rol: 'cliente'
    });

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      userId: user._id
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error del servidor',
      error: error.message 
    });
  }
}
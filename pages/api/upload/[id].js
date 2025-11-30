// pages/api/uploads/[id].js
import { connectToDatabase } from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id || id === 'undefined') {
    return res.status(400).json({ error: 'ID de imagen requerido' });
  }

  try {
    const { db } = await connectToDatabase();

    // Buscar imagen en MongoDB
    const image = await db.collection('images').findOne({ 
      _id: new ObjectId(id) 
    });

    if (!image) {
      return res.status(404).json({ error: 'Imagen no encontrada' });
    }

    // Configurar headers
    res.setHeader('Content-Type', image.mimetype);
    res.setHeader('Content-Length', image.size);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    // Enviar imagen
    res.send(image.buffer);

  } catch (error) {
    console.error('Error serving image:', error);
    res.status(500).json({ error: 'Error al cargar la imagen' });
  }
}
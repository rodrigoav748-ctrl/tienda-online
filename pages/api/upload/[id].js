// pages/api/uploads/[id].js
import dbConnect from '../../../lib/mongodb';
import Image from '../../../models/Image';

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id || id === 'undefined') {
    return res.status(400).json({ error: 'ID de imagen requerido' });
  }

  try {
    await dbConnect();

    // Buscar la imagen en la base de datos
    const image = await Image.findById(id);

    if (!image) {
      return res.status(404).json({ error: 'Imagen no encontrada' });
    }

    // Configurar headers para cache
    res.setHeader('Content-Type', image.mimetype);
    res.setHeader('Content-Length', image.size);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Content-Disposition', `inline; filename="${image.originalName}"`);

    // Enviar el buffer de la imagen
    res.send(image.buffer);

  } catch (error) {
    console.error('Error serving image:', error);
    res.status(500).json({ error: 'Error al cargar la imagen' });
  }
}
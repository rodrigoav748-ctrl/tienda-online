// pages/api/uploads/[id].js - VERSIÓN MEJORADA
import dbConnect from '../../../lib/mongodb';
import Image from '../../../models/Image';

export default async function handler(req, res) {
  const { id } = req.query;

  console.log('🔍 Serving image with ID:', id);

  if (!id || id === 'undefined') {
    return res.status(400).json({ error: 'ID de imagen requerido' });
  }

  try {
    await dbConnect();
    console.log('📡 Connected to database');

    // Buscar la imagen en la base de datos
    const image = await Image.findById(id);

    if (!image) {
      console.log('❌ Image not found in database');
      return res.status(404).json({ error: 'Imagen no encontrada' });
    }

    console.log('✅ Image found:', {
      id: image._id,
      size: image.size,
      type: image.mimetype,
      filename: image.filename
    });

    // Configurar headers para cache
    res.setHeader('Content-Type', image.mimetype);
    res.setHeader('Content-Length', image.size);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Content-Disposition', `inline; filename="${image.originalName}"`);

    console.log('📤 Sending image buffer...');
    
    // Enviar el buffer de la imagen
    res.send(image.buffer);

  } catch (error) {
    console.error('❌ Error serving image:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'ID de imagen inválido' });
    }
    
    res.status(500).json({ 
      error: 'Error al cargar la imagen',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
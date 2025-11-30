// pages/api/upload/image.js
import { connectToDatabase } from '../../../../lib/mongodb';
import { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Método no permitido' 
    });
  }

  try {
    // Parsear formulario
    const data = await new Promise((resolve, reject) => {
      const form = new IncomingForm({
        maxFileSize: 5 * 1024 * 1024, // 5MB
      });

      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });

    const { files } = data;
    const uploadedFile = Array.isArray(files.image) ? files.image[0] : files.image;

    if (!uploadedFile) {
      return res.status(400).json({ 
        success: false, 
        message: 'No se recibió ninguna imagen' 
      });
    }

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(uploadedFile.mimetype)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Tipo de archivo no permitido' 
      });
    }

    // Conectar a MongoDB
    const { db } = await connectToDatabase();

    // Leer archivo como buffer
    const fileBuffer = await fs.readFile(uploadedFile.filepath);
    
    // Generar nombre único
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const fileExtension = uploadedFile.originalFilename.split('.').pop();
    const filename = `image-${timestamp}-${randomStr}.${fileExtension}`;

    // Crear documento en MongoDB
    const imageDoc = {
      filename,
      originalName: uploadedFile.originalFilename,
      mimetype: uploadedFile.mimetype,
      size: uploadedFile.size,
      buffer: fileBuffer,
      uploadedAt: new Date(),
    };

    // Insertar en la colección 'images'
    const result = await db.collection('images').insertOne(imageDoc);

    // Limpiar archivo temporal
    await fs.unlink(uploadedFile.filepath);

    // Generar URL
    const imageUrl = `/api/uploads/${result.insertedId}`;

    res.status(200).json({
      success: true,
      imageUrl,
      fileId: result.insertedId,
      message: 'Imagen subida exitosamente'
    });

  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor'
    });
  }
}
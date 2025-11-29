// pages/api/upload-image.js - VERSIÓN CORREGIDA
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método no permitido' });
  }

  try {
    // Crear directorio de uploads si no existe
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Configurar formidable con la nueva API (v3+)
    const form = formidable({
      uploadDir: uploadDir,
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
      filename: (name, ext, part) => {
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        return `product-${timestamp}-${randomStr}${ext}`;
      },
    });

    // Parsear el request
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Error al parsear:', err);
        return res.status(500).json({ 
          success: false, 
          message: 'Error al procesar la imagen',
          error: err.message 
        });
      }

      console.log('Files recibidos:', files);

      // Manejar tanto formidable v2 como v3
      let uploadedFile;
      
      if (files.image) {
        // Puede ser un array o un objeto
        uploadedFile = Array.isArray(files.image) ? files.image[0] : files.image;
      }

      if (!uploadedFile) {
        return res.status(400).json({ 
          success: false, 
          message: 'No se encontró ninguna imagen' 
        });
      }

      console.log('Archivo procesado:', uploadedFile);

      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      const mimeType = uploadedFile.mimetype || uploadedFile.type;

      if (!allowedTypes.includes(mimeType)) {
        // Eliminar archivo no válido
        try {
          const filePath = uploadedFile.filepath || uploadedFile.path;
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (unlinkErr) {
          console.error('Error al eliminar archivo:', unlinkErr);
        }
        
        return res.status(400).json({ 
          success: false, 
          message: 'Tipo de archivo no permitido. Usa JPG, PNG, GIF o WebP' 
        });
      }

      // Obtener ruta del archivo
      const filePath = uploadedFile.filepath || uploadedFile.path;
      const filename = path.basename(filePath);
      const imageUrl = `/uploads/${filename}`;

      console.log('Imagen guardada:', imageUrl);

      return res.status(200).json({ 
        success: true, 
        imageUrl,
        message: 'Imagen subida exitosamente' 
      });
    });

  } catch (error) {
    console.error('Error general:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error del servidor',
      error: error.message 
    });
  }
}
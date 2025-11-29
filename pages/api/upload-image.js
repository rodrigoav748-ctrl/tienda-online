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

    // Configurar formidable
    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB máximo
      filename: (name, ext, part, form) => {
        // Generar nombre único para el archivo
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        return `product-${timestamp}-${randomStr}${ext}`;
      },
    });

    // Parsear el formulario
    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error('Error al parsear formulario:', err);
        return res.status(500).json({ 
          success: false, 
          message: 'Error al procesar la imagen' 
        });
      }

      // Obtener el archivo subido
      const file = files.image;
      
      if (!file) {
        return res.status(400).json({ 
          success: false, 
          message: 'No se encontró ninguna imagen' 
        });
      }

      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      const fileArray = Array.isArray(file) ? file : [file];
      const uploadedFile = fileArray[0];

      if (!allowedTypes.includes(uploadedFile.mimetype)) {
        // Eliminar archivo no válido
        fs.unlinkSync(uploadedFile.filepath);
        return res.status(400).json({ 
          success: false, 
          message: 'Tipo de archivo no permitido. Usa JPG, PNG, GIF o WebP' 
        });
      }

      // Obtener el nombre del archivo guardado
      const filename = path.basename(uploadedFile.filepath);
      const imageUrl = `/uploads/${filename}`;

      res.status(200).json({ 
        success: true, 
        imageUrl,
        message: 'Imagen subida exitosamente' 
      });
    });

  } catch (error) {
    console.error('Error al subir imagen:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error del servidor',
      error: error.message 
    });
  }
}
// pages/api/images/[fileId].js - SERVIR IMÁGENES DESDE MONGODB
import { MongoClient, GridFSBucket } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI);

export default async function handler(req, res) {
  const { fileId } = req.query;

  if (!fileId) {
    return res.status(400).json({ error: 'ID de archivo requerido' });
  }

  let mongoClient;

  try {
    mongoClient = await client.connect();
    const db = mongoClient.db();
    const bucket = new GridFSBucket(db, { bucketName: 'images' });

    // Buscar el archivo en GridFS
    const files = await bucket.find({ _id: new ObjectId(fileId) }).toArray();
    
    if (!files || files.length === 0) {
      return res.status(404).json({ error: 'Imagen no encontrada' });
    }

    const file = files[0];

    // Configurar headers
    res.setHeader('Content-Type', file.contentType);
    res.setHeader('Content-Length', file.length);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache por 1 año

    // Stream de la imagen al response
    const downloadStream = bucket.openDownloadStream(new ObjectId(fileId));

    downloadStream.pipe(res);

    downloadStream.on('error', () => {
      res.status(404).json({ error: 'Error al cargar la imagen' });
    });

  } catch (error) {
    console.error('Error al servir imagen:', error);
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    if (mongoClient) {
      await mongoClient.close();
    }
  }
}
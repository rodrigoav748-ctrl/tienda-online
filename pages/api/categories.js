import dbConnect from '../../lib/mongodb';
import Category from '../../models/Category';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const categories = await Category.find({ activa: true });
      res.status(200).json({ success: true, data: categories });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  } else {
    res.status(405).json({ success: false, message: 'Método no permitido' });
  }
}
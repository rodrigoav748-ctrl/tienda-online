import dbConnect from '../../../lib/mongodb';
import Product from '../../../models/Product';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método no permitido' });
  }

  await dbConnect();

  try {
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: 'Stock insuficiente' });
    }

    product.stock -= quantity;
    await product.save();

    res.status(200).json({ success: true, message: 'Stock actualizado' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error del servidor', error: error.message });
  }
}
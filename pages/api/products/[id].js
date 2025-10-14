import dbConnect from '../../../lib/mongodb';
import Product from '../../../models/Product';

export default async function handler(req, res) {
  const { id } = req.query;
  await dbConnect();

  switch (req.method) {
    case 'GET':
      try {
        const product = await Product.findById(id);
        if (!product) {
          return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }
        res.status(200).json({ success: true, data: product });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'PUT':
      try {
        console.log('Actualizando producto:', id, req.body); // Debug
        
        const product = await Product.findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true,
        });
        
        if (!product) {
          return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }
        
        res.status(200).json({ success: true, data: product });
      } catch (error) {
        console.error('Error actualizando producto:', error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'DELETE':
      try {
        const deletedProduct = await Product.findByIdAndDelete(id);
        if (!deletedProduct) {
          return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }
        res.status(200).json({ success: true, message: 'Producto eliminado' });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.status(405).json({ success: false, message: 'Método no permitido' });
  }
}
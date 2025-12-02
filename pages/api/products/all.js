// pages/api/products/all.js
import dbConnect from '../../../lib/mongodb';
import Product from '../../../models/Product';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      // Opcional: Implementar aquí la lógica de autenticación y autorización (isAdmin)

      // 🛑 Obtener TODOS los productos (sin filtros de 'activo' y sin limitación)
      const products = await Product.find({})
        .sort({ codigo: 1 }); // Ordenar por código o nombre para fácil administración

      // Devolver la lista completa (sin datos de paginación)
      res.status(200).json({
        success: true,
        data: products,
      });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Error al obtener productos para admin.' });
    }
  } else {
    res.status(405).json({ success: false, message: 'Método no permitido' });
  }
}
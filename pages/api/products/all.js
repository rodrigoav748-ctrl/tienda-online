// pages/api/products/all.js

import dbConnect from '../../../lib/mongodb';
import Product from '../../../models/Product';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      // Obtener TODOS los productos sin limitación ni filtros de 'activo'
      const products = await Product.find({})
        .sort({ codigo: 1 }); // Ordenar por código para fácil administración

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
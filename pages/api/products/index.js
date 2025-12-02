import dbConnect from '../../../lib/mongodb';
import Product from '../../../models/Product';

export default async function handler(req, res) {
  await dbConnect();

  switch (req.method) {
    case 'GET':
      try {
        const showAll = req.query.admin === 'true';
        const publicView = req.query.public === 'true';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || (publicView ? 6 : 12);
        const skip = (page - 1) * limit;
        
        const filter = showAll ? {} : { activo: true };
        
        if (publicView && !showAll) {
          filter.destacado = true;
        }
        
        const products = await Product.find(filter)
          .skip(skip)
          .limit(limit)
          .sort({ destacado: -1, createdAt: -1 });
          
        const totalProducts = await Product.countDocuments(filter);
        const hasMore = skip + products.length < totalProducts;
        
        const publicHasMore = publicView ? true : hasMore;
        
        res.status(200).json({ 
          success: true, 
          data: products,
          pagination: {
            page,
            limit,
            total: totalProducts,
            hasMore: publicView ? publicHasMore : hasMore,
            totalPages: Math.ceil(totalProducts / limit),
            isPublicView: publicView || false
          }
        });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'POST':
      try {
        if (req.body.codigo) {
          const existingProduct = await Product.findOne({ codigo: req.body.codigo });
          if (existingProduct) {
            return res.status(400).json({ 
              success: false, 
              error: 'Ya existe un producto con este código' 
            });
          }
        }

        const product = await Product.create(req.body);
        res.status(201).json({ success: true, data: product });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.status(405).json({ success: false, message: 'Método no permitido' });
  }
}
const mongoose = require('mongoose');

// Conectar a MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://rodrigoav748_db_user:Trexyol0@tiendaonline.b3voxws.mongodb.net/tienda?retryWrites=true&w=majority');
    console.log('✅ Conectado a MongoDB Atlas');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
}

// Definir el esquema directamente en el script
const productSchema = new mongoose.Schema({
  codigo: String,
  nombre: String,
  precio: Number,
  stock: Number,
  descripcion: String,
  oferta: Boolean,
  categoria: String,
  activo: Boolean,
  imagen: String,
  peso: Number,
  descuento: Number,
  fecha_creacion: Date
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

// Actualizar productos existentes
async function updateProducts() {
  try {
    // Agregar campo descuento a todos los productos existentes
    const result = await Product.updateMany(
      { descuento: { $exists: false } },
      { $set: { descuento: 0 } }
    );
    
    console.log(`✅ ${result.modifiedCount} productos actualizados con campo descuento`);
    
    // También asegurarnos que todos tengan el campo activo
    const resultActivo = await Product.updateMany(
      { activo: { $exists: false } },
      { $set: { activo: true } }
    );
    
    console.log(`✅ ${resultActivo.modifiedCount} productos actualizados con campo activo`);
    
  } catch (error) {
    console.error('❌ Error actualizando productos:', error);
  }
}

async function main() {
  await connectDB();
  await updateProducts();
  await mongoose.connection.close();
  console.log('✅ Proceso completado');
}

main();
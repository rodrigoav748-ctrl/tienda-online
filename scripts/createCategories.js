const mongoose = require('mongoose');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://rodrigoav748_db_user:Trexyol0@tiendaonline.b3voxws.mongodb.net/tienda?retryWrites=true&w=majority');
    console.log('✅ Conectado a MongoDB Atlas');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
}

// Definir esquema de categorías
const categorySchema = new mongoose.Schema({
  nombre: String,
  descripcion: String,
  imagen: String,
  activa: Boolean
});

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

async function createDefaultCategories() {
  try {
    const defaultCategories = [
      {
        nombre: 'Electrónica',
        descripcion: 'Dispositivos electrónicos y gadgets',
        imagen: '/images/electronics.jpg',
        activa: true
      },
      {
        nombre: 'Computación',
        descripcion: 'Computadoras, laptops y accesorios',
        imagen: '/images/computers.jpg',
        activa: true
      },
      {
        nombre: 'Hogar',
        descripcion: 'Electrodomésticos y artículos para el hogar',
        imagen: '/images/home.jpg',
        activa: true
      },
      {
        nombre: 'Deportes',
        descripcion: 'Artículos deportivos y fitness',
        imagen: '/images/sports.jpg',
        activa: true
      },
      {
        nombre: 'Ropa',
        descripcion: 'Ropa y accesorios de moda',
        imagen: '/images/clothing.jpg',
        activa: true
      }
    ];

    // Eliminar categorías existentes y crear nuevas
    await Category.deleteMany({});
    await Category.insertMany(defaultCategories);
    
    console.log('✅ Categorías por defecto creadas exitosamente');
    
  } catch (error) {
    console.error('❌ Error creando categorías:', error);
  }
}

async function main() {
  await connectDB();
  await createDefaultCategories();
  await mongoose.connection.close();
  console.log('✅ Proceso completado');
}

main();
const mongoose = require('mongoose');
const csv = require('csv-parser');
const fs = require('fs');
const bcrypt = require('bcryptjs');

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

// Definir esquemas directamente en el script para evitar problemas de importación
const categorySchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  descripcion: {
    type: String,
    default: ''
  },
  imagen: {
    type: String,
    default: '/images/category-placeholder.jpg'
  },
  activa: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const productSchema = new mongoose.Schema({
  codigo: {
    type: String,
    required: true,
    unique: true
  },
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  precio: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  descripcion: {
    type: String,
    default: ''
  },
  oferta: {
    type: Boolean,
    default: false
  },
  categoria: {
    type: String,
    required: true
  },
  activo: {
    type: Boolean,
    default: true
  },
  imagen: {
    type: String,
    default: '/images/placeholder.jpg'
  },
  peso: {
    type: Number,
    default: 0
  },
  fecha_creacion: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const userSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  rol: {
    type: String,
    enum: ['cliente', 'admin', 'trabajador'],
    default: 'cliente'
  },
  telefono: {
    type: String,
    default: ''
  },
  direccion: {
    calle: String,
    ciudad: String,
    pais: String,
    codigo_postal: String
  },
  fecha_registro: {
    type: Date,
    default: Date.now
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Crear modelos
const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
const User = mongoose.models.User || mongoose.model('User', userSchema);

// Importar categorías
async function importCategories() {
  return new Promise((resolve, reject) => {
    const categories = [];
    
    if (!fs.existsSync('./csv/categorias.csv')) {
      console.log('📁 Creando archivo categorias.csv de ejemplo...');
      const exampleData = `nombre,descripcion,imagen
Electrónica,Dispositivos electrónicos y gadgets,/images/electronics.jpg
Computación,Computadoras, laptops y accesorios,/images/computers.jpg
Audio,Audífonos, parlantes y equipos de sonido,/images/audio.jpg
Hogar,Electrodomésticos y artículos para el hogar,/images/home.jpg
Deportes,Artículos deportivos y fitness,/images/sports.jpg
Ropa,Ropa y accesorios de moda,/images/clothing.jpg`;
      
      fs.writeFileSync('./csv/categorias.csv', exampleData);
      console.log('✅ Archivo categorias.csv creado');
    }

    fs.createReadStream('./csv/categorias.csv')
      .pipe(csv())
      .on('data', (row) => {
        categories.push({
          nombre: row.nombre,
          descripcion: row.descripcion || '',
          imagen: row.imagen || '/images/category-placeholder.jpg'
        });
      })
      .on('end', async () => {
        try {
          console.log(`📥 Procesando ${categories.length} categorías...`);
          await Category.deleteMany({});
          const result = await Category.insertMany(categories);
          console.log(`✅ ${result.length} categorías importadas`);
          resolve();
        } catch (error) {
          console.error('❌ Error importando categorías:', error);
          reject(error);
        }
      })
      .on('error', (error) => {
        console.error('❌ Error leyendo archivo CSV:', error);
        reject(error);
      });
  });
}

// Importar productos
async function importProducts() {
  return new Promise((resolve, reject) => {
    const products = [];
    
    if (!fs.existsSync('./csv/productos.csv')) {
      console.log('📁 Creando archivo productos.csv de ejemplo...');
      const exampleData = `codigo,nombre,precio,stock,descripcion,oferta,categoria,activo,peso,imagen
PROD001,Smartphone Samsung Galaxy,599.99,50,Smartphone Android con 128GB,si,Electrónica,si,0.2,/images/phone.jpg
PROD002,Laptop HP Pavilion,899.99,25,Laptop 15.6" Intel i5,no,Computación,si,2.5,/images/laptop.jpg
PROD003,Audífonos Sony,149.99,100,Audífonos inalámbricos noise canceling,si,Audio,si,0.3,/images/headphones.jpg
PROD004,Tablet Amazon Fire,79.99,75,Tablet 8" 32GB,si,Tablets,si,0.4,/images/tablet.jpg
PROD005,Smart TV 55",449.99,30,TV 4K UHD Smart TV,no,Televisores,si,15.0,/images/tv.jpg
PROD006,Zapatillas Deportivas,89.99,200,Zapatillas running ultraligeras,si,Deportes,si,0.8,/images/shoes.jpg
PROD007,Camisa Casual,29.99,150,Camisa de algodón 100%,no,Ropa,si,0.3,/images/shirt.jpg
PROD008,Juguete Educativo,19.99,80,Juguete para niños 3+ años,si,Juguetes,si,0.5,/images/toy.jpg`;
      
      fs.writeFileSync('./csv/productos.csv', exampleData);
      console.log('✅ Archivo productos.csv creado');
    }

    fs.createReadStream('./csv/productos.csv')
      .pipe(csv())
      .on('data', (row) => {
        products.push({
          codigo: row.codigo,
          nombre: row.nombre,
          precio: parseFloat(row.precio) || 0,
          stock: parseInt(row.stock) || 0,
          descripcion: row.descripcion || '',
          oferta: row.oferta === 'si',
          categoria: row.categoria || 'General',
          activo: row.activo !== 'no',
          peso: parseFloat(row.peso) || 0,
          imagen: row.imagen || '/images/placeholder.jpg'
        });
      })
      .on('end', async () => {
        try {
          console.log(`📥 Procesando ${products.length} productos...`);
          await Product.deleteMany({});
          const result = await Product.insertMany(products);
          console.log(`✅ ${result.length} productos importados`);
          resolve();
        } catch (error) {
          console.error('❌ Error importando productos:', error);
          reject(error);
        }
      })
      .on('error', (error) => {
        console.error('❌ Error leyendo archivo CSV:', error);
        reject(error);
      });
  });
}

// Importar usuarios
async function importUsers() {
  return new Promise((resolve, reject) => {
    const users = [];
    
    if (!fs.existsSync('./csv/usuarios.csv')) {
      console.log('📁 Creando archivo usuarios.csv de ejemplo...');
      const exampleData = `nombre,email,password,rol,telefono,calle,ciudad,pais,codigo_postal
Admin Principal,admin@tienda.com,admin123,admin,+123456789,Av Principal 123,Lima,Perú,15001
Cliente Ejemplo,cliente@tienda.com,cliente123,cliente,+123456788,Calle Secundaria 456,Lima,Perú,15002
Trabajador 1,trabajador@tienda.com,trab123,trabajador,+123456787,Av Central 789,Lima,Perú,15003
Maria Gonzalez,maria@email.com,maria123,cliente,+123456786,Calle Norte 321,Lima,Perú,15004
Carlos Rodriguez,carlos@email.com,carlos123,cliente,+123456785,Av Sur 654,Lima,Perú,15005`;
      
      fs.writeFileSync('./csv/usuarios.csv', exampleData);
      console.log('✅ Archivo usuarios.csv creado');
    }

    fs.createReadStream('./csv/usuarios.csv')
      .pipe(csv())
      .on('data', async (row) => {
        const hashedPassword = await bcrypt.hash(row.password, 12);
        users.push({
          nombre: row.nombre,
          email: row.email,
          password: hashedPassword,
          rol: row.rol || 'cliente',
          telefono: row.telefono || '',
          direccion: {
            calle: row.calle || '',
            ciudad: row.ciudad || '',
            pais: row.pais || '',
            codigo_postal: row.codigo_postal || ''
          }
        });
      })
      .on('end', async () => {
        try {
          console.log(`📥 Procesando ${users.length} usuarios...`);
          await User.deleteMany({});
          const result = await User.insertMany(users);
          console.log(`✅ ${result.length} usuarios importados`);
          resolve();
        } catch (error) {
          console.error('❌ Error importando usuarios:', error);
          reject(error);
        }
      })
      .on('error', (error) => {
        console.error('❌ Error leyendo archivo CSV:', error);
        reject(error);
      });
  });
}

// Función principal
async function main() {
  try {
    console.log('🚀 Iniciando importación de datos a MongoDB Atlas...');
    console.log('📝 Nota: Se crearán archivos CSV de ejemplo si no existen\n');
    
    await connectDB();
    
    console.log('\n📋 Importando categorías...');
    await importCategories();
    
    console.log('\n📦 Importando productos...');
    await importProducts();
    
    console.log('\n👥 Importando usuarios...');
    await importUsers();
    
    console.log('\n🎉 ¡TODOS LOS DATOS IMPORTADOS EXITOSAMENTE!');
    console.log('=========================================');
    console.log('📊 Resumen final:');
    console.log('   ✅ Categorías: importadas');
    console.log('   ✅ Productos: importados'); 
    console.log('   ✅ Usuarios: importados');
    console.log('\n🌐 Puedes verificar en MongoDB Atlas que los datos están ahí');
    console.log('🔗 URL: https://cloud.mongodb.com');
    console.log('\n🚀 Ahora puedes ejecutar: npm run dev');
    
    await mongoose.connection.close();
    console.log('\n📡 Conexión cerrada. ¡Listo!');
    
  } catch (error) {
    console.error('\n❌ Error durante la importación:', error.message);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = { importProducts, importUsers, importCategories };
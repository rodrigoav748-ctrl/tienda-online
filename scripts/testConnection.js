const mongoose = require('mongoose');

async function testConnection() {
  console.log('🔗 Probando conexión a MongoDB Atlas...');
  
  const uri = 'mongodb+srv://rodrigoav748_db_user:Trexyol0@tiendaonline.b3voxws.mongodb.net/tienda?retryWrites=true&w=majority';
  
  try {
    console.log('📡 Conectando a:', uri);
    
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });
    
    console.log('✅ ¡Conexión exitosa a MongoDB Atlas!');
    
    // Verificar si la base de datos existe
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log(`📊 Colecciones en la base de datos: ${collections.length}`);
    
    collections.forEach(collection => {
      console.log(`   - ${collection.name}`);
    });
    
    await mongoose.connection.close();
    console.log('✅ Conexión cerrada correctamente');
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    
    if (error.name === 'MongoServerSelectionError') {
      console.log('💡 Posibles soluciones:');
      console.log('   1. Verifica tu conexión a internet');
      console.log('   2. La IP puede no estar en la whitelist de MongoDB Atlas');
      console.log('   3. Revisa el usuario y contraseña en la conexión');
    } else if (error.name === 'MongoNetworkError') {
      console.log('💡 Error de red - Verifica tu conexión a internet');
    }
  }
}

testConnection();
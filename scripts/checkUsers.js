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

async function checkUsers() {
  const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}));
  
  try {
    const users = await User.find({});
    
    console.log(`\n👥 USUARIOS EN LA BASE DE DATOS (${users.length}):`);
    console.log('=========================================');
    
    users.forEach(user => {
      console.log(`\n📧 Email: ${user.email}`);
      console.log(`👤 Nombre: ${user.nombre}`);
      console.log(`🎭 Rol: ${user.rol}`);
      console.log(`📅 Registro: ${new Date(user.fecha_registro).toLocaleDateString()}`);
      console.log(`✅ Activo: ${user.activo ? 'Sí' : 'No'}`);
      console.log('-----------------------------------------');
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo usuarios:', error);
  }
}

async function main() {
  await connectDB();
  await checkUsers();
  await mongoose.connection.close();
}

main();
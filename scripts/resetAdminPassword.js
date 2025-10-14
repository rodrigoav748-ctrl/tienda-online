const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function connectDB() {
  const uri = 'mongodb+srv://rodrigoav748_db_user:Trexyol0@tiendaonline.b3voxws.mongodb.net/tienda?retryWrites=true&w=majority';
  
  try {
    await mongoose.connect(uri);
    console.log('✅ Conectado a MongoDB Atlas');
    return true;
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    return false;
  }
}

async function resetAdminPassword() {
  const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}));
  
  try {
    const user = await User.findOne({ email: 'admin@tienda.com' });
    
    if (user) {
      // Resetear contraseña a 'admin123'
      user.password = await bcrypt.hash('admin123', 12);
      await user.save();
      
      console.log('✅ Contraseña del admin resetada a: admin123');
      console.log('📧 Email: admin@tienda.com');
      console.log('🔐 Nueva password: admin123');
    } else {
      console.log('❌ Usuario admin no encontrado');
    }
    
  } catch (error) {
    console.error('❌ Error resetando contraseña:', error.message);
  }
}

async function main() {
  const connected = await connectDB();
  if (connected) {
    await resetAdminPassword();
    await mongoose.connection.close();
  }
}

main();
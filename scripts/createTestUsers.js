const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function connectDB() {
  console.log('🔗 Conectando a MongoDB Atlas...');
  
  const uri = 'mongodb+srv://rodrigoav748_db_user:Trexyol0@tiendaonline.b3voxws.mongodb.net/tienda?retryWrites=true&w=majority';
  
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    
    console.log('✅ ¡Conectado exitosamente!');
    return true;
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    return false;
  }
}

// Esquema simple para usuarios
const userSchema = new mongoose.Schema({
  nombre: String,
  email: String,
  password: String,
  rol: String,
  telefono: String,
  direccion: Object,
  fecha_registro: Date,
  activo: Boolean
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function createTestUsers() {
  try {
    console.log('👥 Creando usuarios de prueba...');
    
    // Datos de usuarios
    const testUsers = [
      {
        nombre: 'Administrador Principal',
        email: 'admin@tienda.com',
        password: await bcrypt.hash('admin123', 12),
        rol: 'admin',
        telefono: '+51 987 654 321',
        direccion: {
          calle: 'Av. Principal 123',
          ciudad: 'Lima',
          pais: 'Perú',
          codigo_postal: '15001'
        },
        fecha_registro: new Date(),
        activo: true
      },
      {
        nombre: 'Cliente Ejemplo',
        email: 'cliente@tienda.com',
        password: await bcrypt.hash('cliente123', 12),
        rol: 'cliente',
        telefono: '+51 987 654 322',
        direccion: {
          calle: 'Calle Secundaria 456',
          ciudad: 'Lima',
          pais: 'Perú',
          codigo_postal: '15002'
        },
        fecha_registro: new Date(),
        activo: true
      },
      {
        nombre: 'Maria Gonzalez',
        email: 'maria@ejemplo.com',
        password: await bcrypt.hash('maria123', 12),
        rol: 'cliente',
        telefono: '+51 987 654 323',
        direccion: {
          calle: 'Jr. Los Olivos 321',
          ciudad: 'Arequipa',
          pais: 'Perú',
          codigo_postal: '04001'
        },
        fecha_registro: new Date(),
        activo: true
      },
      {
        nombre: 'Carlos Rodriguez',
        email: 'carlos@ejemplo.com',
        password: await bcrypt.hash('carlos123', 12),
        rol: 'cliente',
        telefono: '+51 987 654 324',
        direccion: {
          calle: 'Av. Libertad 654',
          ciudad: 'Trujillo',
          pais: 'Perú',
          codigo_postal: '13001'
        },
        fecha_registro: new Date(),
        activo: true
      }
    ];

    // Insertar usuarios
    const result = await User.insertMany(testUsers);
    console.log(`✅ ${result.length} usuarios creados exitosamente`);

    // Mostrar credenciales
    console.log('\n🔐 CREDENCIALES DE PRUEBA:');
    console.log('=========================================');
    console.log('👑 ADMINISTRADOR:');
    console.log('   Email: admin@tienda.com');
    console.log('   Password: admin123');
    console.log('   Rol: admin (acceso completo)');
    console.log('');
    console.log('👤 CLIENTES:');
    console.log('   Email: cliente@tienda.com');
    console.log('   Password: cliente123');
    console.log('   Email: maria@ejemplo.com');
    console.log('   Password: maria123');
    console.log('   Email: carlos@ejemplo.com');
    console.log('   Password: carlos123');
    console.log('=========================================\n');

  } catch (error) {
    console.error('❌ Error creando usuarios:', error.message);
  }
}

async function main() {
  const connected = await connectDB();
  if (connected) {
    await createTestUsers();
    await mongoose.connection.close();
    console.log('🎉 Proceso completado!');
  } else {
    console.log('❌ No se pudo completar el proceso por error de conexión');
  }
}

main();
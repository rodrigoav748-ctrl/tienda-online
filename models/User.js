import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
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

export default mongoose.models.User || mongoose.model('User', UserSchema);
import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
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
  descuento: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  fecha_creacion: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

ProductSchema.index({ nombre: 'text', descripcion: 'text' });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
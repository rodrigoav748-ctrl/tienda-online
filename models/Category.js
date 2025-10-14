import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
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

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);
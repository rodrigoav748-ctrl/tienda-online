import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  usuario_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fecha: {
    type: Date,
    default: Date.now
  },
  total: {
    type: Number,
    required: true
  },
  estado: {
    type: String,
    enum: ['pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado'],
    default: 'pendiente'
  },
  direccion_envio: {
    nombre: String,
    direccion: String,
    ciudad: String,
    pais: String,
    codigo_postal: String,
    telefono: String
  },
  items: [{
    producto_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    cantidad: {
      type: Number,
      required: true
    },
    precio_unitario: {
      type: Number,
      required: true
    },
    subtotal: {
      type: Number,
      required: true
    }
  }],
  metodo_pago: {
    type: String,
    enum: ['tarjeta', 'paypal', 'transferencia', 'contraentrega'],
    default: 'tarjeta'
  },
  fecha_actualizacion: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
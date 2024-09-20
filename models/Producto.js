const mongoose = require('mongoose');

const Producto = new mongoose.Schema({
  Producto: { type: String, required: true },
  Imagen: { type: String, required: true },
  T30: { type: Number, default: 0 },
  T32: { type: Number, default: 0 },
  T34: { type: Number, default: 0 },
  T36: { type: Number, default: 0 },
  T38: { type: Number, default: 0 },
  T40: { type: Number, default: 0 },
  T42: { type: Number, default: 0 },
  T44: { type: Number, default: 0 },
  T46: { type: Number, default: 0 },
  Type: { type: String, required: true },
  Cantidad: { type: Number, default: 0 },
  Vendidos: { type: Number, default: 0 },
  Ingreso: { type: Number, default: 0 },
  Precio: { type: Number, required: true }
});

module.exports = mongoose.model('Producto', Producto);
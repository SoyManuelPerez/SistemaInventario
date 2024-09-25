const mongoose = require('mongoose');

const PedidoSchema = new mongoose.Schema({
  Producto: String,
  Imagen: String,
  Cantidad: Number,
  Talla: { type: String, default: 'N/A' }, // Talla será 'N/A' por defecto
  Precio: Number
});

module.exports = mongoose.model('Pedido', PedidoSchema);

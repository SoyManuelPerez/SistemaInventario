const mongoose = require('mongoose')
const Cart = new mongoose.Schema ({
    Cart: String,
    Producto: String,
    Imagen: { type: [String], required: true },
    Talla: { type: String, default: 'N/A' }, // Talla será 'N/A' por defecto
    Cantidad: Number,
    Precio: Number,
})
module.exports = mongoose.model('Carts', Cart)
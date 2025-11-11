const mongoose = require('mongoose')
const Cart = new mongoose.Schema ({
    Cart: String,
    Producto: String,
    Imagen: { type: [String], required: true },
    Cantidad: Number,
    Precio: Number,
})
module.exports = mongoose.model('Carts', Cart)
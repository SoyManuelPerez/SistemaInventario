const mongoose = require('mongoose')
const Cart = new mongoose.Schema ({
    Cart: String,
    Producto: String,
    Imagen: String,
    Cantidad: Number,
    Precio: Number,
})
module.exports = mongoose.model('Carts', Cart)
const mongoose = require('mongoose')
const Pedido = new mongoose.Schema({
    Producto : String,
    Imagen : String,
    Cantidad : Number,
    Vendedor : String,
    Cliente : String,
    Precio : Number
})
module.exports = mongoose.model('Pedido', Pedido)
const mongoose = require('mongoose')
const Producto = new mongoose.Schema({
    Producto : String,
    Imagen : String,
    Cantidad : Number,
    Vendedor : String,
    Cliente : String,
    Precio : Number
})
module.exports = mongoose.model('Producto', Producto)
const mongoose = require('mongoose')
const Producto = new mongoose.Schema({
    Nombre : String,
    Descripcion : String,
    Cantidad : Number,
    Vendidos : Number,
    Ingreso : Number,
    Precio : Number
})
module.exports = mongoose.model('Producto', Producto)
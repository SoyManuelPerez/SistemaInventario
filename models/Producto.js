const mongoose = require('mongoose')
const Producto = new mongoose.Schema({
    Producto : String,
    Imagen : String,
    T30 : Number,
    T32 : Number,
    T34 : Number,
    T36 : Number,
    T38 : Number,
    T40 : Number,
    T42 : Number,
    T44 : Number,
    T46 : Number,
    Vendidos : Number,
    Ingreso : Number,
    Precio : Number
})
module.exports = mongoose.model('Producto', Producto)
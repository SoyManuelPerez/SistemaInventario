const mongoose = require('mongoose');

const Pedidos = new mongoose.Schema({
    Cliente: String,
    Documento: String,
    Telefono: String,
    Direccion: String,
    Cuiudad: String,
    Departamento:String,
    Ventas:Number
});

module.exports = mongoose.model('Pedidos', Pedidos);

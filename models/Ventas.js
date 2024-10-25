const mongoose = require('mongoose');

const Ventas = new mongoose.Schema({
  Cliente: String,
  Estado: String,
  Url: String,
});

module.exports = mongoose.model('Ventas', Ventas);

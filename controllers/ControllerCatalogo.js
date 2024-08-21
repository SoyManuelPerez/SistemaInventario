const Producto = require('../models/Producto')
const dotenv =  require('dotenv')
dotenv.config();
//Mostrar Catalogo
module.exports.mostrar = (req, res) => {
    Producto.find({})
    .then(Producto => res.render('Catalogo', {Producto: Producto}))
    .catch(err => console.log(err, 'Error mostrar Usuario no encontrado'))
}
const jsonwebtoken = require('jsonwebtoken')
const dotenv = require('dotenv')
const Carrito = require('../models/cart');
const Productos = require('../models/Productos')
dotenv.config();
module.exports.Crear = async (req, res) => {
  try {
    const Cantidad = parseInt(req.body.cantidad, 10);
    const Cart = req.cookies.EusseCueros;
    const id = req.params.id;
    const paquete = await Productos.findById(id).lean().exec();
    const Producto = paquete.Producto;
    const Imagen = paquete.Imagen;
    const Precio = paquete.Precio;

    // Buscar si ya existe un carrito con el mismo Cart y Producto
    const existingCart = await Carrito.findOne({ Cart, Producto }).exec();

    if (existingCart) {
      // Si existe, actualizar la cantidad sumando la nueva cantidad
      existingCart.Cantidad += Cantidad;
      await existingCart.save();
    } else {
      // Si no existe, crear un nuevo carrito
      const cart = new Carrito({ Cart, Producto, Cantidad, Imagen, Precio });
      await cart.save();
    }

    res.redirect('/cart');
  } catch (err) {
    console.error(err);
    res.status(500).send("Error interno del servidor");
  }
};

module.exports.mostrar = (req, res) => {
  const Cart = req.cookies.EusseCueros;
  Carrito.find({Cart: Cart}).then(result => result || [])
  .then(result => {
    res.render('cart', {Cart: result});
  })
  .catch(err => {
    console.error('Error mostrando datos', err);
    res.status(500).send('Error mostrando datos');
  });
};
module.exports.Eliminarcart = async (req, res) => {
  const id = req.params.id;
  try {
    await Carrito.findByIdAndDelete(id).exec();
  } catch (error) {
    console.log(error);
  }
  res.redirect('/cart');
};

const jsonwebtoken = require('jsonwebtoken')
const dotenv = require('dotenv')
const Carrito = require('../models/cart');
const Productos = require('../models/Producto')
dotenv.config();
module.exports.Crear = async (req, res) => {
  try {
    const Cantidad = parseInt(req.body.cantidad, 10);
    const Cart = req.cookies.EusseCueros;
    const id = req.params.id;
    const paquete = await Productos.findById(id).lean().exec();
    const Producto = paquete.Producto;
    const Imagen = paquete.Imagenes;
    const Precio = paquete.Precio;
    const Talla = req.body.tallaSeleccionada;

    // Buscar si ya existe un carrito con el mismo Cart y Producto
    const existingCart = await Carrito.findOne({ Cart, Producto }).exec();

    if (existingCart) {
      // Si existe, actualizar la cantidad sumando la nueva cantidad
      existingCart.Cantidad += Cantidad;
      await existingCart.save();
    } else {
      // Si no existe, crear un nuevo carrito
      const cart = new Carrito({ Cart, Producto, Cantidad, Imagen, Precio,Talla });
      await cart.save();
    }

    res.render('cart');
  } catch (err) {
    console.error(err);
    res.status(500).send("Error interno del servidor");
  }
};

module.exports.mostrar = async (req, res) => {
  try {
    // Leer la cookie
    const cartToken = req.cookies.EusseCueros;

    // Si no hay cookie, se puede devolver carrito vacío o redirigir al cliente
    if (!cartToken) {
      return res.render("cart", { Cart: [] });
    }

    // Buscar los productos del carrito asociados a ese token
    const carrito = await Carrito.find({ Cart: cartToken });

    // Renderizar la vista con el resultado
    res.render("cart", { Cart: carrito });

  } catch (err) {
    console.error("Error mostrando datos:", err);
    res.status(500).send("Error mostrando datos");
  }
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

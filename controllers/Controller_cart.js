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
      const cart = new Carrito({ Cart, Producto, Cantidad, Imagen, Precio, Talla });
      await cart.save();
    }

    // 🔧 Buscar el carrito actualizado para enviarlo a la vista
    const carritoActualizado = await Carrito.find({ Cart }).lean();

    // 🔧 Renderizar pasando la variable Cart
    res.render('cart', { Cart: carritoActualizado });

  } catch (err) {
    console.error("Error en Crear:", err);
    res.status(500).send("Error interno del servidor");
  }
};


module.exports.mostrar = async (req, res) => {
  try {
    const cartToken = req.cookies.EusseCueros;

    // Si no hay cookie, mostrar carrito vacío
    if (!cartToken) {
      return res.render("cart", { Cart: [] });
    }

    // Buscar productos en base al token
    const carrito = await Carrito.find({ Cart: cartToken }).lean();

    // Renderizar con datos
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

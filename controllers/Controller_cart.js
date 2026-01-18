const jsonwebtoken = require('jsonwebtoken')
const dotenv = require('dotenv')
const Carrito = require('../models/cart');
const Productos = require('../models/Producto')
dotenv.config();
module.exports.Crear = async (req, res) => {
  try {
    const Cart = req.cookies.EusseCueros;
    const id = req.params.id;
    const Cantidad = parseInt(req.body.cantidad, 10);
    const Talla = req.body.tallaSeleccionada; // 👈 viene del input oculto
    console.log("🧾 Datos recibidos del cliente:", req.body);

    // Verificar existencia de cookie
    if (!Cart) {
      return res.status(400).json({ message: "Cookie del carrito no encontrada." });
    }

    // Validaciones básicas
    if (!id) {
      return res.status(400).json({ message: "ID de producto faltante." });
    }

    if (isNaN(Cantidad) || Cantidad <= 0) {
      return res.status(400).json({ message: "Cantidad inválida." });
    }

    // Obtener producto
    const paquete = await Productos.findById(id).lean().exec();
    if (!paquete) {
      return res.status(404).json({ message: "Producto no encontrado." });
    }

    const Producto = paquete.Producto;
    const Imagen = paquete.Imagenes;
    const Precio = paquete.Precio;

    // 🔎 Si el producto tiene tallas, verificar que se haya seleccionado una
    const tieneTallas = Object.keys(paquete).some(key => key.startsWith("T") && paquete[key] > 0);
    if (tieneTallas && (!Talla || Talla.trim() === "")) {
      return res.status(400).json({ message: "Debes seleccionar una talla antes de agregar." });
    }

    // 🧩 Buscar si ya existe el producto en el carrito con misma talla
    const existingCart = await Carrito.findOne({ Cart, Producto, Talla }).exec();

    if (existingCart) {
      existingCart.Cantidad += Cantidad;
      await existingCart.save();
      console.log("🟡 Producto actualizado en carrito:", existingCart);
    } else {
      const cart = new Carrito({ Cart, Producto, Cantidad, Imagen, Precio, Talla });
      await cart.save();
      console.log("🟢 Nuevo producto agregado:", cart);
    }

    // Respuesta correcta en JSON
    res.status(200).json({ message: "Producto agregado al carrito correctamente." });
  } catch (err) {
    console.error("❌ Error interno al agregar al carrito:", err);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};



module.exports.mostrar = async (req, res) => {
  try {
    const Cart = req.cookies.EusseCueros;

    // Buscar productos en base al token
    const carrito = await Carrito.find({ Cart: Cart }).lean();

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

const Usuario = require('../models/Usuarios')
const Pedido = require('../models/Pedido')
const dotenv =  require('dotenv')
const jsonwebtoken = require('jsonwebtoken');
dotenv.config();
module.exports.mostrar = (req, res) => {
    const token = req.cookies.jwt;
  let User = "";
  if (token) {
    jsonwebtoken.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.redirect("/");
      }
      User = decoded.user;
    }); 
  }
  Promise.all([
    Pedido.find({}),
    Usuario.find({ user: User })
  ]).then(([Pedido, Usuario]) => {
    const tipoUsuario = Usuario.length > 0 ? Usuario[0].type : null;
    res.render('Pedido', {
        Pedido: Pedido,
        tipoUsuario: tipoUsuario,
    });
  })
  .catch(err => {
    console.log(err, 'Error mostrando datos');
    res.status(500).send('Error mostrando datos');
  });
}
module.exports.AgregarCart = async (req, res) => {
  const { nombre, cantidad, precio, tipoProducto, tallaSeleccionada } = req.body;

  // Definir la talla basada en el tipo de producto
  const talla = tipoProducto === 'Correa' ? tallaSeleccionada : 'N/A';

  // Crear un nuevo pedido con la información del formulario
  const nuevoPedido = new Pedido({
    Producto: nombre,
    Cantidad: cantidad,
    Talla: talla,
    Precio: precio,
    Imagen: '' 
  });

  try {
    // Guardar el pedido en la base de datos
    await nuevoPedido.save();
    console.log('Pedido guardado exitosamente:', nuevoPedido);
    
    // Redirigir después de guardar
    res.redirect('/Pedido'); 
  } catch (err) {
    console.error('Error al guardar el pedido:', err);
    res.status(500).send('Hubo un error al procesar el pedido');
  }
};
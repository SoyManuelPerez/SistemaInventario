const Producto = require('../models/Ventas')
const Usuario = require('../models/Usuarios')
const dotenv =  require('dotenv')
const jsonwebtoken = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
dotenv.config();
//Mostrar Catalogo
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
    Producto.find({}),
    Usuario.find({ user: User })
  ]).then(([Producto, Usuario]) => {
    const tipoUsuario = Usuario.length > 0 ? Usuario[0].type : null;
    res.render('Ventas', {
        Producto: Producto,
        tipoUsuario: tipoUsuario,
        User:User
    });
  })
  .catch(err => {
    console.log(err, 'Error mostrando datos');
    res.status(500).send('Error mostrando datos');
  });
}
// Controlador para servir el PDF
exports.pdf = (req, res) => {
  const fileName = req.query.file;
  if (!fileName) {
    console.error('Error: No se especificó el archivo.');
    return res.status(400).send('El archivo no se especificó.');
  }
  // Ruta completa del archivo
  const filePath = path.join(__dirname, '../public/pdf', fileName);

  // Verifica si el archivo existe y envíalo
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error(`Error al intentar enviar el archivo: ${fileName}`, err);
      if (err.code === 'ENOENT') {
        // Archivo no encontrado
        return res.status(404).send('Archivo no encontrado.');
      }
      // Otro tipo de error
      res.status(500).send('Error interno del servidor.');
    }
  });
};

module.exports.eliminarPedido = async (req, res) => {
  const id = req.params.id;

  try {
    const pedido = await Producto.findById(id);

    if (pedido && pedido.url) {
      const pdfPath = path.join(__dirname, 'public', 'pdf', pedido.url);

      fs.unlink(pdfPath, (err) => {
        if (err) {
          console.error("Error al eliminar el archivo PDF:", err.message);
        } else {
          console.log("Archivo PDF eliminado:", pdfPath);
        }
      });
    } else {
      console.log("Pedido no encontrado o no tiene PDF.");
    }

    await Producto.findByIdAndDelete(id);  // Esto se ejecuta siempre, exista o no el pedido
    res.redirect('/Ventas');

  } catch (error) {
    console.error("Error al eliminar el pedido:", error);
    res.status(500).send("Hubo un error al procesar la eliminación del pedido");
  }
};
module.exports.Actualizar = async (req, res) => {
  const { id } = req.params;
  const { nuevoEstado } = req.body;

  try {
    // Validar si se proporcionó un nuevo estado
    if (!nuevoEstado) {
      return res.status(400).send("Debe seleccionar un nuevo estado.");
    }

    // Buscar el pedido por ID
    const pedido = await Producto.findById(id);

    if (!pedido) {
      return res.status(404).send("Pedido no encontrado.");
    }

    // Actualizar el estado del pedido
    pedido.Estado = nuevoEstado;
    await pedido.save();

    console.log(`Estado del pedido ${id} actualizado a: ${nuevoEstado}`);
    res.redirect('/Ventas');
  } catch (error) {
    console.error("Error al actualizar el estado del pedido:", error);
    res.status(500).send("Hubo un error al actualizar el estado del pedido.");
  }
};
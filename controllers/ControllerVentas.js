const Producto = require('../models/Ventas')
const Usuario = require('../models/Usuarios')
const dotenv =  require('dotenv')
const jsonwebtoken = require('jsonwebtoken');
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
  // Asegúrate de que `req.query.file` contenga el nombre del archivo
  const fileName = req.query.file;

  if (!fileName) {
    return res.status(400).send('El archivo no se especificó.');
  }

  // Ruta absoluta al archivo
  const filePath = path.join(__dirname, '../public/pdf', fileName);

  // Enviar el archivo al cliente
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('Error al enviar el archivo:', err);
      res.status(404).send('Archivo no encontrado.');
    }
  });
};
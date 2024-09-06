const Productos = require('../models/Producto')
const multer = require('multer');
const path = require('path');
const fs = require('fs')
const dotenv = require('dotenv')
const { exec } = require('child_process');
dotenv.config();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/img/Productos'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); 
  }
});

const upload = multer({ storage: storage });
//Crear Producto
module.exports.Crear = async (req, res) => {
  upload.single('Imagen')(req, res, async function (err) {
    if (err) {
      return res.status(500).send("Error al subir la imagen.");
    }
    const Producto = req.body.Producto;
    const Precio = req.body.Precio;
    const Tipo = req.body.Tipo;
    const Imagen = req.file ? req.file.filename : '';
    const newProducto = new Productos({ Producto, Precio, Tipo, Imagen });
    try {
      await newProducto.save();
      res.redirect('/inventario')     
    } catch (error) {
      res.status(500).send("Error al guardar el producto.");
      console.log(error);
    }
  });
};

//Eliminar Producto
module.exports.eliminar = (req,res) =>{
  const id = req.params.id
  Productos.findById({_id:id}).exec()
.then(resultado => {
  const foto = resultado.Imagen
  const absolutePath = path.resolve(__dirname, '../public/img/Productos/',foto);
  fs.unlink(absolutePath, (err) => {
    if (err) {
      console.error('Error al eliminar el archivo:', err);
      return res.status(500).send('Error al eliminar el archivo.');
    }
  });
  Productos.findByIdAndDelete({_id:id}).exec()
  console.log("Objeto eliminado : ", resultado); 
})
.catch(error => {
  console.log(error) 
});
  res.redirect('/inventario')       
}
//Editar Producto
module.exports.editar = (req,res) =>{
  console.log(req.body)
    const id = req.body.id
    const Producto = req.body.Producto
    const Precio = req.body.Precio
    Productos.findOneAndUpdate({_id:id},{Precio,Producto}).exec()
    .then(resultado=>{
        console.log("Objeto Actualizado : ", resultado); 
    })
    .catch(error=>{
        console.log(error) 
    })
    res.redirect('/inventario')  
}
//Mostrar productos 
module.exports.mostrar = (req, res) => {
  const Cart = req.cookies.Anfomotos;
  Promise.all([
    Productos.find({}).then(result => result || []),
    Carrito.find({Cart: Cart}).then(result => result || [])
  ])
  .then(([Producto,Cart]) => {
    res.render('catalogo', {
      Producto: Producto,
      Cart:Cart
    });
  })
  .catch(err => {
    console.error('Error mostrando datos', err);
    res.status(500).send('Error mostrando datos');
  });
};
//Mostrar en inventario
module.exports.mostrarInventario = (req, res) => {
    Productos.find({})
  .then(result => {
    res.render('inventario', {Productos:result});
  })
  .catch(err => {
    console.error('Error mostrando datos', err);
    res.status(500).send('Error mostrando datos');
  });
}

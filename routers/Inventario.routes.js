const express = require('express')
const Inventario = require('../controllers/ControllerInventario')
const router = express.Router();
//Mostrar inventario
router.get('/Inventario',Inventario.mostrarInventario,(req,res)=>{
    res.render('Inventario')
});
//Eliminar Producto
router.get('/EliminarProducto/:id',Inventario.eliminar,(req,res)=>{
    res.render('Inventario')
})
router.get('/descargarPDF',Inventario.PDF,(req,res)=>{
})
//Editar Producto
router.post('/EditarCorrea',Inventario.editar)
router.post('/EditarBolso',Inventario.editarBolso)
//Crear Producto
router.post('/CrearProducto',Inventario.Crear)

  
module.exports= router
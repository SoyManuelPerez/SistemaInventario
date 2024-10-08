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
//Editar Producto
router.post('/EditarProducto',Inventario.editar)
//Crear Producto
router.post('/CrearProducto',Inventario.Crear)

  
module.exports= router
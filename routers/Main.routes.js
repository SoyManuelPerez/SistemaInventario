const express = require('express')
const Catalogo = require('../controllers/ControllerCatalogo')
const Ventas = require('../controllers/ControllerVentas')
const Estadistica = require('../controllers/ControllerEstadistica')
const Inventario = require('../controllers/ControllerInventario')
const Pedido = require('../controllers/ControllerPedido')
const router = express.Router();
router.get('/',(req,res)=>{
    res.render('Login')
});
router.get('/Catalogo',Catalogo.mostrar,(req,res)=>{
    res.render('Catalogo')
});
router.get('/Inventario',Inventario.mostrarInventario,(req,res)=>{
    res.render('Inventario')
});
router.post('/Agregarcart/:id',Pedido.AgregarCart);

router.post('/ActualizarEstado/:id',Ventas.Actualizar);

router.get('/Pedido',Pedido.mostrar,(req,res)=>{
    res.render('Pedido')
});
router.get('/EliminarPedido/:id',Pedido.eliminarPedido)
router.get('/Eliminarventas/:id',Ventas.eliminarPedido)
router.get('/Ventas',Ventas.mostrar,(req,res)=>{
    res.render('Ventas')
});
router.get('/Estadisticas',Estadistica.mostrar,(req,res)=>{
    res.render('Estadistica')
});
router.get('/pdf', Ventas.pdf);
router.get('/Pedido',Pedido.mostrar,(req,res)=>{
    res.render('Pedido')
});
router.post('/Factura',Pedido.Factura,(req,res)=>{
});
module.exports= router
const express = require('express')
const Catalogo = require('../controllers/ControllerCatalogo')
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
router.get('/Pedido',Pedido.mostrar,(req,res)=>{
    res.render('Pedido')
});
module.exports= router
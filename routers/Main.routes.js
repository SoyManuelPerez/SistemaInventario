const express = require('express')
const Catalogo = require('../controllers/ControllerCatalogo')
const Inventario = require('../controllers/ControllerInventario')
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
module.exports= router
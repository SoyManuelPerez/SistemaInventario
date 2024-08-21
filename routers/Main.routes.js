const express = require('express')
const Catalogo = require('../controllers/ControllerCatalogo')
const Inventario = require('../controllers/ControllerInventario')
const routes = express.Router();
routes.get('/',(req,res)=>{
    res.render('Login')
});
routes.get('/Catalogo',Catalogo.mostrar,(req,res)=>{
    res.render('Catalogo')
});
routes.get('/Inventario',Inventario.mostrarInventario,(req,res)=>{
    res.render('Inventario')
});
module.exports= routes
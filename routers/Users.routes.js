const express = require('express')
const Usuario = require('../controllers/ControllersUsuario')
const routes = express.Router();
//Login 
routes.post('/ValidarUsuario',Usuario.Login)
module.exports= routes
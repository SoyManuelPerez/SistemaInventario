const express = require('express')
const Usuario = require('../controllers/ControllersUsuario')
const routes = express.Router();
//Login 
routes.post('/ValidarUsuario',Usuario.Login)
//Regristro de Usuarios
routes.get('/Registro',Usuario.mostrar,(res,req)=>{
    res.render('RegistroU')
})
//Crear Usuarios
routes.post('/CrearUsuario',Usuario.Crear,);
//Salir 
routes.get('/logout',Usuario.logout);
//Eliminar Usuario
routes.get('/borrarUsuario/:id',Usuario.eliminar)
//Actualizar
routes.post('/editarUsuario',Usuario.editar)
module.exports= routes
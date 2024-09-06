const express = require('express')
const Usuario = require('../controllers/ControllersUsuario')
const router = express.Router();
//Login 
router.post('/ValidarUsuario',Usuario.Login)
//Regristro de Usuarios
router.get('/Registro',Usuario.mostrar,(res,req)=>{
    res.render('RegistroU')
})
//Crear Usuarios
router.post('/CrearUsuario',Usuario.Crear,);
//Salir 
router.get('/logout',Usuario.logout);
//Eliminar Usuario
router.get('/borrarUsuario/:id',Usuario.eliminar)
//Actualizar
router.post('/editarUsuario',Usuario.editar)
module.exports= router
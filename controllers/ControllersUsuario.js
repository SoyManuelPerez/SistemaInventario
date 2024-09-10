const jsonwebtoken = require('jsonwebtoken')
const Usuario = require('../models/Usuarios')
const dotenv =  require('dotenv')
dotenv.config();
//Mostrar Usuarios
module.exports.mostrar = (req, res) => {
    Usuario.find({})
    .then(usuario => res.render('RegistroU', {usuario: usuario}))
    .catch(err => console.log(err, 'Error mostrar Usuario no encontrado'))
}
//Guardar Usuarios
module.exports.Crear = async (req,res)=>{
const {user,type,password} = req.body
    if(!user || !password || !type){
      res.redirect('/Registro')
    }
    else{
       const Usuariobuscar = await Usuario.findOne({user:user});
       if(Usuariobuscar){
        return res.status(400).send({status:"Error",message:"Usuario Ya Registrado"})
       }else{
        const newUsuario = new Usuario({user,type,password})
        await newUsuario.save()
        res.redirect('/Registro')
       }
    }
}
//Eliminar Usuario
module.exports.eliminar = (req,res) =>{
    const id = req.params.id
    Usuario.findByIdAndDelete({_id:id}).exec()
  .then(    resultado => {
    console.log("Objeto eliminado : ", resultado); 
  })
  .catch(error => {
    console.log(error) 
  });
    res.redirect('/Registro')       
}
//Editae 
module.exports.editar = (req,res) =>{
    const usuario = req.body.User
    const type = req.body.type
    const password = req.body.password
    Usuario.findOneAndUpdate({user:usuario.trim()},{type,password}).exec()
    .then(resultado=>{
        console.log("Objeto Actualizado : ", resultado); 
    })
    .catch(error=>{
        console.log(error) 
    })
    res.redirect('/Registro')  
}
//Verificar Usuario
module.exports.Login = (req, res) => {
    const user = req.body.user;
    const password = req.body.password;

    if (!user || !password) {
        return res.status(400).send({ status: "Error", message: "Los campos están incompletos" });
    }

    Usuario.findOne({ user: user }).lean().exec()
    .then(usuario => {
        if (!usuario) {
            return res.status(400).send({ status: "Error", message: "Usuario Incorrecto" });
        }

        if (password !== usuario.password) {
            return res.status(400).send({ status: "Error", message: "Contraseña Incorrecta" });
        }

        const type = usuario.type;
        const token = jsonwebtoken.sign(
            { user: usuario.user },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION }
        );

        const cookieOption = {
            expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
            path: "/"
        };
        res.cookie("jwt", token, cookieOption);

        if (type === "Admin") {
            res.send({ status: "ok", message: "Usuario loggeado", redirect: "/catalogo" });
        } else if (type === "Vendedor") {
            res.send({ status: "ok", message: "Usuario loggeado", redirect: "/hospedaje" });
        }
    })
    .catch(err => {
        console.error(err);
        res.redirect('/');
    });
};

module.exports.logout =(req,res)=>{
    res.render('login')
}



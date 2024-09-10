const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser');
const dotenv =  require('dotenv')
dotenv.config();
// inicializacion
const app = express()
//Configuracion
app.set(path.join(__dirname,'view'))
app.set('view engine', 'ejs',)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname,'public')))
//Middlewares
app.use(cookieParser());
//Rutas
Main =  require("./routers/Main.routes")
User =  require("./routers/Users.routes")
Inventario =  require("./routers/Inventario.routes")
app.use(Inventario)
app.use(Main)
app.use(User)
// Servidor 
app.set('port',process.env.PORT || 4000);
app.listen(app.get('port'))  
console.log("Servidor corriendo en http://localhost:"+app.get("port"));

//Conexion a la base de datos
mongoose.connect(process.env.URL,{   
    useNewUrlParser: true,
    useUnifiedTopology: true 
})
.then(db => console.log('Conectado a la BD '))

.catch( err => console.log(err));
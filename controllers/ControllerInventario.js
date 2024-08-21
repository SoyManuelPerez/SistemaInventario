const Productos = require('../models/Producto')
const multer = require('multer');
const path = require('path');
const fs = require('fs')
const dotenv = require('dotenv')
const { exec } = require('child_process');
dotenv.config();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/img/Productos'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); 
  }
});

const upload = multer({ storage: storage });
//Crear Producto
module.exports.Crear = async (req, res) => {
  upload.single('Imagen')(req, res, async function (err) {
    if (err) {
      return res.status(500).send("Error al subir la imagen.");
    }
    const Producto = req.body.Producto;
    const Precio = req.body.Precio;
    const Tipo = req.body.Tipo;
    const Imagen = req.file ? req.file.filename : '';
    const newProducto = new Productos({ Producto, Precio, Tipo, Imagen });

    try {
      await newProducto.save();
      // Llama a la función para actualizar Git y pasa el response para manejar la respuesta
      updateGitRepo(res);
    } catch (error) {
      res.status(500).send("Error al guardar el producto.");
      console.log(error);
    }
  });
};

// Función para ejecutar comandos de Git
function runGitCommand(command, callback) {
  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error(`Error ejecutando comando: ${command}`);
      console.error(`Error: ${err.message}`);
      console.error(`stderr: ${stderr}`);
      return callback(err);
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
    callback(null, stdout);
  });
}

// Función para configurar el usuario de Git
function configureGitUser(callback) {
  const command = 'git config --global user.email "Soy_ManuelPerez@outlook.com" && git config --global user.name "SoyManuelPerez"';
  runGitCommand(command, callback);
}

// Función para verificar si el repositorio remoto ya existe
function checkRemoteExists(callback) {
  const command = 'git remote get-url origin';
  runGitCommand(command, (err, stdout, stderr) => {
    if (err) {
      // Si hay un error, asumimos que el repositorio remoto no existe
      console.log("El repositorio remoto no está configurado.");
      return callback(null, false);
    }
    console.log("El repositorio remoto ya está configurado.");
    callback(null, true);
  });
}

// Función para agregar, hacer commit y empujar los cambios
function pushChanges(callback) {
  const gitCommands = `
    git checkout main
    git pull origin main
    git add .
    git commit -m "Actualización automática Exitosa"
    git push origin main
  `;

  runGitCommand(gitCommands, callback);
}

// Función para actualizar el repositorio de Git
function updateGitRepo(res) {
  configureGitUser((err) => {
    if (err) {
      res.status(500).send("Error configurando usuario de Git.");
      return;
    }

    checkRemoteExists((err, exists) => {
      if (err) {
        res.status(500).send("Error verificando repositorio remoto.");
        return;
      }

      if (!exists) {
        configureGitRemote((err) => {
          if (err) {
            res.status(500).send("Error configurando repositorio remoto.");
            return;
          }
          pushChanges((err) => {
            if (err) {
              res.status(500).send("Error empujando cambios al repositorio remoto.");
              return;
            }
            console.log('Cambios empujados al repositorio remoto con éxito.');
            res.redirect('/inventario');
          });
        });
      } else {
        pushChanges((err) => {
          if (err) {
            res.status(500).send("Error empujando cambios al repositorio remoto.");
            return;
          }
          console.log('Cambios empujados al repositorio remoto con éxito.');
          res.redirect('/inventario');
        });
      }
    });
  });
}

// Función para configurar el repositorio remoto
function configureGitRemote(callback) {
  const GITHUB_USERNAME = 'SoyManuelPerez';
  const GITHUB_TOKEN = process.env.Token; // Asegúrate de que esta variable de entorno esté configurada
  const GITHUB_REPOSITORY = 'AnfoMotos';

  const gitRemoteCommand = `git remote add origin https://${GITHUB_USERNAME}:${GITHUB_TOKEN}@github.com/${GITHUB_USERNAME}/${GITHUB_REPOSITORY}.git`;
  runGitCommand(gitRemoteCommand, (err) => {
    if (err && err.message.includes("remote origin already exists")) {
      console.log("El repositorio remoto ya existe, continuando...");
      return callback(null);
    }
    callback(err);
  });
}

//Eliminar Producto
module.exports.eliminar = (req,res) =>{
  const id = req.params.id
  Productos.findById({_id:id}).exec()
.then(resultado => {
  const foto = resultado.Imagen
  const absolutePath = path.resolve(__dirname, '../public/img/Productos/',foto);
  fs.unlink(absolutePath, (err) => {
    if (err) {
      console.error('Error al eliminar el archivo:', err);
      return res.status(500).send('Error al eliminar el archivo.');
    }
  });
  Productos.findByIdAndDelete({_id:id}).exec()
  console.log("Objeto eliminado : ", resultado); 
  updateGitRepo();
})
.catch(error => {
  console.log(error) 
});
  res.redirect('/inventario')       
}
//Editar Producto
module.exports.editar = (req,res) =>{
  console.log(req.body)
    const id = req.body.id
    const Producto = req.body.Producto
    const Precio = req.body.Precio
    Productos.findOneAndUpdate({_id:id},{Precio,Producto}).exec()
    .then(resultado=>{
        console.log("Objeto Actualizado : ", resultado); 
    })
    .catch(error=>{
        console.log(error) 
    })
    res.redirect('/inventario')  
}
//Mostrar productos 
module.exports.mostrar = (req, res) => {
  const Cart = req.cookies.Anfomotos;
  Promise.all([
    Productos.find({}).then(result => result || []),
    Carrito.find({Cart: Cart}).then(result => result || [])
  ])
  .then(([Producto,Cart]) => {
    res.render('catalogo', {
      Producto: Producto,
      Cart:Cart
    });
  })
  .catch(err => {
    console.error('Error mostrando datos', err);
    res.status(500).send('Error mostrando datos');
  });
};
//Mostrar en inventario
module.exports.mostrarInventario = (req, res) => {
    Productos.find({})
  .then(result => {
    res.render('inventario', {Productos:result});
  })
  .catch(err => {
    console.error('Error mostrando datos', err);
    res.status(500).send('Error mostrando datos');
  });
}

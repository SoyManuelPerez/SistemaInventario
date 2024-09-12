const Productos = require('../models/Producto');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Usuario = require('../models/Usuarios');
const dotenv = require('dotenv');
const jsonwebtoken = require('jsonwebtoken');
const { exec } = require('child_process');
dotenv.config();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/img/Productos'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

// Crear Producto
module.exports.Crear = async (req, res) => {
  upload.single('Imagen')(req, res, async (err) => {
    if (err) {
      return res.status(500).send("Error al subir la imagen.",err);
    }

    const { Producto, Precio, Tipo, Cantidad } = req.body;
    const Imagen = req.file ? req.file.filename : '';
    const newProducto = new Productos({ Producto, Precio, Tipo, Cantidad, Imagen });

    try {
      await newProducto.save();
      updateGitRepo(res);
    } catch (error) {
      console.log(error);
      res.status(500).send("Error al guardar el producto.");
    }
  });
};

// Eliminar Producto
module.exports.eliminar = async (req, res) => {
  try {
    const id = req.params.id;
    const producto = await Productos.findById(id).exec();

    if (producto) {
      const absolutePath = path.resolve(__dirname, '../public/img/Productos/', producto.Imagen);
      fs.unlink(absolutePath, (err) => {
        if (err) {
          console.error('Error al eliminar el archivo:', err);
          return res.status(500).send('Error al eliminar el archivo.');
        }
      });

      await Productos.findByIdAndDelete(id).exec();
      console.log("Producto eliminado:", producto);
      updateGitRepo(res);
    } else {
      res.status(404).send("Producto no encontrado.");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al eliminar el producto.");
  }
};

// Editar Producto
module.exports.editar = async (req, res) => {
  try {
    const { id, Producto, Precio } = req.body;
    const productoActualizado = await Productos.findByIdAndUpdate(id, { Producto, Precio }).exec();

    if (productoActualizado) {
      console.log("Producto Actualizado:", productoActualizado);
      res.redirect('/Inventario');
    } else {
      res.status(404).send("Producto no encontrado.");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al actualizar el producto.");
  }
};

// Mostrar productos en Inventario
module.exports.mostrarInventario = async (req, res) => {
  const token = req.cookies.jwt;
  let User = "";
  if (token) {
    jsonwebtoken.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.redirect("/");
      }
      User = decoded.user;
    });
  }
  Promise.all([
    Productos.find({}),
    Usuario.find({ user: User })
  ]).then(([Productos, Usuario]) => {
    const tipoUsuario = Usuario.length > 0 ? Usuario[0].type : null;
    res.render('Inventario', {
      Productos: Productos,
      tipoUsuario: tipoUsuario
    });
  })
  .catch(err => {
    console.log(err, 'Error mostrando datos');
    res.status(500).send('Error mostrando datos');
  });
};

// Función para ejecutar comandos de Git
function runGitCommand(command, callback) {
  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error(`Error ejecutando comando: ${command}`, err.message, stderr);
      return callback(err);
    }
    console.log(stdout);
    callback(null, stdout);
  });
}

// Configurar usuario de Git
function configureGitUser(callback) {
  const command = 'git config --global user.email "Soy_ManuelPerez@outlook.com" && git config --global user.name "SoyManuelPerez"';
  runGitCommand(command, callback);
}

// Verificar si el repositorio remoto existe
function checkRemoteExists(callback) {
  const command = 'git remote get-url origin';
  runGitCommand(command, (err, stdout, stderr) => {
    if (err) {
      console.log("El repositorio remoto no está configurado.");
      return callback(null, false);
    }
    console.log("El repositorio remoto ya está configurado.");
    callback(null, true);
  });
}

// Agregar, hacer commit y empujar los cambios
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

// Configurar el repositorio remoto
function configureGitRemote(callback) {
  const GITHUB_USERNAME = 'SoyManuelPerez';
  const GITHUB_TOKEN = process.env.Token;
  const GITHUB_REPOSITORY = 'SistemaInventario';

  const gitRemoteCommand = `git remote add origin https://${GITHUB_USERNAME}:${GITHUB_TOKEN}@github.com/${GITHUB_USERNAME}/${GITHUB_REPOSITORY}.git`;
  runGitCommand(gitRemoteCommand, (err) => {
    if (err && err.message.includes("remote origin already exists")) {
      console.log("El repositorio remoto ya existe, continuando...");
      return callback(null);
    }
    callback(err);
  });
}

// Actualizar el repositorio de Git
function updateGitRepo(res) {
  configureGitUser((err) => {
    if (err) return res.status(500).send("Error configurando usuario de Git.");

    checkRemoteExists((err, exists) => {
      if (err) return res.status(500).send("Error verificando repositorio remoto.");

      const finalizePush = (err) => {
        if (err) return res.status(500).send("Error empujando cambios al repositorio remoto.");
        console.log('Cambios empujados al repositorio remoto con éxito.');
        res.redirect('/Inventario');
      };

      if (!exists) {
        configureGitRemote((err) => {
          if (err) return res.status(500).send("Error configurando repositorio remoto.");
          pushChanges(finalizePush);
        });
      } else {
        pushChanges(finalizePush);
      }
    });
  });
}

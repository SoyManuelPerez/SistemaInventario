const Productos = require('../models/Producto');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Usuario = require('../models/Usuarios')
const dotenv =  require('dotenv')
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
  upload.single('Imagen')(req, res, async function (err) {
    if (err) {
      return res.status(500).send("Error al subir la imagen.");
    }

    // Capturar datos del formulario
    const { Producto, Precio, Tipo, CantidadBolso, Cantidad30, Cantidad32, Cantidad34, Cantidad36, Cantidad38, Cantidad40, Cantidad42, Cantidad44, Cantidad46 } = req.body;
    const Imagen = req.file ? req.file.filename : '';

    // Lógica para manejar los tipos de producto
    let cantidades = {};
    if (Tipo === 'Correa') {
      const cantidadTotal = 
        Number(Cantidad30) + 
        Number(Cantidad32) + 
        Number(Cantidad34) + 
        Number(Cantidad36) + 
        Number(Cantidad38) + 
        Number(Cantidad40) + 
        Number(Cantidad42) + 
        Number(Cantidad44) + 
        Number(Cantidad46);

      cantidades = { 
        T30: Number(Cantidad30), 
        T32: Number(Cantidad32), 
        T34: Number(Cantidad34), 
        T36: Number(Cantidad36), 
        T38: Number(Cantidad38), 
        T40: Number(Cantidad40), 
        T42: Number(Cantidad42), 
        T44: Number(Cantidad44), 
        T46: Number(Cantidad46),
        Cantidad: cantidadTotal // Total de todas las tallas
      };
    } else if (Tipo === 'Bolso') {
      cantidades = { Cantidad: Number(CantidadBolso) };
    }

    // Crear el objeto del nuevo producto
    const newProducto = new Productos({
      Producto,
      Precio,
      Tipo,
      Imagen,
      ...cantidades
    });

    try {
      console.log(newProducto);
      await newProducto.save();
      updateGitRepo(res);
      res.redirect('/Inventario');
    } catch (error) {
      res.status(500).send("Error al guardar el producto.");
      console.log(error);
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
module.exports.editarBolso = async (req, res) => {
  try {
    const { MProducto, MCantidad, MPrecio } = req.body;
    
    const productoActualizado = await Productos.findOneAndUpdate(
      { Producto: MProducto, Tipo: 'bolso' }, 
      { 
        Cantidad: MCantidad,
        Precio: MPrecio
      },
      { new: true }
    ).exec();

    if (productoActualizado) {
      console.log("Bolso Actualizado:", productoActualizado);
      updateGitRepo(res);
      res.redirect('/Inventario');
    } else {
      res.status(404).send("Producto tipo bolso no encontrado.");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al actualizar el producto tipo bolso.");
  }
};

module.exports.editar = async (req, res) => {
  try {
    const {
      MProducto, MCantidad30, MCantidad32, MCantidad34, MCantidad36,
      MCantidad38, MCantidad40, MCantidad42, MCantidad44, MCantidad46,
      MPrecio
    } = req.body;

    // Calcular la cantidad total como la suma de todas las tallas
    const cantidadTotal = 
      (MCantidad30 || 0) + (MCantidad32 || 0) + (MCantidad34 || 0) +
      (MCantidad36 || 0) + (MCantidad38 || 0) + (MCantidad40 || 0) +
      (MCantidad42 || 0) + (MCantidad44 || 0) + (MCantidad46 || 0);

    const productoActualizado = await Productos.findOneAndUpdate(
      { Producto: MProducto, Tipo: 'correa' },
      {
        T30: MCantidad30,
        T32: MCantidad32,
        T34: MCantidad34,
        T36: MCantidad36,
        T38: MCantidad38,
        T40: MCantidad40,
        T42: MCantidad42,
        T44: MCantidad44,
        T46: MCantidad46,
        Cantidad: cantidadTotal,
        Precio: MPrecio
      },
      { new: true }
    ).exec();

    if (productoActualizado) {
      console.log("Correa Actualizada:", productoActualizado);
      updateGitRepo(res);
      res.redirect('/Inventario');
    } else {
      res.status(404).send("Producto tipo correa no encontrado.");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al actualizar el producto tipo correa.");
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

/// Función para ejecutar comandos de Git
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
            res.redirect('/Inventario');
          });
        });
      } else {
        pushChanges((err) => {
          if (err) {
            res.status(500).send("Error empujando cambios al repositorio remoto.");
            return;
          }
          console.log('Cambios empujados al repositorio remoto con éxito.');
          res.redirect('/Inventario');
        });
      }
    });
  });
}

// Función para configurar el repositorio remoto
function configureGitRemote(callback) {
  const GITHUB_USERNAME = 'SoyManuelPerez';
  const GITHUB_TOKEN = process.env.Token; // Asegúrate de que esta variable de entorno esté configurada
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

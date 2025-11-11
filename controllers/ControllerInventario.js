const Productos = require('../models/Producto');
const PDFDocument = require('pdfkit');
const multer = require('multer');
const path = require('path');
const Carrito = require('../models/cart');
const fs = require('fs');
const Usuario = require('../models/Usuarios')
const dotenv =  require('dotenv')
const jsonwebtoken = require('jsonwebtoken');
const { exec } = require('child_process');
const sharp = require("sharp"); 
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
  upload.array('Imagen', 5)(req, res, async function (err) {
    if (err) {
      return res.status(500).send("Error al subir las imágenes.");
    }

    const { Producto, Precio, Tipo, CantidadBolso, Cantidad30, Cantidad32, Cantidad34, Cantidad36, Cantidad38, Cantidad40, Cantidad42, Cantidad44, Cantidad46 } = req.body;
    const Imagenes = req.files ? req.files.map(file => file.filename) : [];

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

    const newProducto = new Productos({
      Producto,
      Precio,
      Tipo,
      Imagenes,
      ...cantidades
    });

    try {
      console.log(newProducto);
      await newProducto.save();
      updateGitRepo(res);
    } catch (error) {
      res.status(500).send("Error al guardar el producto.");
      console.log(error);
    }
  });
};
//PDF
async function getOptimizedImageBuffer(imagenPath) {
  return await sharp(imagenPath)
    .resize({ width: 500 }) // Redimensionar ancho máximo a 500px
    .jpeg({ quality: 70 })  // Comprimir calidad
    .toBuffer();
}

module.exports.PDF = async (req, res) => {
  try {
    const tabla = req.query.tabla;

    // Definir el tipo de producto basado en la tabla
    let tipo;
    let maxProductosPorPagina = 3; // Por defecto
    let maxImagenesPorFila = 3;   // Por defecto

    if (tabla === "inventarioCorreas") {
      tipo = "Correa";
      maxProductosPorPagina = 4;
      maxImagenesPorFila = 3;
    } else if (tabla === "inventarioBolsos") {
      tipo = "Bolso";
    } else if (tabla === "inventarioAccesorios") {
      tipo = "Accesorios";
    } else {
      return res.status(400).send("Tabla no válida");
    }

    // Filtrar productos por tipo y cantidad mayor a 0 y ORDENAR alfabéticamente por nombre
    const productos = await Productos.find({
      Tipo: tipo,
      Cantidad: { $gt: 0 },
    }).sort({ Producto: 1 }); // Orden ascendente (A → Z)

    const doc = new PDFDocument();

    // Configurar encabezados de respuesta
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${tabla}.pdf`);

    doc.pipe(res);

    let productoCount = 0;
    let filaCount = 0;

    for (const producto of productos) {
      if (tipo === "Correa") {
        // ------------------- Lógica Correas -------------------
        if (filaCount === maxProductosPorPagina) {
          doc.addPage();
          filaCount = 0;
        }

        const margenIzquierdo = 50;
        const espaciadoHorizontal = 160;
        const xPos =
          margenIzquierdo + (productoCount % maxImagenesPorFila) * espaciadoHorizontal;
        const yPos = doc.y;

        if (producto.Imagenes && producto.Imagenes.length > 0) {
          try {
            const imagenPath = path.join(
              __dirname,
              "..",
              "public",
              "img",
              "Productos",
              producto.Imagenes[0]
            );
            const buffer = await getOptimizedImageBuffer(imagenPath);
            doc.image(buffer, xPos, yPos, { width: 150 });
          } catch (err) {
            console.error(`Error al cargar la imagen: ${producto.Imagenes[0]}`, err);
          }
        }

        productoCount++;
        if (productoCount % maxImagenesPorFila === 0) {
          doc.moveDown(12);
          filaCount++;
        }
      } else {
        // ------------------- Lógica Bolsos y Accesorios -------------------
        if (productoCount === maxProductosPorPagina) {
          doc.addPage();
          productoCount = 0;
        }

        const imagenes = producto.Imagenes || [];
        let yInicial = doc.y;

        if (imagenes.length > 0) {
          for (let idx = 0; idx < imagenes.length; idx++) {
            const imagen = imagenes[idx];
            const xPos = 50 + (idx % maxImagenesPorFila) * 150;

            try {
              const imagenPath = path.join(
                __dirname,
                "..",
                "public",
                "img",
                "Productos",
                imagen
              );
              const buffer = await getOptimizedImageBuffer(imagenPath);
              doc.image(buffer, xPos, yInicial, { width: 100 });

              if ((idx + 1) % maxImagenesPorFila === 0) {
                yInicial += 110;
              }
            } catch (err) {
              console.error(`Error al cargar la imagen: ${imagen}`, err);
            }
          }
        }

        // Ajustar posición para texto después de todas las imágenes
        doc.moveDown(9);

        // Nombre del producto (dividido por comas si aplica)
        const nombreProducto = producto.Producto
          ? producto.Producto.split(",")
          : ["Producto sin nombre"];
        nombreProducto.forEach((linea) => {
          doc.fontSize(14).font("Helvetica-Bold").text(linea.trim(), { align: "right" });
        });

        // Precio del producto
        doc
          .fontSize(12)
          .font("Helvetica")
          .text(
            `Precio: $${producto.Precio ? producto.Precio.toLocaleString("es-CO") : "N/A"} COP`,
            { align: "right" }
          );

        // Separador
        doc
          .moveDown(3)
          .moveTo(50, doc.y)
          .lineTo(550, doc.y)
          .strokeColor("black")
          .stroke();

        doc.moveDown(1);
        productoCount++;
      }
    }

    doc.end();
  } catch (error) {
    console.error("Error al generar el PDF:", error);
    res.status(500).send("Error al generar el PDF");
  }
};

// Eliminar Producto
module.exports.eliminar = async (req, res) => {
  try {
    const id = req.params.id;
    const producto = await Productos.findById(id).exec();

    if (producto) {
      // Verifica si el producto tiene imágenes y es un array
      if (Array.isArray(producto.Imagenes) && producto.Imagenes.length > 0) {
        producto.Imagenes.forEach((imagen) => {
          const absolutePath = path.resolve(__dirname, '../public/img/Productos/', imagen);
          fs.unlink(absolutePath, (err) => {
            if (err) {
              console.error('Error al eliminar el archivo:', err);
            }
          });
        });
      }

      // Elimina el producto de la base de datos
      await Productos.findByIdAndDelete(id).exec();
      console.log("Producto eliminado:", producto);

      // Actualiza el repositorio Git
      updateGitRepo(res);
    } else {
      res.status(404).send("Producto no encontrado.");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al eliminar el producto.");
  }
};

module.exports.editarBolso = async (req, res) => {
  try {
    // Manejo de la subida de imágenes (máximo 5)
    upload.array('MImagenBolso', 5)(req, res, async function (err) {
      if (err) {
        console.error("Error al subir las imágenes:", err);
        return res.status(500).send("Error al subir las imágenes.");
      }

      const { id, MProductoBolso, MCantidadBolso, MPrecioBolso } = req.body;

      // Generar un array con los nombres de los archivos subidos
      const Imagenes = req.files ? req.files.map(file => file.filename) : [];

      // Construir el objeto de actualización
      const updateData = {
        Producto: MProductoBolso,
        Cantidad: MCantidadBolso,
        Precio: MPrecioBolso,
      };

      // Solo incluir imágenes si hay nuevas cargadas
      if (Imagenes.length > 0) {
        updateData.Imagenes = Imagenes;
      }

      // Actualizar el producto en la base de datos
      const productoActualizado = await Productos.findByIdAndUpdate(id, updateData, { new: true }).exec();

      if (productoActualizado) {
        console.log("Bolso actualizado:", productoActualizado);

        // Actualizar el repositorio Git
        updateGitRepo(res);
      } else {
        res.status(404).send("Producto tipo bolso no encontrado.");
      }
    });
  } catch (error) {
    console.error("Error al actualizar el producto tipo bolso:", error);
    res.status(500).send("Error al actualizar el producto tipo bolso.");
  }
};

module.exports.editar = async (req, res) => {
  try {
    upload.array('MImagenCorrea', 5)(req, res, async function (err) {
      const {
        id, MProductoCorrea, MCantidad30, MCantidad32, MCantidad34, MCantidad36,
        MCantidad38, MCantidad40, MCantidad42, MCantidad44, MCantidad46, MPrecioCorrea
      } = req.body;
      const Imagenes = req.files ? req.files.map(file => file.filename) : [];
      const cantidadTotal = 
        (parseInt(MCantidad30) || 0) + 
        (parseInt(MCantidad32) || 0) + 
        (parseInt(MCantidad34) || 0) + 
        (parseInt(MCantidad36) || 0) + 
        (parseInt(MCantidad38) || 0) + 
        (parseInt(MCantidad40) || 0) + 
        (parseInt(MCantidad42) || 0) + 
        (parseInt(MCantidad44) || 0) + 
        (parseInt(MCantidad46) || 0);

      const updateData = {
        Producto: MProductoCorrea,
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
        Precio: MPrecioCorrea
      };

      if (Imagenes.length > 0) {
        updateData.Imagenes = Imagenes;
      }

      const productoActualizado = await Productos.findByIdAndUpdate(id, updateData, { new: true });

      if (productoActualizado) {
        console.log("Correa Actualizada:", productoActualizado);
        updateGitRepo(res);
      } else {
        res.status(404).send("Producto tipo correa no encontrado.");
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al actualizar el producto tipo correa.");
  }
};
module.exports.actualizarInventario = async(req,res)=>{
  await Productos.updateMany(
  {
    Tipo: "Correa",
    T30: 0,
    T32: 0,
    T34: 0,
    T36: 0,
    T38: 0,
    T40: 0,
    T42: 0,
    T44: 0,
    T46: 0
  },
  { $set: { Cantidad: 0 } }
);
}
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
    git checkout main &&
    git pull origin main &&
    git add . &&
    git commit -m "Actualización automática Exitosa" ||
    echo "No hay cambios para commitear" &&
    git push origin main
  `;

  runGitCommand(gitCommands, (err, stdout) => {
    if (callback.called) return; // ⚡ evita llamadas dobles
    callback.called = true;
    callback(err, stdout);
  });
}

// Función para actualizar el repositorio de Git
function updateGitRepo(res) {
  configureGitUser((err) => {
    if (err) {
      return res.status(500).send("Error configurando usuario de Git.");
    }

    checkRemoteExists((err, exists) => {
      if (err) {
        return res.status(500).send("Error verificando repositorio remoto.");
      }

      const afterPush = (err) => {
        if (err) {
          return res.status(500).send("Error empujando cambios al repositorio remoto.");
        }
        console.log('Cambios empujados al repositorio remoto con éxito.');
        return res.redirect('/Inventario'); // 👈 siempre termina aquí
      };

      if (!exists) {
        configureGitRemote((err) => {
          if (err) {
            return res.status(500).send("Error configurando repositorio remoto.");
          }
          pushChanges(afterPush);
        });
      } else {
        pushChanges(afterPush);
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
//Mostrar Catalogo
module.exports.mostrarCliente = (req, res) => {
    if (!req.cookies.EuseCueros) {
    const token = jsonwebtoken.sign(
      {}, 
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION }
    );
    const cookieOption = {
      expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
      httpOnly: true,
      path: "/"
    };
    res.cookie("EuseCueros", token, cookieOption);
  }
  const Cart = req.cookies.EuseCueros;
  Promise.all([
    Productos.find({ Cantidad: { $gt: 0 } }),
    Carrito.find({Cart: Cart}),
  ]).then(([Producto,Carro]) => {
    res.render('Cliente', {
        Producto: Producto,
        Cart:Carro
    });
  })
  .catch(err => {
    console.log(err, 'Error mostrando datos');
    res.status(500).send('Error mostrando datos');
  });
}
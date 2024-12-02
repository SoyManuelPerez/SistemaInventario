const Usuario = require('../models/Usuarios')
const Pedido = require('../models/Pedido')
const Producto = require('../models/Producto')
const Venta = require('../models/Ventas')
const dotenv =  require('dotenv')
const jsonwebtoken = require('jsonwebtoken');
const PDFDocument = require('pdfkit');
const { exec } = require('child_process');
const fs = require('fs');

dotenv.config();
module.exports.mostrar = (req, res) => {
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
    Pedido.find({}),
    Usuario.find({ user: User }),
  ]).then(([Pedido, Usuario]) => {
    const tipoUsuario = Usuario.length > 0 ? Usuario[0].type : null;
    res.render('Pedido', {
        Pedido: Pedido,
        tipoUsuario: tipoUsuario,
    });
  })
  .catch(err => {
    console.log(err, 'Error mostrando datos');
    res.status(500).send('Error mostrando datos');
  });
}
module.exports.Factura = async (req, res) => {
  try {
    // Obtener los pedidos de la base de datos
    const pedidos = await Pedido.find({});

    const { Nombre, Telefono, Direccion, Ciudad, Departamento, MetodoPago, Documento, Descuento } = req.body;

    // Asegúrate de que 'Descuento' sea un número válido
    const descuentoAplicado = isNaN(Number(Descuento)) ? 0 : Number(Descuento);

    // Crear un nuevo documento PDF
    const doc = new PDFDocument();
    const filename = `Pedido ${Nombre}.pdf`;
    const filepath = `public/pdf/${filename}`;

    // Establecer la cabecera para descargar el archivo
    res.setHeader('Content-disposition', `attachment; filename=${filename}`);
    res.setHeader('Content-type', 'application/pdf');

    // Stream para enviar el PDF al navegador y guardar una copia en el servidor
    doc.pipe(res);
    doc.pipe(fs.createWriteStream(filepath));

    // Añadir una imagen al PDF
    doc.image('public/img/logo.png', {
      fit: [100, 100],
      align: 'center',
      valign: 'center',
      x: 250,
      y: 50,
    });

    // Añadir contenido al PDF
    doc.moveDown(5);
    doc.fontSize(20).text('Detalles del Pedido', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Nombre del cliente: ${Nombre}`);
    doc.text(`Teléfono: ${Telefono}`);
    doc.text(`Dirección: ${Direccion}`);
    doc.text(`Ciudad: ${Ciudad}`);
    doc.text(`Departamento: ${Departamento}`);
    doc.text(`Método de pago: ${MetodoPago}`);
    doc.text(`Documento: ${Documento ? Documento : 'No especificado'}`);
    doc.text(`Descuento: $${descuentoAplicado.toLocaleString('es-CO')}`);

    // Añadir lista de productos al PDF
    doc.moveDown();
    doc.fontSize(16).text('Productos del Pedido:', { underline: true });
    doc.moveDown();

    // Definir variables para el cálculo del total
    let total = 0;
    if (pedidos && pedidos.length > 0) {
      pedidos.forEach((pedido) => {
        const cantidad = isNaN(Number(pedido.Cantidad)) ? 0 : Number(pedido.Cantidad);
        const precio = isNaN(Number(pedido.Precio)) ? 0 : Number(pedido.Precio);

        doc.fontSize(12).text(
          `Producto: ${pedido.Producto}    Cantidad: ${cantidad}    Talla: ${pedido.Talla}    Precio: $${precio.toLocaleString('es-CO')}`,
          { continued: false }
        );
        total += precio * cantidad;
        doc.moveDown();
      });
    } else {
      doc.fontSize(14).text('No hay productos en el pedido.');
    }
    total -= descuentoAplicado;
    doc.moveDown(2);
    doc.fontSize(16).text(`Total a pagar: $${total.toLocaleString('es-CO')}`, { align: 'right' });
    doc.end();
    await Venta.create({
      Cliente: Nombre,
      Url: filename,
      Estado: 'Por empacar'
    });

    // Eliminar todos los documentos de la colección `Pedido`
    await Pedido.deleteMany({});
    updateGitRepo(res);
    res.render('Pedido')

  } catch (error) {
    console.error('Error generando el PDF:', error);
    res.status(500).send('Error al generar el PDF');
  }
};

module.exports.AgregarCart = async (req, res) => {
  const id = req.params.id;
  let { cantidad, tipoProducto, tallaSeleccionada } = req.body;

  // Validar los datos de entrada
  cantidad = parseInt(cantidad, 10);
  if (isNaN(cantidad) || cantidad <= 0) {
    return res.status(400).send({ status: "Error", message: "Cantidad inválida." });
  }

  const talla = tipoProducto === 'Correa' ? tallaSeleccionada : 'N/A';
  if (tipoProducto === 'Correa' && (!tallaSeleccionada || tallaSeleccionada.trim() === '')) {
    return res.status(400).send({ status: "Error", message: "Debe seleccionar una talla válida para el producto." });
  }

  try {
    // Buscar el producto por ID
    const producto = await Producto.findById(id);
    if (!producto) {
      return res.status(404).send({ status: "Error", message: "Producto no encontrado." });
    }

    // Determinar stock disponible
    let stockDisponible = tipoProducto === 'Correa' ? producto[talla] : producto.Cantidad;
    if (!stockDisponible || stockDisponible <= 0) {
      return res.status(400).send({ status: "Error", message: `Stock no disponible para la ${tipoProducto === 'Correa' ? `talla ${talla}` : 'cantidad solicitada'}.` });
    }

    // Verificar si la cantidad solicitada excede el stock
    if (cantidad > stockDisponible) {
      return res.status(400).send({
        status: "Error",
        message: `Cantidad solicitada (${cantidad}) excede el stock disponible (${stockDisponible}).`,
      });
    }

    // Reducir el stock del producto
    if (tipoProducto === 'Correa') {
      producto[talla] -= cantidad;
    } else {
      producto.Cantidad -= cantidad;
    }
    await producto.save();

    // Crear un nuevo pedido
    const nuevoPedido = new Pedido({
      Producto: producto.Producto,
      Cantidad: cantidad,
      Talla: talla,
      Precio: producto.Precio,
      Imagen: producto.Imagen || producto.Imagenes[0], // Ajustar según el esquema de Producto
    });
    await nuevoPedido.save();
  } catch (err) {
    console.error('Error al procesar el pedido:', err);
    res.status(500).send({ status: "Error", message: "Hubo un error al procesar el pedido." });
  }
};

module.exports.eliminarPedido = async (req, res) => {
  const id = req.params.id;

  try {
    const pedido = await Pedido.findById(id);
    if (!pedido) {
      console.log("Pedido no encontrado.");
      return res.status(404).redirect('/Pedido');
    }
    
    const { Producto: nombreProducto, Cantidad, Talla } = pedido;
    
    await Pedido.findByIdAndDelete(id);
    console.log("Pedido eliminado:", pedido);

    const producto = await Producto.findOne({ Producto: nombreProducto.trim() });
    if (!producto) {
      console.log("Producto no encontrado en la colección Producto.");
      return res.status(404).redirect('/Pedido');
    }

    if (Talla && Talla !== 'N/A') {
      producto[Talla] += Cantidad;
    } else {
      producto.Cantidad += Cantidad;
    }
    
    await producto.save();

    res.redirect('/Pedido');
  } catch (error) {
    console.error("Error al eliminar el pedido:", error);
    res.status(500).send("Hubo un error al procesar la eliminación del pedido");
  }
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


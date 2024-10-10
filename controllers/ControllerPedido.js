const Usuario = require('../models/Usuarios')
const Pedido = require('../models/Pedido')
const Producto = require('../models/Producto')
const dotenv =  require('dotenv')
const jsonwebtoken = require('jsonwebtoken');
const PDFDocument = require('pdfkit');
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
module.exports.AgregarCart = async (req, res) => {
  const id = req.params.id;
  const { cantidad, tipoProducto, tallaSeleccionada } = req.body;
  const talla = tipoProducto === 'Correa' ? tallaSeleccionada : 'N/A';

  try {
    const producto = await Producto.findById(id);

    if (!producto) {
      return res.status(404).send('Producto no encontrado');
    }

    let stockDisponible;

    // Si es una correa, obtén el stock de la talla seleccionada
    if (tipoProducto === 'Correa') {
      stockDisponible = producto[talla]; // Asegúrate de que el producto tiene este campo
      if (!stockDisponible) {
        return res.status(400).send(`La talla ${talla} no está disponible para este producto.`);
      }
    } else {
      // Si no es correa, usa la cantidad general del producto
      stockDisponible = producto.Cantidad;
    }

    // Validar si la cantidad solicitada es mayor que el stock disponible
    if (cantidad > stockDisponible) {
      return res.status(400).send(`Cantidad solicitada (${cantidad}) excede el stock disponible (${stockDisponible})`);
    }

    // Actualizar el stock restando la cantidad solicitada
    if (tipoProducto === 'Correa') {
      producto[talla] -= cantidad;
    } else {
      producto.Cantidad -= cantidad;
    }

    // Guardar el producto con el stock actualizado
    await producto.save();

    // Crear un nuevo pedido
    const nuevoPedido = new Pedido({
      Producto: producto.Producto,
      Cantidad: cantidad,
      Talla: talla,
      Precio: producto.Precio,
      Imagen: producto.Imagen
    });

    // Guardar el pedido en la base de datos
    await nuevoPedido.save();
    console.log('Pedido guardado exitosamente:', nuevoPedido);
    res.redirect('/Pedido'); 

  } catch (err) {
    console.error('Error al procesar el pedido:', err);
    res.status(500).send('Hubo un error al procesar el pedido');
  }
};

module.exports.Factura = async (req, res) => {
  try {
    // Obtener los pedidos de la base de datos
    const pedidos = await Pedido.find({});

    const { Nombre, Telefono, Direccion, Ciudad, Departamento, MetodoPago, Documento, Descuento } = req.body;

    // Asegúrate de que 'Descuento' sea un número válido
    const descuentoAplicado = isNaN(Number(Descuento)) ? 0 : Number(Descuento);
    // Crear un nuevo documento PDF
    const doc = new PDFDocument();
    // Configurar el nombre del archivo PDF
    const filename = `Pedido_${Nombre}.pdf`;
    // Establecer la cabecera para descargar el archivo
    res.setHeader('Content-disposition', `attachment; filename=${filename}`);
    res.setHeader('Content-type', 'application/pdf');
    // Stream para enviar el PDF al navegador
    doc.pipe(res);
    // Añadir una imagen al PDF (asegúrate de tener la ruta correcta de la imagen)
    doc.image('public/img/logo.png', {
      fit: [100, 100],
      align: 'center',
      valign: 'center',
      x: 250, // Ajusta 'x' para centrar la imagen en la parte superior
      y: 50,  // Espacio desde el margen superior
    });
    // Añadir contenido al PDF
    doc.moveDown(5);  // Mueve hacia abajo después de la imagen
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
        // Escribir los productos en una sola fila, separando con espacios
        doc.fontSize(12).text(
          `Producto: ${pedido.Producto}    Cantidad: ${cantidad}    Talla: ${pedido.Talla}    Precio: $${precio.toLocaleString('es-CO')}`,
          { continued: false }
        );

        // Sumar al total
        total += precio * cantidad;

        doc.moveDown();  // Espacio entre productos
      });
    } else {
      doc.fontSize(14).text('No hay productos en el pedido.');
    }
    console.log('Total antes del descuento:', total);
    total -= descuentoAplicado;
    // Mostrar el total
    doc.moveDown(2);
    doc.fontSize(16).text(`Total a pagar: $${total.toLocaleString('es-CO')}`, { align: 'right' });

    // Finalizar la creación del documento
    doc.end();
  } catch (error) {
    console.error('Error generando el PDF:', error);
    res.status(500).send('Error al generar el PDF');
  }
};

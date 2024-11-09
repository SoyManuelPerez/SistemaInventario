function descargarPDF(tablaId) {
  // Muestra el mensaje de carga y oculta cualquier mensaje de error previo
  document.getElementById('mensajeCarga').style.display = 'block';
  document.getElementById('mensajeError').style.display = 'none';

  // Solicita el PDF al servidor
  fetch(`/descargarPDF?tabla=${tablaId}`)
    .then(response => {
      if (!response.ok) {
        throw new Error("Error en la respuesta del servidor");
      }
      return response.blob();
    })
    .then(blob => {
      // Crea un enlace para descargar el archivo
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${tablaId}.pdf`;
      a.click();

      // Oculta el mensaje de carga después de la descarga
      document.getElementById('mensajeCarga').style.display = 'none';
    })
    .catch(error => {
      console.error("Error al descargar el PDF:", error);

      // Muestra mensaje de error y oculta el mensaje de carga
      document.getElementById('mensajeCarga').style.display = 'none';
      document.getElementById('mensajeError').style.display = 'block';
    });
}

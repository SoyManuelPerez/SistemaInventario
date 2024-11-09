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
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${tablaId}.pdf`;
      a.click();
      document.getElementById('mensajeCarga').style.display = 'none';
    })
    .catch(error => {
      console.error("Error al descargar el PDF:", error);
      document.getElementById('mensajeCarga').style.display = 'none';
      document.getElementById('mensajeError').style.display = 'block';
    });
}

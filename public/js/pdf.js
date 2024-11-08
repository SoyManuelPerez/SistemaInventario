function descargarPDF(tablaId) {
    // Solicita los datos al servidor
    fetch(`/descargarPDF?tabla=${tablaId}`)
      .then(response => response.blob())
      .then(blob => {
        // Crea un enlace para descargar el archivo
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${tablaId}.pdf`;
        a.click();
      })
      .catch(error => console.error("Error al descargar el PDF:", error));
  }
  
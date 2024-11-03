const modalActualizarBolso = new bootstrap.Modal(document.getElementById('modalActualizarBolso'));
const modalActualizarCorrea = new bootstrap.Modal(document.getElementById('modalActualizarCorrea'));

const onl = (element, event, selector, handler) => {
  element.addEventListener(event, e => {
    if (e.target.closest(selector)) {
      handler(e);
    }
  });
};

onl(document, 'click', '.btnModal', e => {
  const fila = e.target.closest('tr'); // Obtiene la fila correspondiente
  const celdas = fila.children;
  const tipoProducto = celdas[11].innerHTML.trim(); // Suponiendo que la columna 11 contiene el tipo de producto

  if (tipoProducto === "Bolso") {
    // Asigna valores para el modal de bolso
    document.getElementById('MProducto').value = celdas[1].innerHTML.trim();
    document.getElementById('MCantidad').value = celdas[2].innerHTML.trim();
    document.getElementById('MPrecio').value = celdas[3].innerHTML.trim();
    
    // Muestra el modal para bolso
    modalActualizarBolso.show();

  } else if (tipoProducto === "Correa") {
    // Asigna valores para el modal de correa
    document.getElementById('MProducto').value = celdas[1].innerHTML.trim();
    document.getElementById('MCantidad30').value = celdas[2].innerHTML.trim();
    document.getElementById('MCantidad32').value = celdas[3].innerHTML.trim();
    document.getElementById('MCantidad34').value = celdas[4].innerHTML.trim();
    document.getElementById('MCantidad36').value = celdas[5].innerHTML.trim();
    document.getElementById('MCantidad38').value = celdas[6].innerHTML.trim();
    document.getElementById('MCantidad40').value = celdas[7].innerHTML.trim();
    document.getElementById('MCantidad42').value = celdas[8].innerHTML.trim();
    document.getElementById('MCantidad44').value = celdas[9].innerHTML.trim();
    document.getElementById('MCantidad46').value = celdas[10].innerHTML.trim();
    document.getElementById('MPrecio').value = celdas[3].innerHTML.trim();

    // Muestra el modal para correa
    modalActualizarCorrea.show();
  }
});

// Función para mostrar campos específicos según el tipo de producto seleccionado
function showFields() {
  const tipo = document.getElementById("Tipo").value;
  const correasSection = document.getElementById("correas-section");
  const bolsoSection = document.getElementById("bolso-section");
  
  if (tipo === "Correa") {
    correasSection.style.display = "block";
    bolsoSection.style.display = "none";
  } else if (tipo === "Bolso") {
    correasSection.style.display = "none";
    bolsoSection.style.display = "block";
  } else {
    correasSection.style.display = "none";
    bolsoSection.style.display = "none";
  }
}

// Ocultar secciones al cargar la página
document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("correas-section").style.display = "none";
  document.getElementById("bolso-section").style.display = "none";
});

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
  const fila = e.target.closest('tr');
  const celdas = fila ? fila.children : [];
  const tipoProducto = e.target.id;

  if (tipoProducto === "Bolso") {
    // Verifica si los elementos existen antes de asignar valores
    const productoBolso = document.getElementById('MProductoBolso');
    const cantidadBolso = document.getElementById('MCantidadBolso');
    const precioBolso = document.getElementById('MPrecioBolso');
    
    if (productoBolso && cantidadBolso && precioBolso) {
      productoBolso.value = celdas[1].innerHTML.trim();
      cantidadBolso.value = celdas[2].innerHTML.trim();
      precioBolso.value = celdas[3].innerHTML.trim();
    }
    
    modalActualizarBolso.show();

  } else if (tipoProducto === "Correa") {
    const productoCorrea = document.getElementById('MProductoCorrea');
    const cantidad30 = document.getElementById('MCantidad30');
    const cantidad32 = document.getElementById('MCantidad32');
    // ... continúa con los otros elementos

    if (productoCorrea && cantidad30 && cantidad32 /* && verifica los demás elementos */) {
      productoCorrea.value = celdas[1].innerHTML.trim();
      cantidad30.value = celdas[2].innerHTML.trim();
      cantidad32.value = celdas[3].innerHTML.trim();
      // ... asigna los valores de los demás elementos
    }
    
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

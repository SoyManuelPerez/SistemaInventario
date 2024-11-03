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
  const celdas = Array.from(fila.children); 
  const tipoProducto = e.target.id;
  if (tipoProducto === "Bolso") {
    const productoBolso = document.getElementById('MProductoBolso');
    const cantidadBolso = document.getElementById('MCantidadBolso');
    const precioBolso = document.getElementById('MPrecioBolso');

      productoBolso.value = celdas[1].innerHTML.trim();
      cantidadBolso.value = celdas[2].innerHTML.trim();
      precioBolso.value = celdas[3].innerHTML.trim();
      modalActualizarBolso.show();
    
  } else if (tipoProducto === "Correa") {
    const productoCorrea = document.getElementById('MProductoCorrea');
    const cantidad30 = document.getElementById('MCantidad30');
    const cantidad32 = document.getElementById('MCantidad32');
    const cantidad34 = document.getElementById('MCantidad34');
    const cantidad36 = document.getElementById('MCantidad36');
    const cantidad38 = document.getElementById('MCantidad38');
    const cantidad40 = document.getElementById('MCantidad40');
    const cantidad42 = document.getElementById('MCantidad42');
    const cantidad44 = document.getElementById('MCantidad44');
    const cantidad46 = document.getElementById('MCantidad46');
    const precioCorrea = document.getElementById('MPrecioCorrea');

      productoCorrea.value = celdas[1].innerHTML.trim();
      cantidad30.value = celdas[2].innerHTML.trim();
      cantidad32.value = celdas[3].innerHTML.trim();
      cantidad34.value = celdas[4].innerHTML.trim();
      cantidad36.value = celdas[5].innerHTML.trim();
      cantidad38.value = celdas[6].innerHTML.trim();
      cantidad40.value = celdas[7].innerHTML.trim();
      cantidad42.value = celdas[8].innerHTML.trim();
      cantidad44.value = celdas[9].innerHTML.trim();
      cantidad46.value = celdas[10].innerHTML.trim();
      precioCorrea.value = celdas[12].innerHTML.trim(); 
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

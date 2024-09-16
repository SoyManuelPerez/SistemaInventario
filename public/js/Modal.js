const modalAactualizar = new bootstrap.Modal(document.getElementById('modalAactualizar'));

const onl = (element, event, selector, handler) => {
  element.addEventListener(event, e => {
    if (e.target.closest(selector)) {
      handler(e);
    }
  });
};

onl(document, 'click', '.btnModal', e => {
  const fila = e.target.closest('tr'); // Obtiene el tr correcto
    const celdas = fila.children;
      MProducto.value = celdas[1].innerHTML.trim(); 
      MCantidad30.value = celdas[2].innerHTML.trim();
      MCantidad32.value = celdas[3].innerHTML.trim();
      MCantidad34.value = celdas[4].innerHTML.trim();
      MCantidad36.value = celdas[5].innerHTML.trim();
      MCantidad38.value = celdas[6].innerHTML.trim();
      MCantidad40.value = celdas[7].innerHTML.trim();
      MCantidad42.value = celdas[8].innerHTML.trim();
      MCantidad44.value = celdas[9].innerHTML.trim();
      MCantidad46.value = celdas[10].innerHTML.trim();
      MProducto.setAttribute('readonly', true)
      modalAactualizar.show();
});
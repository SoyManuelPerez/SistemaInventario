const modalAactualizar = new bootstrap.Modal(document.getElementById('modalAactualizar'));

const onl = (element, event, selector, handler) => {
  element.addEventListener(event, e => {
    if (e.target.closest(selector)) {
      handler(e);
    }
  });
};

onl(document, 'click', '.btnModal', e => {
  const card = e.target.closest('.card'); // Encuentra la tarjeta contenedora
  const producto = card.querySelector('.card-title').innerText; // Obtiene el nombre del producto
  const precio = card.querySelector('.Precio').getAttribute('data-precio'); // Obtiene el precio original del producto
  const id = e.target.getAttribute('data-id'); // Obtiene el ID del producto

  // Asigna los valores a los campos del modal
  document.getElementById('modalProducto').value = producto;
  document.getElementById('modalPrecio').value = precio;
  document.getElementById('modalId').value = id; // Asigna el ID al campo oculto

  modalAactualizar.show();
});
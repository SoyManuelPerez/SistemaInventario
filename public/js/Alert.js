document.addEventListener('DOMContentLoaded', function () {
  // Seleccionar todos los formularios
  const forms = document.querySelectorAll('[id^="agregarCartForm-"]');

  forms.forEach((form) => {
    const id = form.id.split('-')[1]; // Extraer el ID del producto
    const errorMessageDiv = document.getElementById(`error-message-${id}`);

    // Manejar el envío del formulario
    form.addEventListener('submit', async function (event) {
      console.log('FormData enviado:', Object.fromEntries(formData.entries()));
      event.preventDefault();
      const formData = new FormData(form);
      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const resJson = await res.json();
          errorMessageDiv.style.display = 'block';
          errorMessageDiv.textContent = resJson.message;
          return;
        } else {
          errorMessageDiv.style.display = 'none';
          window.location.href = '/Pedido';
        }
      } catch (error) {
        errorMessageDiv.style.display = 'block';
        errorMessageDiv.textContent = 'Error al enviar la solicitud.';
      }
    });
  });

  // Manejar selección de tallas
  document.querySelectorAll('input[type="radio"][name^="talla-"]').forEach((radio) => {
    radio.addEventListener('change', function () {
      const productId = this.name.split('-')[1]; // Extraer el ID del producto
      const tallaInput = document.getElementById(`tallaSeleccionada-${productId}`);
      tallaInput.value = this.value;
    });
  });
});

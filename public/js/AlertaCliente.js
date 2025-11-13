document.addEventListener('DOMContentLoaded', function () {
  // Manejar el cambio en las tallas
  document.querySelectorAll('input[type="radio"][name^="tallaSeleccionada-"]').forEach((radio) => {
    radio.addEventListener('change', function () {
      const productId = this.name.split('-')[1];
      const tallaInput = document.getElementById(`tallaSeleccionada-${productId}`);
      if (tallaInput) {
        tallaInput.value = this.value;
      }
    });
  });

  // Manejar el envío de formularios
  const forms = document.querySelectorAll('[id^="agregarCartForm-"]');
  forms.forEach((form) => {
    const id = form.id.split('-')[1];
    const errorMessageDiv = document.getElementById(`error-message-${id}`);
    const tallaInput = document.getElementById(`tallaSeleccionada-${id}`);
    const cantidadInput = document.getElementById(`cantidad-${id}`);
    const hasTallas = !!tallaInput;

    form.addEventListener('submit', async function (event) {
      event.preventDefault();
    
      if (hasTallas && !tallaInput.value) {
        errorMessageDiv.style.display = 'block';
        errorMessageDiv.textContent = 'Debe seleccionar una talla válida para el producto.';
        return;
      }
    
      if (cantidadInput && cantidadInput.value <= 0) {
        errorMessageDiv.style.display = 'block';
        errorMessageDiv.textContent = 'Por favor, ingresa una cantidad válida.';
        return;
      }
    
      const formData = new FormData(form);
      const jsonData = {};
    
      formData.forEach((value, key) => {
        jsonData[key] = value;
      });
    
      if (hasTallas) {
        jsonData["tallaSeleccionada"] = tallaInput.value;
      }
      try {
        const res = await fetch(form.action, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(jsonData),
        });
    
        if (!res.ok) {
          const resJson = await res.json();
          errorMessageDiv.style.display = 'block';
          errorMessageDiv.textContent = resJson.message || 'Hubo un error.';
          return;
        }
    
        errorMessageDiv.style.display = 'none';
        window.location.href = '/cart';
      } catch (error) {
        errorMessageDiv.style.display = 'block';
        errorMessageDiv.textContent = 'Error al enviar la solicitud.';
      }
    });
    
  });
});
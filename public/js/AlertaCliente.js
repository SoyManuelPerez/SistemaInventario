// === CAMBIO DE TALLA Y ENVÍO ===
document.addEventListener('DOMContentLoaded', function () {
  // Escucha cambios en las tallas de cada producto
  document.querySelectorAll('input[type="radio"][name^="tallaSeleccionada-"]').forEach((radio) => {
    radio.addEventListener('change', function () {
      const productId = this.name.split('-')[1]; // obtiene el id del producto
      const form = document.querySelector(`#agregarCartForm-${productId}`);
      let tallaInput = document.getElementById(`tallaSeleccionada-${productId}`);

      // Si no existe el input oculto, lo crea
      if (!tallaInput) {
        tallaInput = document.createElement('input');
        tallaInput.type = 'hidden';
        tallaInput.id = `tallaSeleccionada-${productId}`;
        tallaInput.name = 'tallaSeleccionada';
        form.appendChild(tallaInput);
      }

      // Actualiza el valor seleccionado
      tallaInput.value = this.value;
    });
  });

  // Manejo de envío del formulario
  document.querySelectorAll('[id^="agregarCartForm-"]').forEach((form) => {
    const id = form.id.split('-')[1];
    const errorDiv = document.getElementById(`error-message-${id}`);
    const cantidadInput = document.getElementById(`cantidad-${id}`);
    const tallaContainer = document.querySelector(`#tallasContainer-${id}`);

    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      errorDiv.style.display = 'none';
      errorDiv.textContent = '';

      const tallaInput = document.getElementById(`tallaSeleccionada-${id}`);
      const hasTallas = !!tallaContainer;

      // Validaciones
      if (hasTallas && (!tallaInput || !tallaInput.value)) {
        errorDiv.style.display = 'block';
        errorDiv.textContent = 'Por favor, selecciona una talla antes de agregar.';
        return;
      }

      if (!cantidadInput.value || cantidadInput.value <= 0) {
        errorDiv.style.display = 'block';
        errorDiv.textContent = 'Por favor, ingresa una cantidad válida.';
        return;
      }

      // Construir JSON del formulario
      const formData = new FormData(form);
      const jsonData = {};
      formData.forEach((v, k) => (jsonData[k] = v));

      if (hasTallas && tallaInput) {
        jsonData['tallaSeleccionada'] = tallaInput.value;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Agregando...';

      try {
        const res = await fetch(form.action, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(jsonData),
        });

        const resJson = await res.json();
        if (!res.ok) {
          errorDiv.style.display = 'block';
          errorDiv.textContent = resJson.message || 'Hubo un error al agregar.';
        } else {
          window.location.href = '/cart';
        }
      } catch (err) {
        errorDiv.style.display = 'block';
        errorDiv.textContent = 'Error de conexión o servidor.';
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Agregar al pedido';
      }
    });
  });
});

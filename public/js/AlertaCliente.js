// === CAMBIO DE TALLA Y ENVÍO DEL FORMULARIO ===
document.addEventListener('DOMContentLoaded', function () {
  console.log("✅ Script de tallas cargado");

  // Detecta selección de talla
  document.querySelectorAll('input[type="radio"][name^="tallaSeleccionada-"]').forEach((radio) => {
    radio.addEventListener('change', function () {
      const productId = this.name.split('-')[1];
      const form = document.querySelector(`#agregarCartForm-${productId}`);

      // Buscar o crear el input oculto
      let tallaInput = form.querySelector('input[name="tallaSeleccionada"]');
      if (!tallaInput) {
        tallaInput = document.createElement('input');
        tallaInput.type = 'hidden';
        tallaInput.name = 'tallaSeleccionada';
        form.appendChild(tallaInput);
      }

      // Actualiza valor
      tallaInput.value = this.value;
      console.log(`👕 Talla seleccionada (${productId}): ${this.value}`);
    });
  });

  // Manejar envío del formulario
  document.querySelectorAll('[id^="agregarCartForm-"]').forEach((form) => {
    const id = form.id.split('-')[1];
    const errorDiv = document.getElementById(`error-message-${id}`);
    const cantidadInput = document.getElementById(`cantidad-${id}`);
    const tallaContainer = document.querySelector(`#tallasContainer-${id}`);

    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      errorDiv.style.display = 'none';
      errorDiv.textContent = '';

      const tallaInput = form.querySelector('input[name="tallaSeleccionada"]');
      const hasTallas = tallaContainer && tallaContainer.querySelectorAll('input[type="radio"]').length > 0;

      // Validaciones
      if (hasTallas && (!tallaInput || !tallaInput.value)) {
        errorDiv.style.display = 'block';
        errorDiv.textContent = '⚠️ Por favor selecciona una talla.';
        return;
      }

      if (!cantidadInput.value || cantidadInput.value <= 0) {
        errorDiv.style.display = 'block';
        errorDiv.textContent = '⚠️ Ingresa una cantidad válida.';
        return;
      }

      // Construir JSON
      const formData = new FormData(form);
      const jsonData = {};
      formData.forEach((v, k) => (jsonData[k] = v));

      // Confirmar valores antes de enviar
      console.log('📦 Enviando datos al servidor:', jsonData);

      // Deshabilitar botón
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
          errorDiv.textContent = resJson.message || 'Error al agregar el producto.';
        } else {
          console.log('🟢 Producto agregado correctamente:', resJson);
          window.location.href = '/cart';
        }
      } catch (err) {
        console.error('❌ Error de red:', err);
        errorDiv.style.display = 'block';
        errorDiv.textContent = 'Error de conexión o servidor.';
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Agregar al pedido';
      }
    });
  });
});

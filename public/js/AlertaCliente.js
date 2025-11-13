// === CAMBIO DE TALLA Y ENVÍO ===
    document.addEventListener('DOMContentLoaded', function () {
      document.querySelectorAll('input[type="radio"][name="tallaSeleccionada"]').forEach((radio) => {
        radio.addEventListener('change', function () {
          const productId = this.dataset.productId;
          const form = document.querySelector(`#agregarCartForm-${productId}`);
          let tallaInput = document.getElementById(`tallaSeleccionada-${productId}`);

          if (!tallaInput) {
            tallaInput = document.createElement('input');
            tallaInput.type = 'hidden';
            tallaInput.id = `tallaSeleccionada-${productId}`;
            tallaInput.name = 'tallaSeleccionada';
            form.appendChild(tallaInput);
          }
          tallaInput.value = this.value;
        });
      });

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

          const formData = new FormData(form);
          const jsonData = {};
          formData.forEach((v, k) => jsonData[k] = v);
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
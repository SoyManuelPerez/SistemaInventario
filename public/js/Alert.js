document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('agregarCartForm-<%= Producto.id %>');
  const errorMessageDiv = document.getElementById('error-message-<%= Producto.id %>');
  const cantidadInput = document.getElementById('cantidad-<%= Producto.id %>');

  if (form) {
    form.addEventListener('submit', async function(event) {
      event.preventDefault();

      // Verificar si `cantidad` es un número válido mayor a cero
      const cantidad = parseInt(cantidadInput.value, 10);
      if (isNaN(cantidad) || cantidad <= 0) {
        errorMessageDiv.style.display = 'block';
        errorMessageDiv.textContent = 'Por favor ingresa una cantidad válida mayor a 0.';
        return;
      }

      const formData = new FormData(form);

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (!result.success) {
          errorMessageDiv.style.display = 'block'; 
          errorMessageDiv.textContent = result.message;
        } else {
          errorMessageDiv.style.display = 'none'; 
          alert(result.message); 
          window.location.href = '/Pedido';
        }
      } catch (error) {
        errorMessageDiv.style.display = 'block'; 
        errorMessageDiv.textContent = 'Error al enviar la solicitud.';
      }
    });
  }
});

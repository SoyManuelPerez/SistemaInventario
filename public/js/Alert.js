document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('agregarCartForm-<%= Producto.id %>');
  const errorMessageDiv = document.getElementById('error-message-<%= Producto.id %>');
    form.addEventListener('submit', async function(event) {
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
  }
);

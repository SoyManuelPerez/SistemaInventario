document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('agregarCartForm-<%= Producto.id %>');
  const errorMessageDiv = document.getElementById('error-message-<%= Producto.id %>');

  if (form) {
    form.addEventListener('submit', async function(event) {
      event.preventDefault(); // Evita que el formulario se envíe normalmente

      const formData = new FormData(form);

      // Verificar los datos que se están enviando al servidor
      for (var pair of formData.entries()) {
        console.log(pair[0] + ', ' + pair[1]); // Muestra los pares clave-valor enviados en el formulario
      }

      // Si el producto es una correa, verificar que se haya seleccionado una talla
      const tallaSeleccionada = document.getElementById('tallaSeleccionada-<%= Producto.id %>').value;
      if (tallaSeleccionada === '') {
        errorMessageDiv.style.display = 'block'; 
        errorMessageDiv.textContent = 'Por favor selecciona una talla.';
        return; // Detener el envío del formulario si no hay talla seleccionada
      }

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        // Si el servidor responde con éxito falso, mostrar el error
        if (!result.success) {
          errorMessageDiv.style.display = 'block'; 
          errorMessageDiv.textContent = result.message; // Mostrar el mensaje de error
        } else {
          // Si la respuesta es exitosa, ocultar el mensaje de error y mostrar un alert
          errorMessageDiv.style.display = 'none'; 
          alert(result.message); // Mostrar el mensaje de éxito en una alerta
          window.location.href = '/Pedido'; // Redirigir a la página de pedido
        }
      } catch (error) {
        // Si ocurre un error en el proceso de envío, mostrar un mensaje de error genérico
        errorMessageDiv.style.display = 'block'; 
        errorMessageDiv.textContent = 'Error al enviar la solicitud.';
      }
    });
  }

  // Verificar la selección de talla en tiempo real
  document.querySelectorAll('input[name="talla-<%= Producto.id %>"]').forEach((radio) => {
    radio.addEventListener('change', function() {
      // Actualizar el campo oculto con la talla seleccionada
      document.getElementById('tallaSeleccionada-<%= Producto.id %>').value = this.value;
    });
  });
});

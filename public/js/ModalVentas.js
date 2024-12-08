const editarEstadoModal = document.getElementById('editarEstadoModal');
const formEditarEstado = document.getElementById('formEditarEstado');
const estadoActualInput = document.getElementById('estadoActual');
const nuevoEstadoSelect = document.getElementById('nuevoEstado');

// Configurar los datos cuando se abra el modal
editarEstadoModal.addEventListener('show.bs.modal', (event) => {
  const button = event.relatedTarget;
  const id = button.getAttribute('data-id');
  const estadoActual = button.getAttribute('data-estado');
  
  // Asignar valores a los campos
  estadoActualInput.value = estadoActual;
  formEditarEstado.action = `/ActualizarEstado/${id}`;
});
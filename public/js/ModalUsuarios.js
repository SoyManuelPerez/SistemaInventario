const modalUsuario = new bootstrap.Modal(document.getElementById('modalUsuario'))

const onl =(element,event,selector,handler)=>{
    element.addEventListener(event, e =>{
        if (e.target.closest(selector)) {
            handler(e);
        }
    })
}
onl(document,'click','.btnEditarUsuario',e=>{
    const fila = e.target.parentNode.parentNode;
    User.value = fila.children[0].innerHTML;
    type.value = fila.children[1].innerHTML;
    password.value = fila.children[2].innerHTML;
    User.setAttribute('readonly', true)
    modalUsuario.show()
})
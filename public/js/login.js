const mensajeError = document.getElementsByClassName("error")[0];

document.getElementById("login").addEventListener("submit", async (e) => {
    e.preventDefault();
    const user = e.target.children.user.value;
    const password = e.target.children.password.value;
    const baseUrl = window.location.origin;
    const apiUrl = `${baseUrl}/ValidarUsuario`;

    const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ user, password })
    });

    if (!res.ok) {
        const resJson = await res.json();
        mensajeError.textContent = resJson.message || "Error al iniciar sesión";
        mensajeError.classList.remove("escondido");
        return;
    }

    const resJson = await res.json();
    if (resJson.redirect) {
        window.location.href = resJson.redirect;
    }
});

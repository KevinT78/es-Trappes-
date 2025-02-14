async function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const errorMessage = document.getElementById("errorMessage");

    errorMessage.textContent = ""; // Réinitialisation du message d'erreur

    try {
        const response = await fetch("http://localhost:3000/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Erreur de connexion");
        }

        localStorage.setItem("adminToken", data.token); // Stocke le token
        window.location.href = "admin-registrations.html"; // Redirige vers l'admin
    } catch (error) {
        errorMessage.textContent = error.message;
    }
}

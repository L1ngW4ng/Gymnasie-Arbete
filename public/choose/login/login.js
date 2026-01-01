document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.getElementById("loginBtn");

    loginBtn.addEventListener("click", () => {
        const username = document.getElementById("usernameInput").value.trim();
        const password = document.getElementById("passwordInput").value;
        login(username, password);
    });
});

const API_URL = window.location.origin;

function login(username, password) {
    fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    })
    .then(res => {
        if (!res.ok) throw new Error("Fel vid inloggningen");
        return res.json();
    })
    .then(data => {
        if (!data.success) {
            throw new Error(data.message || "Felaktigt användarnamn eller lösenord");
        }

        // Save full user data
        const user = data.userData;
        // Onödigt att spara bara användarnamnet, och det ställer till problem med gästanvändare
        // sessionStorage.setItem("username", user.username);
        sessionStorage.setItem("userData", JSON.stringify(user));

        console.log("Inloggning lyckades:", user);

        window.location.href = "../../chat/chat.html";
    })
    .catch(err => {
        alert("Inloggning misslyckades: " + err.message);
    });
}



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
        sessionStorage.setItem("username", user.username);
        sessionStorage.setItem("userData", JSON.stringify(user));

        console.log("Inloggning lyckades:", user);

        alert("LÄS I LOGIN.JS RAD 34!!!");
        alert("Lägg till Guest User med vilket namn som helst!");
        /*
            Ändra så att Konto knappen inte bara är för att logga in och registrera,
            utan det ska vara för att ändra konto inställningar?

            Eller så byter du namn till Logga in och så är den bara till att logga in och registrera och om man vill
            ändra konto inställningar så får man fixa det i inställningar, kanske i profil. Men profil ska vara mer offentliga saker:
            Bio, profilbild, namn, födelsedag och allt sånt.
            Sen i inställningar så får man ändra lösenord, hantera login, allt sånt tekniskt.
        */

        window.location.href = "../../chat/chat.html";
    })
    .catch(err => {
        alert("Inloggning misslyckades: " + err.message);
    });
}



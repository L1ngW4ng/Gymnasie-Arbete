// ======= CLIENT SIDE =======

document.addEventListener("DOMContentLoaded", function () {
    const sendBtn = document.querySelector(".sendBtn");
    const messageInput = document.getElementById("message-input");
    const popup = document.getElementById("loginPopup");
    const blurBg = document.querySelector(".blurBackground");
    const hoverBtn = document.querySelector(".loginRDBtn");
    const displayContainer = document.getElementById("profile-container");
    const API_URL = window.location.origin;

    // === Sätt Guest som default användare om ingen finns ===
    let username = sessionStorage.getItem("username");
    if (!username) {
        username = "Guest" + Math.floor(Math.random() * 1000);
        sessionStorage.setItem("username", username);
    }

    // === Funktion för att uppdatera profildisplay ===
    function updateProfileDisplay(user) {
        if (user.startsWith("Guest")) {
            displayContainer.innerHTML = `
                <img id="profile-picture" src="${API_URL}/uploads/default-profile.png" alt="Guest" width="50" height="50">
                <h3 id="displayUsername">${user}</h3>
            `;
        } else {
            fetch(`${API_URL}/user/${user}`)
                .then(res => {
                    if (!res.ok) throw new Error("Användare hittades inte");
                    return res.json();
                })
                .then(userData => {
                    displayContainer.innerHTML = `
                        <img id="profile-picture" src="${userData.profile_picture ? `${API_URL}/uploads/${userData.profile_picture}` : 'default-profile.png'}"
                             alt="${userData.username}" width="50" height="50">
                        <h3 id="displayUsername">${userData.username}</h3>
                    `;
                })
                .catch(err => {
                    console.error("Kunde inte hämta profilbild:", err);
                    // fallback
                    displayContainer.innerHTML = `
                        <img id="profile-picture" src="${API_URL}/uploads/default-profile.png" alt="${user}" width="50" height="50">
                        <h3 id="displayUsername">${user}</h3>
                    `;
                });
        }
    }

    // === Initiera profildisplay ===
    updateProfileDisplay(username);

    // === Hover-effekter på login-knappen ===
    hoverBtn.addEventListener("mouseenter", () => {
        popup.style.backgroundColor = "lightgray";
    });
    hoverBtn.addEventListener("mouseleave", () => {
        popup.style.backgroundColor = "rgba(141, 141, 141, 0.716)";
    });

    // === Visa popup om man vill logga in ===
    if (!sessionStorage.getItem("username")) {
        popup.style.visibility = "visible";
        blurBg.style.visibility = "visible";
    }

    // === Skicka meddelande ===
    sendBtn.addEventListener("click", function () {
        sendMessage(messageInput.value);
    });

    // === WebSocket setup ===
    const ws = new WebSocket('ws://localhost:8080');

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const msgBox = document.querySelector(".messageBox");

        if (data.username === sessionStorage.getItem("username")) {
            msgBox.innerHTML += `<p><strong>You:</strong> ${data.message}</p>`;
        } else {
            msgBox.innerHTML += `<p><strong>${data.username}:</strong> ${data.message}</p>`;
        }
    };
});

// ======= FUNCTIONS =======

// Skicka meddelande
function sendMessage() {
    const input = document.getElementById("messageInput");
    const message = input.value.trim();
    const username = sessionStorage.getItem("username");

    if (message) {
        const ws = new WebSocket('ws://localhost:8080');
        ws.onopen = () => {
            ws.send(JSON.stringify({ username, message }));
        };
        input.value = "";
    }
}

// Guest user-knapp
function guestUser() {
    const API_URL = window.location.origin;
    const username = "Guest" + Math.floor(Math.random() * 1000);

    sessionStorage.setItem("username", username);
    const displayContainer = document.getElementById("profile-container");
    displayContainer.innerHTML = `
        <img id="profile-picture" src="${API_URL}/uploads/default-profile.png" alt="Guest" width="50" height="50">
        <h3 id="displayUsername">${username}</h3>
    `;
}

// Spara användare från login-popup
function saveUsername(userName) {
    const popup = document.getElementById("loginPopup");
    const blurBg = document.querySelector(".blurBackground");

    if (userName) {
        sessionStorage.setItem("username", userName);
        popup.style.visibility = "hidden";
        blurBg.style.visibility = "hidden";

        // Uppdatera profildisplay
        const displayContainer = document.getElementById("profile-container");
        displayContainer.innerHTML = `
            <img id="profile-picture" src="default-profile.png" alt="${userName}" width="50" height="50">
            <h3 id="displayUsername">${userName}</h3>
        `;
    }
}

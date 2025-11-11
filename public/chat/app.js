// ======= CLIENT SIDE =======
document.addEventListener("DOMContentLoaded", function () {
    const sendBtn = document.querySelector(".sendBtn");
    const messageInput = document.getElementById("messageInput");
    const popup = document.getElementById("loginPopup");
    const blurBg = document.querySelector(".blurBackground");
    const hoverBtn = document.querySelector(".loginRDBtn");
    const displayContainer = document.getElementById("profile-container");
    const msgBox = document.querySelector(".messageBox");
    const API_URL = window.location.origin;

    // === Guest om ingen username finns ===
    let username = sessionStorage.getItem("username");
    if (!username) {
        username = "Guest" + Math.floor(Math.random() * 1000);
        sessionStorage.setItem("username", username);
    }

    // === Visa profil ===
    function updateProfileDisplay(user) {
        displayContainer.innerHTML = `
            <img id="profile-picture" src="${API_URL}/uploads/default-profile.png" alt="${user}" width="50" height="50">
            <h3 id="displayUsername">${user}</h3>
        `;
    }
    updateProfileDisplay(username);

    // === Hover på popup knapp ===
    hoverBtn.addEventListener("mouseenter", () => popup.style.backgroundColor = "lightgray");
    hoverBtn.addEventListener("mouseleave", () => popup.style.backgroundColor = "rgba(141,141,141,0.716)");

    // === WebSocket ===
    const ws = new WebSocket('ws://localhost:8080');

    ws.addEventListener("open", () => console.log("WebSocket connected"));


    // TODO: lägg till notis om någon har skrivit ett nytt meddelande när man scrollar uppåt
    
    ws.addEventListener("message", (event) => {
        const data = JSON.parse(event.data);

        // Hur långt från botten är vi?
        const distanceFromBottom = msgBox.scrollHeight - msgBox.scrollTop - msgBox.clientHeight;

        if (data.username === username) {
            // Mitt eget meddelande → alltid scrolla ner
            msgBox.innerHTML += `<p><strong>You:</strong> ${escapeHtml(data.message)}</p>`;
            msgBox.scrollTop = msgBox.scrollHeight;
        } else {
            // Andras meddelande → scrolla endast om vi är nära botten (<100px)
            msgBox.innerHTML += `<p><strong>${escapeHtml(data.username)}:</strong> ${escapeHtml(data.message)}</p>`;
            if (distanceFromBottom <= 50) {
                msgBox.scrollTop = msgBox.scrollHeight;
            }
        }
    });


    ws.addEventListener("close", () => console.log("WebSocket closed"));
    ws.addEventListener("error", e => console.error("WebSocket error", e));

    // === Skicka meddelande ===
    function sendMessage() {
        const message = messageInput.value.trim();
        if (!message) return;

        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ username, message }));
            messageInput.value = "";
        } else {
            console.warn("WebSocket är inte öppen!");
        }
    }

    // Klick på send-knapp
    sendBtn.addEventListener("click", sendMessage);

    // Enter-tangent
    messageInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            sendMessage();
        }
    });

    // === Kontrollera om elementet är längst ner ===
    function isScrolledToBottom(el) {
        return el.scrollHeight - el.scrollTop === el.clientHeight;
    }

    // === Guest-knapp ===
    window.guestUser = function() {
        username = "Guest" + Math.floor(Math.random() * 1000);
        sessionStorage.setItem("username", username);
        updateProfileDisplay(username);
    };

    // === Popup login-spara ===
    window.saveUsername = function(userName) {
        if (!userName) return;
        username = userName.trim();
        sessionStorage.setItem("username", username);
        popup.style.visibility = "hidden";
        blurBg.style.visibility = "hidden";
        updateProfileDisplay(username);
    };

    // === Enkel HTML-escape för säkerhet ===
    function escapeHtml(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});

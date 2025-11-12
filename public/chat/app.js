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

    // === Hämta användardata från sessionStorage ===
    let userData = JSON.parse(sessionStorage.getItem("userData"));
    let username, profile_picture;

    // === Om ingen användare finns, skapa gäst ===
    if (!userData) {
        username = "Guest" + Math.floor(Math.random() * 1000);
        profile_picture = `${API_URL}/uploads/default-profile.png`;
        userData = { username, profile_picture };
        sessionStorage.setItem("userData", JSON.stringify(userData));
    } else {
        username = userData.username;
        profile_picture = userData.profile_picture ? `${API_URL}/uploads/${userData.profile_picture}` : `${API_URL}/uploads/default-profile.png`;
    }

    // === Visa profil ===
    function updateProfileDisplay(username, profile_picture) {
        const imgSrc = profile_picture || `${API_URL}/uploads/default-profile.png`;
        displayContainer.innerHTML = `
            <img id="profile-picture" src="${imgSrc}" alt="${username}" width="50" height="50">
            <h3 id="displayUsername">${username}</h3>
        `;
    }

    updateProfileDisplay(username, profile_picture);

    // === Hover på popup-knapp ===
    hoverBtn.addEventListener("mouseenter", () => popup.style.backgroundColor = "lightgray");
    hoverBtn.addEventListener("mouseleave", () => popup.style.backgroundColor = "rgba(141,141,141,0.716)");

    // === WebSocket ===
    const ws = new WebSocket('ws://localhost:8080');

    ws.addEventListener("open", () => console.log("WebSocket connected"));

    ws.addEventListener("message", (event) => {
        const data = JSON.parse(event.data);

        // Hur långt från botten är vi?
        const distanceFromBottom = msgBox.scrollHeight - msgBox.scrollTop - msgBox.clientHeight;

        if (data.username === username) {
            msgBox.innerHTML += `<p><strong>You:</strong> ${escapeHtml(data.message)}</p>`;
            msgBox.scrollTop = msgBox.scrollHeight;
        } else {
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

    sendBtn.addEventListener("click", sendMessage);
    messageInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            sendMessage();
        }
    });

    // === Guest-knapp ===
    window.guestUser = function() {
        const guestName = "Guest" + Math.floor(Math.random() * 1000);
        const guestPic = `${API_URL}/uploads/default-profile.png`;
        sessionStorage.setItem("userData", JSON.stringify({ username: guestName, profile_picture: guestPic }));
        updateProfileDisplay(guestName, guestPic);
    };

    // === Popup login-spara ===
    window.saveUsername = function(userName) {
        if (!userName) return;
        const newUserData = { username: userName.trim(), profile_picture: profile_picture };
        sessionStorage.setItem("userData", JSON.stringify(newUserData));
        popup.style.visibility = "hidden";
        blurBg.style.visibility = "hidden";
        updateProfileDisplay(newUserData.username, newUserData.profile_picture);
    };

    // === Enkel HTML-escape ===
    function escapeHtml(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});

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

    // Server notification elements
    const notification = document.getElementById("server-notifications");

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
        profile_picture = userData.profile_picture || `${API_URL}/uploads/default-profile.png`;
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

    // === Server notification close button ===
    // const notification = document.getElementById("server-notifications");
    if (notification) {
        const notificationCross = notification.querySelector(".notification-cross");
        if (notificationCross) {
            notificationCross.addEventListener("click", () => {
                notification.style.display = "none";
            });
        }
    }



    // === WebSocket ===
    const ws = new WebSocket('ws://localhost:8080');

    ws.addEventListener("open", () => console.log("WebSocket connected"));

    ws.addEventListener("message", (event) => {
        const data = JSON.parse(event.data);

        // Check if user was near bottom
        const wasNearBottom = msgBox.scrollTop + msgBox.clientHeight >= msgBox.scrollHeight - 50;

        // Create message element
        const p = document.createElement("p");
        if (data.username === username) {
            p.innerHTML = `<strong>You:</strong> ${escapeHtml(data.message)}`;
        } else {
            p.innerHTML = `<strong>${escapeHtml(data.username)}:</strong> ${escapeHtml(data.message)}`;
        }

        msgBox.appendChild(p);

        // Scroll only if user was near bottom
        if (wasNearBottom) {
            msgBox.scrollTop = msgBox.scrollHeight;
        }
    });

    ws.addEventListener("close", () => {
        console.log("WebSocket closed");
        showServerOfflineMessage();
    });

    ws.addEventListener("error", (e) => {
        console.error("WebSocket error", e);
        showServerOfflineMessage();
    });

    function showServerOfflineMessage() {
        notification.style.display = "flex"; // Show the notification
        console.log("Server is offline notification shown");
    }

    // === Skicka meddelande ===
    function sendMessage() {
        const message = messageInput.value.trim();
        if (!message) return;

        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ username, message }));
            messageInput.value = "";
        } else {
            console.warn("WebSocket är inte öppen!");
            showServerOfflineMessage();
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

    // === HTML-escape ===
    function escapeHtml(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});

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
    const room_id = "general";

    // Tab-ID
    let tabID = sessionStorage.getItem("tabID");
    if (!tabID) {
        tabID = Math.random().toString(36).substring(2, 9);
        sessionStorage.setItem("tabID", tabID);
    }

    // Server notification element
    const notification = document.getElementById("server-notifications");

    // Hämta userData från sessionStorage
    let userData = JSON.parse(sessionStorage.getItem("userData"));
    let username, profile_picture;

    if (!userData) {
        username = "Guest" + Math.floor(Math.random() * 1000);
        profile_picture = `${API_URL}/uploads/default-profile.png`;
        userData = { username, profile_picture: null };
        sessionStorage.setItem("userData", JSON.stringify(userData));
    } else {
        username = userData.username;
        profile_picture = userData.profile_picture
            ? `${API_URL}/uploads/${userData.profile_picture}`
            : `${API_URL}/uploads/default-profile.png`;
    }

    // Visa profil
    function updateProfileDisplay(username, profile_picture) {
        const imgSrc = profile_picture || `${API_URL}/uploads/default-profile.png`;
        displayContainer.innerHTML = `
            <img id="profile-picture" src="${imgSrc}" alt="${username}" width="50" height="50">
            <h3 id="displayUsername">${username}</h3>
        `;
    }
    updateProfileDisplay(username, profile_picture);

    // Hover popup-knapp
    hoverBtn.addEventListener("mouseenter", () => popup.style.backgroundColor = "lightgray");
    hoverBtn.addEventListener("mouseleave", () => popup.style.backgroundColor = "rgba(141,141,141,0.716)");

    // Server notification close
    if (notification) {
        const notificationCross = notification.querySelector(".notification-cross");
        if (notificationCross) {
            notificationCross.addEventListener("click", () => notification.style.display = "none");
        }
    }

    // Load messages
    async function loadMessages() {
        try {
            const res = await fetch(`${API_URL}/test/messages/${room_id}`);
            const messages = await res.json();
            msgBox.innerHTML = "";
            messages.forEach(msg => {
                const p = document.createElement("p");
                p.innerHTML = msg.sender === username
                    ? `<strong>You:</strong> ${escapeHtml(msg.content)}`
                    : `<strong>${escapeHtml(msg.sender)}:</strong> ${escapeHtml(msg.content)}`;
                msgBox.appendChild(p);
            });
            msgBox.scrollTop = msgBox.scrollHeight;
        } catch (err) {
            console.error("Error loading messages:", err);
        }
    }
    loadMessages();

    async function saveMessageToDB(content) {
        try {
            await fetch(`${API_URL}/test/message`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ room_id, sender: username, content })
            });
        } catch (err) {
            console.error("Error saving message to database:", err);
        }
    }

    // WebSocket
    const ws = new WebSocket('ws://localhost:8080');
    ws.addEventListener("open", () => console.log("WebSocket connected"));
    ws.addEventListener("message", (event) => {
        const data = JSON.parse(event.data);
        const wasNearBottom = msgBox.scrollTop + msgBox.clientHeight >= msgBox.scrollHeight - 50;
        const p = document.createElement("p");
        p.innerHTML = data.username === username
            ? `<strong>You:</strong> ${escapeHtml(data.message)}`
            : `<strong>${escapeHtml(data.username)}:</strong> ${escapeHtml(data.message)}`;
        msgBox.appendChild(p);
        if (data.tabID === tabID || wasNearBottom) msgBox.scrollTop = msgBox.scrollHeight;
    });
    ws.addEventListener("close", () => showServerOfflineMessage());
    ws.addEventListener("error", () => showServerOfflineMessage());

    function showServerOfflineMessage() {
        if (notification) notification.style.display = "flex";
    }

    // Skicka meddelande
    function sendMessage() {
        const message = messageInput.value.trim();
        if (!message) return;
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ username, message, tabID }));
            saveMessageToDB(message);
            messageInput.value = "";
        } else {
            showServerOfflineMessage();
        }
    }
    sendBtn.addEventListener("click", sendMessage);
    messageInput.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); sendMessage(); } });

    // Guest-knapp
    window.guestUser = function () {
        if (userData && userData.id) {
            const data = JSON.stringify({ userID: userData.id });
            const blob = new Blob([data], { type: "application/json" });
            navigator.sendBeacon(`${API_URL}/logout`, blob);
        }

        const guestName = "Guest" + Math.floor(Math.random() * 1000);

        userData = {
            username: guestName,
            profile_picture: "default-profile.png"
        };

        sessionStorage.setItem("userData", JSON.stringify(userData));

        updateProfileDisplay(guestName, null);
    };


    // Popup login-spara
    window.saveUsername = function (userName) {
        if (!userName) return;
        const newUserData = { username: userName.trim(), profile_picture };
        sessionStorage.setItem("userData", JSON.stringify(newUserData));
        popup.style.visibility = "hidden";
        blurBg.style.visibility = "hidden";
        updateProfileDisplay(newUserData.username, newUserData.profile_picture);
    };

    // Logout med sendBeacon
    window.addEventListener("beforeunload", () => {
        if (userData && userData.id) {
            const data = JSON.stringify({ userID: userData.id });
            const blob = new Blob([data], { type: "application/json" });
            navigator.sendBeacon(`${API_URL}/logout`, blob);
        }
    });

    // HTML escape
    function escapeHtml(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});

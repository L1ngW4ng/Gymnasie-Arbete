// CLIENT CODE

document.addEventListener("DOMContentLoaded", function () {
    const sendBtn = document.querySelector(".sendBtn");
    const messageInput = document.getElementById("message-input");

    const popup = document.getElementById("loginPopup");
    const saveBtn = document.getElementById("saveBtn");
    const userInput = document.getElementById("userInput");
    
    const blurBg = document.querySelector(".blurBackground");

    const hoverBtn = document.querySelector(".loginRDBtn");

    hoverBtn.addEventListener("mouseenter", () => {
        popup.style.backgroundColor = "lightgray";
    });
    hoverBtn.addEventListener("mouseleave", () => {
        popup.style.backgroundColor = "rgba(141, 141, 141, 0.716)";
    });

    // if(!popup) return;

    if(!sessionStorage.getItem("username")) {
        popup.style.visibility = "visible";
        blurBg.style.visibility = "visible";
    }

    sendBtn.addEventListener("click", function () {
        sendMessage(messageInput.value);
    });
});

function saveUsername(userName) {
    const popup = document.getElementById("loginPopup");
    const blurBg = document.querySelector(".blurBackground");


    if(userName) {
        sessionStorage.setItem("username", userName);
        popup.style.visibility = "hidden";
        blurBg.style.visibility = "hidden";
    }
}






// SERVER CODE

const ws = new WebSocket('ws://localhost:8080');



ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    const msgBox = document.querySelector(".messageBox");

    if(data.username === sessionStorage.getItem("username")) {
        msgBox.innerHTML += `<p><strong>You:</strong> ${ data.message }</p>`;
    } else {
        msgBox.innerHTML += `<p><strong>${ data.username }:</strong> ${ data.message }</p>`;
    }
}

function sendMessage() {
    const input = document.getElementById("messageInput");
    const message = input.value.trim();
    const username = sessionStorage.getItem("username");


    if(message) {
        ws.send(JSON.stringify({ username, message }));
        input.value = "";
    }
}
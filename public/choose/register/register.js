document.addEventListener("DOMContentLoaded", () => {
    const registerBtn = document.getElementById("registerBtn");


    


    registerBtn.addEventListener("click", () => {
        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value;
        const email = document.getElementById("email").value;
        const phonenumber = document.getElementById("phonenumber").value;
        const birthday = document.getElementById("birthday").value;

        register(username, password, email, phonenumber, birthday);

    });
});

const API_URL = window.location.origin;



function register(username, password, email, phonenumber, birthday) {
    fetch(`${ API_URL }/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, email, phonenumber, birthday })
    })
    .then(res => {
        if(!res.ok) throw new Error("Fel vid registrering");
        return res.text();
    })
    .then(msg => {
        console.log(msg);
        alert("Registrering lyckades! Du kan nu logga in.");

        window.location.href = "../login/login.html";
    })
    .catch(err => {
        alert("Registreringen misslyckades: " + err.message);
    });
}
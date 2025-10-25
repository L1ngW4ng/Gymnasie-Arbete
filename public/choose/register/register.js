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
    const profilePictureInput = document.getElementById("profile_picture");

    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);
    formData.append("email", email);
    formData.append("phonenumber", phonenumber);
    formData.append("birthday", birthday);
    if(profilePictureInput.files.length > 0) {
        formData.append("profile_picture", profilePictureInput.files[0]);
    }

    fetch(`${ API_URL }/register`, {
        method: "POST",
        body: formData,
    })
    .then(msg => {
        console.log(msg);
        alert("Registreringen lyckades! Du kan nu logga in.");
        window.location.href = "../login/login.html";
    })
    .catch(err => {
        alert("Registreringen misslyckades: " + err.message);
    });
}
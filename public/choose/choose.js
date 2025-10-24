document.addEventListener("DOMContentLoaded", () => {
    const chooseLogin = document.getElementById("chooseLogin");
    const chooseRegister = document.getElementById("chooseRegister");
    const blurBackground = document.querySelector(".blurBackground");
    const Lline = document.querySelector(".Lline");
    const Rline = document.querySelector(".Rline");




    blurBackground.style.visibility = "visible";

    chooseLogin.addEventListener("click", () => {
        blurBackground.style.visibility = "hidden";
        window.location.href = "./login/login.html";
    });
    chooseLogin.addEventListener("mouseover", () => {
        Lline.style.border = "1px solid rgb(192, 192, 192)";
        Lline.style.boxShadow = "0px 2px 2px gray";
    });
    chooseLogin.addEventListener("mouseleave", () => {
        Lline.style.border = "1px solid white";
    });


    chooseRegister.addEventListener("click", () => {
        blurBackground.style.visibility = "hidden";
        window.location.href = "./register/register.html";
    });
    chooseRegister.addEventListener("mouseover", () => {
        Rline.style.border = "1px solid rgb(192, 192, 192)";
        Rline.style.boxShadow = "0px 2px 2px gray";
    });
    chooseRegister.addEventListener("mouseleave", () => {
        Rline.style.border = "1px solid white";
    });
});
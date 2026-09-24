```javascript
/* =========================================================
   NUTRIQ
   SCRIPT PRINCIPAL
========================================================= */

"use strict";


/* =========================================================
   MENU / HEADER
========================================================= */

const header = document.querySelector(".header");

let ultimaPosicao = window.scrollY;

if (header) {
    window.addEventListener("scroll", () => {

        const posicaoAtual = window.scrollY;

        if (posicaoAtual <= 20) {
            header.classList.remove("hidden");
        } 
        else if (posicaoAtual > ultimaPosicao) {
            header.classList.add("hidden");
        } 
        else {
            header.classList.remove("hidden");
        }

        ultimaPosicao = posicaoAtual;
    });
}


/* =========================================================
   LOGIN
========================================================= */

const btnLogin = document.getElementById("btnLogin");
const loginModal = document.getElementById("loginModal");
const closeLogin = document.getElementById("closeLogin");
const loginOverlay = document.querySelector(".login-overlay");


function abrirLogin() {

    if (!loginModal) {
        return;
    }

    loginModal.classList.add("active");
    loginModal.setAttribute("aria-hidden", "false");

    document.body.style.overflow = "hidden";
}


function fecharLogin() {

    if (!loginModal) {
        return;
    }

    loginModal.classList.remove("active");
    loginModal.setAttribute("aria-hidden", "true");

    document.body.style.overflow = "";
}


if (btnLogin) {
    btnLogin.addEventListener("click", abrirLogin);
}


if (closeLogin) {
    closeLogin.addEventListener("click", fecharLogin);
}


if (loginOverlay) {

    loginOverlay.addEventListener("click", (event) => {

        if (event.target === loginOverlay) {
            fecharLogin();
        }

    });
}


document.addEventListener("keydown", (event) => {

    if (event.key === "Escape") {
        fecharLogin();
    }

});


/* =========================================================
   LOGO / PREVISUALIZAÇÃO DE IMAGEM
========================================================= */

const logoInput = document.getElementById("logoInput");
const logoPreview = document.getElementById("logoPreview");

if (logoInput && logoPreview) {

    logoInput.addEventListener("change", (event) => {

        const arquivo = event.target.files[0];

        if (!arquivo) {
            return;
        }

        if (!arquivo.type.startsWith("image/")) {

            alert("Selecione um arquivo de imagem válido.");

            logoInput.value = "";

            return;
        }

        const imagemURL = URL.createObjectURL(arquivo);

        logoPreview.src = imagemURL;

        logoPreview.onload = () => {
            URL.revokeObjectURL(imagemURL);
        };

    });

}


/* =========================================================
   ABAS DAS CALCULADORAS
========================================================= */

const macroForm = document.getElementById("macroForm");
const imcForm = document.getElementById("imcForm");
const aguaForm = document.getElementById("aguaForm");


function mostrarCalculadora(tipo) {

    const calculadoras = {
        macros: {
            elemento: macroForm,
            aba: tabMacros
        },

        imc: {
            elemento: imcForm,
            aba: tabIMC
        },

        agua: {
            elemento: aguaForm,
            aba: tabAgua
        }
    };


    Object.values(calculadoras).forEach((calculadora) => {

        if (calculadora.elemento) {
            calculadora.elemento.style.display = "none";
        }

        if (calculadora.aba) {
            calculadora.aba.classList.remove("active");
        }

    });


    const selecionada = calculadoras[tipo];

    if (!selecionada) {
        return;
    }


    if (selecionada.elemento) {
        selecionada.elemento.style.display = "block";
    }

    if (selecionada.aba) {
        selecionada.aba.classList.add("active");
    }

}


if (tabMacros) {

    tabMacros.addEventListener("click", (event) => {

        event.preventDefault();

        mostrarCalculadora("macros");

    });

}


if (tabIMC) {

    tabIMC.addEventListener("click", (event) => {

        event.preventDefault();

        mostrarCalculadora("imc");

    });

}


if (tabAgua) {

    tabAgua.addEventListener("click", (event) => {

        event.preventDefault();

        mostrarCalculadora("agua");

    });

}


mostrarCalculadora("macros");


/* =========================================================
   LOGIN / CADASTRO
========================================================= */

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const criarConta = document.getElementById("criarConta");
const voltarLogin = document.getElementById("voltarLogin");

const loginTitle = document.getElementById("loginTitle");
const loginSubtitle = document.getElementById("loginSubtitle");


function mostrarCadastro() {

    if (!loginForm || !registerForm) {
        return;
    }

    loginForm.style.display = "none";
    registerForm.style.display = "block";


    if (loginTitle) {
        loginTitle.textContent = "Criar sua conta";
    }


    if (loginSubtitle) {
        loginSubtitle.textContent =
            "Preencha seus dados para começar";
    }

}


function mostrarLogin() {

    if (!loginForm || !registerForm) {
        return;
    }

    registerForm.style.display = "none";
    loginForm.style.display = "block";


    if (loginTitle) {
        loginTitle.textContent = "Entrar na sua conta";
    }


    if (loginSubtitle) {
        loginSubtitle.textContent =
            "Acesse sua conta no NUTRIQ";
    }

}


if (criarConta) {

    criarConta.addEventListener("click", (event) => {

        event.preventDefault();

        mostrarCadastro();

    });

}


if (voltarLogin) {

    voltarLogin.addEventListener("click", (event) => {

        event.preventDefault();

        mostrarLogin();

    });

}


/* =========================================================
   FORMULÁRIO DE LOGIN
========================================================= */

if (loginForm) {

    loginForm.addEventListener("submit", (event) => {

        event.preventDefault();

        alert(
            "Login será conectado ao sistema posteriormente."
        );

    });

}


/* =========================================================
   FORMULÁRIO DE CADASTRO
========================================================= */

if (registerForm) {

    registerForm.addEventListener("submit", (event) => {

        event.preventDefault();

        alert(
            "Cadastro será conectado ao sistema posteriormente."
        );

    });

}
```

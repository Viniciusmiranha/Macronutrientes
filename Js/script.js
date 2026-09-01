/* =========================================================
   NUTRIQ - SCRIPT PRINCIPAL
========================================================= */


/* =========================================================
   MENU - ESCONDER AO ROLAR PARA BAIXO
========================================================= */

const header = document.querySelector(".header");

let ultimaPosicao = window.scrollY;

window.addEventListener("scroll", function () {

    const posicaoAtual = window.scrollY;

    if (posicaoAtual <= 20) {

        header.classList.remove("hidden");

    } else if (posicaoAtual > ultimaPosicao) {

        // Rolando para baixo
        header.classList.add("hidden");

    } else {

        // Rolando para cima
        header.classList.remove("hidden");

    }

    ultimaPosicao = posicaoAtual;

});


/* =========================================================
   LOGIN
========================================================= */

const btnLogin = document.getElementById("btnLogin");
const loginModal = document.getElementById("loginModal");
const closeLogin = document.getElementById("closeLogin");
const loginOverlay = document.querySelector(".login-overlay");


/* Abrir login */

if (btnLogin && loginModal) {

    btnLogin.addEventListener("click", function () {

        loginModal.classList.add("active");

        loginModal.setAttribute("aria-hidden", "false");

        document.body.style.overflow = "hidden";

    });

}


/* Fechar pelo X */

if (closeLogin) {

    closeLogin.addEventListener("click", function () {

        fecharLogin();

    });

}


/* Fechar clicando no fundo */

if (loginOverlay) {

    loginOverlay.addEventListener("click", function () {

        fecharLogin();

    });

}


/* Função para fechar */

function fecharLogin() {

    if (!loginModal) {
        return;
    }

    loginModal.classList.remove("active");

    loginModal.setAttribute("aria-hidden", "true");

    document.body.style.overflow = "";

}


/* Fechar com ESC */

document.addEventListener("keydown", function (event) {

    if (event.key === "Escape") {

        fecharLogin();

    }

});


/* =========================================================
   LOGO - SELECIONAR IMAGEM
========================================================= */

const logoInput = document.getElementById("logoInput");
const logoPreview = document.getElementById("logoPreview");


if (logoInput && logoPreview) {

    logoInput.addEventListener("change", function (event) {

        const arquivo = event.target.files[0];

        if (!arquivo) {
            return;
        }

        if (!arquivo.type.startsWith("image/")) {

            alert("Selecione um arquivo de imagem.");

            logoInput.value = "";

            return;

        }

        const imagemURL = URL.createObjectURL(arquivo);

        logoPreview.src = imagemURL;

    });

}


/* =========================================================
   ABAS - MACROS / IMC
========================================================= */

const tabMacros = document.getElementById("tabMacros");
const tabIMC = document.getElementById("tabIMC");

const macroForm = document.getElementById("macroForm");
const imcForm = document.getElementById("imc");


/* Macronutrientes */

if (tabMacros && tabIMC && macroForm && imcForm) {

    tabMacros.addEventListener("click", function () {

        tabMacros.classList.add("active");

        tabIMC.classList.remove("active");

        macroForm.style.display = "block";

        imcForm.style.display = "none";

    });

}


/* IMC */

if (tabIMC && tabMacros && macroForm && imcForm) {

    tabIMC.addEventListener("click", function () {

        tabIMC.classList.add("active");

        tabMacros.classList.remove("active");

        macroForm.style.display = "none";

        imcForm.style.display = "block";

    });

}


/* =========================================================
   FORMULÁRIO DE MACRONUTRIENTES
========================================================= */

const formularioMacros =
    document.querySelector(".macro-form form");


if (formularioMacros) {

    formularioMacros.addEventListener("submit", function (event) {

        event.preventDefault();

        alert(
            "Cálculo de macronutrientes será implementado posteriormente."
        );

    });

}


/* =========================================================
   FORMULÁRIO DE IMC
========================================================= */

const formularioIMC =
    document.querySelector(".imc-form form");


if (formularioIMC) {

    formularioIMC.addEventListener("submit", function (event) {

        event.preventDefault();

        alert(
            "Cálculo do IMC será implementado posteriormente."
        );

    });

}


/* =========================================================
   FORMULÁRIO DE LOGIN
========================================================= */

const loginForm =
    document.getElementById("loginForm");


if (loginForm) {

    loginForm.addEventListener("submit", function (event) {

        event.preventDefault();

        alert(
            "Login será conectado ao sistema posteriormente."
        );

    });

}


/* =========================================================
   LOGIN / CRIAR CONTA
========================================================= */

const criarConta =
    document.getElementById("criarConta");

const voltarLogin =
    document.getElementById("voltarLogin");

const registerForm =
    document.getElementById("registerForm");

const loginTitle =
    document.getElementById("loginTitle");

const loginSubtitle =
    document.getElementById("loginSubtitle");


/* =========================================================
   ABRIR TELA DE CADASTRO
========================================================= */

if (criarConta && loginForm && registerForm) {

    criarConta.addEventListener("click", function () {

        loginForm.style.display = "none";

        registerForm.style.display = "block";


        if (loginTitle) {

            loginTitle.textContent =
                "Criar sua conta";

        }


        if (loginSubtitle) {

            loginSubtitle.textContent =
                "Preencha seus dados para começar";

        }

    });

}


/* =========================================================
   VOLTAR PARA LOGIN
========================================================= */

if (voltarLogin && loginForm && registerForm) {

    voltarLogin.addEventListener("click", function () {

        registerForm.style.display = "none";

        loginForm.style.display = "block";


        if (loginTitle) {

            loginTitle.textContent =
                "Entrar na sua conta";

        }


        if (loginSubtitle) {

            loginSubtitle.textContent =
                "Acesse sua conta no NUTRIQ";

        }

    });

}


/* =========================================================
   FORMULÁRIO DE CADASTRO
========================================================= */

if (registerForm) {

    registerForm.addEventListener("submit", function (event) {

        event.preventDefault();

        alert(
            "Cadastro será conectado ao sistema posteriormente."
        );

    });

}
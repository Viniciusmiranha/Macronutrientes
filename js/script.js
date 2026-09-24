/* =========================================================
   NUTRIQ - SCRIPT PRINCIPAL
   Menu, Login, Cadastro, Logo e Abas das Calculadoras
========================================================= */


/* =========================================================
   MENU - ESCONDER AO ROLAR PARA BAIXO
========================================================= */

const header = document.querySelector(".header");

let ultimaPosicao = window.scrollY;

if (header) {
    window.addEventListener("scroll", function () {

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

    loginOverlay.addEventListener("click", function (event) {

        if (event.target === loginOverlay) {

            fecharLogin();

        }

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
   ABAS DAS CALCULADORAS
   MACRONUTRIENTES / IMC / ÁGUA
========================================================= */


/*
    BOTÕES DAS ABAS
*/

const tabMacros = document.getElementById("tabMacros");
const tabIMC = document.getElementById("tabIMC");
const tabAgua = document.getElementById("tabAgua");


/*
    FORMULÁRIOS

    IMPORTANTE:
    O formulário do IMC é "imcForm".
*/

const macroForm = document.getElementById("macroForm");
const imcForm = document.getElementById("imcForm");
const aguaForm = document.getElementById("aguaForm");


/* =========================================================
   FUNÇÃO CENTRAL PARA TROCAR DE CALCULADORA
========================================================= */

function mostrarCalculadora(tipo) {

    /*
        Primeiro escondemos todas as calculadoras.
    */

    if (macroForm) {
        macroForm.style.display = "none";
    }

    if (imcForm) {
        imcForm.style.display = "none";
    }

    if (aguaForm) {
        aguaForm.style.display = "none";
    }


    /*
        Removemos "active" de todas as abas.
    */

    if (tabMacros) {
        tabMacros.classList.remove("active");
    }

    if (tabIMC) {
        tabIMC.classList.remove("active");
    }

    if (tabAgua) {
        tabAgua.classList.remove("active");
    }


    /*
        Agora mostramos somente
        a calculadora selecionada.
    */

    if (tipo === "macros") {

        if (macroForm) {
            macroForm.style.display = "block";
        }

        if (tabMacros) {
            tabMacros.classList.add("active");
        }

    }


    else if (tipo === "imc") {

        if (imcForm) {
            imcForm.style.display = "block";
        }

        if (tabIMC) {
            tabIMC.classList.add("active");
        }

    }


    else if (tipo === "agua") {

        if (aguaForm) {
            aguaForm.style.display = "block";
        }

        if (tabAgua) {
            tabAgua.classList.add("active");
        }

    }

}


/* =========================================================
   ABA - MACRONUTRIENTES
========================================================= */

if (tabMacros) {

    tabMacros.addEventListener("click", function (event) {

        event.preventDefault();

        mostrarCalculadora("macros");

    });

}


/* =========================================================
   ABA - IMC
========================================================= */

if (tabIMC) {

    tabIMC.addEventListener("click", function (event) {

        event.preventDefault();

        mostrarCalculadora("imc");

    });

}


/* =========================================================
   ABA - ÁGUA
========================================================= */

if (tabAgua) {

    tabAgua.addEventListener("click", function (event) {

        event.preventDefault();

        mostrarCalculadora("agua");

    });

}


/* =========================================================
   ESTADO INICIAL
   MACRONUTRIENTES ABERTO
========================================================= */

mostrarCalculadora("macros");


/* =========================================================
   FORMULÁRIO DE LOGIN
========================================================= */

const loginForm = document.getElementById("loginForm");


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

const criarConta = document.getElementById("criarConta");

const voltarLogin = document.getElementById("voltarLogin");

const registerForm = document.getElementById("registerForm");

const loginTitle = document.getElementById("loginTitle");

const loginSubtitle = document.getElementById("loginSubtitle");


/* =========================================================
   ABRIR TELA DE CADASTRO
========================================================= */

if (criarConta && loginForm && registerForm) {

    criarConta.addEventListener("click", function (event) {

        event.preventDefault();

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

    voltarLogin.addEventListener("click", function (event) {

        event.preventDefault();

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

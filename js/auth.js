"use strict";

function atualizarTelaAuth(cadastro) {
    if (!loginForm || !registerForm) return;

    loginForm.classList.toggle("hidden", cadastro);
    registerForm.classList.toggle("hidden", !cadastro);

    document.getElementById("lpTitulo").textContent = cadastro
        ? "Criar conta profissional"
        : "Entrar no NUTRIQ";
    document.getElementById("lpCardDescription").textContent = cadastro
        ? "Comece agora a aproveitar todos os recursos do NUTRIQ."
        : "Acesse sua conta profissional.";

    limparErros();
    limparFeedback();
    document.getElementById(cadastro ? "registerName" : "loginEmail")?.focus();
}

showRegister?.addEventListener("click", () => atualizarTelaAuth(true));
backToLogin?.addEventListener("click", () => atualizarTelaAuth(false));

/* =========================================================
   LOGIN
========================================================= */

loginForm?.addEventListener(
    "submit",
    event => {
        event.preventDefault();

        limparErros();

        const email =
            document
                .getElementById("loginEmail")
                .value
                .trim();

        const senha =
            document
                .getElementById("loginPassword")
                .value;

        let valido = true;

        /* E-mail */

        if (!validarEmail(email)) {
            mostrarErro(
                "loginEmail",
                "Digite um e-mail válido."
            );

            valido = false;
        }

        /* Senha */

        if (senha.length < 6) {
            mostrarErro(
                "loginPassword",
                "A senha deve ter pelo menos 6 caracteres."
            );

            valido = false;
        }

        if (!valido) {
            return;
        }

        /* =========================================================
           LOGIN VALIDADO
        ========================================================= */

        /*
           Salva que o usuário passou pelo login.
        */

        sessionStorage.setItem(
            "usuarioLogado",
            "true"
        );

        sessionStorage.setItem(
            "perfilUsuario",
            "nutricionista"
        );

        /*
           Vai para a página principal
        */

        window.location.href = "pagina1.html";
    }
);

/* =========================================================
   CADASTRO DO NUTRICIONISTA
========================================================= */

registerForm?.addEventListener(
    "submit",
    event => {
        event.preventDefault();

        limparErros();

        const nome =
            document
                .getElementById("registerName")
                .value
                .trim();

        const email =
            document
                .getElementById("registerEmail")
                .value
                .trim();
        const cpf =
            document
                .getElementById("registerCPF")
                .value
                .trim();
        const crn =
            document
                .getElementById("registerCRN")
                .value
                .trim();

        const senha =
            document
                .getElementById("registerPassword")
                .value;

        const confirmar =
            document
                .getElementById("registerConfirmPassword")
                .value;

        let valido = true;

        /* Nome */

        if (nome.length < 3) {
            mostrarErro(
                "registerName",
                "Informe seu nome completo."
            );

            valido = false;
        }

        /* E-mail */

        if (!validarEmail(email)) {
            mostrarErro(
                "registerEmail",
                "Digite um e-mail válido."
            );

            valido = false;
        }
        /* CPF */

        if (!validarCPF(cpf)) {
            mostrarErro(
                "registerCPF",
                "Digite um CPF válido."
            );

            valido = false;
        }
        /* CRN */

        if (crn.length < 4) {
            mostrarErro(
                "registerCRN",
                "Informe seu número de CRN."
            );

            valido = false;
        }

        /* Senha */

        if (senha.length < 6) {
            mostrarErro(
                "registerPassword",
                "A senha deve ter pelo menos 6 caracteres."
            );

            valido = false;
        }

        /* Confirmar senha */

        if (senha !== confirmar) {
            mostrarErro(
                "registerConfirmPassword",
                "As senhas não coincidem."
            );

            valido = false;
        }

        if (!valido) {
            return;
        }

        mostrarFeedback(
            "success",
            "Cadastro validado com sucesso! O próximo passo será validar o CRN."
        );

        registerForm.reset();
    }
);

/* =========================================================
   VALIDAR E-MAIL
========================================================= */

function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(email);
}
function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, "");

    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
        return false;
    }

    let soma = 0;

    for (let i = 0; i < 9; i++) {
        soma += Number(cpf[i]) * (10 - i);
    }

    let resto = (soma * 10) % 11;
    if (resto === 10) resto = 0;

    if (resto !== Number(cpf[9])) {
        return false;
    }

    soma = 0;

    for (let i = 0; i < 10; i++) {
        soma += Number(cpf[i]) * (11 - i);
    }

    resto = (soma * 10) % 11;
    if (resto === 10) resto = 0;

    return resto === Number(cpf[10]);
}
/* =========================================================
   MOSTRAR ERRO
========================================================= */

function mostrarErro(
    inputId,
    mensagem
) {
    const input =
        document.getElementById(inputId);

    if (!input) {
        return;
    }

    input.classList.add("input-error");

    const grupo =
        input.closest(".form-group");

    if (!grupo) {
        return;
    }

    const erro =
        grupo.querySelector(".error-message");

    if (erro) {
        erro.textContent = mensagem;
    }
}

/* =========================================================
   LIMPAR ERROS
========================================================= */

function limparErros() {
    document
        .querySelectorAll(".input-error")
        .forEach(
            input => {
                input.classList.remove("input-error");
            }
        );

    document
        .querySelectorAll(".error-message")
        .forEach(
            erro => {
                erro.textContent = "";
            }
        );
}

/* =========================================================
   FEEDBACK
========================================================= */

function mostrarFeedback(
    tipo,
    mensagem
) {
    const feedback = document.getElementById("lpFeedback");
    if (!feedback) return;

    feedback.className = "lp-feedback";
    feedback.classList.add(tipo);
    feedback.textContent = mensagem;
    feedback.hidden = false;
}

function limparFeedback() {
    const feedback = document.getElementById("lpFeedback");
    if (!feedback) return;

    feedback.textContent = "";
    feedback.hidden = true;
}
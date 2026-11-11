"use strict";

const CHAVE_CONTAS_LOCAIS = "nutriq_contas_locais_v1";
const ITERACOES_HASH_SENHA = 120000;

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

function obterContasLocais() {
    const salvo = localStorage.getItem(CHAVE_CONTAS_LOCAIS);
    if (!salvo) return [];

    const contas = JSON.parse(salvo);
    if (!Array.isArray(contas)) {
        throw new Error("Os dados das contas locais estão inválidos.");
    }

    return contas;
}

function sincronizarPerfilLocal(conta, preencherSomenteAusentes) {
    const salvo = localStorage.getItem("nutriqPerfil");
    const perfil = salvo ? JSON.parse(salvo) : {};
    if (!perfil || typeof perfil !== "object" || Array.isArray(perfil)) {
        throw new Error("Os dados do perfil local estão inválidos.");
    }

    ["nome", "email", "crn"].forEach(campo => {
        const valor = String(conta[campo] || "").trim();
        if (valor && (!preencherSomenteAusentes || !String(perfil[campo] || "").trim())) {
            perfil[campo] = valor;
        }
    });

    localStorage.setItem("nutriqPerfil", JSON.stringify(perfil));
}

function exigirCriptografiaLocal() {
    if (!window.crypto?.subtle || !window.crypto.getRandomValues) {
        throw new Error("Use um navegador atualizado em HTTPS ou no Live Preview para criar ou acessar a conta local.");
    }
}

function codificarBase64(bytes) {
    return btoa(Array.from(bytes, byte => String.fromCharCode(byte)).join(""));
}

function decodificarBase64(valor) {
    return Uint8Array.from(atob(valor), caractere => caractere.charCodeAt(0));
}

async function derivarHashSenha(senha, salt) {
    exigirCriptografiaLocal();
    const chave = await window.crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(senha),
        "PBKDF2",
        false,
        ["deriveBits"]
    );
    const hash = await window.crypto.subtle.deriveBits({
        name: "PBKDF2",
        salt,
        iterations: ITERACOES_HASH_SENHA,
        hash: "SHA-256"
    }, chave, 256);
    return new Uint8Array(hash);
}

function hashesIguais(a, b) {
    if (a.length !== b.length) return false;
    let diferenca = 0;
    for (let i = 0; i < a.length; i++) diferenca |= a[i] ^ b[i];
    return diferenca === 0;
}

loginForm?.addEventListener(
    "submit",
    async event => {
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

        if (!validarEmail(email)) {
            mostrarErro(
                "loginEmail",
                "Digite um e-mail válido."
            );
            return;
        }

        try {
            const conta = obterContasLocais().find(item =>
                item.email === email.toLowerCase() &&
                item.perfil === "nutricionista"
            );
            if (!conta) {
                mostrarFeedbackLogin("Este e-mail não está cadastrado. Verifique o endereço ou crie uma conta.");
                return;
            }

            if (senha.length < 6) {
                mostrarErro(
                    "loginPassword",
                    "A senha deve ter pelo menos 6 caracteres."
                );
                return;
            }

            const hash = await derivarHashSenha(
                senha,
                decodificarBase64(conta.salt)
            );
            if (!hashesIguais(hash, decodificarBase64(conta.hashSenha))) {
                mostrarFeedbackLogin("E-mail ou senha incorretos.");
                return;
            }

            sincronizarPerfilLocal(conta, true);
            sessionStorage.setItem("usuarioLogado", "true");
            sessionStorage.setItem("perfilUsuario", conta.perfil);
            window.location.href = "pagina1.html";
        } catch {
            mostrarFeedbackLogin("Não foi possível verificar a conta local. Verifique o armazenamento do navegador e tente novamente.");
        }
    }
);

registerForm?.addEventListener(
    "submit",
    async event => {
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

if (nome.length < 3) {
    mostrarErro(
        "registerName",
        "Informe seu nome completo."
    );
    return;
}

if (!validarEmail(email)) {
    mostrarErro(
        "registerEmail",
        "Digite um e-mail válido."
    );
    return;
}

if (!NutriqValidacao.validarCPF(cpf)) {
    mostrarErro(
        "registerCPF",
        "Digite um CPF válido."
    );
    return;
        }

if (crn.length < 4) {
    mostrarErro(
        "registerCRN",
        "Informe seu número de CRN."
    );
    return;
}

if (senha.length < 6) {
    mostrarErro(
        "registerPassword",
        "A senha deve ter pelo menos 6 caracteres."
    );
    return;
}

if (senha !== confirmar) {
    mostrarErro(
        "registerConfirmPassword",
        "As senhas não coincidem."
    );
    return;
}

try {
    exigirCriptografiaLocal();
    const contas = obterContasLocais();
    const emailNormalizado = email.toLowerCase();
    if (contas.some(conta => conta.email === emailNormalizado)) {
        mostrarErro("registerEmail", "Já existe uma conta local com este e-mail.");
        return;
    }

    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const hashSenha = await derivarHashSenha(senha, salt);
    const conta = {
        nome,
        email: emailNormalizado,
        crn,
        perfil: "nutricionista",
        salt: codificarBase64(salt),
        hashSenha: codificarBase64(hashSenha),
        criadoEm: new Date().toISOString()
    };
    contas.push(conta);
    localStorage.setItem(CHAVE_CONTAS_LOCAIS, JSON.stringify(contas));
    let perfilSincronizado = true;
    try {
        sincronizarPerfilLocal(conta);
    } catch {
        perfilSincronizado = false;
    }

    registerForm.reset();
    atualizarTelaAuth(false);
    document.getElementById("loginEmail").value = emailNormalizado;
    mostrarFeedback(
        perfilSincronizado ? "success" : "error",
        perfilSincronizado
            ? "Conta profissional criada e salva neste navegador. A senha não é armazenada em texto puro. Este cadastro não verifica o CRN nem substitui autenticação em servidor."
            : "Conta criada, mas não foi possível preencher o perfil local. Entre novamente para tentar sincronizar os dados."
    );
} catch {
    mostrarFeedback("error", "Não foi possível salvar a conta local. Verifique o armazenamento do navegador e tente novamente.");
}
    }
);

function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(email);
}
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

function mostrarFeedbackLogin(mensagem) {
    const feedback = document.getElementById("loginFeedback");
    if (!feedback) return;

    feedback.className = "lp-feedback error";
    feedback.textContent = mensagem;
    feedback.hidden = false;
}

function limparFeedback() {
    const feedback = document.getElementById("lpFeedback");
    if (feedback) {
        feedback.textContent = "";
        feedback.hidden = true;
    }

    const feedbackLogin = document.getElementById("loginFeedback");
    if (feedbackLogin) {
        feedbackLogin.textContent = "";
        feedbackLogin.hidden = true;
    }
}

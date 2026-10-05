"use strict";

/* =========================================================
   NUTRIQ
   SCRIPT PRINCIPAL
========================================================= */


/* =========================================================
   ELEMENTOS
========================================================= */

const header = document.querySelector(".header");

const nav = document.getElementById("mainNav");

const menuButton = document.getElementById("menuButton");

const themeButton = document.getElementById("themeButton");

const openLoginHeader =
    document.getElementById("openLoginHeader");


/* =========================================================
   MODAL
========================================================= */

const accessModal =
    document.getElementById("accessModal");

const closeModal =
    document.getElementById("closeModal");


const nutritionistButton =
    document.getElementById("nutritionistButton");

const patientButton =
    document.getElementById("patientButton");


const modalTitle =
    document.getElementById("modalTitle");

const modalDescription =
    document.getElementById("modalDescription");


const selectedProfile =
    document.getElementById("selectedProfile");

const profileIcon =
    document.getElementById("profileIcon");

const profileName =
    document.getElementById("profileName");


/* =========================================================
   FORMULÁRIOS
========================================================= */

const loginForm =
    document.getElementById("loginForm");

const registerForm =
    document.getElementById("registerForm");


const nutritionistRegister =
    document.getElementById("nutritionistRegister");

const patientInfo =
    document.getElementById("patientInfo");


const showRegister =
    document.getElementById("showRegister");

const backToLogin =
    document.getElementById("backToLogin");


const patientLoginButton =
    document.getElementById("patientLoginButton");


const modalFeedback =
    document.getElementById("modalFeedback");


/* =========================================================
   VARIÁVEIS
========================================================= */

let perfilAtual = null;

let headerEscondido = false;


/* =========================================================
   HEADER - ESCONDER AO ROLAR
========================================================= */

let ultimaPosicaoScroll = window.scrollY;
let bloqueioHeader = false;

if (header) {

    header.classList.add("visible");


    function atualizarHeader() {

        const posicaoAtual = window.scrollY;

        /* ================================================
           TOPO DA PÁGINA
        ================================================= */

        if (posicaoAtual <= 30) {

            header.classList.remove("hidden");
            header.classList.add("visible");
            header.classList.remove("scrolled");

            ultimaPosicaoScroll = posicaoAtual;

            return;
        }


        /* ================================================
           PÁGINA FOI ROLADA
        ================================================= */

        header.classList.add("scrolled");


        const diferenca =
            posicaoAtual - ultimaPosicaoScroll;


        /* ================================================
           DESCENDO

           Só esconde depois de uma movimentação
           significativa.
        ================================================= */

        if (diferenca > 12) {

            header.classList.remove("visible");
            header.classList.add("hidden");

            ultimaPosicaoScroll = posicaoAtual;

            return;
        }


        /* ================================================
           SUBINDO

           Também exige alguns pixels para evitar
           que o header fique piscando.
        ================================================= */

        if (diferenca < -12) {

            header.classList.remove("hidden");
            header.classList.add("visible");

            ultimaPosicaoScroll = posicaoAtual;

            return;
        }
    }


    /* =====================================================
       SCROLL
    ===================================================== */

    window.addEventListener("scroll", () => {

        if (bloqueioHeader) {
            return;
        }

        bloqueioHeader = true;

        window.requestAnimationFrame(() => {

            atualizarHeader();

            bloqueioHeader = false;

        });

    }, {
        passive: true
    });


    /* =====================================================
       MOUSE PRÓXIMO AO TOPO
    ===================================================== */

    document.addEventListener("mousemove", (evento) => {

        if (evento.clientY <= 55) {

            header.classList.remove("hidden");
            header.classList.add("visible");

        }

    });


    /* =====================================================
       GARANTE HEADER NO TOPO
    ===================================================== */

    window.addEventListener("scroll", () => {

        if (window.scrollY <= 30) {

            header.classList.remove("hidden");
            header.classList.add("visible");

        }

    }, {
        passive: true
    });

}

/* =========================================================
   MENU MOBILE
========================================================= */

if (menuButton) {

    menuButton.addEventListener(
        "click",
        () => {

            const aberto =
                nav.classList.toggle(
                    "mobile-open"
                );

            menuButton.setAttribute(
                "aria-expanded",
                aberto
            );

            menuButton.textContent =
                aberto ? "×" : "☰";

        }
    );

}


/* =========================================================
   FECHAR MENU AO CLICAR EM UMA ÂNCORA
========================================================= */

document
    .querySelectorAll(".nav-link")
    .forEach(
        link => {

            link.addEventListener(
                "click",
                () => {

                    nav.classList.remove(
                        "mobile-open"
                    );

                    menuButton.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                    menuButton.textContent =
                        "☰";

                }
            );

        }
    );


/* =========================================================
   NAVEGAÇÃO ATIVA
========================================================= */

const sections =
    document.querySelectorAll(
        "main section"
    );

const navLinks =
    document.querySelectorAll(
        ".nav-link"
    );


const observer =
    new IntersectionObserver(
        entries => {

            entries.forEach(
                entry => {

                    if (
                        entry.isIntersecting
                    ) {

                        navLinks.forEach(
                            link => {

                                link.classList.remove(
                                    "active"
                                );

                                if (
                                    link.getAttribute(
                                        "href"
                                    ) ===
                                    `#${entry.target.id}`
                                ) {

                                    link.classList.add(
                                        "active"
                                    );

                                }

                            }
                        );

                    }

                }
            );

        },
        {
            rootMargin:
                "-35% 0px -55% 0px"
        }
    );


sections.forEach(
    section => observer.observe(section)
);


/* =========================================================
   TEMA ESCURO
========================================================= */

const temaSalvo =
    localStorage.getItem(
        "nutriq-theme"
    );


if (temaSalvo === "dark") {

    document.body.classList.add(
        "dark-mode"
    );

    themeButton.textContent = "☀";

}


themeButton.addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "dark-mode"
        );


        const dark =
            document.body.classList.contains(
                "dark-mode"
            );


        localStorage.setItem(
            "nutriq-theme",
            dark ? "dark" : "light"
        );


        themeButton.textContent =
            dark ? "☀" : "☾";

    }
);


/* =========================================================
   ABRIR MODAL
========================================================= */

function abrirModal(perfil) {

    perfilAtual = perfil;

    resetarModal();


    accessModal.classList.add(
        "active"
    );

    accessModal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.style.overflow =
        "hidden";


    if (perfil === "nutricionista") {

        modalTitle.textContent =
            "Entrar como nutricionista";

        modalDescription.textContent =
            "Acesse sua conta profissional.";

        profileIcon.textContent =
            "♧";

        profileName.textContent =
            "Nutricionista";

        nutritionistRegister.classList.remove(
            "hidden"
        );

        patientInfo.classList.add(
            "hidden"
        );

        loginForm.classList.remove(
            "hidden"
        );

    }


    if (perfil === "paciente") {

        modalTitle.textContent =
            "Acesso do paciente";

        modalDescription.textContent =
            "Entre utilizando os dados fornecidos pelo seu nutricionista.";

        profileIcon.textContent =
            "♙";

        profileName.textContent =
            "Paciente";

        nutritionistRegister.classList.add(
            "hidden"
        );

        patientInfo.classList.remove(
            "hidden"
        );

        loginForm.classList.add(
            "hidden"
        );

    }


    setTimeout(
        () => {

            if (
                perfil === "nutricionista"
            ) {

                document
                    .getElementById("loginEmail")
                    .focus();

            } else {

                patientLoginButton.focus();

            }

        },
        200
    );

}


/* =========================================================
   FECHAR MODAL
========================================================= */

function fecharModal() {

    accessModal.classList.remove(
        "active"
    );

    accessModal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.style.overflow =
        "";

    perfilAtual = null;

}


/* =========================================================
   EVENTOS DOS BOTÕES
========================================================= */

nutritionistButton.addEventListener(
    "click",
    () => {

        abrirModal(
            "nutricionista"
        );

    }
);


patientButton.addEventListener(
    "click",
    () => {

        abrirModal(
            "paciente"
        );

    }
);


openLoginHeader.addEventListener(
    "click",
    () => {

        abrirModal(
            "nutricionista"
        );

    }
);


closeModal.addEventListener(
    "click",
    fecharModal
);


/* =========================================================
   FECHAR CLICANDO FORA
========================================================= */

accessModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            accessModal
        ) {

            fecharModal();

        }

    }
);


/* =========================================================
   ESC
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            accessModal.classList.contains(
                "active"
            )
        ) {

            fecharModal();

        }

    }
);


/* =========================================================
   MOSTRAR CADASTRO DO NUTRICIONISTA
========================================================= */

showRegister.addEventListener(
    "click",
    () => {

        loginForm.classList.add(
            "hidden"
        );

        nutritionistRegister.classList.add(
            "hidden"
        );

        registerForm.classList.remove(
            "hidden"
        );

        modalTitle.textContent =
            "Criar conta de nutricionista";

        modalDescription.textContent =
            "Preencha os dados para criar sua conta profissional.";

        document
            .getElementById("registerName")
            .focus();

    }
);


/* =========================================================
   VOLTAR PARA LOGIN
========================================================= */

backToLogin.addEventListener(
    "click",
    () => {

        registerForm.classList.add(
            "hidden"
        );

        loginForm.classList.remove(
            "hidden"
        );

        nutritionistRegister.classList.remove(
            "hidden"
        );

        modalTitle.textContent =
            "Entrar como nutricionista";

        modalDescription.textContent =
            "Acesse sua conta profissional.";

        limparFeedback();

        document
            .getElementById("loginEmail")
            .focus();

    }
);


/* =========================================================
   BOTÃO PACIENTE
========================================================= */

patientLoginButton.addEventListener(
    "click",
    () => {

        patientInfo.classList.add(
            "hidden"
        );

        loginForm.classList.remove(
            "hidden"
        );

        modalTitle.textContent =
            "Entrar como paciente";

        modalDescription.textContent =
            "Utilize os dados fornecidos pelo seu nutricionista.";

        profileIcon.textContent =
            "♙";

        profileName.textContent =
            "Paciente";

        document
            .getElementById("loginEmail")
            .focus();

    }
);

/* =========================================================
   LOGIN
========================================================= */

loginForm.addEventListener(
    "submit",
    event => {

        event.preventDefault();

        limparErros();

        const email =
            document
                .getElementById(
                    "loginEmail"
                )
                .value
                .trim();

        const senha =
            document
                .getElementById(
                    "loginPassword"
                )
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


        /*
           Salva o tipo de usuário:
           paciente ou nutricionista
        */

        sessionStorage.setItem(
            "perfilUsuario",
            perfilAtual
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

registerForm.addEventListener(
    "submit",
    event => {

        event.preventDefault();

        limparErros();

        const nome =
            document
                .getElementById(
                    "registerName"
                )
                .value
                .trim();

        const email =
            document
                .getElementById(
                    "registerEmail"
                )
                .value
                .trim();

        const crn =
            document
                .getElementById(
                    "registerCRN"
                )
                .value
                .trim();

        const senha =
            document
                .getElementById(
                    "registerPassword"
                )
                .value;

        const confirmar =
            document
                .getElementById(
                    "registerConfirmPassword"
                )
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
            "Cadastro validado com sucesso! O próximo passo será conectar este formulário ao banco de dados e validar o CRN."
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


/* =========================================================
   MOSTRAR ERRO
========================================================= */

function mostrarErro(
    inputId,
    mensagem
) {

    const input =
        document.getElementById(
            inputId
        );


    if (!input) {
        return;
    }


    input.classList.add(
        "input-error"
    );


    const grupo =
        input.closest(
            ".form-group"
        );


    if (!grupo) {
        return;
    }


    const erro =
        grupo.querySelector(
            ".error-message"
        );


    if (erro) {

        erro.textContent =
            mensagem;

    }

}


/* =========================================================
   LIMPAR ERROS
========================================================= */

function limparErros() {

    document
        .querySelectorAll(
            ".input-error"
        )
        .forEach(
            input => {

                input.classList.remove(
                    "input-error"
                );

            }
        );


    document
        .querySelectorAll(
            ".error-message"
        )
        .forEach(
            erro => {

                erro.textContent =
                    "";

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

    modalFeedback.className =
        "modal-feedback";

    modalFeedback.classList.add(
        tipo
    );

    modalFeedback.textContent =
        mensagem;

}


function limparFeedback() {

    modalFeedback.className =
        "modal-feedback";

    modalFeedback.textContent =
        "";

}


/* =========================================================
   RESETAR MODAL
========================================================= */

function resetarModal() {

    limparErros();

    limparFeedback();

    loginForm.reset();

    registerForm.reset();


    loginForm.classList.remove(
        "hidden"
    );

    registerForm.classList.add(
        "hidden"
    );

    nutritionistRegister.classList.remove(
        "hidden"
    );

    patientInfo.classList.add(
        "hidden"
    );

}


/* =========================================================
   ANIMAÇÃO AO ENTRAR NA TELA
========================================================= */

const elementosAnimados =
    document.querySelectorAll(
        ".hero-content, .profile-card, .benefit-card, .function-card, .contact-card"
    );


const animationObserver =
    new IntersectionObserver(
        entries => {

            entries.forEach(
                entry => {

                    if (
                        entry.isIntersecting
                    ) {

                        entry.target.style.opacity =
                            "1";

                        entry.target.style.transform =
                            "translateY(0)";

                        animationObserver.unobserve(
                            entry.target
                        );

                    }

                }
            );

        },
        {
            threshold: 0.12
        }
    );


elementosAnimados.forEach(
    elemento => {

        elemento.style.opacity =
            "0";

        elemento.style.transform =
            "translateY(15px)";

        elemento.style.transition =
            "opacity 0.6s ease, transform 0.6s ease";

        animationObserver.observe(
            elemento
        );

    }
);


/* =========================================================
   FINAL
========================================================= */

console.log(
    "nutriQ carregado com sucesso."
);
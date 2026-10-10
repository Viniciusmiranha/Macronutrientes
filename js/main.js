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
                nav.classList.toggle("mobile-open");

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
                    nav.classList.remove("mobile-open");

                    menuButton.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                    menuButton.textContent = "☰";
                }
            );
        }
    );

/* =========================================================
   NAVEGAÇÃO ATIVA
========================================================= */

const sections =
    document.querySelectorAll("main section");

const navLinks =
    document.querySelectorAll(".nav-link");

const observer =
    new IntersectionObserver(
        entries => {
            entries.forEach(
                entry => {
                    if (entry.isIntersecting) {
                        navLinks.forEach(
                            link => {
                                link.classList.remove("active");

                                if (
                                    link.getAttribute("href") ===
                                    `#${entry.target.id}`
                                ) {
                                    link.classList.add("active");
                                }
                            }
                        );
                    }
                }
            );
        },
        {
            rootMargin: "-35% 0px -55% 0px"
        }
    );

sections.forEach(
    section => observer.observe(section)
);

/* =========================================================
   TEMA ESCURO
========================================================= */

const temaSalvo =
    localStorage.getItem("nutriq-theme");

if (temaSalvo === "dark") {
    document.body.classList.add("dark-mode");

    themeButton.textContent = "☀";
}

themeButton.addEventListener(
    "click",
    () => {
        document.body.classList.toggle("dark-mode");

        const dark =
            document.body.classList.contains("dark-mode");

        localStorage.setItem(
            "nutriq-theme",
            dark ? "dark" : "light"
        );

        themeButton.textContent =
            dark ? "☀" : "☾";
    }
);

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
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = "1";

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
        elemento.style.opacity = "0";

        elemento.style.transform =
            "translateY(15px)";

        elemento.style.transition =
            "opacity 0.6s ease, transform 0.6s ease";

        animationObserver.observe(elemento);
    }
);

/* =========================================================
   FINAL
========================================================= */

console.log(
    "nutriQ carregado com sucesso."
);
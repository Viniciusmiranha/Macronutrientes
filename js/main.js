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

/* =========================================================
   FORMULÁRIOS
========================================================= */

const loginForm =
    document.getElementById("loginForm");

const registerForm =
    document.getElementById("registerForm");

const showRegister =
    document.getElementById("showRegister");

const backToLogin =
    document.getElementById("backToLogin");

/* =========================================================
   VARIÁVEIS
========================================================= */

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

if (menuButton && nav) {
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
                        if (!nav || !menuButton) {
                            return;
                        }

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

const CHAVE_PREFERENCIAS = "nutriqPreferencias";
const CHAVE_TEMA_LEGADA = "nutriq-theme";

function modoEscuroSalvo() {
    try {
        const preferencias = JSON.parse(
            localStorage.getItem(CHAVE_PREFERENCIAS) || "null"
        );

        if (typeof preferencias?.modoEscuro === "boolean") {
            return preferencias.modoEscuro;
        }

        return localStorage.getItem(CHAVE_TEMA_LEGADA) === "dark";
    } catch {
        return false;
    }
}

function aplicarTema(dark) {
    document.body.classList.toggle("dark-mode", dark);

    if (themeButton) {
        themeButton.textContent = dark ? "☀" : "☾";
    }
}

function persistirTema(dark) {
    try {
        const preferencias = JSON.parse(
            localStorage.getItem(CHAVE_PREFERENCIAS) || "{}"
        );
        const dados = preferencias && typeof preferencias === "object" && !Array.isArray(preferencias)
            ? preferencias
            : {};

        dados.modoEscuro = dark;
        localStorage.setItem(CHAVE_PREFERENCIAS, JSON.stringify(dados));
    } catch {
        // A preferência continua aplicada nesta página se o armazenamento estiver indisponível.
    }
}

aplicarTema(modoEscuroSalvo());

window.addEventListener("nutriqTemaAlterado", evento => {
    aplicarTema(Boolean(evento.detail?.modoEscuro));
});

window.addEventListener("storage", evento => {
    if (evento.key === CHAVE_PREFERENCIAS || evento.key === CHAVE_TEMA_LEGADA) {
        aplicarTema(modoEscuroSalvo());
    }
});

if (themeButton) {
    themeButton.addEventListener("click", () => {
        const dark = !document.body.classList.contains("dark-mode");
        aplicarTema(dark);
        persistirTema(dark);

        window.dispatchEvent(new CustomEvent("nutriqTemaAlterado", {
            detail: { modoEscuro: dark }
        }));
    });
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
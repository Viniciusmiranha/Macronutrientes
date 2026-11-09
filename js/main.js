"use strict";

const headers = [...document.querySelectorAll(".header, .dashboard-topbar, .perfil-header")];

const nav = document.getElementById("mainNav");

const menuButton = document.getElementById("menuButton");

const themeButton = document.getElementById("themeButton");

const landingLogo = document.querySelector(".lp-logo");
landingLogo?.addEventListener("click", evento => {
    evento.preventDefault();
    if (window.location.hash !== "#topo") {
        window.history.replaceState(null, "", window.location.pathname + window.location.search + "#topo");
    }
    if (window.scrollY > 0) {
        const reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduzirMovimento ? "auto" : "smooth" });
    }
});

const loginForm =
    document.getElementById("loginForm");

const registerForm =
    document.getElementById("registerForm");

const showRegister =
    document.getElementById("showRegister");

const backToLogin =
    document.getElementById("backToLogin");

if (headers.length) {
    let ultimaPosicao = window.scrollY;
    let direcao = 0;
    let distanciaNaDirecao = 0;
    let quadroPendente = false;
    const LIMIAR_DIRECAO = 28;

    function controlesAbertos() {
        return document.body.classList.contains("nq-modal-open") ||
            document.body.classList.contains("dashboard-menu-open") ||
            Boolean(document.querySelector(
                ".nq-overlay:not([hidden]), .plans-modal-overlay.is-open, .plans-modal-overlay[aria-hidden='false']"
            ));
    }

    function mostrarHeader() {
        headers.forEach(header => {
            header.classList.remove("scroll-header-hidden");
            header.inert = false;
        });
    }

    function ocultarHeader() {
        headers.forEach(header => {
            header.classList.add("scroll-header-hidden");
            header.inert = true;
        });
    }

    function atualizarHeader() {
        const posicaoAtual = window.scrollY;
        const deslocamento = posicaoAtual - ultimaPosicao;
        ultimaPosicao = posicaoAtual;

        if (posicaoAtual <= 30 || controlesAbertos() || headers.some(header => header.contains(document.activeElement))) {
            mostrarHeader();
            distanciaNaDirecao = 0;
            direcao = 0;
            headers.forEach(header => {
                if (posicaoAtual <= 30) header.classList.remove("scrolled");
            });
            return;
        }

        headers.forEach(header => header.classList.add("scrolled"));
        if (!deslocamento) return;

        const novaDirecao = Math.sign(deslocamento);
        if (novaDirecao !== direcao) {
            direcao = novaDirecao;
            distanciaNaDirecao = Math.abs(deslocamento);
        } else {
            distanciaNaDirecao += Math.abs(deslocamento);
        }

        if (distanciaNaDirecao < LIMIAR_DIRECAO) return;

        if (direcao > 0) {
            ocultarHeader();
        } else {
            mostrarHeader();
        }
        distanciaNaDirecao = 0;
    }

    mostrarHeader();
    window.addEventListener("scroll", () => {
        if (quadroPendente) return;
        quadroPendente = true;
        window.requestAnimationFrame(() => {
            quadroPendente = false;
            atualizarHeader();
        });
    }, { passive: true });

    document.addEventListener("focusin", () => {
        if (headers.some(header => header.contains(document.activeElement))) {
            mostrarHeader();
            ultimaPosicao = window.scrollY;
            distanciaNaDirecao = 0;
            direcao = 0;
        }
        if (controlesAbertos()) {
            mostrarHeader();
            ultimaPosicao = window.scrollY;
            distanciaNaDirecao = 0;
            direcao = 0;
        }
    });
}

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

console.log(
    "nutriQ carregado com sucesso."
);
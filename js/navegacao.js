
"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.getElementById("dashboardSidebar");
    const menuToggle = document.getElementById("dashboardMenuToggle");
    const mobileMenu = window.matchMedia("(max-width: 1050px)");
    const backdrop = document.createElement("div");
    backdrop.className = "dashboard-menu-backdrop";
    backdrop.hidden = true;
    document.body.appendChild(backdrop);

    const paginasPermitidas = new Set([
        "pagina1.html",
        "pacientes.html",
        "planos-alimentares.html",
        "calculadoras.html",
        "consultas.html",
        "agenda.html",
        "relatorios.html",
        "perfil.html"
    ]);

    function fecharMenu(devolverFoco) {
        sidebar?.classList.remove("is-open", "active");
        menuToggle?.setAttribute("aria-expanded", "false");
        menuToggle?.setAttribute("aria-label", "Abrir menu");
        document.body.classList.remove("dashboard-menu-open");
        backdrop.hidden = true;
        if (sidebar) sidebar.inert = mobileMenu.matches;
        if (devolverFoco && mobileMenu.matches) menuToggle?.focus();
    }

    function abrirMenu() {
        if (!sidebar || !menuToggle || !mobileMenu.matches) return;
        sidebar.inert = false;
        sidebar.classList.add("is-open");
        menuToggle.setAttribute("aria-expanded", "true");
        menuToggle.setAttribute("aria-label", "Fechar menu");
        document.body.classList.add("dashboard-menu-open");
        backdrop.hidden = false;
        sidebar.querySelector("a[href]")?.focus();
    }

    function sincronizarMenu() {
        if (!mobileMenu.matches) {
            fecharMenu(false);
            if (sidebar) sidebar.inert = false;
        } else if (!sidebar?.classList.contains("is-open")) {
            if (sidebar?.contains(document.activeElement)) menuToggle?.focus();
            sidebar.inert = true;
        }
    }

    sincronizarMenu();
    mobileMenu.addEventListener("change", sincronizarMenu);
    backdrop.addEventListener("click", () => fecharMenu(true));

    document.addEventListener("keydown", evento => {
        if (!mobileMenu.matches || !sidebar?.classList.contains("is-open")) return;
        if (evento.key === "Escape") {
            evento.preventDefault();
            fecharMenu(true);
            return;
        }
        if (evento.key !== "Tab") return;
        const focaveis = Array.from(sidebar.querySelectorAll(
            'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])'
        )).filter(item => item.offsetParent !== null);
        if (!focaveis.length) return;
        const primeiro = focaveis[0];
        const ultimo = focaveis[focaveis.length - 1];
        if (evento.shiftKey && document.activeElement === primeiro) {
            evento.preventDefault();
            ultimo.focus();
        } else if (!evento.shiftKey && document.activeElement === ultimo) {
            evento.preventDefault();
            primeiro.focus();
        }
    });

    document.addEventListener("click", evento => {
        const link = evento.target.closest("a[href]");

        if (!link || link.target || link.hasAttribute("download")) return;

        if (evento.defaultPrevented) return;

        const dentroDoPainel = link.closest(
            ".dashboard-navigation, " +
            ".dashboard-nav, " +
            ".dashboard-brand, " +
            ".dashboard-logo, " +
            ".dashboard-profile-button, " +
            ".calculadoras-profile"
        );

        if (!dentroDoPainel) return;

        const url = new URL(link.href, window.location.href);

        if (url.origin !== window.location.origin) return;

        if (mobileMenu.matches) fecharMenu(false);
    });

    if (menuToggle && sidebar) {
        menuToggle.addEventListener("click", () => {
            if (sidebar.classList.contains("is-open")) fecharMenu(true);
            else abrirMenu();
        });
    }

    function redirecionarPaginaDaUrl() {
        const parametros = new URLSearchParams(window.location.search);
        const paginaDaUrl = parametros.get("pagina");

        if (!paginasPermitidas.has(paginaDaUrl)) return;

        parametros.delete("pagina");
        const destino = new URL(paginaDaUrl, window.location.href);
        destino.search = parametros.toString();
        window.location.replace(destino.href);
    }

    window.addEventListener("popstate", redirecionarPaginaDaUrl);
    redirecionarPaginaDaUrl();
});

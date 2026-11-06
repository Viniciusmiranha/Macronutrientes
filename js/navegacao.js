
"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.getElementById("dashboardSidebar");
    const menuToggle = document.getElementById("dashboardMenuToggle");

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

    function fecharMenu() {
        sidebar?.classList.remove("is-open", "active");
        menuToggle?.setAttribute("aria-expanded", "false");
    }

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

        fecharMenu();
    });

    if (menuToggle && sidebar) {
        menuToggle.addEventListener("click", () => {
            const aberto = !sidebar.classList.contains("is-open");

            sidebar.classList.toggle("is-open", aberto);
            menuToggle.setAttribute("aria-expanded", String(aberto));
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

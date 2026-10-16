
"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const area = document.getElementById("conteudoPrincipal");
    const sidebar = document.getElementById("dashboardSidebar");
    const menuToggle = document.getElementById("dashboardMenuToggle");
    const feedback = document.getElementById("dashboardFeedback");

    if (!area) {
        console.error("NUTRIQ: área central não encontrada.");
        return;
    }

    const paginasPermitidas = new Set([
        "pagina1.html",
        "pacientes.html",
        "planos-alimentares.html",
        "macros.html",
        "consultas.html",
        "agenda.html",
        "relatorios.html",
        "perfil.html"
    ]);

    let conteudoInicial = null;
    let paginaAtual = "pagina1.html";
    let requisicaoAtual = 0;

    function nomeArquivo(caminho) {
        return caminho.split("/").pop();
    }

    function mostrarFeedback(mensagem) {
        if (feedback) {
            feedback.textContent = mensagem;
        }
    }

    function fecharMenu() {
        sidebar?.classList.remove("is-open");
        menuToggle?.setAttribute("aria-expanded", "false");
    }

    function salvarConteudoInicial() {
        if (conteudoInicial) {
            return;
        }

        conteudoInicial = document.createDocumentFragment();

        while (area.firstChild) {
            conteudoInicial.appendChild(area.firstChild);
        }
    }

    function atualizarMenu(arquivo) {
        document.querySelectorAll(".dashboard-navigation a").forEach(link => {
            const url = new URL(link.href, window.location.href);
            const ativo = nomeArquivo(url.pathname) === arquivo;

            link.classList.toggle("active", ativo);

            if (ativo) {
                link.setAttribute("aria-current", "page");
            } else {
                link.removeAttribute("aria-current");
            }
        });
    }

    function atualizarEndereco(arquivo, adicionarHistorico) {
        const url = new URL(window.location.href);

        if (arquivo === "pagina1.html") {
            url.searchParams.delete("pagina");
        } else {
            url.searchParams.set("pagina", arquivo);
        }

        url.hash = "";

        const estado = { pagina: arquivo };

        if (adicionarHistorico) {
            history.pushState(estado, "", url);
        } else {
            history.replaceState(estado, "", url);
        }
    }

    function inicializarAgenda() {
        const formulario = area.querySelector("#formAgenda");

        if (!formulario || formulario.dataset.inicializado === "true") {
            return;
        }

        formulario.dataset.inicializado = "true";

        formulario.addEventListener("submit", event => {
            event.preventDefault();

            const nome = area.querySelector("#paciente")?.value.trim();
            const data = area.querySelector("#data")?.value;
            const horario = area.querySelector("#horario")?.value;
            const tipo = area.querySelector("#tipo")?.value;
            const mensagem = area.querySelector("#mensagemAgenda");

            if (!nome || !data || !horario || !mensagem) {
                return;
            }

            mensagem.textContent =
                "Dados preenchidos para " + nome +
                ", em " + data + " às " + horario +
                " (" + tipo + "). " +
                "Este compromisso ainda não foi salvo.";

            mensagem.style.display = "block";
            formulario.reset();
        });
    }

    function inicializarPagina(arquivo) {
        if (arquivo === "agenda.html") {
            inicializarAgenda();
        }

        window.dispatchEvent(
            new CustomEvent("nutriqPaginaCarregada", {
                detail: { pagina: arquivo }
            })
        );
    }

    async function navegar(arquivo, adicionarHistorico = true) {
        if (!paginasPermitidas.has(arquivo)) {
            mostrarFeedback("Página não permitida ou indisponível.");
            return;
        }

        const idRequisicao = ++requisicaoAtual;

        if (arquivo === "pagina1.html") {
            if (!conteudoInicial) {
                paginaAtual = arquivo;
                atualizarMenu(arquivo);
                fecharMenu();
                atualizarEndereco(arquivo, adicionarHistorico);
                return;
            }

            area.replaceChildren(conteudoInicial);
            conteudoInicial = null;
            paginaAtual = arquivo;
            document.title = "Painel Profissional | NUTRIQ";

            atualizarMenu(arquivo);
            fecharMenu();
            mostrarFeedback("");
            atualizarEndereco(arquivo, adicionarHistorico);

            window.dispatchEvent(
                new CustomEvent("nutriqDadosAtualizados")
            );

            return;
        }

        try {
            const url = new URL(arquivo, window.location.href);

            if (url.origin !== window.location.origin) {
                throw new Error("Origem não permitida.");
            }

            const resposta = await fetch(url.href, {
                method: "GET",
                headers: {
                    Accept: "text/html"
                },
                credentials: "same-origin"
            });

            if (!resposta.ok) {
                throw new Error(
                    "Falha ao carregar a página: " + resposta.status
                );
            }

            const html = await resposta.text();

            if (idRequisicao !== requisicaoAtual) {
                return;
            }

            const documento = new DOMParser().parseFromString(
                html,
                "text/html"
            );

            const origem =
                documento.querySelector(".pagina-extra") ||
                documento.querySelector("[data-page-content]") ||
                documento.querySelector("main");

            if (!origem) {
                throw new Error("Conteúdo principal não encontrado.");
            }

            const novoConteudo = origem.cloneNode(true);

            novoConteudo.querySelectorAll(
                "script, .pagina-topo"
            ).forEach(elemento => elemento.remove());

            novoConteudo.classList.add("pagina-dinamica");

            salvarConteudoInicial();
            area.replaceChildren(novoConteudo);

            const titulo = novoConteudo.querySelector("h1");

            document.title = titulo
                ? titulo.textContent.trim() + " | NUTRIQ"
                : documento.title || "NUTRIQ";

            paginaAtual = arquivo;

            atualizarMenu(arquivo);
            fecharMenu();
            mostrarFeedback("");
            atualizarEndereco(arquivo, adicionarHistorico);
            inicializarPagina(arquivo);

            window.scrollTo({
                top: 0,
                behavior: "auto"
            });
        } catch (erro) {
            if (idRequisicao !== requisicaoAtual) {
                return;
            }

            console.error("NUTRIQ: erro na navegação.", erro);

            mostrarFeedback(
                "Não foi possível abrir a página. Verifique o arquivo e tente novamente."
            );
        }
    }

    document.addEventListener("click", event => {
        const link = event.target.closest("a[href]");

        if (!link || link.target || link.hasAttribute("download")) {
            return;
        }

        const dentroDoPainel = link.closest(
            ".dashboard-navigation, " +
            "#conteudoPrincipal, " +
            ".dashboard-brand, " +
            ".dashboard-profile-button"
        );

        if (!dentroDoPainel) {
            return;
        }

        const url = new URL(link.href, window.location.href);

        if (url.origin !== window.location.origin) {
            return;
        }

        const arquivo = nomeArquivo(url.pathname);

        if (!paginasPermitidas.has(arquivo)) {
            return;
        }

        event.preventDefault();
        navegar(arquivo);
    });

    window.addEventListener("popstate", () => {
        const arquivo =
            new URLSearchParams(window.location.search).get("pagina") ||
            "pagina1.html";

        navegar(arquivo, false);
    });

    if (menuToggle && sidebar) {
        menuToggle.addEventListener("click", () => {
            const aberto = sidebar.classList.toggle("is-open");

            menuToggle.setAttribute("aria-expanded", String(aberto));
        });
    }

    atualizarMenu(paginaAtual);

    const paginaDaUrl =
        new URLSearchParams(window.location.search).get("pagina");

    if (paginaDaUrl && paginasPermitidas.has(paginaDaUrl)) {
        navegar(paginaDaUrl, false);
    }
});

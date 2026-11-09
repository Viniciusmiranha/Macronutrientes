
"use strict";

/* =========================================================
   NUTRIQ - DASHBOARD.JS
   Métricas e barras de progresso das metas
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /*
       METAS CONFIGURÁVEIS

       Neste exemplo, a meta é de 10 registros para
       cada categoria. Altere estes valores para definir
       as metas reais do seu consultório.
    */

    const METAS = {
        pacientes: 10,
        planos: 10,
        avaliacoes: 10
    };

    /* =====================================================
       CALCULAR E LIMITAR PORCENTAGEM
    ===================================================== */

    function limitarPercentual(valor) {
        return Math.max(0, Math.min(100, valor));
    }

    function calcularPercentual(atual, meta) {
        if (meta <= 0) {
            return 0;
        }

        return limitarPercentual((atual / meta) * 100);
    }

    /* =====================================================
       CALCULAR TAXA DE ADESÃO

       Considera consultas concluídas em relação
       ao total de consultas cadastradas.
    ===================================================== */

    function calcularAdesao(consultas) {
        if (!consultas.length) {
            return 0;
        }

        const concluidas = consultas.filter(consulta => {
            const status = String(consulta.status || "")
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase()
                .trim();

            return [
                "concluida",
                "concluido",
                "realizada",
                "realizado",
                "finalizada",
                "finalizado",
                "completed"
            ].includes(status);
        }).length;

        return limitarPercentual(
            (concluidas / consultas.length) * 100
        );
    }

    /* =====================================================
       ATUALIZAR UMA BARRA HORIZONTAL
    ===================================================== */

    function atualizarBarra(indice, percentual, idValor) {
        const cards = document.querySelectorAll(
            ".dashboard-goal-item"
        );

        const card = cards[indice];

        const barra = card?.querySelector(
            ".dashboard-progress-track > span"
        );

        const valor = document.getElementById(idValor);

        const porcentagem = limitarPercentual(percentual);

        if (barra) {
            barra.style.width = `${porcentagem}%`;
            barra.style.transition = "width 0.6s ease";
        }

        if (valor) {
            valor.textContent = `${Math.round(porcentagem)}%`;
        }
    }

    /* =====================================================
       ATUALIZAR CÍRCULO DE METAS CONCLUÍDAS
    ===================================================== */

    function atualizarCirculo(percentual) {
        const circulo = document.querySelector(
            ".dashboard-ring-value"
        );

        const texto = document.getElementById(
            "percentualMetas"
        );

        const indicador = document.querySelector(
            ".dashboard-progress-ring"
        );

        const porcentagem = limitarPercentual(percentual);

        /*
           O círculo SVG tem raio 48.
           A circunferência é 2 × PI × raio.
        */

        const circunferencia = 2 * Math.PI * 48;

        const deslocamento =
            circunferencia * (1 - porcentagem / 100);

        if (circulo) {
            circulo.style.strokeDasharray =
                `${circunferencia}`;

            circulo.style.strokeDashoffset =
                `${deslocamento}`;

            circulo.style.transition =
                "stroke-dashoffset 0.6s ease";
        }

        if (texto) {
            texto.textContent = `${Math.round(porcentagem)}%`;
        }

        if (indicador) {
            indicador.setAttribute(
                "aria-label",
                `${Math.round(porcentagem)} por cento das metas concluídas`
            );
        }
    }

    /* =====================================================
       ATUALIZAR TODAS AS MÉTRICAS E BARRAS
    ===================================================== */

    function atualizarMetricas() {
        if (!window.NutriqDados) {
            console.warn(
                "NutriqDados não foi carregado. Verifique a ordem dos scripts."
            );

            return;
        }

        const resumo = window.NutriqDados.obterResumo();

        /* ---------------------------------------------
           CONTADORES PRINCIPAIS DO PAINEL
        --------------------------------------------- */

        const contadores = {
            totalPacientes: resumo.totalPacientes,
            totalPlanos: resumo.totalPlanos,
            totalAvaliacoes: resumo.totalAvaliacoes,
            totalConsultas: resumo.totalConsultas
        };

        Object.entries(contadores).forEach(([id, valor]) => {
            const elemento = document.getElementById(id);

            if (elemento) {
                elemento.textContent = valor;
            }
        });

        /* ---------------------------------------------
           CALCULAR PORCENTAGENS DAS METAS
        --------------------------------------------- */

        const percentualPacientes = calcularPercentual(
            resumo.totalPacientes,
            METAS.pacientes
        );

        const percentualPlanos = calcularPercentual(
            resumo.totalPlanos,
            METAS.planos
        );

        const percentualAvaliacoes = calcularPercentual(
            resumo.totalAvaliacoes,
            METAS.avaliacoes
        );

        const percentualAdesao = calcularAdesao(
            resumo.consultas
        );

        /* ---------------------------------------------
           ATUALIZAR BARRAS HORIZONTAIS

           Índice 0: Pacientes atendidos
           Índice 1: Planos elaborados
           Índice 2: Avaliações realizadas
           Índice 3: Taxa de adesão
        --------------------------------------------- */

        atualizarBarra(
            0,
            percentualPacientes,
            "metaPacientesValor"
        );

        atualizarBarra(
            1,
            percentualPlanos,
            "metaPlanosValor"
        );

        atualizarBarra(
            2,
            percentualAvaliacoes,
            "metaAvaliacoesValor"
        );

        atualizarBarra(
            3,
            percentualAdesao,
            "metaAdesaoValor"
        );

        /* ---------------------------------------------
           PORCENTAGEM GERAL DAS METAS

           É a média das quatro porcentagens acima.
        --------------------------------------------- */

        const porcentagens = [
            percentualPacientes,
            percentualPlanos,
            percentualAvaliacoes,
            percentualAdesao
        ];

        const percentualGeral =
            porcentagens.reduce(
                (total, percentual) => total + percentual,
                0
            ) / porcentagens.length;

        atualizarCirculo(percentualGeral);
    }

    /* =====================================================
       EVENTOS DE ATUALIZAÇÃO
    ===================================================== */

    atualizarMetricas();

    /*
       Atualiza quando um cadastro, uma edição ou uma
       exclusão dispara o evento do banco de dados local.
    */

    window.addEventListener(
        "nutriqDadosAtualizados",
        atualizarMetricas
    );

    /*
       Atualiza quando os dados mudam em outra aba.
    */

    window.addEventListener(
        "storage",
        atualizarMetricas
    );

    function normalizarBusca(valor) {
        return String(valor || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    }

    const busca = document.getElementById("campoBusca");
    const formularioBusca = document.getElementById("dashboardSearch");
    if (busca && formularioBusca && window.location.pathname.split("/").pop() === "pagina1.html") {
        const resultados = document.createElement("div");
        resultados.id = "dashboardSearchResults";
        resultados.className = "dashboard-search-results";
        resultados.setAttribute("role", "region");
        resultados.setAttribute("aria-label", "Resultados de pacientes");
        resultados.setAttribute("aria-live", "polite");
        resultados.hidden = true;
        formularioBusca.appendChild(resultados);
        busca.setAttribute("aria-controls", resultados.id);

        function atualizarBusca() {
            const termo = normalizarBusca(busca.value);
            resultados.replaceChildren();
            if (!termo) {
                resultados.hidden = true;
                busca.setAttribute("aria-expanded", "false");
                return;
            }
            const pacientes = typeof window.NutriqDados?.listarPacientes === "function"
                ? window.NutriqDados.listarPacientes()
                : [];
            const digitos = valor => String(valor || "").replace(/\D/g, "");
            const numeroTermo = digitos(termo);
            const correspondentes = pacientes.filter(paciente => {
                const dados = normalizarBusca([
                    paciente.nome,
                    paciente.email,
                    paciente.cpf,
                    paciente.telefone
                ].join(" "));
                const identificadores = digitos([paciente.cpf, paciente.telefone].join(" "));
                return dados.includes(termo) || Boolean(numeroTermo && identificadores.includes(numeroTermo));
            }).slice(0, 8);

            if (!correspondentes.length) {
                const vazio = document.createElement("p");
                vazio.className = "dashboard-search-empty";
                vazio.textContent = "Nenhum paciente encontrado.";
                resultados.appendChild(vazio);
            } else {
                correspondentes.forEach(paciente => {
                    const link = document.createElement("a");
                    link.className = "dashboard-search-result";
                    link.href = "pacientes.html?ficha=" + encodeURIComponent(paciente.id);
                    const nome = document.createElement("strong");
                    nome.textContent = paciente.nome || "Paciente sem nome";
                    const detalhe = document.createElement("small");
                    detalhe.textContent = paciente.email || paciente.telefone || paciente.cpf || "Abrir ficha do paciente";
                    link.append(nome, detalhe);
                    resultados.appendChild(link);
                });
            }
            resultados.hidden = false;
            busca.setAttribute("aria-expanded", "true");
        }

        busca.addEventListener("input", atualizarBusca);
        busca.addEventListener("keydown", evento => {
            if (evento.key === "Escape" && !resultados.hidden) {
                resultados.hidden = true;
                busca.setAttribute("aria-expanded", "false");
            }
        });
        formularioBusca.addEventListener("submit", evento => evento.preventDefault());
        document.addEventListener("click", evento => {
            if (!formularioBusca.contains(evento.target)) {
                resultados.hidden = true;
                busca.setAttribute("aria-expanded", "false");
            }
        });
        window.addEventListener("nutriqDadosAtualizados", atualizarBusca);
        window.addEventListener("storage", atualizarBusca);
    }

    const botaoNotificacoes = document.getElementById("btnNotificacoes");
    if (botaoNotificacoes) {
        const wrapper = document.createElement("div");
        wrapper.className = "dashboard-notification-wrap";
        botaoNotificacoes.parentNode.insertBefore(wrapper, botaoNotificacoes);
        wrapper.appendChild(botaoNotificacoes);

        const badge = document.createElement("span");
        badge.className = "dashboard-notification-badge";
        badge.hidden = true;
        badge.setAttribute("aria-hidden", "true");
        botaoNotificacoes.appendChild(badge);

        const painel = document.createElement("section");
        painel.id = "dashboardNotificationsPanel";
        painel.className = "dashboard-notification-panel";
        painel.setAttribute("role", "dialog");
        painel.setAttribute("aria-labelledby", "dashboardNotificationsTitle");
        painel.tabIndex = -1;
        painel.hidden = true;
        painel.innerHTML = '<header class="dashboard-notification-head"><h2 id="dashboardNotificationsTitle">Notificações</h2><button type="button" class="dashboard-notification-read">Marcar todas como lidas</button></header><div class="dashboard-notification-list" aria-live="polite"></div>';
        wrapper.appendChild(painel);
        botaoNotificacoes.setAttribute("aria-controls", painel.id);
        botaoNotificacoes.setAttribute("aria-haspopup", "dialog");
        botaoNotificacoes.setAttribute("aria-expanded", "false");

        const listaAvisos = painel.querySelector(".dashboard-notification-list");
        const marcarLidas = painel.querySelector(".dashboard-notification-read");
        const chaveLidas = "nutriqNotificacoesLidas";
        let avisosAtuais = [];

        function lidasSalvas() {
            try {
                const valor = JSON.parse(localStorage.getItem(chaveLidas) || "[]");
                return new Set(Array.isArray(valor) ? valor : []);
            } catch {
                return new Set();
            }
        }

        function instanteConsulta(consulta) {
            const data = String(consulta.data || "").split("T")[0].split("-").map(Number);
            const horario = String(consulta.hora || consulta.horario || "00:00").split(":").map(Number);
            if (data.length !== 3 || !data[0] || !data[1] || !data[2]) return null;
            const instante = new Date(data[0], data[1] - 1, data[2], horario[0] || 0, horario[1] || 0);
            return Number.isNaN(instante.getTime()) ? null : instante;
        }

        function consultarAgendamentos() {
            const dados = window.NutriqDados;
            const consultas = typeof dados?.consultas?.listar === "function"
                ? dados.consultas.listar()
                : typeof dados?.listarConsultas === "function" ? dados.listarConsultas() : [];
            const agora = Date.now();
            const limite = agora + 7 * 24 * 60 * 60 * 1000;
            avisosAtuais = consultas.map(consulta => {
                const instante = instanteConsulta(consulta);
                return {
                    consulta,
                    instante,
                    status: normalizarBusca(consulta.status),
                    chave: [consulta.id, consulta.data, consulta.hora || consulta.horario].join("|")
                };
            }).filter(item => item.instante && item.instante.getTime() >= agora &&
                item.instante.getTime() <= limite && item.status === "agendada")
                .sort((a, b) => a.instante - b.instante);
        }

        function renderizarNotificacoes() {
            consultarAgendamentos();
            const lidas = lidasSalvas();
            const naoLidas = avisosAtuais.filter(item => !lidas.has(item.chave));
            badge.textContent = naoLidas.length > 9 ? "9+" : String(naoLidas.length);
            badge.hidden = naoLidas.length === 0;
            botaoNotificacoes.setAttribute("aria-label", naoLidas.length
                ? "Notificações, " + naoLidas.length + " não lidas"
                : "Notificações");
            marcarLidas.disabled = naoLidas.length === 0;
            listaAvisos.replaceChildren();

            if (!avisosAtuais.length) {
                const vazio = document.createElement("p");
                vazio.className = "dashboard-notification-empty";
                vazio.textContent = "Não há consultas próximas nos próximos 7 dias.";
                listaAvisos.appendChild(vazio);
                return;
            }

            avisosAtuais.forEach(item => {
                const consulta = item.consulta;
                const link = document.createElement("a");
                link.className = "dashboard-notification-item" + (lidas.has(item.chave) ? " is-read" : "");
                link.href = "consultas.html?editar=" + encodeURIComponent(consulta.id);
                const nome = document.createElement("strong");
                nome.textContent = consulta.paciente || "Consulta agendada";
                const data = document.createElement("small");
                data.textContent = item.instante.toLocaleString("pt-BR", {
                    weekday: "short", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit"
                });
                link.append(nome, data);
                link.addEventListener("click", () => {
                    const atualizadas = lidasSalvas();
                    atualizadas.add(item.chave);
                    try { localStorage.setItem(chaveLidas, JSON.stringify(Array.from(atualizadas))); } catch {}
                });
                listaAvisos.appendChild(link);
            });
        }

        function fecharNotificacoes(devolverFoco) {
            painel.hidden = true;
            botaoNotificacoes.setAttribute("aria-expanded", "false");
            if (devolverFoco) botaoNotificacoes.focus();
        }

        botaoNotificacoes.addEventListener("click", () => {
            const abrir = painel.hidden;
            renderizarNotificacoes();
            painel.hidden = !abrir;
            botaoNotificacoes.setAttribute("aria-expanded", String(abrir));
            if (abrir) (marcarLidas.disabled ? listaAvisos.querySelector("a") || painel : marcarLidas).focus();
        });
        marcarLidas.addEventListener("click", () => {
            const lidas = lidasSalvas();
            avisosAtuais.forEach(item => lidas.add(item.chave));
            try { localStorage.setItem(chaveLidas, JSON.stringify(Array.from(lidas))); } catch {}
            renderizarNotificacoes();
            marcarLidas.focus();
        });
        document.addEventListener("click", evento => {
            if (!wrapper.contains(evento.target) && !painel.hidden) fecharNotificacoes(false);
        });
        document.addEventListener("keydown", evento => {
            if (evento.key === "Escape" && !painel.hidden) fecharNotificacoes(true);
        });
        window.addEventListener("nutriqDadosAtualizados", renderizarNotificacoes);
        window.addEventListener("storage", renderizarNotificacoes);
        setInterval(renderizarNotificacoes, 60000);
        renderizarNotificacoes();
    }

    try {
        const perfil = JSON.parse(localStorage.getItem("nutriqPerfil") || "{}");
        const nome = document.getElementById("professionalName");
        if (nome && perfil.nome) nome.textContent = perfil.nome;
        const avatar = document.querySelector(".dashboard-avatar-professional");
        if (avatar && perfil.foto) {
            const imagem = document.createElement("img");
            imagem.src = perfil.foto;
            imagem.alt = "";
            imagem.className = "dashboard-profile-photo";
            avatar.replaceChildren(imagem);
        }
    } catch {}

    console.log(
        "NUTRIQ: dashboard.js carregado com barras dinâmicas."
    );
});

/* =========================================================
   CONTROLE DA JANELA DE PLANOS
========================================================= */

(() => {
    const botao = document.getElementById("btnVerPlanos");
    const modal = document.getElementById("modalPlanos");
    const fechar = document.getElementById("fecharModalPlanos");

    if (!botao || !modal || !fechar) {
        console.warn(
            "Verifique se btnVerPlanos, modalPlanos e fecharModalPlanos existem no HTML."
        );
        return;
    }

    let elementoAnterior = null;
    let overflowAnterior = "";

    function abrir() {
        elementoAnterior = document.activeElement;
        overflowAnterior = document.body.style.overflow;

        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");

        document.body.style.overflow = "hidden";

        fechar.focus();
    }

    function fecharModal() {
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");

        document.body.style.overflow = overflowAnterior;

        if (elementoAnterior) {
            elementoAnterior.focus();
        }
    }

    botao.addEventListener("click", abrir);
    fechar.addEventListener("click", fecharModal);

    modal.addEventListener("click", evento => {
        if (evento.target === modal) {
            fecharModal();
        }
    });

    document.addEventListener("keydown", evento => {
        if (
            evento.key === "Escape" &&
            modal.classList.contains("is-open")
        ) {
            fecharModal();
        }
    });
})();


(() => {
  const botao = document.getElementById("alternarBarraLateral");
  const pagina = document.querySelector(".dashboard-page");
  const chave = "nutriqBarraLateralOculta";
    const desktop = window.matchMedia("(min-width: 1051px)");

  if (!botao || !pagina) return;

  function atualizarBotao(oculta) {
    botao.setAttribute("aria-expanded", String(!oculta));
    botao.setAttribute(
      "aria-label",
      oculta ? "Mostrar barra lateral" : "Esconder barra lateral"
    );
    botao.title = oculta ? "Mostrar barra lateral" : "Esconder barra lateral";
  }

    function sincronizar() {
        botao.hidden = !desktop.matches;
        botao.setAttribute("aria-hidden", String(!desktop.matches));
        botao.tabIndex = desktop.matches ? 0 : -1;
        let oculta = false;
        try { oculta = desktop.matches && localStorage.getItem(chave) === "true"; } catch {}
        pagina.classList.toggle("sidebar-collapsed", oculta);
        atualizarBotao(oculta);
    }

    sincronizar();
    desktop.addEventListener("change", sincronizar);

  botao.addEventListener("click", () => {
        if (!desktop.matches) return;
        const oculta = !pagina.classList.contains("sidebar-collapsed");

    pagina.classList.toggle("sidebar-collapsed", oculta);
    atualizarBotao(oculta);

    try {
      localStorage.setItem(chave, String(oculta));
    } catch {}
  });
})();


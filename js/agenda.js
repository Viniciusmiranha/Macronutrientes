/* =====================================================
   NUTRIQ · Agenda (js/agenda.js)

   Lê as mesmas consultas da página consultas.html.

   >>> Ajuste apenas carregarConsultas() e salvarConsultas()
       para usar o seu js/database.js. <<<

   Consulta: { id, paciente, data (AAAA-MM-DD), hora (HH:MM),
               tipo, status: "agendada" | "realizada" | "cancelada" }
===================================================== */

(function () {
    "use strict";

    var CHAVE_CONSULTAS = "nutriq_consultas";
    var MAX_CHIPS_MES = 2;
    var HORA_INICIAL = 7;
    var HORA_FINAL = 20;

    /* ---------- Acesso a dados (troque pelo seu database.js) ---------- */
    function carregarConsultas() {
        try {
            var dados = JSON.parse(localStorage.getItem(CHAVE_CONSULTAS) || "[]");
            return Array.isArray(dados) ? dados : [];
        } catch (e) {
            return [];
        }
    }

    function salvarConsultas(lista) {
        try {
            localStorage.setItem(CHAVE_CONSULTAS, JSON.stringify(lista));
            return true;
        } catch (e) {
            return false;
        }
    }

    /* ---------- Estado e elementos ---------- */
    var consultas = carregarConsultas();
    var visao = "mes";
    var cursor = hoje();
    var termoBusca = "";

    function $(id) { return document.getElementById(id); }

    var el = {
        calendario: $("agCalendario"),
        periodo: $("agPeriodo"),
        anterior: $("agAnterior"),
        proximo: $("agProximo"),
        botaoHoje: $("agHoje"),
        diaData: $("agDiaData"),
        vazio: $("agVazio"),
        vazioTexto: $("agVazioTexto"),
        listaDia: $("agListaDia"),
        busca: $("campoBusca"),
        formBusca: $("dashboardSearch"),
        feedback: $("dashboardFeedback")
    };

    /* ---------- Datas ---------- */
    function hoje() {
        var n = new Date();
        return new Date(n.getFullYear(), n.getMonth(), n.getDate());
    }

    function iso(d) {
        var m = String(d.getMonth() + 1).padStart(2, "0");
        var dia = String(d.getDate()).padStart(2, "0");
        return d.getFullYear() + "-" + m + "-" + dia;
    }

    function lerISO(s) {
        var p = String(s).split("-");
        return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
    }

    function somarDias(d, n) {
        return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
    }

    function inicioDaSemana(d) {
        var deslocamento = (d.getDay() + 6) % 7; // segunda = 0
        return somarDias(d, -deslocamento);
    }

    function diasNoMes(ano, mes) {
        return new Date(ano, mes + 1, 0).getDate();
    }

    function mesmoDia(a, b) {
        return iso(a) === iso(b);
    }

    function capitalizar(t) {
        return t ? t.charAt(0).toUpperCase() + t.slice(1) : t;
    }

    function formatar(d, opcoes) {
        return d.toLocaleDateString("pt-BR", opcoes).replace(/\./g, "");
    }

    function momento(c) {
        var d = String(c.data || "").split("-");
        var h = String(c.hora || "00:00").split(":");
        return new Date(Number(d[0]), Number(d[1]) - 1, Number(d[2]), Number(h[0]) || 0, Number(h[1]) || 0);
    }

    /* ---------- Utilidades ---------- */
    function escapar(texto) {
        var div = document.createElement("div");
        div.textContent = texto == null ? "" : String(texto);
        return div.innerHTML;
    }

    function aviso(mensagem) {
        if (!el.feedback) return;
        el.feedback.textContent = mensagem;
        el.feedback.classList.add("is-visible");
        clearTimeout(aviso._t);
        aviso._t = setTimeout(function () {
            el.feedback.classList.remove("is-visible");
        }, 3000);
    }

    /* ---------- Eventos por dia ---------- */
    function eventosPorDia() {
        var termo = termoBusca.trim().toLowerCase();
        var mapa = {};
        consultas.forEach(function (c) {
            if (c.status === "cancelada" || !c.data) return;
            if (termo && String(c.paciente || "").toLowerCase().indexOf(termo) === -1) return;
            (mapa[c.data] = mapa[c.data] || []).push(c);
        });
        Object.keys(mapa).forEach(function (k) {
            mapa[k].sort(function (a, b) { return String(a.hora).localeCompare(String(b.hora)); });
        });
        return mapa;
    }

    function classeChip(c) {
        if (c.status === "realizada") return "ag-chip is-done";
        if (momento(c).getTime() < Date.now()) return "ag-chip is-pending";
        return "ag-chip";
    }

    /* ---------- Visão: mês ---------- */
    function htmlMes(mapa) {
        var ano = cursor.getFullYear();
        var mes = cursor.getMonth();
        var primeiro = new Date(ano, mes, 1);
        var inicio = inicioDaSemana(primeiro);
        var deslocamento = (primeiro.getDay() + 6) % 7;
        var linhas = Math.ceil((deslocamento + diasNoMes(ano, mes)) / 7);
        var dias = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
        var agora = hoje();

        var html = '<div class="ag-month"><div class="ag-weekdays">' +
            dias.map(function (d) { return '<div class="ag-weekday">' + d + "</div>"; }).join("") +
            '</div><div class="ag-month-body">';

        for (var i = 0; i < linhas * 7; i++) {
            var dia = somarDias(inicio, i);
            var chave = iso(dia);
            var lista = mapa[chave] || [];
            var classes = "ag-cell";
            if (dia.getMonth() !== mes) classes += " is-outside";
            if (mesmoDia(dia, agora)) classes += " is-today";
            if (mesmoDia(dia, cursor)) classes += " is-selected";

            var rotulo = formatar(dia, { weekday: "long", day: "numeric", month: "long", year: "numeric" }) +
                (lista.length ? ", " + lista.length + (lista.length === 1 ? " atendimento" : " atendimentos") : "");

            var chips = lista.slice(0, MAX_CHIPS_MES).map(function (c) {
                return '<span class="' + classeChip(c) + '">' + escapar(c.hora) + " " + escapar(c.paciente) + "</span>";
            }).join("");
            if (lista.length > MAX_CHIPS_MES) {
                chips += '<span class="ag-more">+' + (lista.length - MAX_CHIPS_MES) + " mais</span>";
            }

            html += '<button type="button" class="' + classes + '" data-data="' + chave + '"' +
                ' aria-label="' + escapar(rotulo) + '" aria-pressed="' + (mesmoDia(dia, cursor) ? "true" : "false") + '">' +
                '<span class="ag-daynum">' + dia.getDate() + "</span>" +
                (lista.length ? '<span class="ag-chips">' + chips + "</span>" +
                    '<span class="ag-count">' + lista.length + "</span>" : "") +
                "</button>";
        }

        return html + "</div></div>";
    }

    /* ---------- Visão: semana ---------- */
    function htmlSemana(mapa) {
        var inicio = inicioDaSemana(cursor);
        var agora = hoje();
        var html = '<div class="ag-week">';

        for (var i = 0; i < 7; i++) {
            var dia = somarDias(inicio, i);
            var chave = iso(dia);
            var lista = mapa[chave] || [];
            var classes = "ag-col" + (mesmoDia(dia, cursor) ? " is-selected" : "");
            var cabecalho = "ag-col-head" + (mesmoDia(dia, agora) ? " is-today" : "");
            var nomeDia = capitalizar(formatar(dia, { weekday: "short" }));

            html += '<div class="' + classes + '">' +
                '<button type="button" class="' + cabecalho + '" data-data="' + chave + '"' +
                ' aria-label="' + escapar(formatar(dia, { weekday: "long", day: "numeric", month: "long" })) + '">' +
                "<span>" + escapar(nomeDia) + '</span><span class="ag-daynum">' + dia.getDate() + "</span></button>" +
                '<div class="ag-col-body">' +
                lista.map(function (c) {
                    return '<span class="' + classeChip(c) + '"><strong>' + escapar(c.hora) + "</strong> " +
                        escapar(c.paciente) + "<small>" + escapar(c.tipo || "Consulta") + "</small></span>";
                }).join("") +
                "</div></div>";
        }

        return html + "</div>";
    }

    /* ---------- Visão: dia ---------- */
    function htmlDia(mapa) {
        var lista = mapa[iso(cursor)] || [];
        var primeira = HORA_INICIAL;
        var ultima = HORA_FINAL;
        lista.forEach(function (c) {
            var h = parseInt(String(c.hora).split(":")[0], 10);
            if (!isNaN(h)) {
                primeira = Math.min(primeira, h);
                ultima = Math.max(ultima, h);
            }
        });

        var html = '<div class="ag-day-view">';
        for (var h = primeira; h <= ultima; h++) {
            var doHorario = lista.filter(function (c) {
                return parseInt(String(c.hora).split(":")[0], 10) === h;
            });
            html += '<div class="ag-hour"><div class="ag-hour-label">' + String(h).padStart(2, "0") + ":00</div>" +
                '<div class="ag-hour-slot">' +
                doHorario.map(function (c) {
                    return '<span class="' + classeChip(c) + '"><strong>' + escapar(c.hora) + "</strong> · " +
                        escapar(c.paciente) + " · " + escapar(c.tipo || "Consulta") + "</span>";
                }).join("") +
                "</div></div>";
        }
        return html + "</div>";
    }

    /* ---------- Rótulo do período ---------- */
    function rotuloPeriodo() {
        if (visao === "mes") {
            return capitalizar(formatar(cursor, { month: "long", year: "numeric" }));
        }
        if (visao === "semana") {
            var ini = inicioDaSemana(cursor);
            var fim = somarDias(ini, 6);
            return formatar(ini, { day: "2-digit", month: "short" }) + " – " +
                formatar(fim, { day: "2-digit", month: "short", year: "numeric" });
        }
        return formatar(cursor, { day: "numeric", month: "long", year: "numeric" });
    }

    /* ---------- Painel "Atendimentos do dia" ---------- */
    function renderizarDia(mapa) {
        el.diaData.textContent = capitalizar(
            formatar(cursor, { weekday: "long", day: "numeric", month: "long", year: "numeric" })
        );

        var lista = mapa[iso(cursor)] || [];
        var tem = lista.length > 0;
        el.vazio.hidden = tem;
        el.listaDia.hidden = !tem;
        el.vazioTexto.textContent = mesmoDia(cursor, hoje())
            ? "Você está com a agenda livre para hoje."
            : "Você está com a agenda livre neste dia.";

        el.listaDia.innerHTML = lista.map(function (c) {
            var passada = momento(c).getTime() < Date.now();
            var badge;
            var acoes = "";

            if (c.status === "realizada") {
                badge = '<span class="pac-badge">Realizada</span>';
            } else {
                badge = passada
                    ? '<span class="pac-badge ag-badge-warn">Pendente</span>'
                    : '<span class="pac-badge">Agendada</span>';
                acoes =
                    '<button type="button" class="ag-item-btn" data-acao="realizar" data-id="' + escapar(c.id) + '">Concluir</button>' +
                    '<button type="button" class="ag-item-btn ag-item-btn-danger" data-acao="cancelar" data-id="' + escapar(c.id) + '">Cancelar</button>';
            }

            return (
                '<li class="ag-item">' +
                    '<span class="ag-item-time">' + escapar(c.hora) + "</span>" +
                    '<div class="ag-item-info"><strong>' + escapar(c.paciente) + "</strong>" +
                    "<small>" + escapar(c.tipo || "Consulta") + "</small></div>" +
                    '<div class="ag-item-actions">' + acoes + badge + "</div>" +
                "</li>"
            );
        }).join("");
    }

    /* ---------- Renderização geral ---------- */
    function renderizar() {
        var mapa = eventosPorDia();
        el.periodo.textContent = rotuloPeriodo();

        if (visao === "mes") el.calendario.innerHTML = htmlMes(mapa);
        else if (visao === "semana") el.calendario.innerHTML = htmlSemana(mapa);
        else el.calendario.innerHTML = htmlDia(mapa);

        renderizarDia(mapa);
    }

    /* ---------- Navegação ---------- */
    function mover(sentido) {
        if (visao === "mes") {
            var ano = cursor.getFullYear();
            var mes = cursor.getMonth() + sentido;
            var alvo = new Date(ano, mes, 1);
            var dia = Math.min(cursor.getDate(), diasNoMes(alvo.getFullYear(), alvo.getMonth()));
            cursor = new Date(alvo.getFullYear(), alvo.getMonth(), dia);
        } else if (visao === "semana") {
            cursor = somarDias(cursor, 7 * sentido);
        } else {
            cursor = somarDias(cursor, sentido);
        }
        renderizar();
    }

    function trocarVisao(nova) {
        visao = nova;
        document.querySelectorAll(".ag-view").forEach(function (b) {
            var ativo = b.getAttribute("data-visao") === nova;
            b.classList.toggle("is-active", ativo);
            b.setAttribute("aria-pressed", ativo ? "true" : "false");
        });
        renderizar();
    }

    /* ---------- Ações nos atendimentos ---------- */
    function aoClicarNaLista(evento) {
        var botao = evento.target.closest("[data-acao]");
        if (!botao) return;

        var id = botao.getAttribute("data-id");
        var acao = botao.getAttribute("data-acao");

        if (acao === "cancelar" && !window.confirm("Cancelar este atendimento?")) return;

        consultas.forEach(function (c) {
            if (c.id === id) c.status = acao === "realizar" ? "realizada" : "cancelada";
        });

        salvarConsultas(consultas);
        renderizar();
        aviso(acao === "realizar" ? "Atendimento marcado como realizado." : "Atendimento cancelado.");
    }

    /* ---------- Eventos ---------- */
    function iniciar() {
        el.anterior.addEventListener("click", function () { mover(-1); });
        el.proximo.addEventListener("click", function () { mover(1); });
        el.botaoHoje.addEventListener("click", function () {
            cursor = hoje();
            renderizar();
        });

        document.querySelectorAll(".ag-view").forEach(function (b) {
            b.addEventListener("click", function () {
                trocarVisao(b.getAttribute("data-visao"));
            });
        });

        el.calendario.addEventListener("click", function (e) {
            var alvo = e.target.closest("[data-data]");
            if (!alvo) return;
            cursor = lerISO(alvo.getAttribute("data-data"));
            renderizar();
            var mantido = el.calendario.querySelector('[data-data="' + iso(cursor) + '"]');
            if (mantido) mantido.focus();
        });

        el.listaDia.addEventListener("click", aoClicarNaLista);

        if (el.busca) {
            el.busca.addEventListener("input", function () {
                termoBusca = el.busca.value;
                renderizar();
            });
        }
        if (el.formBusca) {
            el.formBusca.addEventListener("submit", function (e) { e.preventDefault(); });
        }

        // Atualiza ao voltar de outra página (consultas.html) ou de outra aba
        window.addEventListener("pageshow", function () {
            consultas = carregarConsultas();
            renderizar();
        });
        window.addEventListener("storage", function (e) {
            if (e.key === CHAVE_CONSULTAS) {
                consultas = carregarConsultas();
                renderizar();
            }
        });

        renderizar();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", iniciar);
    } else {
        iniciar();
    }
})();
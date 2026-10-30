/* =====================================================
   NUTRIQ · Consultas (js/consultas.js)
   Agendar, editar, concluir e cancelar consultas.
   Usa js/nutriq-dados.js.
===================================================== */

(function () {
    "use strict";

    var D = window.NutriqDados;
    if (!D) {
        console.error("NUTRIQ: carregue js/nutriq-dados.js antes de js/consultas.js");
        return;
    }
    var U = D.util;
    var esc = U.escapar;

    var MAX_PROXIMAS = 5;
    var MAX_HISTORICO = 5;
    var MAX_ATENDIMENTOS = 3;
    var DIAS_ATENDIMENTOS = 7;

    function $(id) { return document.getElementById(id); }

    var el = {
        total: $("statTotal"),
        proximas: $("statProximas"),
        atendidos: $("statAtendidos"),
        avaliacao: $("statAvaliacao"),

        proximasVazio: $("csProximasVazio"),
        proximasSem: $("csProximasSemResultado"),
        listaProximas: $("listaProximas"),
        btnProximas: $("btnVerTodasProximas"),

        historicoVazio: $("csHistoricoVazio"),
        historicoSem: $("csHistoricoSemResultado"),
        listaHistorico: $("listaHistorico"),
        btnHistorico: $("btnVerTodosHistorico"),

        atendVazio: $("csAtendimentosVazio"),
        listaAtend: $("listaAtendimentos"),

        busca: $("campoBusca"),
        formBusca: $("dashboardSearch"),
        modal: $("modalNovaConsulta"),
        form: $("formConsulta"),
        select: $("csPaciente"),
        semPacientes: $("csSemPacientes"),
        grupoAvaliacao: $("csAvaliacaoGrupo"),
        salvar: $("csSalvar")
    };

    var termoBusca = "";
    var expandirProximas = false;
    var expandirHistorico = false;

    /* ---------- Situação de cada consulta ---------- */
    function momentoDe(c) { return U.momento(c.data, c.hora); }

    function ehFutura(c) {
        var m = momentoDe(c);
        return c.status === "agendada" && !!m && m.getTime() >= Date.now();
    }

    function iniciou(c) {
        var m = momentoDe(c);
        return !!m && m.getTime() <= Date.now();
    }

    function ordenarAsc(a, b) { return momentoDe(a) - momentoDe(b); }
    function ordenarDesc(a, b) { return momentoDe(b) - momentoDe(a); }

    function correspondeBusca(c) {
        var termo = U.normalizar(termoBusca);
        return !termo || U.normalizar(c.paciente).indexOf(termo) !== -1;
    }

    /* ---------- Blocos de HTML ---------- */
    function blocoData(c) {
        var d = U.lerISO(c.data);
        if (!d) return '<div class="cs-date"><strong>—</strong></div>';
        var mes = d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
        return '<div class="cs-date" aria-hidden="true"><strong>' + d.getDate() + "</strong><span>" + esc(mes) + "</span></div>";
    }

    function rotuloData(c) {
        var d = U.lerISO(c.data);
        if (!d) return "";
        return d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "2-digit" }) + " às " + (c.hora || "");
    }

    function botao(acao, id, texto, perigo) {
        return '<button type="button" class="cs-item-btn' + (perigo ? " cs-item-btn-danger" : "") +
            '" data-acao="' + acao + '" data-id="' + esc(id) + '">' + texto + "</button>";
    }

    function subtitulo(c) {
        var nota = c.status === "realizada" && c.avaliacao ? " · ★ " + esc(c.avaliacao) : "";
        return esc(c.tipo || "Consulta") + " · " + esc(rotuloData(c)) + nota;
    }

    function itemAgendada(c) {
        var acoes = (iniciou(c) ? botao("realizar", c.id, "Concluir") : "") +
            botao("editar", c.id, "Editar") +
            botao("cancelar", c.id, "Cancelar", true);
        return (
            '<li class="cs-item">' + blocoData(c) +
                '<div class="cs-item-info"><strong>' + esc(c.paciente) + "</strong><small>" + subtitulo(c) + "</small></div>" +
                '<div class="cs-item-actions">' + acoes + "</div></li>"
        );
    }

    function itemAtendimento(c) {
        return (
            '<li class="cs-item">' + blocoData(c) +
                '<div class="cs-item-info"><strong>' + esc(c.paciente) + "</strong>" +
                "<small>" + esc(c.hora || "") + " · " + esc(c.tipo || "Consulta") + "</small></div></li>"
        );
    }

    function itemHistorico(c) {
        var badge, acoes = "";
        if (c.status === "realizada") {
            badge = '<span class="pac-badge">Realizada</span>';
            acoes = botao("editar", c.id, "Editar");
        } else if (c.status === "cancelada") {
            badge = '<span class="pac-badge pac-badge-off">Cancelada</span>';
            acoes = botao("editar", c.id, "Editar");
        } else {
            badge = '<span class="pac-badge cs-badge-warn">Pendente</span>';
            acoes = botao("realizar", c.id, "Concluir") + botao("editar", c.id, "Editar") + botao("cancelar", c.id, "Cancelar", true);
        }
        return (
            '<li class="cs-item">' + blocoData(c) +
                '<div class="cs-item-info"><strong>' + esc(c.paciente) + "</strong><small>" + subtitulo(c) + "</small></div>" +
                '<div class="cs-item-actions">' + acoes + badge + "</div></li>"
        );
    }

    /* ---------- Renderização ---------- */
    function atualizarResumo(todas) {
        var realizadas = todas.filter(function (c) { return c.status === "realizada"; });
        var unicos = {};
        realizadas.forEach(function (c) { unicos[c.pacienteId || c.paciente] = true; });
        var notas = realizadas
            .map(function (c) { return Number(c.avaliacao); })
            .filter(function (n) { return n >= 1 && n <= 5; });

        el.total.textContent = realizadas.length;
        el.proximas.textContent = todas.filter(ehFutura).length;
        el.atendidos.textContent = Object.keys(unicos).length;
        el.avaliacao.textContent = notas.length
            ? (notas.reduce(function (s, n) { return s + n; }, 0) / notas.length).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })
            : "—";
    }

    function secao(lista, ul, vazio, semResultado, botaoVerTodas, temDados, limite, expandido, gerarItem) {
        var tem = lista.length > 0;
        var visiveis = expandido ? lista : lista.slice(0, limite);

        vazio.hidden = temDados;
        semResultado.hidden = !(temDados && !tem);
        ul.hidden = !tem;
        ul.innerHTML = visiveis.map(gerarItem).join("");

        botaoVerTodas.hidden = lista.length <= limite;
        botaoVerTodas.setAttribute("aria-expanded", expandido ? "true" : "false");
        botaoVerTodas.firstChild.textContent = expandido ? "Ver menos " : "Ver todas ";
    }

    function render() {
        var todas = D.consultas.listar().filter(function (c) { return !!momentoDe(c); });
        atualizarResumo(todas);

        var futurasTodas = todas.filter(ehFutura).sort(ordenarAsc);
        secao(futurasTodas.filter(correspondeBusca), el.listaProximas, el.proximasVazio, el.proximasSem,
            el.btnProximas, futurasTodas.length > 0, MAX_PROXIMAS, expandirProximas, itemAgendada);

        var historicoTodas = todas.filter(function (c) { return !ehFutura(c); }).sort(ordenarDesc);
        secao(historicoTodas.filter(correspondeBusca), el.listaHistorico, el.historicoVazio, el.historicoSem,
            el.btnHistorico, historicoTodas.length > 0, MAX_HISTORICO, expandirHistorico, itemHistorico);

        var limite = Date.now() + DIAS_ATENDIMENTOS * 24 * 60 * 60 * 1000;
        var proximosDias = futurasTodas
            .filter(function (c) { return momentoDe(c).getTime() <= limite && correspondeBusca(c); })
            .slice(0, MAX_ATENDIMENTOS);
        el.atendVazio.hidden = proximosDias.length > 0;
        el.listaAtend.hidden = proximosDias.length === 0;
        el.listaAtend.innerHTML = proximosDias.map(itemAtendimento).join("");
    }

    /* ---------- Formulário ---------- */
    function limparErros() {
        el.form.querySelectorAll(".nq-error").forEach(function (s) { s.textContent = ""; });
        el.form.querySelectorAll(".has-error").forEach(function (f) { f.classList.remove("has-error"); });
    }

    function preencherPacientes(selecionadoId) {
        var pacientes = D.pacientes.listar().sort(function (a, b) {
            return String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR");
        });

        el.select.innerHTML = '<option value="">Selecione o paciente</option>' +
            pacientes.map(function (p) {
                var sufixo = p.status === "alta" ? " (alta)" : p.status === "inativo" ? " (inativo)" : "";
                return '<option value="' + esc(p.id) + '">' + esc(p.nome) + sufixo + "</option>";
            }).join("");

        var vazio = pacientes.length === 0;
        el.semPacientes.hidden = !vazio;
        el.select.disabled = vazio;
        el.salvar.disabled = vazio;

        if (selecionadoId && pacientes.some(function (p) { return p.id === selecionadoId; })) {
            el.select.value = selecionadoId;
        }
    }

    function atualizarCampoAvaliacao() {
        var realizada = $("csStatus").value === "realizada";
        el.grupoAvaliacao.hidden = !realizada;
        if (!realizada) $("csAvaliacao").value = "";
    }

    function abrirFormulario(consulta, sugestao) {
        sugestao = sugestao || {};
        el.form.reset();
        limparErros();
        $("csId").value = "";
        preencherPacientes(consulta ? consulta.pacienteId : sugestao.pacienteId);

        if (consulta) {
            $("csModalTitulo").textContent = "Editar consulta";
            el.salvar.textContent = "Salvar alterações";
            $("csId").value = consulta.id;
            $("csData").value = consulta.data || "";
            $("csHora").value = consulta.hora || "";
            $("csTipo").value = consulta.tipo || "Primeira consulta";
            $("csStatus").value = consulta.status || "agendada";
            $("csAvaliacao").value = consulta.avaliacao ? String(consulta.avaliacao) : "";
            $("csObs").value = consulta.observacoes || "";
        } else {
            $("csModalTitulo").textContent = "Nova consulta";
            el.salvar.textContent = "Agendar consulta";
            $("csData").value = U.lerISO(sugestao.data) ? sugestao.data : U.hojeISO();
        }

        atualizarCampoAvaliacao();
        D.abrirModal(el.modal, el.select.disabled ? ".nq-close" : "#csPaciente");
    }

    function lerFormulario() {
        limparErros();
        var primeiro = null;
        var idEdicao = $("csId").value;
        var original = idEdicao ? D.consultas.obter(idEdicao) : null;

        function falha(idCampo, mensagem) {
            var campo = $(idCampo);
            campo.parentNode.classList.add("has-error");
            var span = el.form.querySelector('[data-erro-para="' + idCampo + '"]');
            if (span) span.textContent = mensagem;
            if (!primeiro) primeiro = campo;
        }

        var paciente = el.select.value ? D.pacientes.obter(el.select.value) : null;
        if (!paciente) falha("csPaciente", "Selecione o paciente.");

        var data = $("csData").value;
        var hora = $("csHora").value;
        var status = $("csStatus").value;

        if (!U.lerISO(data)) falha("csData", "Informe a data.");
        if (!/^\d{2}:\d{2}$/.test(hora)) falha("csHora", "Informe o horário.");

        if (!primeiro) {
            var m = U.momento(data, hora);
            var mudouHorario = !original || original.data !== data || original.hora !== hora || original.status !== "agendada";

            if (status === "agendada" && mudouHorario && m.getTime() < Date.now()) {
                falha("csHora", "Escolha um horário futuro ou mude a situação para Realizada.");
            } else if (status === "realizada" && m.getTime() > Date.now()) {
                falha("csData", "Uma consulta realizada não pode estar no futuro.");
            } else if (status !== "cancelada" && D.consultas.conflito(data, hora, idEdicao)) {
                falha("csHora", "Já existe um atendimento neste horário.");
            }
        }

        var nota = $("csAvaliacao").value;
        if (status === "realizada" && nota !== "" && (Number(nota) < 1 || Number(nota) > 5)) {
            falha("csAvaliacao", "Use uma nota de 1 a 5.");
        }

        if (primeiro) {
            primeiro.focus();
            return null;
        }

        return {
            pacienteId: paciente.id,
            paciente: paciente.nome,
            data: data,
            hora: hora,
            tipo: $("csTipo").value,
            observacoes: $("csObs").value.trim(),
            status: status,
            avaliacao: status === "realizada" && nota !== "" ? Number(nota) : null
        };
    }

    function aoSalvar(evento) {
        evento.preventDefault();
        var dados = lerFormulario();
        if (!dados) return;

        var id = $("csId").value;
        var salvo = id ? D.consultas.atualizar(id, dados) : D.consultas.criar(dados);
        if (!salvo) {
            D.toast("Não foi possível salvar a consulta. O armazenamento do navegador pode estar indisponível.", "erro");
            return;
        }

        D.fecharModal(el.modal);
        render();
        D.toast(id ? "Consulta atualizada." : (dados.status === "agendada" ? "Consulta agendada." : "Consulta registrada."));
    }

    /* ---------- Ações nas listas ---------- */
    function aoClicarNaLista(evento) {
        var b = evento.target.closest("[data-acao]");
        if (!b) return;

        var id = b.getAttribute("data-id");
        var acao = b.getAttribute("data-acao");
        var consulta = D.consultas.obter(id);
        if (!consulta) return;

        if (acao === "editar") {
            abrirFormulario(consulta);
        } else if (acao === "realizar") {
            if (!iniciou(consulta)) {
                D.toast("Só é possível concluir a consulta depois do horário marcado.", "erro");
                return;
            }
            if (!D.consultas.atualizar(id, { status: "realizada" })) {
                D.toast("Não foi possível atualizar a consulta.", "erro");
                return;
            }
            render();
            D.toast("Consulta marcada como realizada.");
        } else if (acao === "cancelar") {
            if (!window.confirm("Cancelar a consulta de " + consulta.paciente + "?")) return;
            if (!D.consultas.atualizar(id, { status: "cancelada" })) {
                D.toast("Não foi possível cancelar a consulta.", "erro");
                return;
            }
            render();
            D.toast("Consulta cancelada.");
        }
    }

    /* ---------- Eventos ---------- */
    function iniciar() {
        document.querySelectorAll("[data-abrir-consulta]").forEach(function (b) {
            b.addEventListener("click", function () { abrirFormulario(null); });
        });

        document.addEventListener("click", function (e) {
            var alvo = e.target.closest("[data-fechar]");
            if (alvo) D.fecharModal(alvo.closest(".nq-overlay"));
        });

        el.form.addEventListener("submit", aoSalvar);
        $("csStatus").addEventListener("change", atualizarCampoAvaliacao);
        el.listaProximas.addEventListener("click", aoClicarNaLista);
        el.listaHistorico.addEventListener("click", aoClicarNaLista);

        el.btnProximas.addEventListener("click", function () {
            expandirProximas = !expandirProximas;
            render();
        });
        el.btnHistorico.addEventListener("click", function () {
            expandirHistorico = !expandirHistorico;
            render();
        });

        if (el.busca) {
            el.busca.addEventListener("input", function () {
                termoBusca = el.busca.value;
                render();
            });
        }
        if (el.formBusca) {
            el.formBusca.addEventListener("submit", function (e) { e.preventDefault(); });
        }

        D.aoMudar(render);
        setInterval(render, 60000); // consultas que passam do horário vão para o histórico
        render();

        // Atalhos vindos de outras páginas
        var editar = U.parametro("editar");
        if (editar && D.consultas.obter(editar)) {
            abrirFormulario(D.consultas.obter(editar));
        } else if (U.parametro("novo") === "1") {
            abrirFormulario(null, { pacienteId: U.parametro("paciente"), data: U.parametro("data") });
        }
        if (editar || U.parametro("novo")) U.limparParametros();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", iniciar);
    } else {
        iniciar();
    }
})();
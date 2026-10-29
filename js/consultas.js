/* =====================================================
   NUTRIQ · Consultas (js/consultas.js)

   >>> Ajuste apenas carregarConsultas(), salvarConsultas()
       e carregarPacientes() para usar o seu js/database.js. <<<

   Consulta: { id, paciente, data, hora, tipo, observacoes,
               status, avaliacao, criadoEm }
   status: "agendada" | "realizada" | "cancelada"
   avaliacao: número de 1 a 5 (opcional, preenchido pelo paciente)
===================================================== */

(function () {
    "use strict";

    var CHAVE_CONSULTAS = "nutriq_consultas";
    var CHAVE_PACIENTES = "nutriq_pacientes";
    var MAX_PROXIMAS = 5;
    var MAX_HISTORICO = 5;
    var MAX_ATENDIMENTOS = 3;
    var DIAS_ATENDIMENTOS = 7;

    /* ---------- Acesso a dados (troque pelo seu database.js) ---------- */
    function lerLista(chave) {
        try {
            var dados = JSON.parse(localStorage.getItem(chave) || "[]");
            return Array.isArray(dados) ? dados : [];
        } catch (e) {
            return [];
        }
    }

    function carregarConsultas() { return lerLista(CHAVE_CONSULTAS); }
    function carregarPacientes() { return lerLista(CHAVE_PACIENTES); }

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
    var termoBusca = "";
    var ultimoFoco = null;

    function $(id) { return document.getElementById(id); }

    var el = {
        total: $("statTotal"),
        proximas: $("statProximas"),
        atendidos: $("statAtendidos"),
        avaliacao: $("statAvaliacao"),

        proximasVazio: $("csProximasVazio"),
        proximasSem: $("csProximasSemResultado"),
        listaProximas: $("listaProximas"),

        historicoVazio: $("csHistoricoVazio"),
        historicoSem: $("csHistoricoSemResultado"),
        listaHistorico: $("listaHistorico"),

        atendVazio: $("csAtendimentosVazio"),
        listaAtend: $("listaAtendimentos"),

        busca: $("campoBusca"),
        formBusca: $("dashboardSearch"),
        modal: $("modalNovaConsulta"),
        form: $("formConsulta"),
        datalist: $("csListaPacientes"),
        feedback: $("dashboardFeedback")
    };

    /* ---------- Utilidades ---------- */
    function escapar(texto) {
        var div = document.createElement("div");
        div.textContent = texto == null ? "" : String(texto);
        return div.innerHTML;
    }

    function dataHora(c) {
        var d = String(c.data || "").split("-");
        var h = String(c.hora || "00:00").split(":");
        if (d.length !== 3) return null;
        return new Date(Number(d[0]), Number(d[1]) - 1, Number(d[2]), Number(h[0]) || 0, Number(h[1]) || 0);
    }

    function hojeISO() {
        var n = new Date();
        var mes = String(n.getMonth() + 1).padStart(2, "0");
        var dia = String(n.getDate()).padStart(2, "0");
        return n.getFullYear() + "-" + mes + "-" + dia;
    }

    function novoId() {
        return "co_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
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

    function blocoData(c) {
        var dt = dataHora(c);
        if (!dt) return '<div class="cs-date"><strong>—</strong></div>';
        var mes = dt.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
        return '<div class="cs-date" aria-hidden="true"><strong>' + dt.getDate() + "</strong><span>" + escapar(mes) + "</span></div>";
    }

    function rotuloData(c) {
        var dt = dataHora(c);
        if (!dt) return "";
        var dia = dt.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "2-digit" });
        return dia + " às " + (c.hora || "");
    }

    /* ---------- Separação por situação ---------- */
    function correspondeBusca(c) {
        var termo = termoBusca.trim().toLowerCase();
        return !termo || String(c.paciente || "").toLowerCase().indexOf(termo) !== -1;
    }

    function ehFutura(c) {
        var dt = dataHora(c);
        return c.status === "agendada" && dt && dt.getTime() >= Date.now();
    }

    function ordenarAsc(a, b) { return dataHora(a) - dataHora(b); }
    function ordenarDesc(a, b) { return dataHora(b) - dataHora(a); }

    /* ---------- Renderização ---------- */
    function atualizarResumo() {
        var realizadas = consultas.filter(function (c) { return c.status === "realizada"; });
        var unicos = {};
        realizadas.forEach(function (c) {
            unicos[String(c.paciente || "").trim().toLowerCase()] = true;
        });

        var notas = consultas
            .map(function (c) { return Number(c.avaliacao); })
            .filter(function (n) { return n >= 1 && n <= 5; });

        el.total.textContent = realizadas.length;
        el.proximas.textContent = consultas.filter(ehFutura).length;
        el.atendidos.textContent = Object.keys(unicos).length;
        el.avaliacao.textContent = notas.length
            ? (notas.reduce(function (s, n) { return s + n; }, 0) / notas.length).toFixed(1).replace(".", ",")
            : "—";
    }

    function itemProxima(c) {
        return (
            '<li class="cs-item">' + blocoData(c) +
                '<div class="cs-item-info"><strong>' + escapar(c.paciente) + "</strong>" +
                "<small>" + escapar(c.tipo || "Consulta") + " · " + escapar(rotuloData(c)) + "</small></div>" +
                '<div class="cs-item-actions">' +
                    '<button type="button" class="cs-item-btn" data-acao="realizar" data-id="' + escapar(c.id) + '">Concluir</button>' +
                    '<button type="button" class="cs-item-btn cs-item-btn-danger" data-acao="cancelar" data-id="' + escapar(c.id) + '">Cancelar</button>' +
                "</div></li>"
        );
    }

    function itemAtendimento(c) {
        return (
            '<li class="cs-item">' + blocoData(c) +
                '<div class="cs-item-info"><strong>' + escapar(c.paciente) + "</strong>" +
                "<small>" + escapar(c.hora || "") + " · " + escapar(c.tipo || "Consulta") + "</small></div></li>"
        );
    }

    function itemHistorico(c) {
        var badge;
        var acoes = "";
        if (c.status === "realizada") {
            badge = '<span class="pac-badge">Realizada</span>';
        } else if (c.status === "cancelada") {
            badge = '<span class="pac-badge pac-badge-off">Cancelada</span>';
        } else {
            badge = '<span class="pac-badge cs-badge-warn">Pendente</span>';
            acoes =
                '<button type="button" class="cs-item-btn" data-acao="realizar" data-id="' + escapar(c.id) + '">Concluir</button>' +
                '<button type="button" class="cs-item-btn cs-item-btn-danger" data-acao="cancelar" data-id="' + escapar(c.id) + '">Cancelar</button>';
        }
        return (
            '<li class="cs-item">' + blocoData(c) +
                '<div class="cs-item-info"><strong>' + escapar(c.paciente) + "</strong>" +
                "<small>" + escapar(c.tipo || "Consulta") + " · " + escapar(rotuloData(c)) + "</small></div>" +
                '<div class="cs-item-actions">' + acoes + badge + "</div></li>"
        );
    }

    function renderizarLista(lista, ul, vazio, semResultado, temDadosNaSecao, gerarItem) {
        var tem = lista.length > 0;
        vazio.hidden = temDadosNaSecao;
        if (semResultado) semResultado.hidden = !(temDadosNaSecao && !tem);
        ul.hidden = !tem;
        ul.innerHTML = lista.map(gerarItem).join("");
    }

    function renderizar() {
        atualizarResumo();

        // Próximas consultas
        var futurasTodas = consultas.filter(ehFutura).sort(ordenarAsc);
        var futuras = futurasTodas.filter(correspondeBusca).slice(0, MAX_PROXIMAS);
        renderizarLista(futuras, el.listaProximas, el.proximasVazio, el.proximasSem, futurasTodas.length > 0, itemProxima);

        // Histórico (realizadas, canceladas e agendadas já passadas)
        var historicoTodas = consultas.filter(function (c) { return !ehFutura(c); }).sort(ordenarDesc);
        var historico = historicoTodas.filter(correspondeBusca).slice(0, MAX_HISTORICO);
        renderizarLista(historico, el.listaHistorico, el.historicoVazio, el.historicoSem, historicoTodas.length > 0, itemHistorico);

        // Próximos atendimentos (janela de poucos dias, versão compacta)
        var limite = Date.now() + DIAS_ATENDIMENTOS * 24 * 60 * 60 * 1000;
        var proximosDias = futurasTodas
            .filter(function (c) { return dataHora(c).getTime() <= limite && correspondeBusca(c); })
            .slice(0, MAX_ATENDIMENTOS);
        var temAtend = proximosDias.length > 0;
        el.atendVazio.hidden = temAtend;
        el.listaAtend.hidden = !temAtend;
        el.listaAtend.innerHTML = proximosDias.map(itemAtendimento).join("");
    }

    /* ---------- Modal ---------- */
    function preencherPacientes() {
        el.datalist.innerHTML = carregarPacientes().map(function (p) {
            return '<option value="' + escapar(p.nome) + '"></option>';
        }).join("");
    }

    function limparErros() {
        el.form.querySelectorAll(".cs-error").forEach(function (s) { s.textContent = ""; });
        el.form.querySelectorAll(".has-error").forEach(function (f) { f.classList.remove("has-error"); });
    }

    function abrirModal() {
        ultimoFoco = document.activeElement;
        preencherPacientes();
        el.form.reset();
        limparErros();
        $("csData").value = hojeISO();
        el.modal.hidden = false;
        document.body.classList.add("cs-modal-open");
        $("csPaciente").focus();
    }

    function fecharModal() {
        el.modal.hidden = true;
        document.body.classList.remove("cs-modal-open");
        if (ultimoFoco && ultimoFoco.focus) ultimoFoco.focus();
    }

    function erro(idCampo, mensagem) {
        var campo = $(idCampo);
        var span = el.form.querySelector('[data-erro-para="' + idCampo + '"]');
        campo.parentNode.classList.add("has-error");
        if (span) span.textContent = mensagem;
        return campo;
    }

    function validar() {
        limparErros();
        var primeiro = null;
        function marcar(campo) { if (!primeiro) primeiro = campo; }

        if (!$("csPaciente").value.trim()) marcar(erro("csPaciente", "Informe o paciente."));
        if (!$("csData").value) marcar(erro("csData", "Informe a data."));
        if (!$("csHora").value) marcar(erro("csHora", "Informe o horário."));

        if (!primeiro) {
            var candidata = { data: $("csData").value, hora: $("csHora").value };
            var dt = dataHora(candidata);
            if (dt && dt.getTime() < Date.now()) {
                marcar(erro("csHora", "Escolha um horário futuro."));
            }
        }

        if (primeiro) primeiro.focus();
        return !primeiro;
    }

    function aoSalvar(evento) {
        evento.preventDefault();
        if (!validar()) return;

        consultas.push({
            id: novoId(),
            paciente: $("csPaciente").value.trim(),
            data: $("csData").value,
            hora: $("csHora").value,
            tipo: $("csTipo").value,
            observacoes: $("csObs").value.trim(),
            status: "agendada",
            avaliacao: null,
            criadoEm: new Date().toISOString()
        });

        if (!salvarConsultas(consultas)) {
            consultas.pop();
            aviso("Não foi possível salvar a consulta. Tente novamente.");
            return;
        }

        fecharModal();
        renderizar();
        aviso("Consulta agendada.");
    }

    /* ---------- Ações nos itens ---------- */
    function aoClicarNaLista(evento) {
        var botao = evento.target.closest("[data-acao]");
        if (!botao) return;

        var id = botao.getAttribute("data-id");
        var acao = botao.getAttribute("data-acao");

        if (acao === "cancelar" &&
            !window.confirm("Cancelar esta consulta?")) {
            return;
        }

        consultas.forEach(function (c) {
            if (c.id !== id) return;
            c.status = acao === "realizar" ? "realizada" : "cancelada";
        });

        salvarConsultas(consultas);
        renderizar();
        aviso(acao === "realizar" ? "Consulta marcada como realizada." : "Consulta cancelada.");
    }

    /* ---------- Eventos ---------- */
    function iniciar() {
        document.querySelectorAll("[data-abrir-consulta]").forEach(function (b) {
            b.addEventListener("click", abrirModal);
        });

        $("csFechar").addEventListener("click", fecharModal);
        $("csCancelar").addEventListener("click", fecharModal);
        el.modal.addEventListener("mousedown", function (e) {
            if (e.target === el.modal) fecharModal();
        });
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && !el.modal.hidden) fecharModal();
        });

        el.form.addEventListener("submit", aoSalvar);
        el.listaProximas.addEventListener("click", aoClicarNaLista);
        el.listaHistorico.addEventListener("click", aoClicarNaLista);

        if (el.busca) {
            el.busca.addEventListener("input", function () {
                termoBusca = el.busca.value;
                renderizar();
            });
        }
        if (el.formBusca) {
            el.formBusca.addEventListener("submit", function (e) { e.preventDefault(); });
        }

        renderizar();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", iniciar);
    } else {
        iniciar();
    }
})();
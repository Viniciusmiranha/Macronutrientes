/* =====================================================
   NUTRIQ · Planos alimentares (js/planos-alimentares.js)
   Criar, editar, concluir/reabrir, excluir, filtrar e buscar.
   Usa js/nutriq-dados.js.
===================================================== */

(function () {
    "use strict";

    var D = window.NutriqDados;
    if (!D) {
        console.error("NUTRIQ: carregue js/nutriq-dados.js antes de js/planos-alimentares.js");
        return;
    }
    var U = D.util;
    var esc = U.escapar;

    function $(id) { return document.getElementById(id); }

    var el = {
        total: $("statTotal"),
        pacientes: $("statPacientes"),
        ativos: $("statAtivos"),
        concluidos: $("statConcluidos"),
        toolbar: $("plnToolbar"),
        contagem: $("plnCount"),
        vazio: $("plnEmpty"),
        semResultado: $("plnNoResults"),
        tabelaWrap: $("plnTableWrap"),
        lista: $("listaPlanos"),
        busca: $("campoBusca"),
        formBusca: $("dashboardSearch"),
        modal: $("modalNovoPlano"),
        form: $("formPlano"),
        select: $("plnPaciente"),
        semPacientes: $("plnSemPacientes"),
        kcalAuto: $("plnKcalAuto"),
        salvar: $("plnSalvar")
    };

    var filtro = "todos";
    var termoBusca = "";
    var TEXTO_AJUDA = "Os macronutrientes alimentam o gráfico do relatório do paciente.";

    /* ---------- Auxiliares ---------- */
    function ehConcluido(p) { return p.status === "concluido"; }

    function periodo(p) {
        var ini = p.inicio ? U.formatarData(p.inicio) : "";
        var fim = p.fim ? U.formatarData(p.fim) : "";
        if (ini && fim) return ini + " a " + fim;
        return ini ? "Desde " + ini : "—";
    }

    function plural(n, singular, pluralTxt) {
        return n + " " + (n === 1 ? singular : pluralTxt);
    }

    function numeroOuNulo(valor) {
        return valor === "" || valor == null ? null : Number(valor);
    }

    function kcalDosMacros(c, p, g) {
        return Math.round((c || 0) * 4 + (p || 0) * 4 + (g || 0) * 9);
    }

    /* ---------- Lista e resumo ---------- */
    function render() {
        var todos = D.planos.listar().sort(function (a, b) {
            return String(b.criadoEm || "").localeCompare(String(a.criadoEm || ""));
        });

        var unicos = {};
        todos.forEach(function (p) { unicos[p.pacienteId || p.paciente] = true; });
        el.total.textContent = todos.length;
        el.pacientes.textContent = Object.keys(unicos).length;
        el.ativos.textContent = todos.filter(function (p) { return !ehConcluido(p); }).length;
        el.concluidos.textContent = todos.filter(ehConcluido).length;

        var termo = U.normalizar(termoBusca);
        var visiveis = todos.filter(function (p) {
            var okFiltro = filtro === "todos" || (filtro === "concluido" ? ehConcluido(p) : !ehConcluido(p));
            var okBusca = !termo || U.normalizar([p.nome, p.paciente, p.objetivo].join(" ")).indexOf(termo) !== -1;
            return okFiltro && okBusca;
        });

        el.vazio.hidden = todos.length > 0;
        el.toolbar.hidden = todos.length === 0;
        el.semResultado.hidden = !(todos.length > 0 && visiveis.length === 0);
        el.tabelaWrap.hidden = visiveis.length === 0;
        el.contagem.textContent = todos.length ? plural(visiveis.length, "plano", "planos") : "";

        el.lista.innerHTML = visiveis.map(function (p) {
            var concluido = ehConcluido(p);
            return (
                "<tr>" +
                    '<td><div class="pln-plan-name"><strong>' + esc(p.nome) + "</strong>" +
                        "<small>" + esc(p.objetivo || "") + "</small></div></td>" +
                    "<td>" + esc(p.paciente || "—") + "</td>" +
                    "<td>" + esc(periodo(p)) + "</td>" +
                    "<td>" + (p.calorias ? esc(p.calorias) + " kcal" : "—") + "</td>" +
                    '<td><span class="pac-badge' + (concluido ? " pac-badge-off" : "") + '">' +
                        (concluido ? "Concluído" : "Em andamento") + "</span></td>" +
                    '<td><div class="nq-row-actions">' +
                        '<button type="button" class="nq-row-btn" data-acao="editar" data-id="' + esc(p.id) + '">Editar</button>' +
                        '<button type="button" class="nq-row-btn" data-acao="' + (concluido ? "reabrir" : "concluir") + '" data-id="' + esc(p.id) + '">' +
                            (concluido ? "Reabrir" : "Concluir") + "</button>" +
                        '<button type="button" class="nq-row-btn nq-row-btn-danger" data-acao="excluir" data-id="' + esc(p.id) + '">Excluir</button>' +
                    "</div></td>" +
                "</tr>"
            );
        }).join("");
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

    function atualizarAjudaKcal() {
        var c = numeroOuNulo($("plnCarb").value);
        var p = numeroOuNulo($("plnProt").value);
        var g = numeroOuNulo($("plnGord").value);
        if (c == null && p == null && g == null) {
            el.kcalAuto.textContent = TEXTO_AJUDA;
            return;
        }
        var kcal = kcalDosMacros(c, p, g);
        el.kcalAuto.textContent = "Os macronutrientes somam cerca de " +
            kcal.toLocaleString("pt-BR") + " kcal. Se a meta diária ficar vazia, esse valor será usado.";
    }

    function abrirFormulario(plano, pacienteIdSugerido) {
        el.form.reset();
        limparErros();
        $("plnId").value = "";
        preencherPacientes(plano ? plano.pacienteId : pacienteIdSugerido);

        if (plano) {
            $("plnModalTitulo").textContent = "Editar plano alimentar";
            el.salvar.textContent = "Salvar alterações";
            $("plnId").value = plano.id;
            $("plnNome").value = plano.nome || "";
            $("plnObjetivo").value = plano.objetivo || "Emagrecimento";
            $("plnInicio").value = plano.inicio || "";
            $("plnFim").value = plano.fim || "";
            $("plnCalorias").value = plano.calorias || "";
            $("plnStatus").value = ehConcluido(plano) ? "concluido" : "ativo";
            $("plnObs").value = plano.observacoes || "";
            if (plano.macros) {
                $("plnCarb").value = plano.macros.carboidratos != null ? plano.macros.carboidratos : "";
                $("plnProt").value = plano.macros.proteinas != null ? plano.macros.proteinas : "";
                $("plnGord").value = plano.macros.gorduras != null ? plano.macros.gorduras : "";
            }
        } else {
            $("plnModalTitulo").textContent = "Novo plano alimentar";
            el.salvar.textContent = "Salvar plano";
            $("plnInicio").value = U.hojeISO();
        }

        atualizarAjudaKcal();
        D.abrirModal(el.modal, plano ? "#plnNome" : (el.select.disabled ? ".nq-close" : "#plnNome"));
    }

    function lerFormulario() {
        limparErros();
        var primeiro = null;

        function falha(idCampo, mensagem) {
            var campo = $(idCampo);
            campo.parentNode.classList.add("has-error");
            var span = el.form.querySelector('[data-erro-para="' + idCampo + '"]');
            if (span) span.textContent = mensagem;
            if (!primeiro) primeiro = campo;
        }

        var nome = $("plnNome").value.replace(/\s+/g, " ").trim();
        if (nome.length < 2) falha("plnNome", "Informe o nome do plano.");

        var pacienteId = el.select.value;
        var paciente = pacienteId ? D.pacientes.obter(pacienteId) : null;
        if (!paciente) falha("plnPaciente", "Selecione o paciente.");

        var inicio = $("plnInicio").value;
        var fim = $("plnFim").value;
        if (!U.lerISO(inicio)) falha("plnInicio", "Informe a data de início.");
        if (fim && !U.lerISO(fim)) falha("plnFim", "Data de término inválida.");
        else if (fim && inicio && fim < inicio) falha("plnFim", "O término deve ser depois do início.");

        var calorias = numeroOuNulo($("plnCalorias").value);
        if (calorias != null && (calorias < 500 || calorias > 6000)) {
            falha("plnCalorias", "Use um valor entre 500 e 6000 kcal.");
        }

        var carb = numeroOuNulo($("plnCarb").value);
        var prot = numeroOuNulo($("plnProt").value);
        var gord = numeroOuNulo($("plnGord").value);
        [["plnCarb", carb], ["plnProt", prot], ["plnGord", gord]].forEach(function (par) {
            if (par[1] != null && (par[1] < 0 || par[1] > 1500)) {
                falha(par[0], "Use um valor entre 0 e 1500 g.");
            }
        });

        if (primeiro) {
            primeiro.focus();
            return null;
        }

        var temMacros = carb != null || prot != null || gord != null;
        if (calorias == null && temMacros) {
            calorias = kcalDosMacros(carb, prot, gord);
            if (calorias < 500) calorias = null; // soma pequena demais para ser uma meta diária
        }

        return {
            pacienteId: paciente.id,
            paciente: paciente.nome,
            nome: nome,
            objetivo: $("plnObjetivo").value,
            inicio: inicio,
            fim: fim,
            calorias: calorias,
            macrosTipo: "g",
            macros: temMacros ? { carboidratos: carb || 0, proteinas: prot || 0, gorduras: gord || 0 } : null,
            observacoes: $("plnObs").value.trim(),
            status: $("plnStatus").value
        };
    }

    function aoSalvar(evento) {
        evento.preventDefault();
        var dados = lerFormulario();
        if (!dados) return;

        var id = $("plnId").value;

        if (dados.status === "ativo") {
            var jaTem = D.planos.doPaciente(dados.pacienteId).some(function (p) {
                return p.id !== id && !ehConcluido(p);
            });
            if (jaTem && !window.confirm(dados.paciente + " já tem um plano em andamento. Salvar este também?")) {
                return;
            }
        }

        var salvo = id ? D.planos.atualizar(id, dados) : D.planos.criar(dados);
        if (!salvo) {
            D.toast("Não foi possível salvar o plano. O armazenamento do navegador pode estar indisponível.", "erro");
            return;
        }

        D.fecharModal(el.modal);
        render();
        D.toast(id ? "Plano atualizado." : "Plano alimentar salvo.");
    }

    /* ---------- Ações da tabela ---------- */
    function aoClicarNaTabela(evento) {
        var botao = evento.target.closest("[data-acao]");
        if (!botao) return;

        var id = botao.getAttribute("data-id");
        var acao = botao.getAttribute("data-acao");
        var plano = D.planos.obter(id);
        if (!plano) return;

        if (acao === "editar") {
            abrirFormulario(plano);
        } else if (acao === "concluir" || acao === "reabrir") {
            var ok = D.planos.atualizar(id, { status: acao === "concluir" ? "concluido" : "ativo" });
            if (!ok) { D.toast("Não foi possível atualizar o plano.", "erro"); return; }
            render();
            D.toast(acao === "concluir" ? "Plano marcado como concluído." : "Plano reaberto.");
        } else if (acao === "excluir") {
            if (!window.confirm('Excluir o plano "' + plano.nome + '"? Esta ação não pode ser desfeita.')) return;
            if (!D.planos.excluir(id)) { D.toast("Não foi possível excluir o plano.", "erro"); return; }
            render();
            D.toast("Plano excluído.");
        }
    }

    /* ---------- Eventos ---------- */
    function iniciar() {
        document.querySelectorAll("[data-abrir-plano]").forEach(function (b) {
            b.addEventListener("click", function () { abrirFormulario(null); });
        });

        document.addEventListener("click", function (e) {
            var alvo = e.target.closest("[data-fechar]");
            if (alvo) D.fecharModal(alvo.closest(".nq-overlay"));
        });

        el.form.addEventListener("submit", aoSalvar);
        ["plnCarb", "plnProt", "plnGord"].forEach(function (id) {
            $(id).addEventListener("input", atualizarAjudaKcal);
        });
        el.lista.addEventListener("click", aoClicarNaTabela);

        document.querySelectorAll(".pln-filter").forEach(function (b) {
            b.addEventListener("click", function () {
                filtro = b.getAttribute("data-filtro");
                document.querySelectorAll(".pln-filter").forEach(function (o) {
                    var ativo = o === b;
                    o.classList.toggle("is-active", ativo);
                    o.setAttribute("aria-pressed", ativo ? "true" : "false");
                });
                render();
            });
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
        render();

        // Vindo da ficha do paciente: ?novo=1&paciente=ID
        if (U.parametro("novo") === "1") {
            abrirFormulario(null, U.parametro("paciente"));
            U.limparParametros();
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", iniciar);
    } else {
        iniciar();
    }
})();
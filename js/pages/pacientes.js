/* =====================================================
   NUTRIQ · Meus pacientes (js/pacientes.js)
   Cadastro, edição, ficha com avaliações, busca, filtros
   e exclusão. Usa js/nutriq-dados.js.
===================================================== */

(function () {
    "use strict";

    var D = window.NutriqDados;
    if (!D) {
        console.error("NUTRIQ: carregue js/nutriq-dados.js antes de js/pacientes.js");
        return;
    }
    var U = D.util;

    function $(id) { return document.getElementById(id); }

    var el = {
        total: $("statTotal"),
        ativos: $("statAtivos"),
        novos: $("statNovos"),
        alta: $("statAlta"),
        toolbar: $("pacToolbar"),
        contagem: $("pacContagem"),
        vazio: $("pacEmpty"),
        semResultado: $("pacNoResults"),
        tabelaWrap: $("pacTableWrap"),
        lista: $("pacLista"),
        busca: $("campoBusca"),
        formBusca: $("dashboardSearch"),
        modalForm: $("modalPaciente"),
        form: $("formPaciente"),
        pesoGrupo: $("pacPesoGrupo"),
        modalFicha: $("modalFicha"),
        ficha: $("fichaConteudo")
    };

    var STATUS = {
        ativo: { texto: "Ativo", classe: "pac-badge" },
        inativo: { texto: "Inativo", classe: "pac-badge pac-badge-off" },
        alta: { texto: "Alta nutricional", classe: "pac-badge pac-badge-off" }
    };

    var filtro = "todos";
    var termoBusca = "";
    var fichaAtualId = null;

    /* ---------- Auxiliares ---------- */
    var esc = U.escapar;

    function statusDe(p) { return STATUS[p.status] ? p.status : "ativo"; }

    function iniciais(nome) {
        var partes = String(nome || "?").trim().split(/\s+/);
        var a = partes[0] ? partes[0].charAt(0) : "?";
        var b = partes.length > 1 ? partes[partes.length - 1].charAt(0) : "";
        return (a + b).toUpperCase();
    }

    function plural(n, singular, pluralTxt) {
        return n + " " + (n === 1 ? singular : pluralTxt);
    }

    function numero(n, casas) {
        return Number(n).toLocaleString("pt-BR", { maximumFractionDigits: casas == null ? 1 : casas });
    }

    function ordenados() {
        return D.pacientes.listar().sort(function (a, b) {
            return String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR");
        });
    }

    /* ---------- Lista e resumo ---------- */
    function atualizarResumo(todos) {
        var agora = new Date();
        el.total.textContent = todos.length;
        el.ativos.textContent = todos.filter(function (p) { return statusDe(p) === "ativo"; }).length;
        el.alta.textContent = todos.filter(function (p) { return statusDe(p) === "alta"; }).length;
        el.novos.textContent = todos.filter(function (p) {
            var d = new Date(p.criadoEm);
            return !isNaN(d) && d.getMonth() === agora.getMonth() && d.getFullYear() === agora.getFullYear();
        }).length;
    }

    function correspondeBusca(p, termo) {
        if (!termo) return true;
        var texto = U.normalizar([p.nome, p.email, p.telefone, String(p.telefone || "").replace(/\D/g, "")].join(" "));
        return texto.indexOf(termo) !== -1;
    }

    function render() {
        var todos = ordenados();
        atualizarResumo(todos);

        var termo = U.normalizar(termoBusca);
        var visiveis = todos.filter(function (p) {
            return (filtro === "todos" || statusDe(p) === filtro) && correspondeBusca(p, termo);
        });

        el.vazio.hidden = todos.length > 0;
        el.toolbar.hidden = todos.length === 0;
        el.semResultado.hidden = !(todos.length > 0 && visiveis.length === 0);
        el.tabelaWrap.hidden = visiveis.length === 0;
        el.contagem.textContent = todos.length ? plural(visiveis.length, "paciente", "pacientes") : "";

        el.lista.innerHTML = visiveis.map(function (p) {
            var st = STATUS[statusDe(p)];
            var anos = U.idade(p);
            return (
                "<tr>" +
                    '<td><div class="pac-person">' +
                        '<span class="pac-person-avatar" aria-hidden="true">' + esc(iniciais(p.nome)) + "</span>" +
                        "<div><strong>" + esc(p.nome) + "</strong>" +
                        "<small>" + esc(p.email || (anos != null ? anos + " anos" : "")) + "</small></div>" +
                    "</div></td>" +
                    "<td>" + esc(p.telefone || "—") + "</td>" +
                    "<td>" + esc(p.objetivo || "—") + "</td>" +
                    '<td><span class="' + st.classe + '">' + st.texto + "</span></td>" +
                    '<td><div class="nq-row-actions">' +
                        '<button type="button" class="nq-row-btn" data-acao="ficha" data-id="' + esc(p.id) + '">Ver ficha</button>' +
                        '<button type="button" class="nq-row-btn" data-acao="editar" data-id="' + esc(p.id) + '">Editar</button>' +
                        '<button type="button" class="nq-row-btn nq-row-btn-danger" data-acao="excluir" data-id="' + esc(p.id) + '">Excluir</button>' +
                    "</div></td>" +
                "</tr>"
            );
        }).join("");
    }

    /* ---------- Formulário de cadastro / edição ---------- */
    function limparErros() {
        el.form.querySelectorAll(".nq-error").forEach(function (s) { s.textContent = ""; });
        el.form.querySelectorAll(".has-error").forEach(function (f) { f.classList.remove("has-error"); });
    }

    function abrirFormulario(paciente) {
        el.form.reset();
        limparErros();

        if (paciente) {
            $("pacModalTitulo").textContent = "Editar paciente";
            $("pacSalvar").textContent = "Salvar alterações";
            el.pesoGrupo.hidden = true;
            $("pacId").value = paciente.id;
            $("pacNome").value = paciente.nome || "";
            $("pacEmail").value = paciente.email || "";
            $("pacTelefone").value = paciente.telefone || "";
            $("pacNascimento").value = paciente.nascimento || "";
            $("pacGenero").value = paciente.genero || "";
            $("pacAltura").value = paciente.altura || "";
            $("pacStatus").value = statusDe(paciente);
            $("pacObjetivo").value = paciente.objetivo || "";
            $("pacObs").value = paciente.observacoes || "";
        } else {
            $("pacModalTitulo").textContent = "Novo paciente";
            $("pacSalvar").textContent = "Salvar paciente";
            el.pesoGrupo.hidden = false;
            $("pacId").value = "";
        }

        $("pacNascimento").max = U.hojeISO();
        D.abrirModal(el.modalForm, "#pacNome");
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

        var nome = $("pacNome").value.replace(/\s+/g, " ").trim();
        if (nome.length < 2) falha("pacNome", "Informe o nome do paciente.");

        var email = $("pacEmail").value.trim();
        if (email && !U.emailValido(email)) falha("pacEmail", "Informe um e-mail válido.");

        var telefone = $("pacTelefone").value.trim();
        if (telefone && telefone.replace(/\D/g, "").length < 10) {
            falha("pacTelefone", "Informe o DDD e o número. Ex.: (11) 99999-9999");
        }

        var nascimento = $("pacNascimento").value;
        if (nascimento) {
            if (!U.lerISO(nascimento) || nascimento < "1900-01-01") {
                falha("pacNascimento", "Data de nascimento inválida.");
            } else if (nascimento > U.hojeISO()) {
                falha("pacNascimento", "A data de nascimento não pode ser futura.");
            }
        }

        var altura = $("pacAltura").value;
        if (altura !== "" && (Number(altura) < 50 || Number(altura) > 250)) {
            falha("pacAltura", "Use uma altura entre 50 e 250 cm.");
        }

        var peso = el.pesoGrupo.hidden ? "" : $("pacPeso").value;
        if (peso !== "" && (Number(peso) < 2 || Number(peso) > 500)) {
            falha("pacPeso", "Use um peso entre 2 e 500 kg.");
        }

        if (primeiro) {
            primeiro.focus();
            return null;
        }

        return {
            nome: nome,
            email: email,
            telefone: telefone,
            nascimento: nascimento,
            genero: $("pacGenero").value,
            altura: altura !== "" ? Number(altura) : null,
            status: $("pacStatus").value,
            objetivo: $("pacObjetivo").value,
            observacoes: $("pacObs").value.trim(),
            peso: peso !== "" ? Number(peso) : null
        };
    }

    function aoSalvarPaciente(evento) {
        evento.preventDefault();
        var dados = lerFormulario();
        if (!dados) return;

        var id = $("pacId").value;
        var peso = dados.peso;
        delete dados.peso;

        var nomeNorm = U.normalizar(dados.nome);
        var homonimo = D.pacientes.listar().some(function (p) {
            return p.id !== id && U.normalizar(p.nome) === nomeNorm;
        });
        if (homonimo && !window.confirm('Já existe um paciente chamado "' + dados.nome + '". Salvar mesmo assim?')) {
            return;
        }

        if (id) {
            if (!D.pacientes.atualizar(id, dados)) {
                D.toast("Não foi possível salvar as alterações.", "erro");
                return;
            }
            D.fecharModal(el.modalForm);
            render();
            D.toast("Paciente atualizado.");
            return;
        }

        dados.avaliacoes = [];
        var novo = D.pacientes.criar(dados);
        if (!novo) {
            D.toast("Não foi possível salvar o paciente. O armazenamento do navegador pode estar indisponível.", "erro");
            return;
        }
        if (peso != null) {
            D.pacientes.adicionarAvaliacao(novo.id, { data: U.hojeISO(), peso: peso, altura: dados.altura });
        }

        D.fecharModal(el.modalForm);
        render();
        D.toast("Paciente cadastrado.");
    }

    /* ---------- Exclusão ---------- */
    function excluirPaciente(id) {
        var p = D.pacientes.obter(id);
        if (!p) return;
        var v = D.pacientes.vinculos(id);

        var aviso = "";
        if (v.planos || v.consultas) {
            var partes = [];
            if (v.planos) partes.push(plural(v.planos, "plano alimentar", "planos alimentares"));
            if (v.consultas) partes.push(plural(v.consultas, "consulta", "consultas"));
            aviso = "\n\nIsso também remove " + partes.join(" e ") + " deste paciente.";
        }

        if (!window.confirm('Excluir o paciente "' + p.nome + '"?' + aviso + "\n\nEsta ação não pode ser desfeita.")) return;

        if (!D.pacientes.excluir(id)) {
            D.toast("Não foi possível excluir o paciente.", "erro");
            return;
        }
        D.fecharModal(el.modalFicha);
        fichaAtualId = null;
        render();
        D.toast("Paciente excluído.");
    }

    /* ---------- Ficha do paciente ---------- */
    function renderFicha(id, focoPeso) {
        var p = D.pacientes.obter(id);
        if (!p) {
            D.fecharModal(el.modalFicha);
            return;
        }
        fichaAtualId = id;

        var planos = D.planos.doPaciente(id);
        var consultas = D.consultas.doPaciente(id);
        var realizadas = consultas.filter(function (c) { return c.status === "realizada"; }).length;
        var agora = Date.now();
        var futuras = consultas
            .filter(function (c) {
                var m = U.momento(c.data, c.hora);
                return c.status === "agendada" && m && m.getTime() >= agora;
            })
            .sort(function (a, b) { return U.momento(a.data, a.hora) - U.momento(b.data, b.hora); });

        var avaliacoes = (p.avaliacoes || []).slice().sort(function (a, b) {
            return String(b.data).localeCompare(String(a.data));
        });
        var ultima = avaliacoes[0];
        var imcUltimo = ultima ? U.imc(ultima.peso, ultima.altura || p.altura) : null;
        var anos = U.idade(p);
        var st = STATUS[statusDe(p)];

        var linhas = avaliacoes.map(function (a) {
            var imc = U.imc(a.peso, a.altura || p.altura);
            return (
                "<tr><td>" + esc(U.formatarData(a.data)) + "</td>" +
                "<td>" + numero(a.peso) + " kg</td>" +
                "<td>" + (a.altura || p.altura ? numero(a.altura || p.altura, 0) + " cm" : "—") + "</td>" +
                "<td>" + (imc != null ? numero(imc) : "—") + "</td>" +
                '<td><button type="button" class="nq-row-btn nq-row-btn-danger" data-acao="remover-avaliacao" data-av="' + esc(a.id) + '">Remover</button></td></tr>'
            );
        }).join("");

        var q = encodeURIComponent(id);

        el.ficha.innerHTML =
            '<div class="nq-modal-header">' +
                '<div class="nq-ficha-head" style="margin-bottom:0">' +
                    '<span class="nq-ficha-avatar" aria-hidden="true">' + esc(iniciais(p.nome)) + "</span>" +
                    "<div><h2 id=\"fichaTitulo\">" + esc(p.nome) + "</h2>" +
                    '<small><span class="' + st.classe + '">' + st.texto + "</span> · Cadastrado em " +
                    esc(U.formatarData(p.criadoEm)) + "</small></div>" +
                "</div>" +
                '<button type="button" class="nq-close" data-acao="fechar-ficha" aria-label="Fechar">&times;</button>' +
            "</div>" +

            '<dl class="nq-ficha-grid">' +
                "<div><dt>Telefone</dt><dd>" + esc(p.telefone || "—") + "</dd></div>" +
                "<div><dt>E-mail</dt><dd>" + esc(p.email || "—") + "</dd></div>" +
                "<div><dt>Idade e gênero</dt><dd>" + esc((anos != null ? anos + " anos" : "—") + (p.genero ? " · " + p.genero : "")) + "</dd></div>" +
                "<div><dt>Altura</dt><dd>" + (p.altura ? numero(p.altura, 0) + " cm" : "—") + "</dd></div>" +
                "<div><dt>Objetivo</dt><dd>" + esc(p.objetivo || "—") + "</dd></div>" +
                "<div><dt>Observações</dt><dd>" + esc(p.observacoes || "—") + "</dd></div>" +
            "</dl>" +

            '<div class="nq-ficha-resumo">' +
                "<div><small>Planos alimentares</small><strong>" + planos.length + "</strong></div>" +
                "<div><small>Consultas realizadas</small><strong>" + realizadas + "</strong></div>" +
                "<div><small>Próxima consulta</small><strong>" + (futuras[0] ? esc(U.formatarData(futuras[0].data)) : "—") + "</strong></div>" +
                "<div><small>Último peso · IMC</small><strong>" +
                    (ultima ? numero(ultima.peso) + " kg" + (imcUltimo != null ? " · " + numero(imcUltimo) : "") : "—") + "</strong></div>" +
            "</div>" +

            "<h3>Avaliações (peso e altura)</h3>" +
            (avaliacoes.length
                ? '<table class="nq-ficha-tabela"><thead><tr><th>Data</th><th>Peso</th><th>Altura</th><th>IMC</th><th></th></tr></thead><tbody>' + linhas + "</tbody></table>"
                : '<p class="nq-ficha-vazio">Nenhuma avaliação registrada. Adicione a primeira abaixo para alimentar os gráficos dos relatórios.</p>') +

            '<form class="nq-avaliacao-form" id="formAvaliacao" novalidate>' +
                '<div class="nq-field"><label for="avData">Data</label><input type="date" id="avData" value="' + U.hojeISO() + '" max="' + U.hojeISO() + '"></div>' +
                '<div class="nq-field"><label for="avPeso">Peso (kg)</label><input type="number" id="avPeso" min="2" max="500" step="0.1" inputmode="decimal" placeholder="Ex.: 72,5"></div>' +
                '<div class="nq-field"><label for="avAltura">Altura (cm)</label><input type="number" id="avAltura" min="50" max="250" step="1" inputmode="numeric" placeholder="' + (p.altura ? esc(p.altura) : "Ex.: 170") + '"></div>' +
                '<button type="submit" class="pac-btn pac-btn-primary">Adicionar</button>' +
            "</form>" +

            '<div class="nq-ficha-links">' +
                '<a class="pac-btn nq-btn-ghost" href="planos-alimentares.html?novo=1&paciente=' + q + '">Novo plano alimentar</a>' +
                '<a class="pac-btn nq-btn-ghost" href="consultas.html?novo=1&paciente=' + q + '">Agendar consulta</a>' +
                '<a class="pac-btn nq-btn-ghost" href="relatorios.html?paciente=' + q + '">Ver relatório</a>' +
                '<button type="button" class="pac-btn nq-btn-ghost" data-acao="editar-ficha">Editar dados</button>' +
                '<button type="button" class="pac-btn nq-btn-danger" data-acao="excluir-ficha">Excluir paciente</button>' +
            "</div>";

        if (focoPeso) {
            var campo = $("avPeso");
            if (campo) campo.focus();
        }
    }

    function abrirFicha(id) {
        renderFicha(id, false);
        D.abrirModal(el.modalFicha, "[data-acao='fechar-ficha']");
    }

    function adicionarAvaliacao(evento) {
        evento.preventDefault();
        var p = D.pacientes.obter(fichaAtualId);
        if (!p) return;

        var data = $("avData").value;
        var peso = $("avPeso").value;
        var altura = $("avAltura").value;

        if (!U.lerISO(data)) { D.toast("Informe a data da avaliação.", "erro"); $("avData").focus(); return; }
        if (data > U.hojeISO()) { D.toast("A data da avaliação não pode ser futura.", "erro"); $("avData").focus(); return; }
        if (peso === "" || Number(peso) < 2 || Number(peso) > 500) {
            D.toast("Informe um peso entre 2 e 500 kg.", "erro");
            $("avPeso").focus();
            return;
        }
        if (altura !== "" && (Number(altura) < 50 || Number(altura) > 250)) {
            D.toast("Use uma altura entre 50 e 250 cm.", "erro");
            $("avAltura").focus();
            return;
        }

        var nova = D.pacientes.adicionarAvaliacao(p.id, {
            data: data,
            peso: Number(peso),
            altura: altura !== "" ? Number(altura) : null
        });
        if (!nova) {
            D.toast("Não foi possível salvar a avaliação.", "erro");
            return;
        }
        renderFicha(p.id, true);
        render();
        D.toast("Avaliação registrada.");
    }

    function removerAvaliacao(avId) {
        if (!window.confirm("Remover esta avaliação?")) return;
        if (!D.pacientes.removerAvaliacao(fichaAtualId, avId)) {
            D.toast("Não foi possível remover a avaliação.", "erro");
            return;
        }
        renderFicha(fichaAtualId, false);
        render();
        D.toast("Avaliação removida.");
    }

    /* ---------- Eventos ---------- */
    function iniciar() {
        document.querySelectorAll("[data-abrir-paciente]").forEach(function (b) {
            b.addEventListener("click", function () { abrirFormulario(null); });
        });

        // Botões "Cancelar" e "×" das janelas
        document.addEventListener("click", function (e) {
            var alvo = e.target.closest("[data-fechar]");
            if (alvo) D.fecharModal(alvo.closest(".nq-overlay"));
        });

        el.form.addEventListener("submit", aoSalvarPaciente);
        $("pacTelefone").addEventListener("input", function (e) {
            e.target.value = U.mascaraTelefone(e.target.value);
        });

        // Ações da tabela
        el.lista.addEventListener("click", function (e) {
            var botao = e.target.closest("[data-acao]");
            if (!botao) return;
            var id = botao.getAttribute("data-id");
            var acao = botao.getAttribute("data-acao");
            if (acao === "ficha") abrirFicha(id);
            if (acao === "editar") abrirFormulario(D.pacientes.obter(id));
            if (acao === "excluir") excluirPaciente(id);
        });

        // Ações dentro da ficha
        el.ficha.addEventListener("click", function (e) {
            var botao = e.target.closest("[data-acao]");
            if (!botao) return;
            var acao = botao.getAttribute("data-acao");
            if (acao === "fechar-ficha") D.fecharModal(el.modalFicha);
            if (acao === "remover-avaliacao") removerAvaliacao(botao.getAttribute("data-av"));
            if (acao === "excluir-ficha") excluirPaciente(fichaAtualId);
            if (acao === "editar-ficha") {
                var p = D.pacientes.obter(fichaAtualId);
                D.fecharModal(el.modalFicha);
                if (p) abrirFormulario(p);
            }
        });
        el.ficha.addEventListener("submit", function (e) {
            if (e.target.id === "formAvaliacao") adicionarAvaliacao(e);
        });

        // Filtros
        document.querySelectorAll(".nq-filter").forEach(function (b) {
            b.addEventListener("click", function () {
                filtro = b.getAttribute("data-filtro");
                document.querySelectorAll(".nq-filter").forEach(function (o) {
                    var ativo = o === b;
                    o.classList.toggle("is-active", ativo);
                    o.setAttribute("aria-pressed", ativo ? "true" : "false");
                });
                render();
            });
        });

        // Busca do topo
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

        // Atalhos vindos de outras páginas: ?novo=1 ou ?ficha=ID
        var idFicha = U.parametro("ficha");
        if (idFicha && D.pacientes.obter(idFicha)) abrirFicha(idFicha);
        else if (U.parametro("novo") === "1") abrirFormulario(null);
        if (idFicha || U.parametro("novo")) U.limparParametros();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", iniciar);
    } else {
        iniciar();
    }
})();
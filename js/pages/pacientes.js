

(function () {
    "use strict";

    var D = window.NutriqDados;
    if (!D || !D.pacientes) {
        console.error("NUTRIQ: carregue js/nutriq-dados.js antes de js/pages/pacientes.js");
        return;
    }
    var U = D.util;
    var esc = U.escapar;

    var JANELA_ADESAO_DIAS = 60;

    function $(id) { return document.getElementById(id); }

    var el = {
        total: $("statTotal"),
        ativos: $("statAtivos"),
        novos: $("statNovos"),
        adesao: $("statAdesao"),

        busca: $("pcBusca"),
        buscaTopo: $("campoBusca"),
        formBuscaTopo: $("dashboardSearch"),
        filtroPacientes: $("pcFiltroPacientes"),
        filtroStatus: $("pcFiltroStatus"),
        ordenar: $("pcOrdenar"),
        resultado: $("pcResultado"),

        lista: $("pcLista"),
        vazio: $("pcEmpty"),
        vazioTitulo: $("pcVazioTitulo"),
        vazioTexto: $("pcVazioTexto"),
        btnNovoVazio: $("btnNovoPacienteVazio"),
        btnLimpar: $("pcLimpar"),

        modalForm: $("modalPaciente"),
        form: $("formPaciente"),
        pesoGrupo: $("pacPesoGrupo"),
        modalFicha: $("modalFicha"),
        ficha: $("fichaConteudo")
    };

    var STATUS = {
        ativo: "ativo",
        inativo: "inativo",
        alta: "alta"
    };

    var ICONE_PESSOA = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>';
    var ICONE_MENU = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="5" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="12" cy="19" r="1.8"/></svg>';

    var termoBusca = "";
    var fichaAtualId = null;

function statusDe(p) { return STATUS[p.status] ? p.status : "ativo"; }

    function rotuloStatus(p) {
        var fem = p.genero === "Feminino";
        var st = statusDe(p);
        if (st === "ativo") return fem ? "Ativa" : "Ativo";
        if (st === "inativo") return fem ? "Inativa" : "Inativo";
        return "Alta nutricional";
    }

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

    function soDigitos(texto) { return String(texto || "").replace(/\D/g, ""); }

function mascaraCpf(valor) {
        var d = soDigitos(valor).slice(0, 11);
        if (d.length <= 3) return d;
        if (d.length <= 6) return d.slice(0, 3) + "." + d.slice(3);
        if (d.length <= 9) return d.slice(0, 3) + "." + d.slice(3, 6) + "." + d.slice(6);
        return d.slice(0, 3) + "." + d.slice(3, 6) + "." + d.slice(6, 9) + "-" + d.slice(9);
    }

function correspondeBusca(p) {
        var termo = U.normalizar(termoBusca);
        if (!termo) return true;

        var texto = U.normalizar([p.nome, p.email, p.cpf, p.telefone].join(" "));
        if (texto.indexOf(termo) !== -1) return true;

        var digitos = soDigitos(termoBusca);
        return digitos.length >= 3 &&
            (soDigitos(p.cpf).indexOf(digitos) !== -1 || soDigitos(p.telefone).indexOf(digitos) !== -1);
    }

    function ordenar(lista) {
        var modo = el.ordenar.value;
        var porNome = function (a, b) {
            return String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR");
        };
        var porData = function (a, b) {
            return String(a.criadoEm || "").localeCompare(String(b.criadoEm || ""));
        };

        if (modo === "nome-az") return lista.sort(porNome);
        if (modo === "nome-za") return lista.sort(function (a, b) { return porNome(b, a); });
        if (modo === "antigos") return lista.sort(porData);

        return lista.sort(function (a, b) { return porData(b, a) || porNome(a, b); });
    }

function itemMenu(texto, acao, id, perigo) {
        return '<button type="button" role="menuitem" class="pc-menu-item' + (perigo ? " pc-menu-item-danger" : "") +
            '" data-acao="' + acao + '" data-id="' + esc(id) + '">' + texto + "</button>";
    }

    function linkMenu(texto, href) {
        return '<a role="menuitem" class="pc-menu-item" href="' + href + '">' + texto + "</a>";
    }

    function cartao(p) {
        var anos = U.idade(p);
        var partes = [];
        if (anos != null) partes.push(anos + " anos");
        if (p.genero) partes.push(esc(p.genero));
        var meta = partes.length ? partes.join(" • ") : "Dados não informados";
        var classe = statusDe(p) === "ativo" ? "pac-badge" : "pac-badge pac-badge-off";
        var q = encodeURIComponent(p.id);

        return (
            '<li><article class="pc-card" data-id="' + esc(p.id) + '">' +
                '<span class="pc-avatar">' + ICONE_PESSOA + "</span>" +
                '<div class="pc-info">' +
                    '<button type="button" class="pc-open" data-acao="ficha" data-id="' + esc(p.id) + '">' + esc(p.nome) + "</button>" +
                    '<p class="pc-meta">' + meta + "</p>" +
                    '<span class="' + classe + '">' + esc(rotuloStatus(p)) + "</span>" +
                "</div>" +
                '<button type="button" class="pc-kebab" data-menu aria-haspopup="menu" aria-expanded="false" aria-label="Ações para ' + esc(p.nome) + '">' + ICONE_MENU + "</button>" +
                '<div class="pc-menu" role="menu" hidden>' +
                    itemMenu("Ver ficha", "ficha", p.id) +
                    itemMenu("Editar dados", "editar", p.id) +
                    linkMenu("Novo plano alimentar", "planos-alimentares.html?novo=1&amp;paciente=" + q) +
                    linkMenu("Agendar consulta", "consultas.html?novo=1&amp;paciente=" + q) +
                    linkMenu("Ver relatório", "relatorios.html?paciente=" + q) +
                    '<div class="pc-menu-sep" role="separator"></div>' +
                    itemMenu("Excluir paciente", "excluir", p.id, true) +
                "</div>" +
            "</article></li>"
        );
    }

    function filtrosAtivos() {
        return !!(U.normalizar(termoBusca) || el.filtroPacientes.value !== "todos" || el.filtroStatus.value !== "todos");
    }

    function render() {
        var todos = D.pacientes.listar();
        var planos = D.planos.listar();
        var consultas = D.consultas.listar();
        var agora = Date.now();

var hoje = new Date();
        el.total.textContent = todos.length;
        el.ativos.textContent = todos.filter(function (p) { return statusDe(p) === "ativo"; }).length;
        el.novos.textContent = todos.filter(function (p) {
            var d = new Date(p.criadoEm);
            return !isNaN(d) && d.getMonth() === hoje.getMonth() && d.getFullYear() === hoje.getFullYear();
        }).length;
        var adesao = D.calcularTaxaAdesao(
            todos,
            consultas
        );
        el.adesao.textContent = adesao == null ? "—" : adesao + "%";

var comPlano = {};
        planos.forEach(function (pl) { if (pl.status !== "concluido") comPlano[pl.pacienteId] = true; });
        var comConsulta = {};
        consultas.forEach(function (c) {
            var m = U.momento(c.data, c.hora);
            if (c.status === "agendada" && m && m.getTime() >= agora) comConsulta[c.pacienteId] = true;
        });

        var filtroPac = el.filtroPacientes.value;
        var filtroSt = el.filtroStatus.value;

        var visiveis = ordenar(todos.filter(function (p) {
            if (filtroSt !== "todos" && statusDe(p) !== filtroSt) return false;
            if (filtroPac === "com-plano" && !comPlano[p.id]) return false;
            if (filtroPac === "sem-plano" && comPlano[p.id]) return false;
            if (filtroPac === "com-consulta" && !comConsulta[p.id]) return false;
            return correspondeBusca(p);
        }));

var tem = visiveis.length > 0;
        el.lista.hidden = !tem;
        el.vazio.hidden = tem;
        el.lista.innerHTML = visiveis.map(cartao).join("");

        if (!tem) {
            var semCadastro = todos.length === 0;
            el.vazioTitulo.textContent = "Nenhum paciente encontrado";
            el.vazioTexto.textContent = semCadastro
                ? "Comece cadastrando seu primeiro paciente."
                : "Revise a busca ou os filtros para ver outros pacientes.";
            el.btnNovoVazio.hidden = !semCadastro;
            el.btnLimpar.hidden = semCadastro || !filtrosAtivos();
        }

        el.resultado.textContent = tem
            ? plural(visiveis.length, "paciente encontrado", "pacientes encontrados")
            : "Nenhum paciente encontrado";
    }

    function limparFiltros() {
        termoBusca = "";
        el.busca.value = "";
        if (el.buscaTopo) el.buscaTopo.value = "";
        el.filtroPacientes.value = "todos";
        el.filtroStatus.value = "todos";
        el.ordenar.value = "";
        render();
    }

function menuAberto() {
        return el.lista.querySelector(".pc-menu:not([hidden])");
    }

    function fecharMenus(devolverFoco) {
        var aberto = menuAberto();
        el.lista.querySelectorAll(".pc-menu").forEach(function (m) { m.hidden = true; });
        el.lista.querySelectorAll(".pc-kebab").forEach(function (k) { k.setAttribute("aria-expanded", "false"); });
        el.lista.querySelectorAll(".pc-card.is-open").forEach(function (c) { c.classList.remove("is-open"); });
        if (devolverFoco && aberto) {
            var botao = aberto.parentNode.querySelector(".pc-kebab");
            if (botao) botao.focus();
        }
    }

    function alternarMenu(botao, focarPrimeiro) {
        var cartaoEl = botao.closest(".pc-card");
        var menu = cartaoEl.querySelector(".pc-menu");
        var jaAberto = !menu.hidden;

        fecharMenus(false);
        if (jaAberto) return;

        menu.hidden = false;
        botao.setAttribute("aria-expanded", "true");
        cartaoEl.classList.add("is-open");
        if (focarPrimeiro) {
            var primeiro = menu.querySelector(".pc-menu-item");
            if (primeiro) primeiro.focus();
        }
    }

    function navegarNoMenu(evento) {
        var menu = evento.target.closest(".pc-menu");
        if (!menu) return;
        var itens = Array.prototype.slice.call(menu.querySelectorAll(".pc-menu-item"));
        var i = itens.indexOf(document.activeElement);

        if (evento.key === "ArrowDown") { evento.preventDefault(); itens[(i + 1) % itens.length].focus(); }
        else if (evento.key === "ArrowUp") { evento.preventDefault(); itens[(i - 1 + itens.length) % itens.length].focus(); }
        else if (evento.key === "Home") { evento.preventDefault(); itens[0].focus(); }
        else if (evento.key === "End") { evento.preventDefault(); itens[itens.length - 1].focus(); }
    }

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
            $("pacCpf").value = paciente.cpf || "";
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
        var idEdicao = $("pacId").value;

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
        if (!email || !U.emailValido(email)) falha("pacEmail", "Informe um e-mail válido.");

        var telefone = $("pacTelefone").value.trim();
        if (!telefone || !/^[\d()+ .-]+$/.test(telefone) || !/^\d{10,11}$/.test(soDigitos(telefone))) {
            falha("pacTelefone", "Informe o DDD e um telefone válido com 10 ou 11 dígitos.");
        }

        var cpf = $("pacCpf").value.trim();
        if (cpf) {
            if (!window.NutriqValidacao.validarCPF(cpf)) {
                falha("pacCpf", "CPF inválido. Confira os números.");
            } else {
                var repetido = D.pacientes.listar().some(function (p) {
                    return p.id !== idEdicao && soDigitos(p.cpf) === soDigitos(cpf);
                });
                if (repetido) falha("pacCpf", "Já existe um paciente com este CPF.");
            }
        }

        var nascimento = $("pacNascimento").value;
        if (!nascimento || !U.lerISO(nascimento) || nascimento < "1900-01-01") {
            falha("pacNascimento", "Informe uma data de nascimento válida.");
        } else if (nascimento > U.hojeISO()) {
            falha("pacNascimento", "A data de nascimento não pode ser futura.");
        }

        var genero = $("pacGenero").value;
        if (!["Feminino", "Masculino", "Outro"].includes(genero)) {
            falha("pacGenero", "Selecione o gênero.");
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
            cpf: cpf,
            nascimento: nascimento,
            genero: genero,
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

        var novo = D.pacientes.criar(dados);
        if (!novo) {
            D.toast("Não foi possível salvar o paciente. O armazenamento do navegador pode estar indisponível.", "erro");
            return;
        }
        if (peso != null) {
            var avaliacao = D.pacientes.adicionarAvaliacao(novo.id, {
                data: U.hojeISO(),
                peso: peso,
                altura: dados.altura
            });
            if (!avaliacao) {
                D.fecharModal(el.modalForm);
                render();
                D.toast("Paciente cadastrado, mas não foi possível salvar o peso inicial.", "erro");
                return;
            }
        }

        D.fecharModal(el.modalForm);
        render();
        D.toast("Paciente cadastrado.");
    }

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
        var classeStatus = statusDe(p) === "ativo" ? "pac-badge" : "pac-badge pac-badge-off";

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
                    '<div><h2 id="fichaTitulo">' + esc(p.nome) + "</h2>" +
                    '<small><span class="' + classeStatus + '">' + esc(rotuloStatus(p)) + "</span> · Cadastrado em " +
                    esc(U.formatarData(p.criadoEm)) + "</small></div>" +
                "</div>" +
                '<button type="button" class="nq-close" data-acao="fechar-ficha" aria-label="Fechar">&times;</button>' +
            "</div>" +

            '<dl class="nq-ficha-grid">' +
                "<div><dt>Telefone</dt><dd>" + esc(p.telefone || "—") + "</dd></div>" +
                "<div><dt>E-mail</dt><dd>" + esc(p.email || "—") + "</dd></div>" +
                "<div><dt>CPF</dt><dd>" + esc(p.cpf || "—") + "</dd></div>" +
                "<div><dt>Idade e gênero</dt><dd>" + esc((anos != null ? anos + " anos" : "—") + (p.genero ? " · " + p.genero : "")) + "</dd></div>" +
                "<div><dt>Altura</dt><dd>" + (p.altura ? numero(p.altura, 0) + " cm" : "—") + "</dd></div>" +
                "<div><dt>Objetivo</dt><dd>" + esc(p.objetivo || "—") + "</dd></div>" +
                '<div style="grid-column:1/-1"><dt>Observações</dt><dd>' + esc(p.observacoes || "—") + "</dd></div>" +
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

function definirBusca(valor, origem) {
        termoBusca = valor;
        if (origem !== el.busca) el.busca.value = valor;
        if (el.buscaTopo && origem !== el.buscaTopo) el.buscaTopo.value = valor;
        render();
    }

    function iniciar() {

        document.querySelectorAll("[data-abrir-paciente]").forEach(function (b) {
            b.addEventListener("click", function () { abrirFormulario(null); });
        });

document.addEventListener("click", function (e) {
            var alvo = e.target.closest("[data-fechar]");
            if (alvo) D.fecharModal(alvo.closest(".nq-overlay"));
        });

el.form.addEventListener("submit", aoSalvarPaciente);
        $("pacTelefone").addEventListener("input", function (e) { e.target.value = U.mascaraTelefone(e.target.value); });
        $("pacCpf").addEventListener("input", function (e) { e.target.value = mascaraCpf(e.target.value); });

el.lista.addEventListener("click", function (e) {
            var kebab = e.target.closest("[data-menu]");
            if (kebab) {
                alternarMenu(kebab, e.detail === 0);
                return;
            }

            var botao = e.target.closest("[data-acao]");
            if (!botao) return;
            var id = botao.getAttribute("data-id");
            var acao = botao.getAttribute("data-acao");
            fecharMenus(false);

            if (acao === "ficha") abrirFicha(id);
            if (acao === "editar") abrirFormulario(D.pacientes.obter(id));
            if (acao === "excluir") excluirPaciente(id);
        });

        el.lista.addEventListener("keydown", function (e) {
            if (e.key === "ArrowDown" && e.target.closest("[data-menu]")) {
                e.preventDefault();
                alternarMenu(e.target.closest("[data-menu]"), true);
                return;
            }
            navegarNoMenu(e);
        });

document.addEventListener("click", function (e) {
            if (!e.target.closest(".pc-card")) fecharMenus(false);
        });
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && menuAberto()) fecharMenus(true);
        });
        el.lista.addEventListener("focusout", function (e) {
            var cartaoEl = e.target.closest(".pc-card");
            if (cartaoEl && !cartaoEl.contains(e.relatedTarget)) {
                var menu = cartaoEl.querySelector(".pc-menu");
                if (menu && !menu.hidden) fecharMenus(false);
            }
        });

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

el.busca.addEventListener("input", function () { definirBusca(el.busca.value, el.busca); });
        if (el.buscaTopo) {
            el.buscaTopo.addEventListener("input", function () { definirBusca(el.buscaTopo.value, el.buscaTopo); });
        }
        if (el.formBuscaTopo) {
            el.formBuscaTopo.addEventListener("submit", function (e) { e.preventDefault(); });
        }
        [el.filtroPacientes, el.filtroStatus, el.ordenar].forEach(function (s) {
            s.addEventListener("change", render);
        });
        el.btnLimpar.addEventListener("click", limparFiltros);

        D.aoMudar(render);
        setInterval(render, 5 * 60 * 1000);
        render();

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
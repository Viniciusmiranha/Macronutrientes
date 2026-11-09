

(function (global) {
    "use strict";

    var CHAVE = "nutriq_dados_v1";

var CHAVES_ANTIGAS = {
        pacientes: "nutriq_pacientes",
        planos: "nutriq_planos",
        consultas: "nutriq_consultas"
    };

    var ouvintes = [];

function lista(valor) {
        return Array.isArray(valor)
            ? valor.filter(function (item) {
                return item && typeof item === "object" && !Array.isArray(item);
            })
            : [];
    }

    function lerStore() {
        var bruto = null;
        try {
            bruto = JSON.parse(global.localStorage.getItem(CHAVE));
        } catch (e) {   }

        var base = bruto && typeof bruto === "object" && !Array.isArray(bruto) ? bruto : {};
        return Object.assign({}, base, {
            pacientes: lista(base.pacientes),
            planos: lista(base.planos),
            avaliacoes: lista(base.avaliacoes),
            consultas: lista(base.consultas)
        });
    }

    function gravarStore(store) {
        try {
            global.localStorage.setItem(CHAVE, JSON.stringify(store));
        } catch (e) {
            return false;
        }
        try {
            global.dispatchEvent(new CustomEvent("nutriqDadosAtualizados"));
        } catch (e) {   }
        return true;
    }

    function avisarMudanca() {
        ouvintes.forEach(function (fn) {
            try { fn(); } catch (e) {   }
        });
    }

    function aoMudar(fn) {
        if (typeof fn === "function") ouvintes.push(fn);
    }

    global.addEventListener("nutriqDadosAtualizados", avisarMudanca);

    global.addEventListener("storage", function (evento) {
        if (evento.key === null || evento.key === CHAVE) avisarMudanca();
    });

function escapar(texto) {
        return String(texto == null ? "" : texto)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function normalizar(texto) {
        return String(texto == null ? "" : texto)
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim()
            .toLowerCase();
    }

    function novoId(prefixo) {
        if (global.crypto && global.crypto.randomUUID) return global.crypto.randomUUID();
        return (prefixo || "id_") + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    }

    function lerISO(valor) {
        if (valor instanceof Date) return isNaN(valor) ? null : valor;
        var p = String(valor || "").split("T")[0].split("-");
        if (p.length !== 3) return null;
        var d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
        var confere = d.getFullYear() === Number(p[0]) &&
            d.getMonth() === Number(p[1]) - 1 &&
            d.getDate() === Number(p[2]);
        return confere ? d : null;
    }

    function paraISO(d) {
        var m = String(d.getMonth() + 1).padStart(2, "0");
        var dia = String(d.getDate()).padStart(2, "0");
        return d.getFullYear() + "-" + m + "-" + dia;
    }

    function hojeISO() {
        return paraISO(new Date());
    }

function dataLocal(valor) {
        var texto = String(valor || "");
        if (texto.indexOf("T") === -1) return texto;
        var d = new Date(texto);
        return isNaN(d) ? texto.split("T")[0] : paraISO(d);
    }

    function formatarData(valor) {
        var d = lerISO(valor);
        return d ? d.toLocaleDateString("pt-BR") : "—";
    }

    function momento(data, hora) {
        var d = lerISO(data);
        if (!d) return null;
        var h = String(hora || "00:00").split(":");
        return new Date(d.getFullYear(), d.getMonth(), d.getDate(), Number(h[0]) || 0, Number(h[1]) || 0);
    }

    function idade(paciente) {
        var nasc = lerISO(paciente && paciente.nascimento);
        if (!nasc) return null;
        var hoje = new Date();
        var anos = hoje.getFullYear() - nasc.getFullYear();
        var fez = hoje.getMonth() > nasc.getMonth() ||
            (hoje.getMonth() === nasc.getMonth() && hoje.getDate() >= nasc.getDate());
        if (!fez) anos--;
        return anos >= 0 ? anos : null;
    }

    function imc(peso, altura) {
        var p = Number(peso);
        var a = Number(altura);
        if (!(p > 0) || !(a > 0)) return null;
        var metros = a > 3 ? a / 100 : a;
        return Math.round((p / (metros * metros)) * 10) / 10;
    }

    function classificarImc(valor) {
        if (valor == null) return "";
        if (valor < 18.5) return "Abaixo do peso";
        if (valor < 25) return "Peso normal";
        if (valor < 30) return "Sobrepeso";
        return "Obesidade";
    }

    function mascaraTelefone(valor) {
        var d = String(valor || "").replace(/\D/g, "").slice(0, 11);
        if (d.length <= 2) return d.length ? "(" + d : "";
        if (d.length <= 6) return "(" + d.slice(0, 2) + ") " + d.slice(2);
        if (d.length <= 10) return "(" + d.slice(0, 2) + ") " + d.slice(2, 6) + "-" + d.slice(6);
        return "(" + d.slice(0, 2) + ") " + d.slice(2, 7) + "-" + d.slice(7);
    }

    function emailValido(valor) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(valor || "").trim());
    }

    function parametro(nome) {
        try {
            return new URLSearchParams(global.location.search).get(nome);
        } catch (e) {
            return null;
        }
    }

    function limparParametros() {
        try {
            global.history.replaceState(null, "", global.location.pathname);
        } catch (e) {   }
    }

    function capitalizar(texto) {
        var t = String(texto || "");
        return t.charAt(0).toUpperCase() + t.slice(1);
    }

function toast(mensagem, tipo) {
        var area = document.getElementById("nutriqToast");
        if (!area) {
            area = document.createElement("div");
            area.id = "nutriqToast";
            area.setAttribute("role", "status");
            area.setAttribute("aria-live", "polite");
            document.body.appendChild(area);
        }
        area.className = "nq-toast is-visible" + (tipo === "erro" ? " is-error" : "");
        area.textContent = mensagem;
        clearTimeout(toast._t);
        toast._t = setTimeout(function () {
            area.classList.remove("is-visible");
        }, tipo === "erro" ? 4500 : 3000);
    }

var pilha = [];

    function focaveis(janela) {
        return Array.prototype.slice.call(janela.querySelectorAll(
            'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled])'
        )).filter(function (e) { return e.offsetParent !== null; });
    }

    function abrirModal(sobreposicao, foco) {
        if (!sobreposicao || !sobreposicao.hidden) return;
        sobreposicao._focoAnterior = document.activeElement;
        sobreposicao.hidden = false;
        pilha.push(sobreposicao);
        document.body.classList.add("nq-modal-open");

        var alvo = typeof foco === "string" ? sobreposicao.querySelector(foco) : foco;
        if (!alvo) alvo = focaveis(sobreposicao)[0];
        if (alvo && alvo.focus) alvo.focus();
    }

    function fecharModal(sobreposicao) {
        if (!sobreposicao || sobreposicao.hidden) return;
        sobreposicao.hidden = true;
        pilha = pilha.filter(function (o) { return o !== sobreposicao; });
        if (!pilha.length) document.body.classList.remove("nq-modal-open");
        var anterior = sobreposicao._focoAnterior;
        if (anterior && document.contains(anterior) && anterior.focus) anterior.focus();
    }

    document.addEventListener("keydown", function (e) {
        var topo = pilha[pilha.length - 1];
        if (!topo) return;

        if (e.key === "Escape") {
            fecharModal(topo);
            return;
        }

        if (e.key === "Tab") {
            var itens = focaveis(topo);
            if (!itens.length) return;
            var primeiro = itens[0];
            var ultimo = itens[itens.length - 1];
            if (e.shiftKey && document.activeElement === primeiro) {
                e.preventDefault();
                ultimo.focus();
            } else if (!e.shiftKey && document.activeElement === ultimo) {
                e.preventDefault();
                primeiro.focus();
            }
        }
    });

    document.addEventListener("mousedown", function (e) {
        var topo = pilha[pilha.length - 1];
        if (topo && e.target === topo) fecharModal(topo);
    });

function avaliacoesDe(store, pacienteId) {
        return store.avaliacoes
            .filter(function (a) { return a.pacienteId === pacienteId && Number(a.peso) > 0; })
            .map(function (a) {
                return {
                    id: a.id,
                    data: dataLocal(a.data),
                    peso: Number(a.peso),
                    altura: Number(a.altura) > 0 ? Number(a.altura) : null
                };
            });
    }

    function nomeDoPaciente(store, id, reserva) {
        for (var i = 0; i < store.pacientes.length; i++) {
            if (store.pacientes[i].id === id) return store.pacientes[i].nome;
        }
        return reserva || "";
    }

    function pacienteDeStore(p, store) {
        return Object.assign({}, p, {
            criadoEm: p.dataCadastro || p.criadoEm,
            status: p.status || "ativo",
            avaliacoes: avaliacoesDe(store, p.id)
        });
    }

    function pacienteParaStore(p) {
        var r = Object.assign({}, p);
        delete r.avaliacoes;
        r.dataCadastro = r.dataCadastro || r.criadoEm || new Date().toISOString();
        delete r.criadoEm;
        r.email = r.email || "";
        r.telefone = r.telefone || "";
        return r;
    }

    function planoDeStore(pl, store) {
        return Object.assign({}, pl, {
            criadoEm: pl.dataCadastro || pl.criadoEm,
            paciente: nomeDoPaciente(store, pl.pacienteId, pl.paciente),
            observacoes: pl.observacoes != null ? pl.observacoes : (pl.descricao || ""),
            status: pl.status || "ativo"
        });
    }

    function planoParaStore(p) {
        var r = Object.assign({}, p);
        delete r.paciente;
        r.dataCadastro = r.dataCadastro || r.criadoEm || new Date().toISOString();
        delete r.criadoEm;
        r.descricao = r.observacoes != null ? r.observacoes : (r.descricao || "");
        return r;
    }

    function consultaDeStore(c, store) {
        return Object.assign({}, c, {
            hora: c.hora || c.horario,
            status: String(c.status || "agendada").toLowerCase(),
            paciente: nomeDoPaciente(store, c.pacienteId, c.paciente),
            criadoEm: c.criadoEm || c.dataCadastro
        });
    }

    function consultaParaStore(c) {
        var r = Object.assign({}, c);
        delete r.paciente;
        r.horario = r.hora || r.horario;
        delete r.hora;
        r.status = capitalizar(r.status || "agendada");
        r.criadoEm = r.criadoEm || r.dataCadastro || new Date().toISOString();
        return r;
    }

function acharIndice(itens, id) {
        for (var i = 0; i < itens.length; i++) {
            if (itens[i].id === id) return i;
        }
        return -1;
    }

    function colecao(nome, prefixo, deStore, paraStore) {
        return {
            listar: function () {
                var s = lerStore();
                return s[nome].map(function (x) { return deStore(x, s); });
            },

            obter: function (id) {
                var s = lerStore();
                var i = acharIndice(s[nome], id);
                return i >= 0 ? deStore(s[nome][i], s) : null;
            },

            criar: function (dados) {
                var s = lerStore();
                var item = paraStore(Object.assign({}, dados, { id: novoId(prefixo) }));
                s[nome].push(item);
                return gravarStore(s) ? deStore(item, s) : null;
            },

            atualizar: function (id, dados) {
                var s = lerStore();
                var i = acharIndice(s[nome], id);
                if (i < 0) return null;
                var novo = paraStore(Object.assign({}, deStore(s[nome][i], s), dados, { id: id }));
                s[nome][i] = novo;
                return gravarStore(s) ? deStore(novo, s) : null;
            },

            excluir: function (id) {
                var s = lerStore();
                var restante = s[nome].filter(function (x) { return x.id !== id; });
                if (restante.length === s[nome].length) return false;
                s[nome] = restante;
                return gravarStore(s);
            }
        };
    }

    var pacientes = colecao("pacientes", "pa_", pacienteDeStore, pacienteParaStore);
    var planos = colecao("planos", "pl_", planoDeStore, planoParaStore);
    var consultas = colecao("consultas", "co_", consultaDeStore, consultaParaStore);

    planos.doPaciente = function (pacienteId) {
        return planos.listar().filter(function (p) { return p.pacienteId === pacienteId; });
    };

    consultas.doPaciente = function (pacienteId) {
        return consultas.listar().filter(function (c) { return c.pacienteId === pacienteId; });
    };

    function minutoDaConsulta(data, hora) {
        if (!lerISO(data) || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(String(hora || ""))) return null;
        return momento(data, hora).getTime();
    }

consultas.conflito = function (data, hora, ignorarId) {
        var minuto = minutoDaConsulta(data, hora);
        if (minuto == null) return false;
        return lerStore().consultas.some(function (c) {
            if (c.id === ignorarId || String(c.status || "").toLowerCase() === "cancelada") return false;
            var existente = minutoDaConsulta(c.data, c.horario || c.hora);
            return existente != null && Math.abs(minuto - existente) < 30 * 60 * 1000;
        });
    };

    var criarConsulta = consultas.criar;
    var atualizarConsulta = consultas.atualizar;

    consultas.criar = function (dados) {
        if (String(dados.status || "agendada").toLowerCase() !== "cancelada" &&
            consultas.conflito(dados.data, dados.hora, null)) return null;
        return criarConsulta(dados);
    };

    consultas.atualizar = function (id, dados) {
        var atual = consultas.obter(id);
        if (!atual) return null;
        var novo = Object.assign({}, atual, dados);
        if (String(novo.status || "agendada").toLowerCase() !== "cancelada" &&
            consultas.conflito(novo.data, novo.hora, id)) return null;
        return atualizarConsulta(id, dados);
    };

    pacientes.vinculos = function (id) {
        var s = lerStore();
        return {
            planos: s.planos.filter(function (p) { return p.pacienteId === id; }).length,
            consultas: s.consultas.filter(function (c) { return c.pacienteId === id; }).length
        };
    };

pacientes.excluir = function (id) {
        var s = lerStore();
        var existe = s.pacientes.some(function (p) { return p.id === id; });
        if (!existe) return null;

        var vinculos = pacientes.vinculos(id);
        s.pacientes = s.pacientes.filter(function (p) { return p.id !== id; });
        s.planos = s.planos.filter(function (p) { return p.pacienteId !== id; });
        s.avaliacoes = s.avaliacoes.filter(function (a) { return a.pacienteId !== id; });
        s.consultas = s.consultas.filter(function (c) { return c.pacienteId !== id; });
        return gravarStore(s) ? vinculos : null;
    };

    pacientes.adicionarAvaliacao = function (id, avaliacao) {
        var s = lerStore();
        var i = acharIndice(s.pacientes, id);
        if (i < 0) return null;

        var altura = Number(avaliacao.altura) > 0 ? Number(avaliacao.altura) : null;
        var nova = {
            id: novoId("av_"),
            pacienteId: id,
            peso: Number(avaliacao.peso),
            altura: altura,
            observacoes: "",
            data: avaliacao.data
        };
        s.avaliacoes.push(nova);
        if (!s.pacientes[i].altura && altura) s.pacientes[i].altura = altura;

        return gravarStore(s)
            ? { id: nova.id, data: dataLocal(nova.data), peso: nova.peso, altura: nova.altura }
            : null;
    };

    pacientes.removerAvaliacao = function (id, avaliacaoId) {
        var s = lerStore();
        var restante = s.avaliacoes.filter(function (a) {
            return !(a.id === avaliacaoId && a.pacienteId === id);
        });
        if (restante.length === s.avaliacoes.length) return false;
        s.avaliacoes = restante;
        return gravarStore(s);
    };

function lerAntiga(chave) {
        try {
            return lista(JSON.parse(global.localStorage.getItem(chave)));
        } catch (e) {
            return [];
        }
    }

    function migrar() {
        var antigos = {
            pacientes: lerAntiga(CHAVES_ANTIGAS.pacientes),
            planos: lerAntiga(CHAVES_ANTIGAS.planos),
            consultas: lerAntiga(CHAVES_ANTIGAS.consultas)
        };
        if (!antigos.pacientes.length && !antigos.planos.length && !antigos.consultas.length) {
            limparChavesAntigas();
            return;
        }

        var s = lerStore();

        function garantirPaciente(item) {
            if (item.pacienteId && s.pacientes.some(function (p) { return p.id === item.pacienteId; })) {
                return item.pacienteId;
            }
            var nome = String(item.paciente || "").trim();
            if (!normalizar(nome)) return null;

            var alvo = null;
            for (var i = 0; i < s.pacientes.length; i++) {
                if (normalizar(s.pacientes[i].nome) === normalizar(nome)) { alvo = s.pacientes[i]; break; }
            }
            if (!alvo) {
                alvo = { id: novoId("pa_"), nome: nome, email: "", telefone: "", status: "ativo", dataCadastro: new Date().toISOString() };
                s.pacientes.push(alvo);
            }
            return alvo.id;
        }

        antigos.pacientes.forEach(function (p) {
            var id = p.id || novoId("pa_");
            if (s.pacientes.some(function (x) { return x.id === id; })) return;
            s.pacientes.push(pacienteParaStore(Object.assign({}, p, { id: id })));
            lista(p.avaliacoes).forEach(function (a) {
                if (!(Number(a.peso) > 0)) return;
                s.avaliacoes.push({
                    id: a.id || novoId("av_"),
                    pacienteId: id,
                    peso: Number(a.peso),
                    altura: Number(a.altura) > 0 ? Number(a.altura) : null,
                    observacoes: "",
                    data: a.data
                });
            });
        });

        antigos.planos.forEach(function (pl) {
            var id = pl.id || novoId("pl_");
            if (s.planos.some(function (x) { return x.id === id; })) return;
            var pacienteId = garantirPaciente(pl);
            if (!pacienteId) return;
            s.planos.push(planoParaStore(Object.assign({}, pl, { id: id, pacienteId: pacienteId })));
        });

        antigos.consultas.forEach(function (c) {
            var id = c.id || novoId("co_");
            if (s.consultas.some(function (x) { return x.id === id; })) return;
            var pacienteId = garantirPaciente(c);
            if (!pacienteId) return;
            s.consultas.push(consultaParaStore(Object.assign({}, c, { id: id, pacienteId: pacienteId })));
        });

        if (gravarStore(s)) limparChavesAntigas();
    }

    function limparChavesAntigas() {
        Object.keys(CHAVES_ANTIGAS).forEach(function (k) {
            try { global.localStorage.removeItem(CHAVES_ANTIGAS[k]); } catch (e) {   }
        });
    }

    migrar();

global.NutriqDados = Object.assign(global.NutriqDados || {}, {
        pacientes: pacientes,
        planos: planos,
        consultas: consultas,
        aoMudar: aoMudar,
        toast: toast,
        abrirModal: abrirModal,
        fecharModal: fecharModal,
        util: {
            escapar: escapar,
            normalizar: normalizar,
            lerISO: lerISO,
            paraISO: paraISO,
            hojeISO: hojeISO,
            formatarData: formatarData,
            momento: momento,
            idade: idade,
            imc: imc,
            classificarImc: classificarImc,
            mascaraTelefone: mascaraTelefone,
            emailValido: emailValido,
            parametro: parametro,
            limparParametros: limparParametros
        }
    });
})(window);
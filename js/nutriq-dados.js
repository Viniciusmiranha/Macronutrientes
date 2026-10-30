/* =====================================================
   NUTRIQ · Camada de dados das páginas (js/nutriq-dados.js)

   COMPATÍVEL COM O SEU js/database.js:
   - usa a MESMA chave do localStorage: "nutriq_dados_v1"
   - grava no MESMO formato { pacientes, planos, avaliacoes, consultas }
   - dispara o MESMO evento: "nutriqDadosAtualizados"
   - NÃO substitui o window.NutriqDados do database.js: apenas acrescenta
     as funções novas (pacientes, planos, consultas, toast, abrirModal...)

   Por isso a página inicial (dashboard) enxerga tudo o que for
   cadastrado nas outras páginas, e vice-versa.

   Carregue DEPOIS do database.js e ANTES do script da página.
===================================================== */

(function (global) {
    "use strict";

    var CHAVE = "nutriq_dados_v1";

    // Chaves usadas por versões anteriores destas páginas (migradas e removidas).
    var CHAVES_ANTIGAS = {
        pacientes: "nutriq_pacientes",
        planos: "nutriq_planos",
        consultas: "nutriq_consultas"
    };

    var ouvintes = [];

    /* ---------- Armazenamento ---------- */
    function lista(valor) {
        return Array.isArray(valor) ? valor : [];
    }

    function lerStore() {
        var bruto = null;
        try {
            bruto = JSON.parse(global.localStorage.getItem(CHAVE));
        } catch (e) { /* dados ausentes ou corrompidos: começa vazio */ }

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
        } catch (e) { /* ignorar */ }
        return true;
    }

    function avisarMudanca() {
        ouvintes.forEach(function (fn) {
            try { fn(); } catch (e) { /* um ouvinte com erro não trava os outros */ }
        });
    }

    function aoMudar(fn) {
        if (typeof fn === "function") ouvintes.push(fn);
    }

    global.addEventListener("nutriqDadosAtualizados", avisarMudanca);
    // Mudanças feitas em outra aba
    global.addEventListener("storage", function (evento) {
        if (evento.key === null || evento.key === CHAVE) avisarMudanca();
    });

    /* ---------- Utilidades ---------- */
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

    // O database.js grava a data da avaliação como data/hora ISO (UTC).
    // Aqui ela vira a data local AAAA-MM-DD para não "andar" um dia.
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
        var metros = a > 3 ? a / 100 : a; // aceita cm ou m
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
        } catch (e) { /* ignorar */ }
    }

    function capitalizar(texto) {
        var t = String(texto || "");
        return t.charAt(0).toUpperCase() + t.slice(1);
    }

    /* ---------- Aviso na tela (não depende do CSS do painel) ---------- */
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

    /* ---------- Janelas (modais) ---------- */
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

    /* ---------- Tradução entre o formato do database.js e o das páginas ----------
       database.js:  paciente.dataCadastro | consulta.horario | status "Agendada"
       páginas:      paciente.criadoEm     | consulta.hora    | status "agendada"
       As páginas trabalham com o formato delas; aqui o dado é convertido na
       leitura e na gravação, então o database.js e o dashboard continuam
       funcionando sem nenhuma alteração. */

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

    /* ---------- Coleções ---------- */
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

    // Um único nutricionista: dois atendimentos não podem ocupar o mesmo horário.
    consultas.conflito = function (data, hora, ignorarId) {
        return lerStore().consultas.some(function (c) {
            return c.id !== ignorarId &&
                String(c.status || "").toLowerCase() !== "cancelada" &&
                c.data === data &&
                (c.horario || c.hora) === hora;
        });
    };

    pacientes.vinculos = function (id) {
        var s = lerStore();
        return {
            planos: s.planos.filter(function (p) { return p.pacienteId === id; }).length,
            consultas: s.consultas.filter(function (c) { return c.pacienteId === id; }).length
        };
    };

    // Exclui o paciente e tudo que pertence a ele (igual ao database.js).
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

    /* ---------- Migração de versões anteriores destas páginas ---------- */
    // Antes, pacientes, planos e consultas ficavam em três chaves separadas e
    // planos/consultas só guardavam o nome do paciente. Tudo é movido para a
    // chave do database.js e ligado ao cadastro; nenhum dado se perde.
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
            try { global.localStorage.removeItem(CHAVES_ANTIGAS[k]); } catch (e) { /* ignorar */ }
        });
    }

    migrar();

    /* ---------- API pública ---------- */
    // Acrescenta ao window.NutriqDados do database.js, sem substituí-lo.
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
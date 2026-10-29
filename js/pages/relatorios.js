/* =====================================================
   NUTRIQ · Relatórios (js/relatorios.js)

   >>> Ajuste apenas carregarPacientes(), carregarPlanos() e
       carregarConsultas() para usar o seu js/database.js. <<<

   Formato esperado dos dados (campos opcionais podem faltar):

   Paciente:  { id, nome, email, telefone, nascimento (AAAA-MM-DD),
                idade, genero, objetivo, altura (cm),
                avaliacoes: [{ data (AAAA-MM-DD), peso (kg), altura (cm) }] }
   Plano:     { paciente (nome), nome, objetivo, calorias, status,
                criadoEm, macrosTipo: "g" | "%",
                macros: { carboidratos, proteinas, gorduras } }
   Consulta:  { paciente (nome), data, status }
===================================================== */

(function () {
    "use strict";

    var CHAVES = {
        pacientes: "nutriq_pacientes",
        planos: "nutriq_planos",
        consultas: "nutriq_consultas"
    };

    /* ---------- Acesso a dados (troque pelo seu database.js) ---------- */
    function lerLista(chave) {
        try {
            var dados = JSON.parse(localStorage.getItem(chave) || "[]");
            return Array.isArray(dados) ? dados : [];
        } catch (e) {
            return [];
        }
    }

    function carregarPacientes() { return lerLista(CHAVES.pacientes); }
    function carregarPlanos() { return lerLista(CHAVES.planos); }
    function carregarConsultas() { return lerLista(CHAVES.consultas); }

    /* ---------- Elementos ---------- */
    function $(id) { return document.getElementById(id); }

    var el = {
        select: $("relPaciente"),
        hint: $("relHint"),
        gerar: $("btnGerar"),
        baixar: $("btnBaixar"),
        resumoTexto: $("relResumoTexto"),
        nome: $("relNome"),
        contato: $("relContato"),
        meta: $("relMeta"),
        ultima: $("relUltima"),
        plano: $("relPlano"),
        objetivo: $("relObjetivo"),
        pesoGrafico: $("relPesoGrafico"),
        pesoNota: $("relPesoNota"),
        imcGrafico: $("relImcGrafico"),
        imcNota: $("relImcNota"),
        donut: $("relDonut"),
        donutSegmentos: $("relDonutSegmentos"),
        donutCentro: $("relDonutCentro"),
        carb: $("relCarb"),
        prot: $("relProt"),
        gord: $("relGord"),
        macroNota: $("relMacroNota"),
        completoTexto: $("relCompletoTexto"),
        feedback: $("dashboardFeedback")
    };

    var pacientes = [];
    var gerado = false;
    var nomeGerado = "";

    /* ---------- Utilidades ---------- */
    function escapar(texto) {
        var div = document.createElement("div");
        div.textContent = texto == null ? "" : String(texto);
        return div.innerHTML;
    }

    function normalizar(texto) {
        return String(texto == null ? "" : texto).trim().toLowerCase();
    }

    function lerData(valor) {
        var p = String(valor || "").split("T")[0].split("-");
        if (p.length !== 3) return null;
        var d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
        return isNaN(d) ? null : d;
    }

    function formatarData(d) {
        if (!d) return "—";
        return d.toLocaleDateString("pt-BR");
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

    function formatarNumero(n, casas) {
        return Number(n).toLocaleString("pt-BR", {
            minimumFractionDigits: 0,
            maximumFractionDigits: casas
        });
    }

    /* ---------- Dados derivados do paciente ---------- */
    function idadeDe(p) {
        var nasc = lerData(p.nascimento);
        if (nasc) {
            var hoje = new Date();
            var idade = hoje.getFullYear() - nasc.getFullYear();
            var fezAniversario =
                hoje.getMonth() > nasc.getMonth() ||
                (hoje.getMonth() === nasc.getMonth() && hoje.getDate() >= nasc.getDate());
            if (!fezAniversario) idade--;
            return idade >= 0 ? idade : null;
        }
        return Number(p.idade) > 0 ? Number(p.idade) : null;
    }

    function medicoesDe(p) {
        return (Array.isArray(p.avaliacoes) ? p.avaliacoes : [])
            .map(function (a) {
                return {
                    data: lerData(a.data),
                    peso: Number(a.peso),
                    altura: Number(a.altura || p.altura)
                };
            })
            .filter(function (m) { return m.data && m.peso > 0; })
            .sort(function (a, b) { return a.data - b.data; });
    }

    function imcDe(m) {
        var altura = m.altura > 3 ? m.altura / 100 : m.altura; // aceita cm ou m
        return altura > 0 ? m.peso / (altura * altura) : null;
    }

    function ultimaConsulta(p) {
        var nome = normalizar(p.nome);
        var datas = carregarConsultas()
            .filter(function (c) {
                return c.status === "realizada" && normalizar(c.paciente) === nome;
            })
            .map(function (c) { return lerData(c.data); })
            .filter(Boolean)
            .sort(function (a, b) { return b - a; });
        return datas[0] || null;
    }

    function planoDe(p) {
        var nome = normalizar(p.nome);
        var lista = carregarPlanos()
            .filter(function (pl) { return normalizar(pl.paciente) === nome; })
            .sort(function (a, b) {
                var ativoA = a.status !== "concluido" ? 1 : 0;
                var ativoB = b.status !== "concluido" ? 1 : 0;
                if (ativoA !== ativoB) return ativoB - ativoA;
                return String(b.criadoEm || "").localeCompare(String(a.criadoEm || ""));
            });
        return lista[0] || null;
    }

    /* ---------- Gráficos de linha (SVG) ---------- */
    var W = 460, H = 200, ML = 42, MR = 14, MT = 24, MB = 46, SLOTS = 6;

    function desenharLinha(container, serie, cfg) {
        var vazio = serie.length === 0;
        var n = vazio ? SLOTS : serie.length;
        var plotW = W - ML - MR;
        var plotH = H - MT - MB;
        var ticks;

        if (vazio) {
            ticks = cfg.ticksVazio;
        } else {
            var valores = serie.map(function (s) { return s.valor; });
            var min = Math.min.apply(null, valores);
            var max = Math.max.apply(null, valores);
            var folga = max > min ? (max - min) * 0.35 : Math.max(1, Math.abs(max) * 0.1);
            var baixo = Math.floor(min - folga);
            var alto = Math.ceil(max + folga);
            ticks = [baixo, (baixo + alto) / 2, alto];
        }

        var lo = ticks[0];
        var hi = ticks[ticks.length - 1];

        function yDe(v) { return MT + plotH * (1 - (v - lo) / (hi - lo)); }
        function xDe(i) { return ML + plotW * (i + 0.5) / n; }

        var svg = '<svg viewBox="0 0 ' + W + " " + H + '" aria-hidden="true">';
        svg += '<text class="rel-axis" x="0" y="12">' + escapar(cfg.unidade) + "</text>";

        ticks.forEach(function (t) {
            var y = yDe(t);
            svg += '<line class="rel-grid" x1="' + ML + '" x2="' + (W - MR) + '" y1="' + y + '" y2="' + y + '"/>';
            svg += '<text class="rel-axis" x="' + (ML - 8) + '" y="' + (y + 3) + '" text-anchor="end">' +
                formatarNumero(t, 1) + "</text>";
        });

        if (vazio) {
            for (var i = 0; i < SLOTS; i++) {
                var xv = xDe(i);
                svg += '<circle class="rel-point" cx="' + xv + '" cy="' + yDe(ticks[0]) + '" r="3.2"/>';
                svg += '<text class="rel-axis" x="' + xv + '" y="' + (H - MB + 18) + '" text-anchor="middle">—</text>';
                svg += '<text class="rel-axis" x="' + xv + '" y="' + (H - MB + 32) + '" text-anchor="middle">Mês</text>';
            }
        } else {
            var pontos = serie.map(function (s, i) { return xDe(i) + "," + yDe(s.valor); });
            if (serie.length > 1) {
                svg += '<polyline class="rel-line" points="' + pontos.join(" ") + '"/>';
            }
            serie.forEach(function (s, i) {
                var x = xDe(i);
                var y = yDe(s.valor);
                var mes = s.data.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
                svg += '<circle class="rel-point is-filled" cx="' + x + '" cy="' + y + '" r="4.5"/>';
                svg += '<text class="rel-value" x="' + x + '" y="' + (y - 10) + '" text-anchor="middle">' +
                    formatarNumero(s.valor, 1) + "</text>";
                svg += '<text class="rel-axis" x="' + x + '" y="' + (H - MB + 18) + '" text-anchor="middle">' +
                    s.data.getDate() + "</text>";
                svg += '<text class="rel-axis" x="' + x + '" y="' + (H - MB + 32) + '" text-anchor="middle">' +
                    escapar(mes) + "</text>";
            });
        }

        svg += "</svg>";
        container.innerHTML = svg;
        container.setAttribute(
            "aria-label",
            cfg.titulo + (vazio ? ", sem dados" : ", com " + serie.length + (serie.length === 1 ? " medição" : " medições"))
        );
    }

    /* ---------- Gráfico de macronutrientes ---------- */
    var CIRCUNFERENCIA = 2 * Math.PI * 48;

    function desenharMacros(plano) {
        var caixa = el.donut.parentNode;
        var macros = plano && plano.macros;
        var carb = macros ? Number(macros.carboidratos) || 0 : 0;
        var prot = macros ? Number(macros.proteinas) || 0 : 0;
        var gord = macros ? Number(macros.gorduras) || 0 : 0;

        var energia = plano && plano.macrosTipo === "%"
            ? [carb, prot, gord]
            : [carb * 4, prot * 4, gord * 9];
        var total = energia[0] + energia[1] + energia[2];

        if (!total) {
            caixa.classList.remove("has-data");
            el.donutSegmentos.innerHTML = "";
            el.donutCentro.textContent = "Sem dados";
            el.carb.textContent = el.prot.textContent = el.gord.textContent = "—%";
            el.donut.setAttribute("aria-label", "Distribuição de macronutrientes, sem dados");
            return false;
        }

        var porcentagens = energia.map(function (e) { return (e / total) * 100; });
        var classes = ["carb", "prot", "gord"];
        var deslocamento = 0;

        el.donutSegmentos.innerHTML = porcentagens.map(function (pct, i) {
            var comprimento = (pct / 100) * CIRCUNFERENCIA;
            var circulo =
                '<circle class="rel-donut-seg-' + classes[i] + '" cx="60" cy="60" r="48"' +
                ' stroke-dasharray="' + comprimento + " " + (CIRCUNFERENCIA - comprimento) + '"' +
                ' stroke-dashoffset="' + (-deslocamento) + '"/>';
            deslocamento += comprimento;
            return circulo;
        }).join("");

        caixa.classList.add("has-data");
        el.donutCentro.textContent = plano.calorias ? plano.calorias + " kcal" : "Dieta";
        el.carb.textContent = Math.round(porcentagens[0]) + "%";
        el.prot.textContent = Math.round(porcentagens[1]) + "%";
        el.gord.textContent = Math.round(porcentagens[2]) + "%";
        el.donut.setAttribute(
            "aria-label",
            "Carboidratos " + Math.round(porcentagens[0]) + "%, proteínas " +
            Math.round(porcentagens[1]) + "%, gorduras " + Math.round(porcentagens[2]) + "%"
        );
        return true;
    }

    /* ---------- Estados da página ---------- */
    var CFG_PESO = { unidade: "kg", ticksVazio: [0, 50, 100], titulo: "Gráfico de evolução do peso" };
    var CFG_IMC = { unidade: "IMC", ticksVazio: [0, 15, 30, 45], titulo: "Gráfico de evolução do IMC" };

    function mostrarNota(elemento, texto) {
        elemento.textContent = texto || "";
        elemento.hidden = !texto;
    }

    function estadoVazio() {
        gerado = false;
        nomeGerado = "";

        el.resumoTexto.textContent = "As informações gerais do paciente aparecerão aqui.";
        el.nome.textContent = "Nome do paciente";
        el.contato.textContent = "—";
        el.meta.textContent = "Idade · Gênero";
        el.ultima.textContent = "—";
        el.plano.textContent = "—";
        el.objetivo.textContent = "—";

        desenharLinha(el.pesoGrafico, [], CFG_PESO);
        desenharLinha(el.imcGrafico, [], CFG_IMC);
        desenharMacros(null);
        mostrarNota(el.pesoNota, "");
        mostrarNota(el.imcNota, "");
        mostrarNota(el.macroNota, "");

        el.completoTexto.textContent = "Selecione um paciente para visualizar o relatório completo.";
        el.baixar.disabled = true;
    }

    function gerarRelatorio() {
        var indice = el.select.value;
        var paciente = pacientes[Number(indice)];
        if (indice === "" || !paciente) return;

        var idade = idadeDe(paciente);
        var genero = paciente.genero || paciente.sexo;
        var plano = planoDe(paciente);
        var medicoes = medicoesDe(paciente).slice(-SLOTS);

        // Resumo
        el.resumoTexto.textContent = "Informações gerais do paciente selecionado.";
        el.nome.textContent = paciente.nome || "Paciente sem nome";
        el.contato.textContent = paciente.telefone || paciente.email || "—";
        el.meta.textContent = [idade != null ? idade + " anos" : "Idade", genero || "Gênero"].join(" · ");
        el.ultima.textContent = formatarData(ultimaConsulta(paciente));
        el.plano.textContent = plano && plano.nome ? plano.nome : "—";
        el.objetivo.textContent = paciente.objetivo || (plano && plano.objetivo) || "—";

        // Peso
        var seriePeso = medicoes.map(function (m) { return { data: m.data, valor: m.peso }; });
        desenharLinha(el.pesoGrafico, seriePeso, CFG_PESO);
        mostrarNota(el.pesoNota, seriePeso.length ? "" : "Nenhuma avaliação com peso registrada para este paciente.");

        // IMC
        var serieImc = medicoes
            .map(function (m) { return { data: m.data, valor: imcDe(m) }; })
            .filter(function (s) { return s.valor != null; })
            .map(function (s) { return { data: s.data, valor: Math.round(s.valor * 10) / 10 }; });
        desenharLinha(el.imcGrafico, serieImc, CFG_IMC);
        mostrarNota(el.imcNota, serieImc.length ? "" : "Registre peso e altura nas avaliações para calcular o IMC.");

        // Macronutrientes
        var temMacros = desenharMacros(plano);
        mostrarNota(el.macroNota, temMacros ? "" : "Este paciente não possui plano alimentar com macronutrientes.");

        // Relatório completo
        gerado = true;
        nomeGerado = paciente.nome || "paciente";
        el.completoTexto.textContent =
            "Relatório de " + nomeGerado + " gerado em " + formatarData(new Date()) +
            ". Use “Baixar relatório” e escolha “Salvar como PDF”.";
        el.baixar.disabled = false;

        aviso("Relatório gerado.");
    }

    function baixarRelatorio() {
        if (!gerado) return;
        var tituloOriginal = document.title;
        document.title = "Relatorio - " + nomeGerado;
        window.print();
        document.title = tituloOriginal;
    }

    /* ---------- Lista de pacientes ---------- */
    function preencherPacientes() {
        pacientes = carregarPacientes().sort(function (a, b) {
            return String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR");
        });

        el.select.innerHTML = '<option value="">Escolha um paciente</option>' +
            pacientes.map(function (p, i) {
                return '<option value="' + i + '">' + escapar(p.nome || "Paciente sem nome") + "</option>";
            }).join("");

        el.hint.hidden = pacientes.length > 0;
    }

    /* ---------- Eventos ---------- */
    function iniciar() {
        preencherPacientes();
        estadoVazio();

        el.select.addEventListener("change", function () {
            estadoVazio();
            el.gerar.disabled = el.select.value === "";
        });

        el.gerar.addEventListener("click", gerarRelatorio);
        el.baixar.addEventListener("click", baixarRelatorio);

        // Atualiza a lista ao voltar de outra página
        window.addEventListener("pageshow", function () {
            var atual = el.select.value;
            var nomeAtual = atual !== "" && pacientes[Number(atual)] ? pacientes[Number(atual)].nome : null;
            preencherPacientes();
            if (nomeAtual != null) {
                var novoIndice = pacientes.findIndex(function (p) { return p.nome === nomeAtual; });
                el.select.value = novoIndice >= 0 ? String(novoIndice) : "";
            }
            el.gerar.disabled = el.select.value === "";
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", iniciar);
    } else {
        iniciar();
    }
})();
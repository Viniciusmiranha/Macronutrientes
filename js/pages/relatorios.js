/* =====================================================
   NUTRIQ · Relatórios (js/relatorios.js)
   Resumo do paciente, gráficos de peso, IMC e macronutrientes
   e impressão / PDF. Usa js/nutriq-dados.js.
===================================================== */

(function () {
    "use strict";

    var D = window.NutriqDados;
    if (!D) {
        console.error("NUTRIQ: carregue js/nutriq-dados.js antes de js/relatorios.js");
        return;
    }
    var U = D.util;
    var esc = U.escapar;

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
        completoTexto: $("relCompletoTexto")
    };

    var gerado = false;
    var nomeGerado = "";

    /* ---------- Utilidades ---------- */
    function formatarNumero(n, casas) {
        return Number(n).toLocaleString("pt-BR", {
            minimumFractionDigits: 0,
            maximumFractionDigits: casas
        });
    }

    /* ---------- Dados derivados do paciente ---------- */
    function medicoesDe(p) {
        return (Array.isArray(p.avaliacoes) ? p.avaliacoes : [])
            .map(function (a) {
                return {
                    data: U.lerISO(a.data),
                    peso: Number(a.peso),
                    altura: Number(a.altura || p.altura)
                };
            })
            .filter(function (m) { return m.data && m.peso > 0; })
            .sort(function (a, b) { return a.data - b.data; });
    }

    function ultimaConsulta(p) {
        var datas = D.consultas.doPaciente(p.id)
            .filter(function (c) { return c.status === "realizada"; })
            .map(function (c) { return U.lerISO(c.data); })
            .filter(Boolean)
            .sort(function (a, b) { return b - a; });
        return datas[0] || null;
    }

    function planoDe(p) {
        var lista = D.planos.doPaciente(p.id).sort(function (a, b) {
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
        svg += '<text class="rel-axis" x="0" y="12">' + esc(cfg.unidade) + "</text>";

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
                    esc(mes) + "</text>";
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

        var pct = energia.map(function (e) { return (e / total) * 100; });
        var classes = ["carb", "prot", "gord"];
        var deslocamento = 0;

        el.donutSegmentos.innerHTML = pct.map(function (p, i) {
            var comprimento = (p / 100) * CIRCUNFERENCIA;
            var circulo =
                '<circle class="rel-donut-seg-' + classes[i] + '" cx="60" cy="60" r="48"' +
                ' stroke-dasharray="' + comprimento + " " + (CIRCUNFERENCIA - comprimento) + '"' +
                ' stroke-dashoffset="' + (-deslocamento) + '"/>';
            deslocamento += comprimento;
            return circulo;
        }).join("");

        caixa.classList.add("has-data");
        el.donutCentro.textContent = plano.calorias ? plano.calorias + " kcal" : "Dieta";
        el.carb.textContent = Math.round(pct[0]) + "%";
        el.prot.textContent = Math.round(pct[1]) + "%";
        el.gord.textContent = Math.round(pct[2]) + "%";
        el.donut.setAttribute(
            "aria-label",
            "Carboidratos " + Math.round(pct[0]) + "%, proteínas " + Math.round(pct[1]) +
            "%, gorduras " + Math.round(pct[2]) + "%"
        );
        return true;
    }

    /* ---------- Estados da página ---------- */
    var CFG_PESO = { unidade: "kg", ticksVazio: [0, 50, 100], titulo: "Gráfico de evolução do peso" };
    var CFG_IMC = { unidade: "IMC", ticksVazio: [0, 15, 30, 45], titulo: "Gráfico de evolução do IMC" };

    function mostrarNota(elemento, html) {
        elemento.innerHTML = html || "";
        elemento.hidden = !html;
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

    function gerarRelatorio(silencioso) {
        var paciente = el.select.value ? D.pacientes.obter(el.select.value) : null;
        if (!paciente) return;

        var anos = U.idade(paciente);
        var plano = planoDe(paciente);
        var medicoes = medicoesDe(paciente).slice(-SLOTS);
        var link = encodeURIComponent(paciente.id);

        // Resumo
        el.resumoTexto.textContent = "Informações gerais do paciente selecionado.";
        el.nome.textContent = paciente.nome || "Paciente sem nome";
        el.contato.textContent = paciente.telefone || paciente.email || "—";
        el.meta.textContent = [anos != null ? anos + " anos" : "Idade", paciente.genero || "Gênero"].join(" · ");
        el.ultima.textContent = U.formatarData(ultimaConsulta(paciente));
        el.plano.textContent = plano && plano.nome ? plano.nome : "—";
        el.objetivo.textContent = paciente.objetivo || (plano && plano.objetivo) || "—";

        // Peso
        var seriePeso = medicoes.map(function (m) { return { data: m.data, valor: m.peso }; });
        desenharLinha(el.pesoGrafico, seriePeso, CFG_PESO);
        if (!seriePeso.length) {
            mostrarNota(el.pesoNota,
                'Nenhuma avaliação com peso registrada. <a href="pacientes.html?ficha=' + link + '">Registrar na ficha do paciente</a>.');
        } else if (seriePeso.length > 1) {
            var delta = seriePeso[seriePeso.length - 1].valor - seriePeso[0].valor;
            var texto = delta === 0 ? "Peso estável" : (delta > 0 ? "+" : "−") + formatarNumero(Math.abs(delta), 1) + " kg";
            mostrarNota(el.pesoNota, esc("Variação no período: " + texto));
        } else {
            mostrarNota(el.pesoNota, "");
        }

        // IMC
        var serieImc = medicoes
            .map(function (m) { return { data: m.data, valor: U.imc(m.peso, m.altura) }; })
            .filter(function (s) { return s.valor != null; });
        desenharLinha(el.imcGrafico, serieImc, CFG_IMC);
        if (!serieImc.length) {
            mostrarNota(el.imcNota,
                'Para calcular o IMC, registre peso e altura. <a href="pacientes.html?ficha=' + link + '">Abrir ficha do paciente</a>.');
        } else {
            var ultimo = serieImc[serieImc.length - 1].valor;
            var adulto = anos == null || anos >= 18;
            mostrarNota(el.imcNota, esc(
                "Último IMC: " + formatarNumero(ultimo, 1) +
                (adulto ? " · " + U.classificarImc(ultimo) : " · para menores de 18 anos use as curvas de crescimento")
            ));
        }

        // Macronutrientes
        var temMacros = desenharMacros(plano);
        mostrarNota(el.macroNota, temMacros ? "" :
            'Este paciente não tem plano alimentar com macronutrientes. <a href="planos-alimentares.html?novo=1&amp;paciente=' + link + '">Criar plano</a>.');

        // Relatório completo
        gerado = true;
        nomeGerado = paciente.nome || "paciente";
        el.completoTexto.textContent =
            "Relatório de " + nomeGerado + " gerado em " + U.formatarData(new Date()) +
            ". Use “Baixar relatório” e escolha “Salvar como PDF”.";
        el.baixar.disabled = false;

        if (!silencioso) D.toast("Relatório gerado.");
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
        var anterior = el.select.value;
        var lista = D.pacientes.listar().sort(function (a, b) {
            return String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR");
        });

        el.select.innerHTML = '<option value="">Escolha um paciente</option>' +
            lista.map(function (p) {
                return '<option value="' + esc(p.id) + '">' + esc(p.nome || "Paciente sem nome") + "</option>";
            }).join("");

        el.hint.hidden = lista.length > 0;

        if (anterior && lista.some(function (p) { return p.id === anterior; })) {
            el.select.value = anterior;
        }
        el.gerar.disabled = el.select.value === "";
    }

    // Quando os dados mudam em outra aba, mantém o relatório atualizado.
    function aoMudarDados() {
        var estavaGerado = gerado;
        var selecionado = el.select.value;
        preencherPacientes();
        if (el.select.value !== selecionado) {
            estadoVazio(); // o paciente selecionado foi excluído
        } else if (estavaGerado) {
            gerarRelatorio(true);
        }
    }

    /* ---------- Eventos ---------- */
    function iniciar() {
        preencherPacientes();
        estadoVazio();

        el.select.addEventListener("change", function () {
            estadoVazio();
            el.gerar.disabled = el.select.value === "";
        });

        el.gerar.addEventListener("click", function () { gerarRelatorio(false); });
        el.baixar.addEventListener("click", baixarRelatorio);

        D.aoMudar(aoMudarDados);
        window.addEventListener("pageshow", aoMudarDados);

        // Vindo da ficha do paciente: relatorios.html?paciente=ID
        var idUrl = U.parametro("paciente");
        if (idUrl && D.pacientes.obter(idUrl)) {
            el.select.value = idUrl;
            el.gerar.disabled = false;
            gerarRelatorio(true);
        }
        if (idUrl) U.limparParametros();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", iniciar);
    } else {
        iniciar();
    }
})();

"use strict";

/* =========================================================
   NUTRIQ — MÉTRICAS DO DASHBOARD
   Atualiza pacientes, planos, avaliações e adesão.
========================================================= */

(() => {
    const CHAVE_DADOS = "nutriq_dados_v1";

    function obterDados() {
        try {
            const dadosSalvos = localStorage.getItem(CHAVE_DADOS);

            if (!dadosSalvos) {
                return {
                    pacientes: [],
                    planos: [],
                    avaliacoes: [],
                    consultas: []
                };
            }

            const dados = JSON.parse(dadosSalvos);

            return {
                pacientes: Array.isArray(dados.pacientes)
                    ? dados.pacientes : [],

                planos: Array.isArray(dados.planos)
                    ? dados.planos : [],

                avaliacoes: Array.isArray(dados.avaliacoes)
                    ? dados.avaliacoes : [],

                consultas: Array.isArray(dados.consultas)
                    ? dados.consultas : []
            };
        } catch (erro) {
            console.error("Erro ao ler os dados do NUTRIQ:", erro);

            return {
                pacientes: [],
                planos: [],
                avaliacoes: [],
                consultas: []
            };
        }
    }

    function atualizarTexto(id, valor) {
        const elemento = document.getElementById(id);

        if (elemento) {
            elemento.textContent = valor;
        }
    }

    function calcularAdesao(consultas) {
        if (consultas.length === 0) {
            return 0;
        }

        const statusConcluidos = [
            "concluída",
            "concluida",
            "realizada",
            "realizado",
            "concluído",
            "concluido"
        ];

        const concluidas = consultas.filter(consulta => {
            const status = String(consulta.status || "")
                .trim()
                .toLowerCase();

            return statusConcluidos.includes(status);
        }).length;

        return Math.round((concluidas / consultas.length) * 100);
    }

    function atualizarDashboard() {
        const dados = obterDados();

        // 1. Quantidades reais registradas
        atualizarTexto("totalPacientes", dados.pacientes.length);
        atualizarTexto("totalPlanos", dados.planos.length);
        atualizarTexto("totalAvaliacoes", dados.avaliacoes.length);

        // 2. Taxa de adesão
        // Fórmula: consultas concluídas / total de consultas × 100
        const adesao = calcularAdesao(dados.consultas);

        atualizarTexto("taxaAdesao", `${adesao}%`);

        // Também atualiza a taxa caso o HTML utilize
        // um cartão sem o ID taxaAdesao.
        const cartaoAdesao = document.querySelector(
            ".dashboard-metric-card .dashboard-metric-info"
        );

        // Localiza o cartão pelo texto "Taxa de adesão".
        document.querySelectorAll(
            ".dashboard-metric-card"
        ).forEach(cartao => {
            const titulo = cartao.querySelector(
                ".dashboard-metric-info > span"
            );

            if (
                titulo &&
                titulo.textContent.trim().toLowerCase() === "taxa de adesão"
            ) {
                const valor = cartao.querySelector(
                    ".dashboard-metric-info > strong"
                );

                if (valor) {
                    valor.textContent = `${adesao}%`;
                }

                const demonstracao = cartao.querySelector(
                    ".dashboard-growth"
                );

                if (demonstracao) {
                    demonstracao.textContent =
                        "Percentual de consultas concluídas";
                }
            }
        });

        // 3. Mostra 0% nas metas quando ainda não há metas
        atualizarTexto("percentualMetas", "0%");

        // Evita avisos de variável não utilizada em configurações
        // de desenvolvimento.
        void cartaoAdesao;
    }

    document.addEventListener("DOMContentLoaded", () => {
        atualizarDashboard();

        // Atualiza quando os dados mudam nesta página.
        window.addEventListener(
            "nutriqDadosAtualizados",
            atualizarDashboard
        );

        // Atualiza quando outra aba modifica o armazenamento.
        window.addEventListener("storage", atualizarDashboard);
    });

    // Disponibiliza a atualização para outras funções do painel.
    window.atualizarDashboardNutriq = atualizarDashboard;
})();

"use strict";

document.addEventListener("DOMContentLoaded", () => {

    const atualizarMetricas = () => {

        const resumo = window.NutriqDados.obterResumo();

        const elementos = {
            totalPacientes: resumo.totalPacientes,
            totalPlanos: resumo.totalPlanos,
            totalAvaliacoes: resumo.totalAvaliacoes
        };

        Object.entries(elementos).forEach(([id, valor]) => {

            const elemento = document.getElementById(id);

            if (elemento) {
                elemento.textContent = valor;
            }

        });

    };

    atualizarMetricas();

    window.addEventListener(
        "nutriqDadosAtualizados",
        atualizarMetricas
    );

    window.addEventListener(
        "storage",
        atualizarMetricas
    );

});
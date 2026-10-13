
"use strict";

/* =========================================================
   NUTRIQ - DASHBOARD.JS
   Métricas e barras de progresso das metas
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /*
       METAS CONFIGURÁVEIS

       Neste exemplo, a meta é de 10 registros para
       cada categoria. Altere estes valores para definir
       as metas reais do seu consultório.
    */

    const METAS = {
        pacientes: 10,
        planos: 10,
        avaliacoes: 10
    };

    /* =====================================================
       CALCULAR E LIMITAR PORCENTAGEM
    ===================================================== */

    function limitarPercentual(valor) {
        return Math.max(0, Math.min(100, valor));
    }

    function calcularPercentual(atual, meta) {
        if (meta <= 0) {
            return 0;
        }

        return limitarPercentual((atual / meta) * 100);
    }

    /* =====================================================
       CALCULAR TAXA DE ADESÃO

       Considera consultas concluídas em relação
       ao total de consultas cadastradas.
    ===================================================== */

    function calcularAdesao(consultas) {
        if (!consultas.length) {
            return 0;
        }

        const concluidas = consultas.filter(consulta => {
            const status = String(consulta.status || "")
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase()
                .trim();

            return [
                "concluida",
                "concluido",
                "realizada",
                "realizado",
                "finalizada",
                "finalizado",
                "completed"
            ].includes(status);
        }).length;

        return limitarPercentual(
            (concluidas / consultas.length) * 100
        );
    }

    /* =====================================================
       ATUALIZAR UMA BARRA HORIZONTAL
    ===================================================== */

    function atualizarBarra(indice, percentual, idValor) {
        const cards = document.querySelectorAll(
            ".dashboard-goal-item"
        );

        const card = cards[indice];

        const barra = card?.querySelector(
            ".dashboard-progress-track > span"
        );

        const valor = document.getElementById(idValor);

        const porcentagem = limitarPercentual(percentual);

        if (barra) {
            barra.style.width = `${porcentagem}%`;
            barra.style.transition = "width 0.6s ease";
        }

        if (valor) {
            valor.textContent = `${Math.round(porcentagem)}%`;
        }
    }

    /* =====================================================
       ATUALIZAR CÍRCULO DE METAS CONCLUÍDAS
    ===================================================== */

    function atualizarCirculo(percentual) {
        const circulo = document.querySelector(
            ".dashboard-ring-value"
        );

        const texto = document.getElementById(
            "percentualMetas"
        );

        const indicador = document.querySelector(
            ".dashboard-progress-ring"
        );

        const porcentagem = limitarPercentual(percentual);

        /*
           O círculo SVG tem raio 48.
           A circunferência é 2 × PI × raio.
        */

        const circunferencia = 2 * Math.PI * 48;

        const deslocamento =
            circunferencia * (1 - porcentagem / 100);

        if (circulo) {
            circulo.style.strokeDasharray =
                `${circunferencia}`;

            circulo.style.strokeDashoffset =
                `${deslocamento}`;

            circulo.style.transition =
                "stroke-dashoffset 0.6s ease";
        }

        if (texto) {
            texto.textContent = `${Math.round(porcentagem)}%`;
        }

        if (indicador) {
            indicador.setAttribute(
                "aria-label",
                `${Math.round(porcentagem)} por cento das metas concluídas`
            );
        }
    }

    /* =====================================================
       ATUALIZAR TODAS AS MÉTRICAS E BARRAS
    ===================================================== */

    function atualizarMetricas() {
        if (!window.NutriqDados) {
            console.warn(
                "NutriqDados não foi carregado. Verifique a ordem dos scripts."
            );

            return;
        }

        const resumo = window.NutriqDados.obterResumo();

        /* ---------------------------------------------
           CONTADORES PRINCIPAIS DO PAINEL
        --------------------------------------------- */

        const contadores = {
            totalPacientes: resumo.totalPacientes,
            totalPlanos: resumo.totalPlanos,
            totalAvaliacoes: resumo.totalAvaliacoes,
            totalConsultas: resumo.totalConsultas
        };

        Object.entries(contadores).forEach(([id, valor]) => {
            const elemento = document.getElementById(id);

            if (elemento) {
                elemento.textContent = valor;
            }
        });

        /* ---------------------------------------------
           CALCULAR PORCENTAGENS DAS METAS
        --------------------------------------------- */

        const percentualPacientes = calcularPercentual(
            resumo.totalPacientes,
            METAS.pacientes
        );

        const percentualPlanos = calcularPercentual(
            resumo.totalPlanos,
            METAS.planos
        );

        const percentualAvaliacoes = calcularPercentual(
            resumo.totalAvaliacoes,
            METAS.avaliacoes
        );

        const percentualAdesao = calcularAdesao(
            resumo.consultas
        );

        /* ---------------------------------------------
           ATUALIZAR BARRAS HORIZONTAIS

           Índice 0: Pacientes atendidos
           Índice 1: Planos elaborados
           Índice 2: Avaliações realizadas
           Índice 3: Taxa de adesão
        --------------------------------------------- */

        atualizarBarra(
            0,
            percentualPacientes,
            "metaPacientesValor"
        );

        atualizarBarra(
            1,
            percentualPlanos,
            "metaPlanosValor"
        );

        atualizarBarra(
            2,
            percentualAvaliacoes,
            "metaAvaliacoesValor"
        );

        atualizarBarra(
            3,
            percentualAdesao,
            "metaAdesaoValor"
        );

        /* ---------------------------------------------
           PORCENTAGEM GERAL DAS METAS

           É a média das quatro porcentagens acima.
        --------------------------------------------- */

        const porcentagens = [
            percentualPacientes,
            percentualPlanos,
            percentualAvaliacoes,
            percentualAdesao
        ];

        const percentualGeral =
            porcentagens.reduce(
                (total, percentual) => total + percentual,
                0
            ) / porcentagens.length;

        atualizarCirculo(percentualGeral);
    }

    /* =====================================================
       EVENTOS DE ATUALIZAÇÃO
    ===================================================== */

    atualizarMetricas();

    /*
       Atualiza quando um cadastro, uma edição ou uma
       exclusão dispara o evento do banco de dados local.
    */

    window.addEventListener(
        "nutriqDadosAtualizados",
        atualizarMetricas
    );

    /*
       Atualiza quando os dados mudam em outra aba.
    */

    window.addEventListener(
        "storage",
        atualizarMetricas
    );

    console.log(
        "NUTRIQ: dashboard.js carregado com barras dinâmicas."
    );
});

/* =========================================================
   CONTROLE DA JANELA DE PLANOS
========================================================= */

(() => {
    const botao = document.getElementById("btnVerPlanos");
    const modal = document.getElementById("modalPlanos");
    const fechar = document.getElementById("fecharModalPlanos");

    if (!botao || !modal || !fechar) {
        console.warn(
            "Verifique se btnVerPlanos, modalPlanos e fecharModalPlanos existem no HTML."
        );
        return;
    }

    let elementoAnterior = null;
    let overflowAnterior = "";

    function abrir() {
        elementoAnterior = document.activeElement;
        overflowAnterior = document.body.style.overflow;

        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");

        document.body.style.overflow = "hidden";

        fechar.focus();
    }

    function fecharModal() {
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");

        document.body.style.overflow = overflowAnterior;

        if (elementoAnterior) {
            elementoAnterior.focus();
        }
    }

    botao.addEventListener("click", abrir);
    fechar.addEventListener("click", fecharModal);

    modal.addEventListener("click", evento => {
        if (evento.target === modal) {
            fecharModal();
        }
    });

    document.addEventListener("keydown", evento => {
        if (
            evento.key === "Escape" &&
            modal.classList.contains("is-open")
        ) {
            fecharModal();
        }
    });
})();

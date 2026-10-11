"use strict";

(() => {
    const CHAVE_NUTRIQ = "nutriq_dados_v1";

    function obterDados() {
        try {
            const dados = JSON.parse(
                localStorage.getItem(CHAVE_NUTRIQ)
            );

            return {
                pacientes: Array.isArray(dados?.pacientes)
                    ? dados.pacientes
                    : [],

                planos: Array.isArray(dados?.planos)
                    ? dados.planos
                    : [],

                avaliacoes: Array.isArray(dados?.avaliacoes)
                    ? dados.avaliacoes
                    : [],

                consultas: Array.isArray(dados?.consultas)
                    ? dados.consultas
                    : []
            };
        } catch {
            return {
                pacientes: [],
                planos: [],
                avaliacoes: [],
                consultas: []
            };
        }
    }

    function salvarDados(dados) {
        localStorage.setItem(
            CHAVE_NUTRIQ,
            JSON.stringify(dados)
        );

        window.dispatchEvent(
            new CustomEvent("nutriqDadosAtualizados")
        );
    }

    function gerarId() {
        return crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    }

    /* =========================================================
       CADASTRAR PACIENTE
    ========================================================= */

    function cadastrarPaciente(dadosPaciente) {
        const dados = obterDados();

        const nome = String(dadosPaciente.nome || "").trim();

        const email = String(dadosPaciente.email || "").trim();

        if (!nome) {
            throw new Error("Informe o nome do paciente.");
        }

        const paciente = {
            id: gerarId(),
            nome,
            email,
            telefone: String(dadosPaciente.telefone || "").trim(),
            dataCadastro: new Date().toISOString()
        };

        dados.pacientes.push(paciente);

        salvarDados(dados);

        return paciente;
    }

    /* =========================================================
       LISTAR PACIENTES
    ========================================================= */

    function listarPacientes() {
        return obterDados().pacientes;
    }

    /* =========================================================
       BUSCAR PACIENTE
    ========================================================= */

    function buscarPaciente(id) {
        return obterDados().pacientes.find(
            paciente => paciente.id === id
        ) || null;
    }

    /* =========================================================
       EDITAR PACIENTE
    ========================================================= */

    function editarPaciente(id, alteracoes) {
        const dados = obterDados();

        const indice = dados.pacientes.findIndex(
            paciente => paciente.id === id
        );

        if (indice === -1) {
            throw new Error("Paciente não encontrado.");
        }

        dados.pacientes[indice] = {
            ...dados.pacientes[indice],

            nome: alteracoes.nome !== undefined
                ? String(alteracoes.nome).trim()
                : dados.pacientes[indice].nome,

            email: alteracoes.email !== undefined
                ? String(alteracoes.email).trim()
                : dados.pacientes[indice].email,

            telefone: alteracoes.telefone !== undefined
                ? String(alteracoes.telefone).trim()
                : dados.pacientes[indice].telefone
        };

        salvarDados(dados);

        return dados.pacientes[indice];
    }

    /* =========================================================
       EXCLUIR PACIENTE
    ========================================================= */

    function excluirPaciente(id) {
        const dados = obterDados();

        dados.pacientes = dados.pacientes.filter(
            paciente => paciente.id !== id
        );

        dados.planos = dados.planos.filter(
            plano => plano.pacienteId !== id
        );

        dados.avaliacoes = dados.avaliacoes.filter(
            avaliacao => avaliacao.pacienteId !== id
        );

        dados.consultas = dados.consultas.filter(
            consulta => consulta.pacienteId !== id
        );

        salvarDados(dados);
    }

    /* =========================================================
       CADASTRAR PLANO ALIMENTAR
    ========================================================= */

    function cadastrarPlano(plano) {
        const dados = obterDados();

        if (!dados.pacientes.some(
            paciente => paciente.id === plano.pacienteId
        )) {
            throw new Error("Selecione um paciente cadastrado.");
        }

        if (!String(plano.nome || "").trim()) {
            throw new Error("Informe o nome do plano alimentar.");
        }

        const novoPlano = {
            id: gerarId(),
            pacienteId: plano.pacienteId,
            nome: String(plano.nome).trim(),
            descricao: String(plano.descricao || "").trim(),
            dataCadastro: new Date().toISOString()
        };

        dados.planos.push(novoPlano);

        salvarDados(dados);

        return novoPlano;
    }

    /* =========================================================
       CADASTRAR AVALIAÇÃO
    ========================================================= */

    function cadastrarAvaliacao(avaliacao) {
        const dados = obterDados();

        if (!dados.pacientes.some(
            paciente => paciente.id === avaliacao.pacienteId
        )) {
            throw new Error("Selecione um paciente cadastrado.");
        }

        const novaAvaliacao = {
            id: gerarId(),
            pacienteId: avaliacao.pacienteId,
            peso: Number(avaliacao.peso) || null,
            altura: Number(avaliacao.altura) || null,
            observacoes: String(avaliacao.observacoes || "").trim(),
            data: avaliacao.data || new Date().toISOString()
        };

        dados.avaliacoes.push(novaAvaliacao);

        salvarDados(dados);

        return novaAvaliacao;
    }

    /* =========================================================
       CADASTRAR CONSULTA
    ========================================================= */

    function cadastrarConsulta(consulta) {
        const dados = obterDados();

        if (!dados.pacientes.some(
            paciente => paciente.id === consulta.pacienteId
        )) {
            throw new Error("Selecione um paciente cadastrado.");
        }

        if (!consulta.data || !consulta.horario) {
            throw new Error("Informe a data e o horário da consulta.");
        }

        const novaConsulta = {
            id: gerarId(),
            pacienteId: consulta.pacienteId,
            data: consulta.data,
            horario: consulta.horario,
            tipo: String(consulta.tipo || "Consulta").trim(),
            status: "Agendada"
        };

        dados.consultas.push(novaConsulta);

        salvarDados(dados);

        return novaConsulta;
    }

    /* =========================================================
       LISTAR PLANOS
    ========================================================= */

    function listarPlanos() {
        return obterDados().planos;
    }

    /* =========================================================
       LISTAR AVALIAÇÕES
    ========================================================= */

    function listarAvaliacoes() {
        return obterDados().avaliacoes;
    }

    /* =========================================================
       LISTAR CONSULTAS
    ========================================================= */

    function listarConsultas() {
        return obterDados().consultas;
    }

    /* =========================================================
       OBTER RESUMO
    ========================================================= */

    function obterResumo() {
        const dados = obterDados();

        return {
            totalPacientes: dados.pacientes.length,
            totalPlanos: dados.planos.length,
            totalAvaliacoes: dados.avaliacoes.length,
            totalConsultas: dados.consultas.length,

            pacientes: dados.pacientes,
            planos: dados.planos,
            avaliacoes: dados.avaliacoes,
            consultas: dados.consultas
        };
    }

    /* =========================================================
       DISPONIBILIZAR FUNÇÕES PARA AS OUTRAS PÁGINAS
    ========================================================= */

    window.NutriqDados = {
        cadastrarPaciente,
        listarPacientes,
        buscarPaciente,
        editarPaciente,
        excluirPaciente,

        cadastrarPlano,
        listarPlanos,

        cadastrarAvaliacao,
        listarAvaliacoes,

        cadastrarConsulta,
        listarConsultas,

        obterResumo
    };
})();
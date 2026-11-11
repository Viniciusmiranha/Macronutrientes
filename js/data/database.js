"use strict";

(() => {
    const CHAVE_NUTRIQ = "nutriq_dados_v1";

    function listaDeRegistros(valor) {
        return Array.isArray(valor)
            ? valor.filter(registro =>
                registro && typeof registro === "object" && !Array.isArray(registro)
            )
            : [];
    }

    function obterDados() {
        try {
            const dados = JSON.parse(
                localStorage.getItem(CHAVE_NUTRIQ)
            );

            return {
                pacientes: listaDeRegistros(dados?.pacientes),
                planos: listaDeRegistros(dados?.planos),
                avaliacoes: listaDeRegistros(dados?.avaliacoes),
                consultas: listaDeRegistros(dados?.consultas)
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

function listarPacientes() {
        return obterDados().pacientes;
    }

function buscarPaciente(id) {
        return obterDados().pacientes.find(
            paciente => paciente.id === id
        ) || null;
    }

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

function cadastrarConsulta(consulta) {
        const dados = obterDados();

        if (!dados.pacientes.some(
            paciente => paciente.id === consulta.pacienteId
        )) {
            throw new Error("Selecione um paciente cadastrado.");
        }

        function instanteConsulta(data, horario) {
            const partesData = String(data || "").split("-").map(Number);
            const partesHora = String(horario || "").match(/^(?:([01]\d|2[0-3])):([0-5]\d)$/);
            if (partesData.length !== 3 || !partesHora || partesData.some(parte => !parte)) return null;
            const dataHora = new Date(partesData[0], partesData[1] - 1, partesData[2], Number(partesHora[1]), Number(partesHora[2]));
            if (dataHora.getFullYear() !== partesData[0] || dataHora.getMonth() !== partesData[1] - 1 || dataHora.getDate() !== partesData[2]) return null;
            return dataHora.getTime();
        }

        const instante = instanteConsulta(consulta.data, consulta.horario);
        if (instante == null) {
            throw new Error("Informe a data e o horário da consulta.");
        }

        const conflito = dados.consultas.some(item => {
            if (String(item.status || "").toLowerCase() === "cancelada") return false;
            const existente = instanteConsulta(item.data, item.horario || item.hora);
            return existente != null && Math.abs(instante - existente) < 30 * 60 * 1000;
        });
        if (conflito) {
            throw new Error("Respeite o intervalo mínimo de 30 minutos entre consultas.");
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

function listarPlanos() {
        return obterDados().planos;
    }

function listarAvaliacoes() {
        return obterDados().avaliacoes;
    }

function listarConsultas() {
        return obterDados().consultas;
    }

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

function calcularTaxaAdesao(pacientes, consultas, avaliacoes) {
    const agora = Date.now();
    const limite = new Date();
    limite.setDate(limite.getDate() - 60);
    limite.setHours(0, 0, 0, 0);
    const limiteMs = limite.getTime();
    const acompanhamentos = new Map();

    function instanteDaData(valor) {
        const partes = String(valor || "").split("T")[0]
            .match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (!partes) return null;
        const data = new Date(Number(partes[1]), Number(partes[2]) - 1, Number(partes[3]));
        if (
            data.getFullYear() !== Number(partes[1]) ||
            data.getMonth() !== Number(partes[2]) - 1 ||
            data.getDate() !== Number(partes[3])
        ) return null;
        return data.getTime();
    }

    (avaliacoes || []).forEach(avaliacao => {
        if (!avaliacao || !avaliacao.pacienteId) return;
        const instante = instanteDaData(avaliacao.data);
        if (instante != null && instante >= limiteMs) {
            acompanhamentos.set(avaliacao.pacienteId, true);
        }
    });

    (consultas || []).forEach(consulta => {
        if (!consulta || !consulta.pacienteId) return;
        const status = String(consulta.status || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim();
        if (status !== "realizada" && status !== "agendada") return;

        const instanteDia = instanteDaData(consulta.data);
        const partesHora = String(consulta.hora || consulta.horario || "00:00")
            .match(/^(?:([01]\d|2[0-3])):([0-5]\d)$/);
        if (instanteDia == null || !partesHora) return;
        const data = new Date(instanteDia);
        data.setHours(Number(partesHora[1]), Number(partesHora[2]));
        const instante = data.getTime();
        if (
            (status === "realizada" && instante >= limiteMs && instante <= agora) ||
            (status === "agendada" && instante >= agora)
        ) {
            acompanhamentos.set(consulta.pacienteId, true);
        }
    });

    const ativos = (pacientes || []).filter(paciente => {
        const status = String(paciente.status || "ativo")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim();
        return !["inativo", "alta"].includes(status);
    });

    if (!ativos.length) return null;

    const acompanhados = ativos.filter(paciente =>
        acompanhamentos.has(paciente.id) ||
        (paciente.avaliacoes || []).some(avaliacao => {
            const instante = instanteDaData(avaliacao.data);
            return instante != null && instante >= limiteMs;
        })
    ).length;

    return Math.round(acompanhados / ativos.length * 100);
}

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

        calcularTaxaAdesao,
        obterResumo
    };
})();

/* =====================================================
   NUTRIQ · Meus pacientes (js/pacientes.js)
   Renderiza estatísticas, lista e busca.

   >>> Ajuste apenas obterPacientes() para ler do seu
       js/database.js (ou do local onde você salva). <<<

   Formato esperado de cada paciente:
   { id, nome, email, telefone, objetivo, status, criadoEm }
   status: "ativo" | "inativo" | "alta"
===================================================== */

(function () {
    "use strict";

    function obterPacientes() {
        try {
            const dados = JSON.parse(localStorage.getItem("nutriq_pacientes") || "[]");
            return Array.isArray(dados) ? dados : [];
        } catch (erro) {
            return [];
        }
    }

    const el = {
        total: document.getElementById("statTotal"),
        ativos: document.getElementById("statAtivos"),
        novos: document.getElementById("statNovos"),
        alta: document.getElementById("statAlta"),
        vazio: document.getElementById("pacEmpty"),
        semResultado: document.getElementById("pacNoResults"),
        tabelaWrap: document.getElementById("pacTableWrap"),
        lista: document.getElementById("listaPacientes"),
        busca: document.getElementById("campoBusca"),
        formBusca: document.getElementById("dashboardSearch")
    };

    function escapar(texto) {
        const div = document.createElement("div");
        div.textContent = texto == null ? "" : String(texto);
        return div.innerHTML;
    }

    function iniciais(nome) {
        const partes = String(nome || "?").trim().split(/\s+/);
        const primeira = partes[0] ? partes[0][0] : "?";
        const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
        return (primeira + ultima).toUpperCase();
    }

    function rotuloStatus(status) {
        if (status === "alta") return { texto: "Alta", classe: "pac-badge pac-badge-off" };
        if (status === "inativo") return { texto: "Inativo", classe: "pac-badge pac-badge-off" };
        return { texto: "Ativo", classe: "pac-badge" };
    }

    function atualizarEstatisticas(pacientes) {
        const agora = new Date();
        const novosNoMes = pacientes.filter(function (p) {
            const data = new Date(p.criadoEm);
            return !isNaN(data) &&
                data.getMonth() === agora.getMonth() &&
                data.getFullYear() === agora.getFullYear();
        }).length;

        el.total.textContent = pacientes.length;
        el.ativos.textContent = pacientes.filter(function (p) {
            return (p.status || "ativo") === "ativo";
        }).length;
        el.novos.textContent = novosNoMes;
        el.alta.textContent = pacientes.filter(function (p) {
            return p.status === "alta";
        }).length;
    }

    function renderizar(pacientes, termoBusca) {
        const termo = (termoBusca || "").trim().toLowerCase();
        const filtrados = termo
            ? pacientes.filter(function (p) {
                return String(p.nome || "").toLowerCase().includes(termo);
            })
            : pacientes;

        const temPacientes = pacientes.length > 0;
        el.vazio.hidden = temPacientes;
        el.semResultado.hidden = !(temPacientes && filtrados.length === 0);
        el.tabelaWrap.hidden = filtrados.length === 0;

        el.lista.innerHTML = filtrados.map(function (p) {
            const status = rotuloStatus(p.status);
            const contato = p.telefone || p.email || "—";
            return (
                "<tr>" +
                    '<td><div class="pac-person">' +
                        '<span class="pac-person-avatar" aria-hidden="true">' + escapar(iniciais(p.nome)) + "</span>" +
                        "<div><strong>" + escapar(p.nome) + "</strong>" +
                        (p.email ? "<small>" + escapar(p.email) + "</small>" : "") +
                        "</div></div></td>" +
                    "<td>" + escapar(contato) + "</td>" +
                    "<td>" + escapar(p.objetivo || "—") + "</td>" +
                    '<td><span class="' + status.classe + '">' + status.texto + "</span></td>" +
                    '<td><a class="pac-row-link" href="paciente.html?id=' + encodeURIComponent(p.id) + '">Ver ficha</a></td>' +
                "</tr>"
            );
        }).join("");
    }

    function iniciar() {
        const pacientes = obterPacientes();
        atualizarEstatisticas(pacientes);
        renderizar(pacientes, "");

        if (el.busca) {
            el.busca.addEventListener("input", function () {
                renderizar(pacientes, el.busca.value);
            });
        }
        if (el.formBusca) {
            el.formBusca.addEventListener("submit", function (evento) {
                evento.preventDefault();
            });
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", iniciar);
    } else {
        iniciar();
    }
})();
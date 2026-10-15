
"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const abas = document.querySelectorAll(".calculadora-tab");
    const paineis = document.querySelectorAll(".calculadora-panel");

    function mostrarCalculadora(nome) {
        abas.forEach((aba) => {
            const ativa = aba.dataset.calculadora === nome;
            aba.classList.toggle("active", ativa);
            aba.setAttribute("aria-selected", String(ativa));
        });

        paineis.forEach((painel) => {
            const ativo = painel.id === `painel-${nome}`;
            painel.classList.toggle("active", ativo);
            painel.hidden = !ativo;
        });

        if (window.history.replaceState) {
            window.history.replaceState(null, "", `#${nome}`);
        }
    }

    abas.forEach((aba) => {
        aba.addEventListener("click", () => {
            mostrarCalculadora(aba.dataset.calculadora);
        });
    });

    const calculadoraInicial = window.location.hash.replace("#", "");
    const calculadorasDisponiveis = ["macros", "imc", "agua"];

    mostrarCalculadora(
        calculadorasDisponiveis.includes(calculadoraInicial)
            ? calculadoraInicial
            : "macros"
    );

    function numero(id) {
        const campo = document.getElementById(id);
        if (!campo) return NaN;

        return Number(campo.value);
    }

    function formatarNumero(valor, casas = 0) {
        return valor.toLocaleString("pt-BR", {
            minimumFractionDigits: casas,
            maximumFractionDigits: casas
        });
    }

    function mostrarResultado(id) {
        const elemento = document.getElementById(id);
        if (elemento) elemento.hidden = false;
    }

    function esconderResultado(id) {
        const elemento = document.getElementById(id);
        if (elemento) elemento.hidden = true;
    }

    function preencher(id, valor) {
        const elemento = document.getElementById(id);
        if (elemento) elemento.textContent = valor;
    }

    const macroForm = document.getElementById("macroForm");

    if (macroForm) {
        macroForm.addEventListener("submit", (evento) => {
            evento.preventDefault();

            if (!macroForm.reportValidity()) return;

            const sexo = document.getElementById("macro-sexo").value;
            const idade = numero("macro-idade");
            const peso = numero("macro-peso");
            const altura = numero("macro-altura");
            const atividade = numero("macro-atividade");
            const objetivo = document.getElementById("macro-objetivo").value;

            if (
                !Number.isFinite(idade) ||
                !Number.isFinite(peso) ||
                !Number.isFinite(altura) ||
                idade < 18 ||
                idade > 120 ||
                peso <= 0 ||
                altura < 50 ||
                altura > 250 ||
                atividade <= 0
            ) {
                alert("Confira os dados informados.");
                return;
            }

            const ajusteSexo = sexo === "masculino" ? 5 : -161;

            const tmb =
                10 * peso +
                6.25 * altura -
                5 * idade +
                ajusteSexo;

            const gastoDiario = tmb * atividade;

            let calorias;

            if (objetivo === "emagrecer") {
                calorias = gastoDiario * 0.8;
            } else if (objetivo === "ganhar") {
                calorias = gastoDiario * 1.1;
            } else {
                calorias = gastoDiario;
            }

            const fatorProteina = objetivo === "manter" ? 1.8 : 2.0;
            const proteinas = peso * fatorProteina;
            const gorduras = peso * 0.8;

            const caloriasProteinas = proteinas * 4;
            const caloriasGorduras = gorduras * 9;

            const caloriasCarboidratos =
                calorias - caloriasProteinas - caloriasGorduras;

            const carboidratos = Math.max(0, caloriasCarboidratos / 4);

            preencher("macro-calorias", `${formatarNumero(Math.round(calorias))} kcal`);
            preencher("macro-proteinas", `${formatarNumero(Math.round(proteinas))} g`);
            preencher("macro-carboidratos", `${formatarNumero(Math.round(carboidratos))} g`);
            preencher("macro-gorduras", `${formatarNumero(Math.round(gorduras))} g`);

            preencher("macro-proteinas-kcal", `${formatarNumero(Math.round(caloriasProteinas))} kcal`);
            preencher("macro-carboidratos-kcal", `${formatarNumero(Math.round(carboidratos * 4))} kcal`);
            preencher("macro-gorduras-kcal", `${formatarNumero(Math.round(caloriasGorduras))} kcal`);

            mostrarResultado("resultadoMacros");
        });
    }

    const imcForm = document.getElementById("imcForm");

    if (imcForm) {
        imcForm.addEventListener("submit", (evento) => {
            evento.preventDefault();

            if (!imcForm.reportValidity()) return;

            const peso = numero("imc-peso");
            const alturaCm = numero("imc-altura");

            if (
                !Number.isFinite(peso) ||
                !Number.isFinite(alturaCm) ||
                peso <= 0 ||
                alturaCm < 50 ||
                alturaCm > 250
            ) {
                alert("Informe um peso e uma altura válidos.");
                return;
            }

            const altura = alturaCm / 100;
            const imc = peso / (altura * altura);

            let classificacao;

            if (imc < 18.5) {
                classificacao = "Abaixo do peso";
            } else if (imc < 25) {
                classificacao = "Peso normal";
            } else if (imc < 30) {
                classificacao = "Sobrepeso";
            } else if (imc < 35) {
                classificacao = "Obesidade grau I";
            } else if (imc < 40) {
                classificacao = "Obesidade grau II";
            } else {
                classificacao = "Obesidade grau III";
            }

            preencher("imc-valor", formatarNumero(imc, 1));
            preencher("imc-classificacao", classificacao);
            preencher(
                "imc-mensagem",
                "O IMC é um indicador de triagem e deve ser interpretado junto com outros dados clínicos."
            );

            mostrarResultado("resultadoIMC");
        });
    }

    const aguaForm = document.getElementById("aguaForm");

    if (aguaForm) {
        aguaForm.addEventListener("submit", (evento) => {
            evento.preventDefault();

            if (!aguaForm.reportValidity()) return;

            const peso = numero("aguaPeso");
            const atividade = numero("aguaAtividade");
            const clima = numero("aguaClima");

            if (!Number.isFinite(peso) || peso <= 0 || peso > 500) {
                alert("Informe um peso válido.");
                return;
            }

            const aguaBase = peso * 35;
            const aguaTotalMl = aguaBase + atividade + clima;
            const aguaLitros = aguaTotalMl / 1000;

            preencher("aguaResultado", `${formatarNumero(aguaLitros, 2)} L`);

            mostrarResultado("aguaResult");
        });
    }

    const menuToggle = document.getElementById("dashboardMenuToggle");
    const overlay = document.getElementById("sidebarOverlay");

    function fecharMenu() {
        document.body.classList.remove("menu-open");

        if (menuToggle) {
            menuToggle.setAttribute("aria-expanded", "false");
        }
    }

    function alternarMenu() {
        const aberto = document.body.classList.toggle("menu-open");

        if (menuToggle) {
            menuToggle.setAttribute("aria-expanded", String(aberto));
        }
    }

    if (menuToggle) {
        menuToggle.addEventListener("click", alternarMenu);
    }

    if (overlay) {
        overlay.addEventListener("click", fecharMenu);
    }

    document.addEventListener("keydown", (evento) => {
        if (evento.key === "Escape") {
            fecharMenu();
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 650) {
            fecharMenu();
        }
    });
});

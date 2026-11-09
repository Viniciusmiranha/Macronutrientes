
"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const campos = document.getElementById("camposCalculadora");
    const formulario = document.getElementById("formCalculadora");
    const titulo = document.getElementById("tituloCalculadora");
    const descricao = document.getElementById("descricaoCalculadora");
    const icone = document.getElementById("iconeCalculadora");
    const painel = document.getElementById("painelCalculadora");
    const erro = document.getElementById("erroCalculadora");
    const estadoInicial = document.getElementById("estadoInicial");
    const resultado = document.getElementById("resultadoCalculadora");
    const resultadoCards = document.getElementById("resultadoCards");
    const resultadoDetalhes = document.getElementById("resultadoDetalhes");
    const subtituloResultados = document.getElementById("subtituloResultados");
    const tituloResultados = document.getElementById("tituloResultados");
    const listaBeneficios = document.getElementById("listaBeneficios");
    const botaoCalcular = document.getElementById("btnCalcular");
    const botaoLimpar = document.getElementById("btnLimparResultado");
    const abas = [...document.querySelectorAll(".calculadora-tab")];

    let tipoAtual = "macros";

    const configuracoes = {
        macros: {
            titulo: "Calculadora de Macronutrientes",
            descricao: "Calcule a quantidade ideal de proteínas, carboidratos e gorduras de acordo com os objetivos e características do seu paciente.",
            icone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 7 5 5m2 0 5-5m-6 7-5 5m8-5 3 5"/><circle cx="5" cy="6" r="2"/><circle cx="18" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="20" r="2"/></svg>',
            botao: "Calcular macronutrientes",
            beneficios: [
                "Necessidade calórica diária",
                "Quantidade de proteínas (g)",
                "Quantidade de carboidratos (g)",
                "Quantidade de gorduras (g)",
                "Distribuição em percentual (%)"
            ],
            campos: `
                <div class="calculadora-field">
                    <label for="sexo">Sexo</label>
                    <select id="sexo" name="sexo" required>
                        <option value="">Selecione</option>
                        <option value="masculino">Masculino</option>
                        <option value="feminino">Feminino</option>
                    </select>
                </div>
                <div class="calculadora-field">
                    <label for="idade">Idade (anos)</label>
                    <input id="idade" name="idade" type="number" min="18" max="120" placeholder="Ex.: 30" required>
                </div>
                <div class="calculadora-field">
                    <label for="peso">Peso (kg)</label>
                    <input id="peso" name="peso" type="number" min="1" max="500" step="0.1" placeholder="Ex.: 70" required>
                </div>
                <div class="calculadora-field">
                    <label for="altura">Altura (cm)</label>
                    <input id="altura" name="altura" type="number" min="50" max="250" step="0.1" placeholder="Ex.: 170" required>
                </div>
                <div class="calculadora-field">
                    <label for="atividade">Nível de atividade física</label>
                    <select id="atividade" name="atividade" required>
                        <option value="">Selecione</option>
                        <option value="1.2">Sedentário</option>
                        <option value="1.375">Levemente ativo</option>
                        <option value="1.55">Moderadamente ativo</option>
                        <option value="1.725">Muito ativo</option>
                        <option value="1.9">Extremamente ativo</option>
                    </select>
                </div>
                <div class="calculadora-field">
                    <label for="objetivo">Objetivo</label>
                    <select id="objetivo" name="objetivo" required>
                        <option value="">Selecione</option>
                        <option value="emagrecer">Emagrecer</option>
                        <option value="manter">Manter peso</option>
                        <option value="ganhar">Ganhar massa muscular</option>
                    </select>
                </div>
            `
        },
        imc: {
            titulo: "Calculadora de IMC",
            descricao: "Calcule o Índice de Massa Corporal e consulte a classificação correspondente para adultos.",
            icone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v3m-7 0h14M5 6l-3 6h6L5 6Zm14 0-3 6h6l-3-6ZM8 12a3 3 0 0 0 6 0m-6 0a3 3 0 0 1 6 0m-2 3v5m-5 1h10"/></svg>',
            botao: "Calcular IMC",
            beneficios: [
                "Índice de Massa Corporal",
                "Classificação do IMC",
                "Peso informado",
                "Altura informada"
            ],
            campos: `
                <div class="calculadora-field">
                    <label for="peso">Peso (kg)</label>
                    <input id="peso" name="peso" type="number" min="1" max="500" step="0.1" placeholder="Ex.: 70" required>
                </div>
                <div class="calculadora-field">
                    <label for="altura">Altura (cm)</label>
                    <input id="altura" name="altura" type="number" min="50" max="250" step="0.1" placeholder="Ex.: 170" required>
                </div>
            `
        },
        agua: {
            titulo: "Calculadora de Quantidade de Água",
            descricao: "Estime a ingestão diária de água considerando o peso, a atividade física e as condições climáticas.",
            icone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3s7 7.2 7 12a7 7 0 1 1-14 0c0-4.8 7-12 7-12Z"/><path d="M9 16a3 3 0 0 0 3 3"/></svg>',
            botao: "Calcular quantidade de água",
            beneficios: [
                "Estimativa diária de água",
                "Quantidade em litros",
                "Estimativa por peso corporal",
                "Ajustes conforme as condições informadas"
            ],
            campos: `
                <div class="calculadora-field">
                    <label for="peso">Peso (kg)</label>
                    <input id="peso" name="peso" type="number" min="1" max="500" step="0.1" placeholder="Ex.: 70" required>
                </div>
                <div class="calculadora-field">
                    <label for="atividadeAgua">Nível de atividade física</label>
                    <select id="atividadeAgua" name="atividadeAgua" required>
                        <option value="">Selecione</option>
                        <option value="0">Baixa</option>
                        <option value="350">Moderada</option>
                        <option value="700">Alta</option>
                    </select>
                    <small>Ajuste estimado em mL por dia.</small>
                </div>
                <div class="calculadora-field">
                    <label for="clima">Condição climática</label>
                    <select id="clima" name="clima" required>
                        <option value="">Selecione</option>
                        <option value="0">Ameno</option>
                        <option value="300">Quente</option>
                        <option value="500">Muito quente</option>
                    </select>
                    <small>Ajuste estimado em mL por dia.</small>
                </div>
            `
        }
    };

    function numero(id) {
        const elemento = document.getElementById(id);
        if (!elemento) return NaN;

        return Number(String(elemento.value).replace(",", "."));
    }

    function formatar(valor, casas = 0) {
        return Number(valor).toLocaleString("pt-BR", {
            minimumFractionDigits: casas,
            maximumFractionDigits: casas
        });
    }

    function mostrarErro(mensagem) {
        erro.textContent = mensagem;
        erro.hidden = false;
    }

    function limparErro() {
        erro.textContent = "";
        erro.hidden = true;
    }

    function limparResultado() {
        resultado.hidden = true;
        estadoInicial.hidden = false;
        resultadoCards.replaceChildren();
        resultadoDetalhes.replaceChildren();
        limparErro();
    }

    function trocarCalculadora(tipo) {
        if (!configuracoes[tipo]) return;

        tipoAtual = tipo;
        const config = configuracoes[tipo];

        abas.forEach(aba => {
            const ativa = aba.dataset.calculadora === tipo;
            aba.classList.toggle("active", ativa);
            aba.setAttribute("aria-selected", String(ativa));
            aba.tabIndex = ativa ? 0 : -1;
        });

        painel.setAttribute(
            "aria-labelledby",
            tipo === "macros" ? "tabMacros" : tipo === "imc" ? "tabIMC" : "tabAgua"
        );

        titulo.textContent = config.titulo;
        descricao.textContent = config.descricao;
        icone.innerHTML = config.icone;
        campos.innerHTML = config.campos;
        botaoCalcular.textContent = config.botao;

        if (listaBeneficios) {
            listaBeneficios.replaceChildren();

            config.beneficios.forEach(texto => {
                const item = document.createElement("li");
                item.textContent = texto;
                listaBeneficios.appendChild(item);
            });
        }

        limparResultado();
    }

    function validarDados(ids) {
        for (const id of ids) {
            const elemento = document.getElementById(id);

            if (!elemento || !elemento.value.trim()) {
                if (elemento) elemento.focus();
                mostrarErro("Preencha todos os campos antes de calcular.");
                return false;
            }

            if (elemento.type === "number") {
                const valor = numero(id);
                const minimo = elemento.min === "" ? -Infinity : Number(elemento.min);
                const maximo = elemento.max === "" ? Infinity : Number(elemento.max);

                if (!Number.isFinite(valor) || valor < minimo || valor > maximo) {
                    elemento.focus();
                    mostrarErro(`Confira o valor informado no campo "${elemento.labels[0]?.textContent || id}".`);
                    return false;
                }
            }
        }

        limparErro();
        return true;
    }

    function criarCard(rotulo, valor, unidade = "", detalhe = "") {
        const card = document.createElement("div");
        card.className = "resultado-card";

        const nome = document.createElement("span");
        nome.textContent = rotulo;

        const numeroResultado = document.createElement("strong");
        numeroResultado.textContent = `${valor}${unidade ? ` ${unidade}` : ""}`;

        card.append(nome, numeroResultado);

        if (detalhe) {
            const complemento = document.createElement("small");
            complemento.textContent = detalhe;
            card.appendChild(complemento);
        }

        resultadoCards.appendChild(card);
    }

    function adicionarDetalhe(texto) {
        const paragrafo = document.createElement("p");
        paragrafo.textContent = texto;
        resultadoDetalhes.appendChild(paragrafo);
    }

    function exibirResultado(subtitulo) {
        estadoInicial.hidden = true;
        resultado.hidden = false;
        tituloResultados.textContent = configuracoes[tipoAtual].titulo;
        subtituloResultados.textContent = subtitulo;
        resultado.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    function calcularMacros() {
        const ids = ["sexo", "idade", "peso", "altura", "atividade", "objetivo"];
        if (!validarDados(ids)) return;

        const sexo = document.getElementById("sexo").value;
        const idade = numero("idade");
        const peso = numero("peso");
        const altura = numero("altura");
        const atividade = numero("atividade");
        const objetivo = document.getElementById("objetivo").value;

        const tmb = 10 * peso + 6.25 * altura - 5 * idade
            + (sexo === "masculino" ? 5 : -161);

        const gasto = tmb * atividade;

        let calorias = gasto;
        let proteinaPorKg = 1.8;

        if (objetivo === "emagrecer") {
            calorias = gasto * 0.8;
            proteinaPorKg = 2;
        } else if (objetivo === "ganhar") {
            calorias = gasto * 1.1;
            proteinaPorKg = 2;
        }

        const proteinas = peso * proteinaPorKg;
        const gorduras = peso * 0.8;
        const carboidratos = Math.max(0, (calorias - proteinas * 4 - gorduras * 9) / 4);

        const caloriasProteina = proteinas * 4;
        const caloriasGordura = gorduras * 9;
        const caloriasCarboidrato = carboidratos * 4;

        criarCard("Meta calórica diária", formatar(calorias), "kcal");
        criarCard("Proteínas", formatar(proteinas), "g", `${formatar(caloriasProteina / calorias * 100)}% das calorias`);
        criarCard("Carboidratos", formatar(carboidratos), "g", `${formatar(caloriasCarboidrato / calorias * 100)}% das calorias`);
        criarCard("Gorduras", formatar(gorduras), "g", `${formatar(caloriasGordura / calorias * 100)}% das calorias`);

        adicionarDetalhe(`Taxa metabólica basal estimada: ${formatar(tmb)} kcal/dia.`);
        adicionarDetalhe(`Gasto energético diário estimado: ${formatar(gasto)} kcal/dia.`);
        adicionarDetalhe(`Objetivo selecionado: ${document.getElementById("objetivo").selectedOptions[0].textContent}.`);

        exibirResultado("Estimativas calculadas com base nos dados informados.");
    }

    function calcularIMC() {
        if (!validarDados(["peso", "altura"])) return;

        const peso = numero("peso");
        const alturaCm = numero("altura");
        const alturaM = alturaCm / 100;
        const imc = peso / (alturaM * alturaM);

        let classificacao;

        if (imc < 18.5) classificacao = "Abaixo do peso";
        else if (imc < 25) classificacao = "Peso normal";
        else if (imc < 30) classificacao = "Sobrepeso";
        else if (imc < 35) classificacao = "Obesidade grau I";
        else if (imc < 40) classificacao = "Obesidade grau II";
        else classificacao = "Obesidade grau III";

        criarCard("Índice de Massa Corporal", formatar(imc, 1), "kg/m²");
        criarCard("Classificação", classificacao);
        criarCard("Peso informado", formatar(peso, 1), "kg");
        criarCard("Altura informada", formatar(alturaCm, 1), "cm");

        adicionarDetalhe("A classificação utiliza faixas de referência para adultos.");
        adicionarDetalhe("O IMC é um indicador de triagem e não avalia, sozinho, a composição corporal ou o estado de saúde.");

        exibirResultado("Resultado estimado para adultos.");
    }

    function calcularAgua() {
        if (!validarDados(["peso", "atividadeAgua", "clima"])) return;

        const peso = numero("peso");
        const atividade = numero("atividadeAgua");
        const clima = numero("clima");

        const baseMl = peso * 35;
        const totalMl = baseMl + atividade + clima;
        const litros = totalMl / 1000;

        criarCard("Estimativa diária", formatar(litros, 2), "L");
        criarCard("Quantidade estimada", formatar(totalMl), "mL/dia");
        criarCard("Estimativa por peso", formatar(baseMl), "mL/dia");
        criarCard("Peso informado", formatar(peso, 1), "kg");

        adicionarDetalhe(`A estimativa-base utilizada foi de 35 mL por kg de peso corporal.`);
        adicionarDetalhe(`Ajustes adicionados conforme os campos selecionados: ${formatar(atividade + clima)} mL/dia.`);
        adicionarDetalhe("As necessidades variam conforme saúde, alimentação, suor, medicamentos e outras condições. Este cálculo não substitui orientação individual.");

        exibirResultado("Estimativa geral, não uma prescrição individual de hidratação.");
    }

    abas.forEach((aba, indice) => {
        aba.addEventListener("click", () => trocarCalculadora(aba.dataset.calculadora));

        aba.addEventListener("keydown", evento => {
            if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(evento.key)) return;
            evento.preventDefault();

            let proximo = indice;

            if (evento.key === "ArrowRight") proximo = (indice + 1) % abas.length;
            if (evento.key === "ArrowLeft") proximo = (indice - 1 + abas.length) % abas.length;
            if (evento.key === "Home") proximo = 0;
            if (evento.key === "End") proximo = abas.length - 1;

            abas[proximo].focus();
            trocarCalculadora(abas[proximo].dataset.calculadora);
        });
    });

    formulario.addEventListener("submit", evento => {
        evento.preventDefault();
        limparErro();
        resultadoCards.replaceChildren();
        resultadoDetalhes.replaceChildren();

        if (tipoAtual === "macros") calcularMacros();
        if (tipoAtual === "imc") calcularIMC();
        if (tipoAtual === "agua") calcularAgua();
    });

    botaoLimpar.addEventListener("click", limparResultado);

    trocarCalculadora("macros");
});

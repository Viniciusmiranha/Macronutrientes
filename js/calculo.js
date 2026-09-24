/* =========================================================
   NUTRIQ - CALCULADORA NUTRICIONAL
   IMC + ÁGUA + MACRONUTRIENTES
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       ELEMENTOS PRINCIPAIS
    ===================================================== */

    const formularioMacros = document.querySelector(".macro-form form");
    const formularioIMC = document.querySelector(".imc-form form");

    const macroForm = document.getElementById("macroForm");
    const imcForm = document.getElementById("imcForm");
    const aguaForm = document.getElementById("aguaForm");

    const tabMacros = document.getElementById("tabMacros");
    const tabIMC = document.getElementById("tabIMC");
    const tabAgua = document.getElementById("tabAgua");


    /* =====================================================
       TABELA DE NÍVEL DE ATIVIDADE
    ===================================================== */

    const fatoresAtividade = {
        sedentario: 1.20,
        leve: 1.375,
        moderado: 1.55,
        ativo: 1.725,
        atleta: 1.90
    };


    /* =====================================================
       FUNÇÃO PARA CONVERTER NÚMEROS
       Aceita 70.5 e também 70,5
    ===================================================== */

    function converterNumero(valor) {

        if (typeof valor !== "string") {
            return Number(valor);
        }

        valor = valor.trim().replace(",", ".");

        return Number(valor);
    }


    /* =====================================================
       FUNÇÃO PARA ARREDONDAR
    ===================================================== */

    function arredondar(numero) {

        return Math.round(numero);

    }


    /* =====================================================
       CONTROLE DAS ABAS
    ===================================================== */

    function mostrarAba(aba) {

        /* Esconde todas as áreas */

        if (macroForm) {
            macroForm.style.display = "none";
        }

        if (imcForm) {
            imcForm.style.display = "none";
        }

        if (aguaForm) {
            aguaForm.style.display = "none";
        }


        /* Remove active de todas as abas */

        if (tabMacros) {
            tabMacros.classList.remove("active");
        }

        if (tabIMC) {
            tabIMC.classList.remove("active");
        }

        if (tabAgua) {
            tabAgua.classList.remove("active");
        }


        /* Mostra a aba selecionada */

        if (aba === "macros") {

            if (macroForm) {
                macroForm.style.display = "block";
            }

            if (tabMacros) {
                tabMacros.classList.add("active");
            }

        }


        else if (aba === "imc") {

            if (imcForm) {
                imcForm.style.display = "block";
            }

            if (tabIMC) {
                tabIMC.classList.add("active");
            }

        }


        else if (aba === "agua") {

            if (aguaForm) {
                aguaForm.style.display = "block";
            }

            if (tabAgua) {
                tabAgua.classList.add("active");
            }

        }

    }


    /* =====================================================
       EVENTOS DAS ABAS
    ===================================================== */

    if (tabMacros) {

        tabMacros.addEventListener("click", function () {

            mostrarAba("macros");

        });

    }


    if (tabIMC) {

        tabIMC.addEventListener("click", function () {

            mostrarAba("imc");

        });

    }


    if (tabAgua) {

        tabAgua.addEventListener("click", function () {

            mostrarAba("agua");

        });

    }


    /* =====================================================
       ABA INICIAL
    ===================================================== */

    mostrarAba("macros");


    /* =====================================================
       CÁLCULO DO IMC
    ===================================================== */

    function calcularIMC(peso, altura) {

        /*
            O usuário informa a altura em centímetros.

            Exemplo:
            175 cm

            Convertendo:
            175 / 100 = 1.75 metros
        */

        const alturaMetros = altura / 100;


        /*
            Fórmula:

            IMC = peso / altura²
        */

        const imc =
            peso / (alturaMetros * alturaMetros);


        return imc;

    }


    /* =====================================================
       CLASSIFICAÇÃO DO IMC
    ===================================================== */

    function classificarIMC(imc) {

        if (imc < 18.5) {

            return "Abaixo do peso";

        }


        if (imc < 25) {

            return "Peso normal";

        }


        if (imc < 30) {

            return "Sobrepeso";

        }


        if (imc < 35) {

            return "Obesidade grau I";

        }


        if (imc < 40) {

            return "Obesidade grau II";

        }


        return "Obesidade grau III";

    }


    /* =====================================================
       FORMULÁRIO DO IMC
    ===================================================== */

    if (formularioIMC) {

        formularioIMC.addEventListener("submit", function (event) {

            event.preventDefault();


            /* ---------------------------------------------
               PEGAR CAMPOS
            --------------------------------------------- */

            const campoPeso =
                document.getElementById("imc-peso");

            const campoAltura =
                document.getElementById("imc-altura");


            if (!campoPeso || !campoAltura) {

                alert("Erro: campos do IMC não encontrados.");

                return;

            }


            /* ---------------------------------------------
               CONVERTER VALORES
            --------------------------------------------- */

            const peso =
                converterNumero(campoPeso.value);


            const altura =
                converterNumero(campoAltura.value);


            /* ---------------------------------------------
               VALIDAR PESO
            --------------------------------------------- */

            if (!Number.isFinite(peso) || peso <= 0) {

                alert("Informe um peso válido.");

                campoPeso.focus();

                return;

            }


            /* ---------------------------------------------
               VALIDAR ALTURA
            --------------------------------------------- */

            if (!Number.isFinite(altura) || altura <= 0) {

                alert("Informe uma altura válida em centímetros.");

                campoAltura.focus();

                return;

            }


            /*
                Evita uma altura absurda.
                50 cm até 250 cm.
            */

            if (altura < 50 || altura > 250) {

                alert("Informe uma altura válida entre 50 cm e 250 cm.");

                campoAltura.focus();

                return;

            }


            /* ---------------------------------------------
               CALCULAR IMC
            --------------------------------------------- */

            const imc =
                calcularIMC(
                    peso,
                    altura
                );


            /* ---------------------------------------------
               CLASSIFICAR
            --------------------------------------------- */

            const classificacao =
                classificarIMC(imc);


            /* ---------------------------------------------
               MOSTRAR RESULTADO
            --------------------------------------------- */

            mostrarResultadoIMC(
                imc,
                classificacao
            );

        });

    }


    /* =====================================================
       MOSTRAR RESULTADO DO IMC
    ===================================================== */

    function mostrarResultadoIMC(
        imc,
        classificacao
    ) {

        let resultado =
            document.getElementById("resultadoIMC");


        /*
            Se o resultado ainda não existir,
            cria automaticamente.
        */

        if (!resultado) {

            resultado =
                document.createElement("div");

            resultado.id =
                "resultadoIMC";

            resultado.className =
                "resultado-imc";


            /*
                Coloca o resultado depois do formulário.
            */

            formularioIMC.after(resultado);

        }


        resultado.innerHTML = `

            <div class="resultado-header">

                <h3>
                    Seu IMC
                </h3>

            </div>


            <div class="imc-valor">

                <strong>
                    ${imc.toFixed(1)}
                </strong>

                <span>
                    kg/m²
                </span>

            </div>


            <div class="imc-classificacao">

                <span>
                    Classificação
                </span>

                <strong>
                    ${classificacao}
                </strong>

            </div>

        `;

    }


    /* =====================================================
       CÁLCULO DA TMB
       Fórmula de Mifflin-St Jeor
    ===================================================== */

    function calcularTMB(
        sexo,
        peso,
        altura,
        idade
    ) {

        let tmb;


        /*
            Masculino:

            TMB =
            10 × peso
            + 6,25 × altura
            - 5 × idade
            + 5
        */

        if (sexo === "masculino") {

            tmb =
                (10 * peso) +
                (6.25 * altura) -
                (5 * idade) +
                5;

        }


        /*
            Feminino:

            TMB =
            10 × peso
            + 6,25 × altura
            - 5 × idade
            - 161
        */

        else if (sexo === "feminino") {

            tmb =
                (10 * peso) +
                (6.25 * altura) -
                (5 * idade) -
                161;

        }


        else {

            return 0;

        }


        return tmb;

    }


    /* =====================================================
       CÁLCULO DO GASTO ENERGÉTICO TOTAL
    ===================================================== */

    function calcularGET(
        tmb,
        atividade
    ) {

        const fator =
            fatoresAtividade[atividade];


        if (!fator) {

            return 0;

        }


        return tmb * fator;

    }


    /* =====================================================
       AJUSTE DAS CALORIAS PELO OBJETIVO
    ===================================================== */

    function calcularCaloriasObjetivo(
        get,
        objetivo
    ) {

        /*
            Emagrecer:
            déficit de 20%

            Manter:
            sem alteração

            Ganhar massa:
            superávit de 10%
        */


        if (objetivo === "emagrecer") {

            return get * 0.80;

        }


        if (objetivo === "manter") {

            return get;

        }


        if (objetivo === "ganhar") {

            return get * 1.10;

        }


        return get;

    }


    /* =====================================================
       CÁLCULO DOS MACRONUTRIENTES
    ===================================================== */

    function calcularMacros(
        calorias,
        peso,
        objetivo
    ) {

        let proteinaPorKg;


        /*
            Proteína

            Emagrecer = 2,0 g/kg
            Manter = 1,8 g/kg
            Ganhar = 2,0 g/kg
        */

        if (objetivo === "emagrecer") {

            proteinaPorKg = 2.0;

        }

        else if (objetivo === "ganhar") {

            proteinaPorKg = 2.0;

        }

        else {

            proteinaPorKg = 1.8;

        }


        /*
            Gordura:

            0,8 g/kg
        */

        const gorduraPorKg = 0.8;


        /* ---------------------------------------------
           PROTEÍNA
        --------------------------------------------- */

        const proteinaGramas =
            peso * proteinaPorKg;


        const caloriasProteina =
            proteinaGramas * 4;


        /* ---------------------------------------------
           GORDURA
        --------------------------------------------- */

        const gorduraGramas =
            peso * gorduraPorKg;


        const caloriasGordura =
            gorduraGramas * 9;


        /* ---------------------------------------------
           CARBOIDRATO
        --------------------------------------------- */

        let caloriasCarboidrato =
            calorias -
            caloriasProteina -
            caloriasGordura;


        /*
            Evita resultado negativo.
        */

        if (caloriasCarboidrato < 0) {

            caloriasCarboidrato = 0;

        }


        const carboidratoGramas =
            caloriasCarboidrato / 4;


        return {

            proteina:
                arredondar(proteinaGramas),

            carboidrato:
                arredondar(carboidratoGramas),

            gordura:
                arredondar(gorduraGramas),

            calorias:
                arredondar(calorias)

        };

    }


    /* =====================================================
       VALIDAR DADOS DOS MACROS
    ===================================================== */

    function validarDadosMacros(
        sexo,
        idade,
        peso,
        altura,
        atividade,
        objetivo
    ) {

        if (!sexo) {

            alert("Selecione o sexo.");

            return false;

        }


        if (!Number.isFinite(idade) || idade <= 0) {

            alert("Informe uma idade válida.");

            return false;

        }


        if (idade < 1 || idade > 120) {

            alert("Informe uma idade entre 1 e 120 anos.");

            return false;

        }


        if (!Number.isFinite(peso) || peso <= 0) {

            alert("Informe um peso válido.");

            return false;

        }


        if (!Number.isFinite(altura) || altura <= 0) {

            alert("Informe uma altura válida.");

            return false;

        }


        if (altura < 50 || altura > 250) {

            alert("Informe uma altura entre 50 cm e 250 cm.");

            return false;

        }


        if (!atividade) {

            alert("Selecione seu nível de atividade.");

            return false;

        }


        if (!objetivo) {

            alert("Selecione seu objetivo.");

            return false;

        }


        return true;

    }


    /* =====================================================
       CALCULAR MACRONUTRIENTES
    ===================================================== */

    if (formularioMacros) {

        formularioMacros.addEventListener("submit", function (event) {

            event.preventDefault();


            /* ---------------------------------------------
               PEGAR VALORES
            --------------------------------------------- */

            const sexoElement =
                document.getElementById("sexo");

            const idadeElement =
                document.getElementById("idade");

            const pesoElement =
                document.getElementById("peso");

            const alturaElement =
                document.getElementById("altura");

            const atividadeElement =
                document.getElementById("atividade");

            const objetivoElement =
                document.getElementById("objetivo");


            if (
                !sexoElement ||
                !idadeElement ||
                !pesoElement ||
                !alturaElement ||
                !atividadeElement ||
                !objetivoElement
            ) {

                alert(
                    "Erro: não foi possível encontrar todos os campos da calculadora."
                );

                return;

            }


            const sexo =
                sexoElement.value;


            const idade =
                converterNumero(idadeElement.value);


            const peso =
                converterNumero(pesoElement.value);


            const altura =
                converterNumero(alturaElement.value);


            const atividade =
                atividadeElement.value;


            const objetivo =
                objetivoElement.value;


            /* ---------------------------------------------
               VALIDAR
            --------------------------------------------- */

            if (
                !validarDadosMacros(
                    sexo,
                    idade,
                    peso,
                    altura,
                    atividade,
                    objetivo
                )
            ) {

                return;

            }


            /* ---------------------------------------------
               TMB
            --------------------------------------------- */

            const tmb =
                calcularTMB(
                    sexo,
                    peso,
                    altura,
                    idade
                );


            /* ---------------------------------------------
               GET
            --------------------------------------------- */

            const get =
                calcularGET(
                    tmb,
                    atividade
                );


            /* ---------------------------------------------
               CALORIAS DO OBJETIVO
            --------------------------------------------- */

            const calorias =
                calcularCaloriasObjetivo(
                    get,
                    objetivo
                );


            /* ---------------------------------------------
               MACROS
            --------------------------------------------- */

            const macros =
                calcularMacros(
                    calorias,
                    peso,
                    objetivo
                );


            /* ---------------------------------------------
               MOSTRAR RESULTADO
            --------------------------------------------- */

            mostrarResultadoMacros(
                tmb,
                get,
                macros,
                objetivo
            );

        });

    }


    /* =====================================================
       MOSTRAR RESULTADO DOS MACROS
    ===================================================== */

    function mostrarResultadoMacros(
        tmb,
        get,
        macros,
        objetivo
    ) {

        let resultado =
            document.getElementById("resultadoMacros");


        if (!resultado) {

            resultado =
                document.createElement("div");

            resultado.id =
                "resultadoMacros";

            resultado.className =
                "resultado-macros";


            formularioMacros.after(resultado);

        }


        let nomeObjetivo;


        if (objetivo === "emagrecer") {

            nomeObjetivo =
                "Emagrecimento";

        }

        else if (objetivo === "ganhar") {

            nomeObjetivo =
                "Ganho de Massa Muscular";

        }

        else {

            nomeObjetivo =
                "Manutenção do Peso";

        }


        resultado.innerHTML = `

            <div class="resultado-header">

                <h3>
                    Seu Resultado
                </h3>

                <p>
                    Objetivo: ${nomeObjetivo}
                </p>

            </div>


            <div class="resultado-calorias">

                <span>
                    Necessidade calórica diária
                </span>

                <strong>
                    ${macros.calorias} kcal
                </strong>

            </div>


            <div class="resultado-info">

                <div class="resultado-item">

                    <span>
                        Proteínas
                    </span>

                    <strong>
                        ${macros.proteina} g
                    </strong>

                    <small>
                        ${macros.proteina * 4} kcal
                    </small>

                </div>


                <div class="resultado-item">

                    <span>
                        Carboidratos
                    </span>

                    <strong>
                        ${macros.carboidrato} g
                    </strong>

                    <small>
                        ${macros.carboidrato * 4} kcal
                    </small>

                </div>


                <div class="resultado-item">

                    <span>
                        Gorduras
                    </span>

                    <strong>
                        ${macros.gordura} g
                    </strong>

                    <small>
                        ${macros.gordura * 9} kcal
                    </small>

                </div>

            </div>


            <div class="resultado-base">

                <span>
                    TMB
                </span>

                <strong>
                    ${arredondar(tmb)} kcal
                </strong>


                <span>
                    Gasto diário estimado
                </span>

                <strong>
                    ${arredondar(get)} kcal
                </strong>

            </div>

        `;

    }


    /* =====================================================
       CALCULADORA DE ÁGUA
    ===================================================== */

    const calculateAgua =
        document.getElementById("calculateAgua");


    const aguaPeso =
        document.getElementById("aguaPeso");


    const aguaAtividade =
        document.getElementById("aguaAtividade");


    const aguaClima =
        document.getElementById("aguaClima");


    const aguaResult =
        document.getElementById("aguaResult");


    const aguaResultado =
        document.getElementById("aguaResultado");


    if (
        calculateAgua &&
        aguaPeso &&
        aguaAtividade &&
        aguaClima &&
        aguaResult &&
        aguaResultado
    ) {

        calculateAgua.addEventListener("click", function () {


            /* ---------------------------------------------
               PEGAR PESO
            --------------------------------------------- */

            const peso =
                converterNumero(
                    aguaPeso.value
                );


            /* ---------------------------------------------
               VALIDAR PESO
            --------------------------------------------- */

            if (!Number.isFinite(peso) || peso <= 0) {

                alert("Digite um peso válido.");

                aguaPeso.focus();

                return;

            }


            /* ---------------------------------------------
               LIMITE DE SEGURANÇA
            --------------------------------------------- */

            if (peso < 10 || peso > 400) {

                alert(
                    "Digite um peso entre 10 kg e 400 kg."
                );

                aguaPeso.focus();

                return;

            }


            /* ---------------------------------------------
               ÁGUA BASE
            --------------------------------------------- */

            /*
                35 ml de água por kg de peso.

                Exemplo:

                70 kg × 35 ml
                = 2450 ml

                = 2,45 litros
            */

            const aguaBase =
                peso * 35;


            /* ---------------------------------------------
               ATIVIDADE
            --------------------------------------------- */

            const atividade =
                converterNumero(
                    aguaAtividade.value
                );


            /* ---------------------------------------------
               CLIMA
            --------------------------------------------- */

            const clima =
                converterNumero(
                    aguaClima.value
                );


            /* ---------------------------------------------
               TOTAL EM ML
            --------------------------------------------- */

            const aguaTotal =
                aguaBase +
                atividade +
                clima;


            /* ---------------------------------------------
               CONVERTER ML PARA LITROS
            --------------------------------------------- */

            const litros =
                aguaTotal / 1000;


            /* ---------------------------------------------
               MOSTRAR RESULTADO
            --------------------------------------------- */

            aguaResultado.textContent =
                litros.toFixed(2) + " L";


            aguaResult.classList.add("active");

        });

    }


});
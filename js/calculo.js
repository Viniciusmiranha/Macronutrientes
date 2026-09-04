/* =========================================================
   NUTRIQ - CÁLCULOS
   Arquivo responsável somente pelos cálculos nutricionais
========================================================= */


/* =========================================================
   ELEMENTOS DO HTML
========================================================= */

const formularioMacros = document.querySelector(".macro-form form");
const formularioIMC = document.querySelector(".imc-form form");


/* =========================================================
   TABELA DE NÍVEL DE ATIVIDADE
========================================================= */

const fatoresAtividade = {

    sedentario: 1.20,

    leve: 1.375,

    moderado: 1.55,

    ativo: 1.725,

    atleta: 1.90

};


/* =========================================================
   FUNÇÃO PARA ARREDONDAR
========================================================= */

function arredondar(numero) {

    return Math.round(numero);

}


/* =========================================================
   CÁLCULO DE IMC
========================================================= */

function calcularIMC(peso, altura) {

    /*
        Altura recebida em centímetros.
        Transformamos para metros.
    */

    const alturaMetros = altura / 100;


    const imc =
        peso / (alturaMetros * alturaMetros);


    return imc;

}


/* =========================================================
   CLASSIFICAÇÃO DO IMC
========================================================= */

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


/* =========================================================
   CÁLCULO DA TAXA METABÓLICA BASAL
   Fórmula de Mifflin-St Jeor
========================================================= */

function calcularTMB(sexo, peso, altura, idade) {

    let tmb;


    /*
        Masculino:
        TMB = 10 × peso + 6,25 × altura - 5 × idade + 5
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
        TMB = 10 × peso + 6,25 × altura - 5 × idade - 161
    */

    else if (sexo === "feminino") {

        tmb =
            (10 * peso) +
            (6.25 * altura) -
            (5 * idade) -
            161;

    }


    return tmb;

}


/* =========================================================
   CÁLCULO DO GASTO CALÓRICO TOTAL
========================================================= */

function calcularGET(tmb, atividade) {

    const fator = fatoresAtividade[atividade];

    return tmb * fator;

}


/* =========================================================
   AJUSTE DE CALORIAS PELO OBJETIVO
========================================================= */

function calcularCaloriasObjetivo(get, objetivo) {

    /*
        Emagrecer:
        déficit de aproximadamente 20%

        Manter:
        sem alteração

        Ganhar massa:
        superávit de aproximadamente 10%
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


/* =========================================================
   CÁLCULO DOS MACRONUTRIENTES
========================================================= */

function calcularMacros(calorias, peso, objetivo) {

    let proteinaPorKg;
    let gorduraPorKg;


    /*
        Proteína

        Emagrecer:
        2,0 g/kg

        Manter:
        1,8 g/kg

        Ganhar massa:
        2,0 g/kg
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
        aproximadamente 0,8 g/kg
    */

    gorduraPorKg = 0.8;


    /* Proteína */

    const proteinaGramas =
        peso * proteinaPorKg;


    const caloriasProteina =
        proteinaGramas * 4;


    /* Gordura */

    const gorduraGramas =
        peso * gorduraPorKg;


    const caloriasGordura =
        gorduraGramas * 9;


    /*
        Carboidratos recebem
        as calorias restantes.
    */

    const caloriasCarboidrato =
        calorias -
        caloriasProteina -
        caloriasGordura;


    const carboidratoGramas =
        caloriasCarboidrato / 4;


    return {

        proteina: arredondar(proteinaGramas),

        carboidrato: arredondar(carboidratoGramas),

        gordura: arredondar(gorduraGramas),

        calorias: arredondar(calorias)

    };

}


/* =========================================================
   VALIDAÇÃO DOS DADOS
========================================================= */

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


    if (!idade || idade <= 0) {

        alert("Informe uma idade válida.");

        return false;

    }


    if (!peso || peso <= 0) {

        alert("Informe um peso válido.");

        return false;

    }


    if (!altura || altura <= 0) {

        alert("Informe uma altura válida.");

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


/* =========================================================
   CALCULAR MACRONUTRIENTES
========================================================= */

if (formularioMacros) {

    formularioMacros.addEventListener("submit", function (event) {

        event.preventDefault();


        /* ---------------------------------------------
           PEGAR VALORES
        --------------------------------------------- */

        const sexo =
            document.getElementById("sexo").value;

        const idade =
            Number(document.getElementById("idade").value);

        const peso =
            Number(document.getElementById("peso").value);

        const altura =
            Number(document.getElementById("altura").value);

        const atividade =
            document.getElementById("atividade").value;

        const objetivo =
            document.getElementById("objetivo").value;


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


/* =========================================================
   MOSTRAR RESULTADO DOS MACROS
========================================================= */

function mostrarResultadoMacros(
    tmb,
    get,
    macros,
    objetivo
) {

    /*
        Procuramos uma área de resultado.
        Se ela ainda não existir no HTML,
        criamos automaticamente.
    */

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

        nomeObjetivo = "Emagrecimento";

    }

    else if (objetivo === "ganhar") {

        nomeObjetivo = "Ganho de Massa Muscular";

    }

    else {

        nomeObjetivo = "Manutenção do Peso";

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


/* =========================================================
   CÁLCULO DO IMC
========================================================= */

if (formularioIMC) {

    formularioIMC.addEventListener("submit", function (event) {

        event.preventDefault();


        /* ---------------------------------------------
           PEGAR VALORES
        --------------------------------------------- */

        const peso =
            Number(
                document.getElementById("imc-peso").value
            );


        const altura =
            Number(
                document.getElementById("imc-altura").value
            );


        /* ---------------------------------------------
           VALIDAR
        --------------------------------------------- */

        if (!peso || peso <= 0) {

            alert("Informe um peso válido.");

            return;

        }


        if (!altura || altura <= 0) {

            alert("Informe uma altura válida.");

            return;

        }


        /* ---------------------------------------------
           CALCULAR
        --------------------------------------------- */

        const imc =
            calcularIMC(
                peso,
                altura
            );


        const classificacao =
            classificarIMC(imc);


        /* ---------------------------------------------
           MOSTRAR
        --------------------------------------------- */

        mostrarResultadoIMC(
            imc,
            classificacao
        );

    });

}


/* =========================================================
   MOSTRAR RESULTADO DO IMC
========================================================= */

function mostrarResultadoIMC(
    imc,
    classificacao
) {

    let resultado =
        document.getElementById("resultadoIMC");


    if (!resultado) {

        resultado =
            document.createElement("div");

        resultado.id =
            "resultadoIMC";

        resultado.className =
            "resultado-imc";

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

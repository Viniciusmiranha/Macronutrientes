"use strict";

/* =========================================================
NUTRIQ
SCRIPT PRINCIPAL UNIFICADO

FUNCIONALIDADES:

* Calculadora de Macronutrientes
* Calculadora de IMC
* Calculadora de Água
* TMB
* GET
* Objetivos de calorias
* Abas das calculadoras
* Login / Cadastro
* Sistema de feedback
* Modo escuro
* Acessibilidade
* Header dinâmico
* Animações
* Preview da logo
  ========================================================= */

/* =========================================================
DOM
========================================================= */

document.addEventListener("DOMContentLoaded", () => {


Eles **não devem estar no arquivo `.js`**.

Além disso, o trecho que você enviou termina no meio da função `mostrarFeedback()`. Aqui está o trecho **corrigido e pronto para colar no JavaScript**, sem os ```:

```javascript
/* =====================================================
   ELEMENTOS PRINCIPAIS
===================================================== */

const header = document.querySelector(".header");


/* =====================================================
   LOGIN
===================================================== */

const btnLogin = document.getElementById("btnLogin");

const loginModal = document.getElementById("loginModal");

const closeLogin = document.getElementById("closeLogin");

const loginOverlay = document.querySelector(".login-overlay");

const loginForm = document.getElementById("loginForm");

const registerForm = document.getElementById("registerForm");

const criarConta = document.getElementById("criarConta");

const voltarLogin = document.getElementById("voltarLogin");

const loginTitle = document.getElementById("loginTitle");

const loginSubtitle = document.getElementById("loginSubtitle");


/* =====================================================
   LOGO
===================================================== */

const logoInput = document.getElementById("logoInput");

const logoPreview = document.getElementById("logoPreview");


/* =====================================================
   CALCULADORAS
===================================================== */

const macroForm = document.getElementById("macroForm");

const imcForm = document.getElementById("imcForm");

const aguaForm = document.getElementById("aguaForm");


const formularioMacros =
    document.querySelector(".macro-form form");

const formularioIMC =
    document.querySelector(".imc-form form");


/* =====================================================
   ABAS
===================================================== */

const tabMacros = document.getElementById("tabMacros");

const tabIMC = document.getElementById("tabIMC");

const tabAgua = document.getElementById("tabAgua");


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


/* =====================================================
   CONFIGURAÇÕES
===================================================== */

const fatoresAtividade = {

    sedentario: 1.20,

    leve: 1.375,

    moderado: 1.55,

    ativo: 1.725,

    atleta: 1.90

};


/* =====================================================
   UTILITÁRIOS
===================================================== */

function converterNumero(valor) {

    if (typeof valor !== "string") {

        return Number(valor);

    }

    return Number(
        valor
            .trim()
            .replace(",", ".")
    );

}


function arredondar(numero) {

    return Math.round(numero);

}


/* =====================================================
   SISTEMA GLOBAL DE FEEDBACK
===================================================== */

function criarContainerFeedback() {

    let container =
        document.getElementById(
            "feedbackContainer"
        );


    if (container) {

        return container;

    }


    container =
        document.createElement("div");


    container.id =
        "feedbackContainer";


    container.setAttribute(
        "aria-live",
        "polite"
    );


    container.setAttribute(
        "aria-atomic",
        "true"
    );


    document.body.appendChild(
        container
    );


    return container;

}


function mostrarFeedback(
    mensagem,
    tipo = "success"
) {

    const container =
        criarContainerFeedback();


    const feedback =
        document.createElement("div");


    feedback.className =
        `feedback-message feedback-${tipo}`;


    const icones = {

        success: "✓",

        error: "!",

        info: "i"

    };


    feedback.innerHTML = `

        <span class="feedback-icon">
            ${icones[tipo] || "i"}
        </span>

        <span class="feedback-text">
            ${mensagem}
        </span>

        <button
            type="button"
            class="feedback-close"
            aria-label="Fechar mensagem"
        >
            ×
        </button>

    `;


    container.appendChild(
        feedback
    );


    const fechar =
        feedback.querySelector(
            ".feedback-close"
        );


    if (fechar) {

        fechar.addEventListener(
            "click",
            () => {

                removerFeedback(
                    feedback
                );

            }
        );

    }


    setTimeout(() => {

        feedback.classList.add(
            "visible"
        );

    }, 20);


    setTimeout(() => {

        removerFeedback(
            feedback
        );

    }, 4500);

}


function removerFeedback(
    elemento
) {

    if (!elemento) {

        return;

    }


    elemento.classList.remove(
        "visible"
    );


    setTimeout(() => {

        elemento.remove();

    }, 300);

}


function mostrarFeedbackGlobal(
    mensagem,
    tipo = "success"
) {

    mostrarFeedback(
        mensagem,
        tipo
    );

}

    container.appendChild(
        feedback
    );


    const fechar =
        feedback.querySelector(
            ".feedback-close"
        );


    if (fechar) {

        fechar.addEventListener(
            "click",
            () => {

                removerFeedback(
                    feedback
                );

            }
        );

    }


    setTimeout(() => {

        feedback.classList.add(
            "visible"
        );

    }, 20);


    setTimeout(() => {

        removerFeedback(
            feedback
        );

    }, 4500);

}

function removerFeedback(elemento) {

    if (!elemento) {
        return;
    }

    elemento.classList.remove("visible");

    setTimeout(() => {
        elemento.remove();
    }, 300);
}


function mostrarFeedbackGlobal(
    mensagem,
    tipo = "success"
) {

    mostrarFeedback(
        mensagem,
        tipo
    );

}
/* =====================================================
   HEADER
===================================================== */

let ultimaPosicao =
    window.scrollY;


if (header) {

    window.addEventListener(
        "scroll",
        () => {

            const posicaoAtual =
                window.scrollY;


            if (
                posicaoAtual <= 20
            ) {

                header.classList.remove(
                    "hidden"
                );

            }

            else if (
                posicaoAtual >
                ultimaPosicao
            ) {

                header.classList.add(
                    "hidden"
                );

            }

            else {

                header.classList.remove(
                    "hidden"
                );

            }


            ultimaPosicao =
                posicaoAtual;

        },
        {
            passive: true
        }
    );

}


/* =====================================================
   LOGIN — ABRIR
===================================================== */

function abrirLogin() {

    if (!loginModal) {

        return;

    }


    loginModal.classList.add(
        "active"
    );


    loginModal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.style.overflow =
        "hidden";


    const primeiroCampo =
        loginModal.querySelector(
            "input"
        );


    if (primeiroCampo) {

        setTimeout(() => {

            primeiroCampo.focus();

        }, 150);

    }

}


/* =====================================================
   LOGIN — FECHAR
===================================================== */

function fecharLogin() {

    if (!loginModal) {

        return;

    }


    loginModal.classList.remove(
        "active"
    );


    loginModal.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.style.overflow =
        "";

}


if (btnLogin) {

    btnLogin.addEventListener(
        "click",
        abrirLogin
    );

}


if (closeLogin) {

    closeLogin.addEventListener(
        "click",
        fecharLogin
    );

}


if (loginOverlay) {

    loginOverlay.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                loginOverlay
            ) {

                fecharLogin();

            }

        }
    );

}


/* =====================================================
   ESC — FECHAR LOGIN
===================================================== */

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Escape"
        ) {

            fecharLogin();

        }

    }
);


/* =====================================================
   PREVIEW DA LOGO
===================================================== */

if (
    logoInput &&
    logoPreview
) {

    logoInput.addEventListener(
        "change",
        (event) => {

            const arquivo =
                event.target.files[0];


            if (!arquivo) {

                return;

            }


            if (
                !arquivo.type.startsWith(
                    "image/"
                )
            ) {

                mostrarFeedback(
                    "Selecione um arquivo de imagem válido.",
                    "error"
                );


                logoInput.value =
                    "";


                return;

            }


            const imagemURL =
                URL.createObjectURL(
                    arquivo
                );


            logoPreview.src =
                imagemURL;


            logoPreview.onload =
                () => {

                    URL.revokeObjectURL(
                        imagemURL
                    );

                };

        }
    );

}


/* =====================================================
   CONTROLE DAS ABAS
===================================================== */

const calculadoras = {

    macros: {

        elemento:
            macroForm,

        aba:
            tabMacros

    },


    imc: {

        elemento:
            imcForm,

        aba:
            tabIMC

    },


    agua: {

        elemento:
            aguaForm,

        aba:
            tabAgua

    }

};


function mostrarCalculadora(
    tipo
) {

    Object.values(
        calculadoras
    ).forEach(
        (calculadora) => {


            if (
                calculadora.elemento
            ) {

                calculadora.elemento
                    .classList
                    .remove(
                        "calculator-visible"
                    );


                calculadora.elemento.style.display =
                    "none";

            }


            if (
                calculadora.aba
            ) {

                calculadora.aba.classList
                    .remove(
                        "active"
                    );


                calculadora.aba.setAttribute(
                    "aria-selected",
                    "false"
                );

            }

        }
    );


    const selecionada =
        calculadoras[tipo];


    if (!selecionada) {

        return;

    }


    if (
        selecionada.elemento
    ) {

        selecionada.elemento.style.display =
            "block";


        requestAnimationFrame(
            () => {

                selecionada.elemento.classList.add(
                    "calculator-visible"
                );

            }
        );

    }


    if (
        selecionada.aba
    ) {

        selecionada.aba.classList.add(
            "active"
        );


        selecionada.aba.setAttribute(
            "aria-selected",
            "true"
        );

    }

}


if (tabMacros) {

    tabMacros.addEventListener(
        "click",
        () => {

            mostrarCalculadora(
                "macros"
            );

        }
    );

}


if (tabIMC) {

    tabIMC.addEventListener(
        "click",
        () => {

            mostrarCalculadora(
                "imc"
            );

        }
    );

}


if (tabAgua) {

    tabAgua.addEventListener(
        "click",
        () => {

            mostrarCalculadora(
                "agua"
            );

        }
    );

}


mostrarCalculadora(
    "macros"
);


/* =====================================================
   LOGIN / CADASTRO
===================================================== */

function mostrarCadastro() {

    if (
        !loginForm ||
        !registerForm
    ) {

        return;

    }


    loginForm.style.display =
        "none";


    registerForm.style.display =
        "block";


    if (loginTitle) {

        loginTitle.textContent =
            "Criar sua conta";

    }


    if (loginSubtitle) {

        loginSubtitle.textContent =
            "Preencha seus dados para começar";

    }

}


function mostrarLogin() {

    if (
        !loginForm ||
        !registerForm
    ) {

        return;

    }


    registerForm.style.display =
        "none";


    loginForm.style.display =
        "block";


    if (loginTitle) {

        loginTitle.textContent =
            "Entrar na sua conta";

    }


    if (loginSubtitle) {

        loginSubtitle.textContent =
            "Acesse sua conta no NUTRIQ";

    }

}


if (criarConta) {

    criarConta.addEventListener(
        "click",
        (event) => {

            event.preventDefault();

            mostrarCadastro();

        }
    );

}


if (voltarLogin) {

    voltarLogin.addEventListener(
        "click",
        (event) => {

            event.preventDefault();

            mostrarLogin();

        }
    );

}


/* =====================================================
   LOGIN
===================================================== */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        (event) => {

            event.preventDefault();


            mostrarFeedback(
                "Login será conectado ao sistema posteriormente.",
                "info"
            );

        }
    );

}


/* =====================================================
   CADASTRO
===================================================== */

if (registerForm) {

    registerForm.addEventListener(
        "submit",
        (event) => {

            event.preventDefault();


            mostrarFeedback(
                "Cadastro será conectado ao sistema posteriormente.",
                "info"
            );

        }
    );

}


/* =====================================================
   IMC
===================================================== */

function calcularIMC(
    peso,
    alturaCentimetros
) {

    const alturaMetros =
        alturaCentimetros / 100;


    return (
        peso /
        (
            alturaMetros *
            alturaMetros
        )
    );

}


/* =====================================================
   CLASSIFICAÇÃO DO IMC
===================================================== */

function classificarIMC(
    imc
) {

    if (
        imc < 18.5
    ) {

        return {

            nome:
                "Abaixo do peso",

            classe:
                "imc-baixo",

            percentual:
                25

        };

    }


    if (
        imc < 25
    ) {

        return {

            nome:
                "Peso normal",

            classe:
                "imc-normal",

            percentual:
                50

        };

    }


    if (
        imc < 30
    ) {

        return {

            nome:
                "Sobrepeso",

            classe:
                "imc-sobrepeso",

            percentual:
                68

        };

    }


    if (
        imc < 35
    ) {

        return {

            nome:
                "Obesidade grau I",

            classe:
                "imc-obesidade",

            percentual:
                80

        };

    }


    if (
        imc < 40
    ) {

        return {

            nome:
                "Obesidade grau II",

            classe:
                "imc-obesidade",

            percentual:
                90

        };

    }


    return {

        nome:
            "Obesidade grau III",

        classe:
            "imc-obesidade",

        percentual:
            100

    };

}


/* =====================================================
   FORMULÁRIO DO IMC
===================================================== */

if (formularioIMC) {

    formularioIMC.addEventListener(
        "submit",
        (event) => {

            event.preventDefault();


            const campoPeso =
                document.getElementById(
                    "imc-peso"
                );


            const campoAltura =
                document.getElementById(
                    "imc-altura"
                );


            if (
                !campoPeso ||
                !campoAltura
            ) {

                mostrarFeedbackGlobal(
                    "Não foi possível localizar os campos do IMC.",
                    "error"
                );


                return;

            }


            const peso =
                converterNumero(
                    campoPeso.value
                );


            const altura =
                converterNumero(
                    campoAltura.value
                );


            if (
                !Number.isFinite(
                    peso
                ) ||
                peso <= 0
            ) {

                mostrarFeedbackGlobal(
                    "Informe um peso válido.",
                    "error"
                );


                campoPeso.focus();


                return;

            }


            if (
                !Number.isFinite(
                    altura
                ) ||
                altura <= 0
            ) {

                mostrarFeedbackGlobal(
                    "Informe uma altura válida.",
                    "error"
                );


                campoAltura.focus();


                return;

            }


            if (
                altura < 50 ||
                altura > 250
            ) {

                mostrarFeedbackGlobal(
                    "A altura deve estar entre 50 cm e 250 cm.",
                    "error"
                );


                campoAltura.focus();


                return;

            }


            const imc =
                calcularIMC(
                    peso,
                    altura
                );


            const classificacao =
                classificarIMC(
                    imc
                );


            mostrarResultadoIMC(
                imc,
                classificacao
            );


            mostrarFeedbackGlobal(
                "IMC calculado com sucesso.",
                "success"
            );

        }
    );

}


/* =====================================================
   RESULTADO DO IMC
===================================================== */

function mostrarResultadoIMC(
    imc,
    classificacao
) {

    if (!formularioIMC) {

        return;

    }


    let resultado =
        document.getElementById(
            "resultadoIMC"
        );


    if (!resultado) {

        resultado =
            document.createElement(
                "section"
            );


        resultado.id =
            "resultadoIMC";


        resultado.className =
            "resultado-imc";


        formularioIMC.after(
            resultado
        );

    }


    resultado.setAttribute(
        "aria-live",
        "polite"
    );


    resultado.innerHTML = `

        <div class="resultado-header">

            <span class="resultado-label">
                Resultado
            </span>

            <h3>
                Seu IMC
            </h3>

        </div>


        <div class="imc-result-main">

            <strong class="imc-number">
                ${imc.toFixed(1)}
            </strong>

            <span class="imc-unit">
                kg/m²
            </span>

        </div>


        <div class="imc-classificacao ${classificacao.classe}">

            <span>
                Classificação
            </span>

            <strong>
                ${classificacao.nome}
            </strong>

        </div>


        <div class="imc-scale">

            <div class="imc-scale-track">

                <span
                    class="imc-marker"
                    style="left: ${classificacao.percentual}%"
                >
                </span>

            </div>


            <div class="imc-scale-labels">

                <span>
                    Baixo
                </span>

                <span>
                    Normal
                </span>

                <span>
                    Sobrepeso
                </span>

                <span>
                    Obesidade
                </span>

            </div>

        </div>

    `;


    requestAnimationFrame(
        () => {

            resultado.classList.add(
                "resultado-visible"
            );

        }
    );

}


/* =====================================================
   TMB
   FÓRMULA DE MIFFLIN-ST JEOR
===================================================== */

function calcularTMB(
    sexo,
    peso,
    altura,
    idade
) {

    if (
        sexo === "masculino"
    ) {

        return (
            (10 * peso) +
            (6.25 * altura) -
            (5 * idade) +
            5
        );

    }


    if (
        sexo === "feminino"
    ) {

        return (
            (10 * peso) +
            (6.25 * altura) -
            (5 * idade) -
            161
        );

    }


    return 0;

}


/* =====================================================
   GET
===================================================== */

function calcularGET(
    tmb,
    atividade
) {

    const fator =
        fatoresAtividade[
            atividade
        ];


    if (!fator) {

        return 0;

    }


    return (
        tmb * fator
    );

}


/* =====================================================
   CALORIAS PELO OBJETIVO
===================================================== */

function calcularCaloriasObjetivo(
    get,
    objetivo
) {

    if (
        objetivo === "emagrecer"
    ) {

        return (
            get * 0.80
        );

    }


    if (
        objetivo === "ganhar"
    ) {

        return (
            get * 1.10
        );

    }


    if (
        objetivo === "manter"
    ) {

        return get;

    }


    return get;

}


/* =====================================================
   MACRONUTRIENTES
===================================================== */

function calcularMacros(
    calorias,
    peso,
    objetivo
) {

    let proteinaPorKg;


    if (
        objetivo === "emagrecer" ||
        objetivo === "ganhar"
    ) {

        proteinaPorKg =
            2.0;

    }

    else {

        proteinaPorKg =
            1.8;

    }


    const gorduraPorKg =
        0.8;


    const proteina =
        peso *
        proteinaPorKg;


    const gordura =
        peso *
        gorduraPorKg;


    const caloriasProteina =
        proteina *
        4;


    const caloriasGordura =
        gordura *
        9;


    const caloriasCarboidrato =
        Math.max(
            0,
            calorias -
            caloriasProteina -
            caloriasGordura
        );


    const carboidrato =
        caloriasCarboidrato /
        4;


    return {

        proteina:
            arredondar(
                proteina
            ),

        carboidrato:
            arredondar(
                carboidrato
            ),

        gordura:
            arredondar(
                gordura
            ),

        calorias:
            arredondar(
                calorias
            )

    };

}


/* =====================================================
   VALIDAÇÃO DOS MACROS
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

        mostrarFeedbackGlobal(
            "Selecione o sexo.",
            "error"
        );


        return false;

    }


    if (
        !Number.isFinite(
            idade
        ) ||
        idade < 1 ||
        idade > 120
    ) {

        mostrarFeedbackGlobal(
            "Informe uma idade entre 1 e 120 anos.",
            "error"
        );


        return false;

    }


    if (
        !Number.isFinite(
            peso
        ) ||
        peso <= 0
    ) {

        mostrarFeedbackGlobal(
            "Informe um peso válido.",
            "error"
        );


        return false;

    }


    if (
        !Number.isFinite(
            altura
        ) ||
        altura < 50 ||
        altura > 250
    ) {

        mostrarFeedbackGlobal(
            "Informe uma altura entre 50 cm e 250 cm.",
            "error"
        );


        return false;

    }


    if (!atividade) {

        mostrarFeedbackGlobal(
            "Selecione seu nível de atividade.",
            "error"
        );


        return false;

    }


    if (!objetivo) {

        mostrarFeedbackGlobal(
            "Selecione seu objetivo.",
            "error"
        );


        return false;

    }


    return true;

}


/* =====================================================
   FORMULÁRIO DE MACROS
===================================================== */

if (formularioMacros) {

    formularioMacros.addEventListener(
        "submit",
        (event) => {

            event.preventDefault();


            const sexoElement =
                document.getElementById(
                    "sexo"
                );


            const idadeElement =
                document.getElementById(
                    "idade"
                );


            const pesoElement =
                document.getElementById(
                    "peso"
                );


            const alturaElement =
                document.getElementById(
                    "altura"
                );


            const atividadeElement =
                document.getElementById(
                    "atividade"
                );


            const objetivoElement =
                document.getElementById(
                    "objetivo"
                );


            if (
                !sexoElement ||
                !idadeElement ||
                !pesoElement ||
                !alturaElement ||
                !atividadeElement ||
                !objetivoElement
            ) {

                mostrarFeedbackGlobal(
                    "Não foi possível localizar todos os campos.",
                    "error"
                );


                return;

            }


            const sexo =
                sexoElement.value;


            const idade =
                converterNumero(
                    idadeElement.value
                );


            const peso =
                converterNumero(
                    pesoElement.value
                );


            const altura =
                converterNumero(
                    alturaElement.value
                );


            const atividade =
                atividadeElement.value;


            const objetivo =
                objetivoElement.value;


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


            const tmb =
                calcularTMB(
                    sexo,
                    peso,
                    altura,
                    idade
                );


            const get =
                calcularGET(
                    tmb,
                    atividade
                );


            const calorias =
                calcularCaloriasObjetivo(
                    get,
                    objetivo
                );


            const macros =
                calcularMacros(
                    calorias,
                    peso,
                    objetivo
                );


            mostrarResultadoMacros(
                tmb,
                get,
                macros,
                objetivo
            );


            mostrarFeedbackGlobal(
                "Cálculo concluído com sucesso.",
                "success"
            );

        }
    );

}


/* =====================================================
   RESULTADO DOS MACROS
===================================================== */

function mostrarResultadoMacros(
    tmb,
    get,
    macros,
    objetivo
) {

    if (!formularioMacros) {

        return;

    }


    let resultado =
        document.getElementById(
            "resultadoMacros"
        );


    if (!resultado) {

        resultado =
            document.createElement(
                "section"
            );


        resultado.id =
            "resultadoMacros";


        resultado.className =
            "resultado-macros";


        formularioMacros.after(
            resultado
        );

    }


    const objetivos = {

        emagrecer:
            "Emagrecimento",

        ganhar:
            "Ganho de Massa Muscular",

        manter:
            "Manutenção do Peso"

    };


    const nomeObjetivo =
        objetivos[objetivo] ||
        "Manutenção do Peso";


    resultado.setAttribute(
        "aria-live",
        "polite"
    );


    resultado.innerHTML = `

        <div class="resultado-header">

            <span class="resultado-label">
                Resultado personalizado
            </span>

            <h3>
                Seu plano diário
            </h3>

            <p>
                Objetivo:
                <strong>
                    ${nomeObjetivo}
                </strong>
            </p>

        </div>


        <div class="resultado-calorias">

            <span>
                Necessidade calórica diária
            </span>

            <strong>

                ${macros.calorias}

                <small>
                    kcal
                </small>

            </strong>

        </div>


        <div class="macro-result-grid">


            <!-- PROTEÍNAS -->

            <div class="macro-result-card">

                <div class="macro-card-icon">
                    P
                </div>

                <span>
                    Proteínas
                </span>

                <strong>
                    ${macros.proteina} g
                </strong>

                <div class="macro-progress">

                    <span
                        style="width: 75%"
                    >
                    </span>

                </div>

                <small>
                    ${macros.proteina * 4} kcal
                </small>

            </div>


            <!-- CARBOIDRATOS -->

            <div class="macro-result-card">

                <div class="macro-card-icon">
                    C
                </div>

                <span>
                    Carboidratos
                </span>

                <strong>
                    ${macros.carboidrato} g
                </strong>

                <div class="macro-progress">

                    <span
                        style="width: 60%"
                    >
                    </span>

                </div>

                <small>
                    ${macros.carboidrato * 4} kcal
                </small>

            </div>


            <!-- GORDURAS -->

            <div class="macro-result-card">

                <div class="macro-card-icon">
                    G
                </div>

                <span>
                    Gorduras
                </span>

                <strong>
                    ${macros.gordura} g
                </strong>

                <div class="macro-progress">

                    <span
                        style="width: 40%"
                    >
                    </span>

                </div>

                <small>
                    ${macros.gordura * 9} kcal
                </small>

            </div>

        </div>


        <div class="resultado-base">


            <div>

                <span>
                    Taxa metabólica basal
                </span>

                <strong>
                    ${arredondar(tmb)}
                    kcal
                </strong>

            </div>


            <div>

                <span>
                    Gasto diário estimado
                </span>

                <strong>
                    ${arredondar(get)}
                    kcal
                </strong>

            </div>


        </div>

    `;


    requestAnimationFrame(
        () => {

            resultado.classList.add(
                "resultado-visible"
            );

        }
    );

}


/* =====================================================
   CALCULADORA DE ÁGUA
===================================================== */

if (
    calculateAgua &&
    aguaPeso &&
    aguaAtividade &&
    aguaClima &&
    aguaResult &&
    aguaResultado
) {

    calculateAgua.addEventListener(
        "click",
        () => {


            /* -----------------------------------------
               PESO
            ----------------------------------------- */

            const peso =
                converterNumero(
                    aguaPeso.value
                );


            /* -----------------------------------------
               VALIDAR PESO
            ----------------------------------------- */

            if (
                !Number.isFinite(
                    peso
                ) ||
                peso <= 0
            ) {

                mostrarFeedbackGlobal(
                    "Digite um peso válido.",
                    "error"
                );


                aguaPeso.focus();


                return;

            }


            /* -----------------------------------------
               LIMITE
            ----------------------------------------- */

            if (
                peso < 10 ||
                peso > 400
            ) {

                mostrarFeedbackGlobal(
                    "O peso deve estar entre 10 kg e 400 kg.",
                    "error"
                );


                aguaPeso.focus();


                return;

            }


            /* -----------------------------------------
               ATIVIDADE
            ----------------------------------------- */

            const atividade =
                converterNumero(
                    aguaAtividade.value
                );


            /* -----------------------------------------
               CLIMA
            ----------------------------------------- */

            const clima =
                converterNumero(
                    aguaClima.value
                );


            /* -----------------------------------------
               ÁGUA BASE
            ----------------------------------------- */

            const aguaBase =
                peso *
                35;


            /* -----------------------------------------
               TOTAL
            ----------------------------------------- */

            const aguaTotal =
                aguaBase +
                atividade +
                clima;


            /* -----------------------------------------
               LITROS
            ----------------------------------------- */

            const litros =
                aguaTotal /
                1000;


            /* -----------------------------------------
               RESULTADO
            ----------------------------------------- */

            aguaResultado.textContent =
                litros.toFixed(2) +
                " L";


            aguaResult.classList.add(
                "active"
            );


            aguaResult.setAttribute(
                "aria-live",
                "polite"
            );


            /* -----------------------------------------
               PROGRESSO VISUAL
            ----------------------------------------- */

            const metaVisual =
                Math.min(
                    100,
                    (
                        litros /
                        3
                    ) *
                    100
                );


            aguaResult.style.setProperty(
                "--water-progress",
                `${metaVisual}%`
            );


            mostrarFeedbackGlobal(
                "Sua estimativa de hidratação foi calculada.",
                "success"
            );

        }
    );

}


/* =====================================================
   MODO ESCURO
===================================================== */

function criarControleTema() {

    const headerLocal =
        document.querySelector(
            ".header"
        );


    if (!headerLocal) {

        return;

    }


    if (
        document.getElementById(
            "themeToggle"
        )
    ) {

        return;

    }


    const botao =
        document.createElement(
            "button"
        );


    botao.type =
        "button";


    botao.id =
        "themeToggle";


    botao.className =
        "theme-toggle";


    botao.setAttribute(
        "aria-label",
        "Ativar modo escuro"
    );


    botao.innerHTML =
        "☾";


    const areaLogin =
        document.querySelector(
            ".login-button"
        );


    if (areaLogin) {

        areaLogin.parentNode.insertBefore(
            botao,
            areaLogin
        );

    }

    else {

        headerLocal.appendChild(
            botao
        );

    }


    atualizarTema(
        botao
    );


    botao.addEventListener(
        "click",
        () => {

            const escuro =
                document.body.classList.toggle(
                    "dark-mode"
                );


            localStorage.setItem(
                "nutriq-theme",
                escuro
                    ? "dark"
                    : "light"
            );


            atualizarTema(
                botao
            );


            mostrarFeedback(
                escuro
                    ? "Modo escuro ativado."
                    : "Modo claro ativado.",
                "info"
            );

        }
    );

}


function atualizarTema(
    botao
) {

    const escuro =
        document.body.classList.contains(
            "dark-mode"
        );


    if (escuro) {

        botao.innerHTML =
            "☀";


        botao.setAttribute(
            "aria-label",
            "Ativar modo claro"
        );

    }

    else {

        botao.innerHTML =
            "☾";


        botao.setAttribute(
            "aria-label",
            "Ativar modo escuro"
        );

    }

}


function carregarTema() {

    const tema =
        localStorage.getItem(
            "nutriq-theme"
        );


    if (
        tema === "dark"
    ) {

        document.body.classList.add(
            "dark-mode"
        );

    }

}


carregarTema();

criarControleTema();


/* =====================================================
   ACESSIBILIDADE
   REDUÇÃO DE ANIMAÇÕES
===================================================== */

function criarControleAcessibilidade() {

    if (
        document.getElementById(
            "accessibilityToggle"
        )
    ) {

        return;

    }


    const botao =
        document.createElement(
            "button"
        );


    botao.type =
        "button";


    botao.id =
        "accessibilityToggle";


    botao.className =
        "accessibility-toggle";


    botao.innerHTML =
        "A";


    botao.setAttribute(
        "aria-label",
        "Ativar redução de animações"
    );


    botao.title =
        "Reduzir animações";


    document.body.appendChild(
        botao
    );


    botao.addEventListener(
        "click",
        () => {

            const reduzido =
                document.body.classList.toggle(
                    "reduce-motion"
                );


            localStorage.setItem(
                "nutriq-reduce-motion",
                reduzido
                    ? "true"
                    : "false"
            );


            mostrarFeedback(
                reduzido
                    ? "Animações reduzidas."
                    : "Animações normais ativadas.",
                "info"
            );

        }
    );

}


function carregarAcessibilidade() {

    const reduzido =
        localStorage.getItem(
            "nutriq-reduce-motion"
        );


    if (
        reduzido === "true"
    ) {

        document.body.classList.add(
            "reduce-motion"
        );

    }

}


carregarAcessibilidade();

criarControleAcessibilidade();


/* =====================================================
   FOCO VISÍVEL PARA TECLADO
===================================================== */

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Tab"
        ) {

            document.body.classList.add(
                "keyboard-navigation"
            );

        }

    }
);


document.addEventListener(
    "mousedown",
    () => {

        document.body.classList.remove(
            "keyboard-navigation"
        );

    }
);


/* =====================================================
   ANIMAÇÕES AO ENTRAR NA TELA
===================================================== */

const elementosAnimados =
    document.querySelectorAll(
        ".side-card, .benefit, .about-section, .intro"
    );


if (
    elementosAnimados.length &&
    "IntersectionObserver" in window
) {

    const observer =
        new IntersectionObserver(
            (
                entradas,
                observador
            ) => {

                entradas.forEach(
                    (entrada) => {

                        if (
                            entrada.isIntersecting
                        ) {

                            entrada.target.classList.add(
                                "animate-in"
                            );


                            observador.unobserve(
                                entrada.target
                            );

                        }

                    }
                );

            },
            {
                threshold: 0.12
            }
        );


    elementosAnimados.forEach(
        (elemento) => {

            elemento.classList.add(
                "animate-ready"
            );


            observer.observe(
                elemento
            );

        }
    );

}


/* =====================================================
   CARREGAMENTO DA PÁGINA
===================================================== */

window.addEventListener(
    "load",
    () => {

        document.body.classList.add(
            "page-loaded"
        );

    }
);
```

});

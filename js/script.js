"use strict";

/* =========================================================
   NUTRIQ
   SCRIPT PRINCIPAL
========================================================= */
/* =========================================================
   HEADER - ESCONDER AO ROLAR E MOVIMENTO DO MOUSE
========================================================= */

const header = document.querySelector(".header");

let ultimaPosicao = window.scrollY;
let ultimaPosicaoMouseY = window.innerHeight / 2;

let headerEscondidoScroll = false;
let headerEscondidoMouse = false;


/* =========================================================
   HEADER - ESCONDER AO ROLAR
========================================================= */

window.addEventListener("scroll", () => {

    if (!header) return;

    const posicaoAtual = window.scrollY;

    // No topo, sempre mostrar
    if (posicaoAtual <= 20) {

        header.classList.remove("hidden");
        headerEscondidoScroll = false;

    }

    // Descendo
    else if (posicaoAtual > ultimaPosicao) {

        header.classList.add("hidden");
        headerEscondidoScroll = true;

    }

    // Subindo
    else {

        header.classList.remove("hidden");
        headerEscondidoScroll = false;

    }

    ultimaPosicao = posicaoAtual;

});


/* =========================================================
   HEADER - MOVIMENTO SUTIL DO MOUSE
========================================================= */

if (header) {

    document.addEventListener("mousemove", (event) => {

        const posicaoAtualMouseY = event.clientY;

        // Mouse descendo
        if (
            posicaoAtualMouseY >
            ultimaPosicaoMouseY + 20
        ) {

            if (!headerEscondidoScroll) {

                header.classList.add("mouse-hidden");
                headerEscondidoMouse = true;

            }

        }

        // Mouse subindo
        else if (
            posicaoAtualMouseY <
            ultimaPosicaoMouseY - 20
        ) {

            header.classList.remove("mouse-hidden");
            headerEscondidoMouse = false;

        }

        ultimaPosicaoMouseY = posicaoAtualMouseY;

    });

}

/* =========================================================
   ELEMENTOS DAS ABAS
========================================================= */

const tabMacros = document.getElementById("tabMacros");
const tabIMC = document.getElementById("tabIMC");
const tabAgua = document.getElementById("tabAgua");

const macroForm = document.getElementById("macroForm");
const imcForm = document.getElementById("imcForm");
const aguaForm = document.getElementById("aguaForm");


/* =========================================================
   FUNÇÃO - MOSTRAR ABA
========================================================= */

function mostrarAba(aba) {

    if (!macroForm || !imcForm || !aguaForm) return;

    // Esconde todos
    macroForm.style.display = "none";
    imcForm.style.display = "none";
    aguaForm.style.display = "none";

    // Remove ativo
    document.querySelectorAll(".tab").forEach(tab => {
        tab.classList.remove("active");
    });

    // Mostra selecionado
    if (aba === "macros") {

        macroForm.style.display = "block";
        tabMacros?.classList.add("active");

    }

    if (aba === "imc") {

        imcForm.style.display = "block";
        tabIMC?.classList.add("active");

    }

    if (aba === "agua") {

        aguaForm.style.display = "block";
        tabAgua?.classList.add("active");

    }

    // Pequena animação
    const formularioAtual =
        aba === "macros"
            ? macroForm
            : aba === "imc"
                ? imcForm
                : aguaForm;

    formularioAtual.classList.remove("calculator-visible");

    void formularioAtual.offsetWidth;

    formularioAtual.classList.add("calculator-visible");
}


/* =========================================================
   EVENTOS DAS ABAS
========================================================= */

tabMacros?.addEventListener("click", () => {
    mostrarAba("macros");
});

tabIMC?.addEventListener("click", () => {
    mostrarAba("imc");
});

tabAgua?.addEventListener("click", () => {
    mostrarAba("agua");
});


/* =========================================================
   FEEDBACK VISUAL
========================================================= */

function mostrarFeedback(mensagem, tipo = "info") {

    let container = document.getElementById("feedbackContainer");

    // Cria automaticamente caso não exista
    if (!container) {

        container = document.createElement("div");

        container.id = "feedbackContainer";

        document.body.appendChild(container);
    }

    const feedback = document.createElement("div");

    feedback.className = `feedback-message feedback-${tipo}`;

    let icone = "i";

    if (tipo === "success") {
        icone = "✓";
    }

    if (tipo === "error") {
        icone = "!";
    }

    feedback.innerHTML = `

        <div class="feedback-icon">
            ${icone}
        </div>

        <div class="feedback-text">
            ${mensagem}
        </div>

        <button
            type="button"
            class="feedback-close"
            aria-label="Fechar mensagem"
        >
            ×
        </button>

    `;

    container.appendChild(feedback);

    requestAnimationFrame(() => {
        feedback.classList.add("visible");
    });

    const fechar = () => {

        feedback.classList.remove("visible");

        setTimeout(() => {
            feedback.remove();
        }, 300);

    };

    feedback
        .querySelector(".feedback-close")
        .addEventListener("click", fechar);

    setTimeout(fechar, 4500);
}


/* =========================================================
   FUNÇÕES AUXILIARES
========================================================= */

function numeroValido(valor) {

    return valor !== "" &&
           valor !== null &&
           valor !== undefined &&
           Number.isFinite(Number(valor)) &&
           Number(valor) > 0;

}


function arredondar(numero, casas = 1) {

    const fator = Math.pow(10, casas);

    return Math.round(numero * fator) / fator;

}


/* =========================================================
   IMC
========================================================= */

const imcFormElement = document.querySelector(".imc-form form");

imcFormElement?.addEventListener("submit", function(event) {

    event.preventDefault();

    const peso = Number(
        document.getElementById("imc-peso")?.value
    );

    const alturaCm = Number(
        document.getElementById("imc-altura")?.value
    );

    if (!numeroValido(peso) || !numeroValido(alturaCm)) {

        mostrarFeedback(
            "Preencha corretamente o peso e a altura.",
            "error"
        );

        return;
    }

    if (alturaCm < 50 || alturaCm > 250) {

        mostrarFeedback(
            "Digite uma altura válida entre 50 cm e 250 cm.",
            "error"
        );

        return;
    }

    const altura = alturaCm / 100;

    const imc = peso / (altura * altura);

    let classificacao;
    let classe = "";

    if (imc < 18.5) {

        classificacao = "Abaixo do peso";
        classe = "imc-baixo";

    } else if (imc < 25) {

        classificacao = "Peso normal";
        classe = "imc-normal";

    } else if (imc < 30) {

        classificacao = "Sobrepeso";
        classe = "imc-sobrepeso";

    } else {

        classificacao = "Obesidade";
        classe = "imc-obesidade";

    }

    criarResultadoIMC(
        imc,
        classificacao,
        classe
    );

    mostrarFeedback(
        "Cálculo do IMC realizado com sucesso!",
        "success"
    );

});


/* =========================================================
   CRIAR RESULTADO DO IMC
========================================================= */

function criarResultadoIMC(imc, classificacao, classe) {

    let resultado = document.querySelector(".resultado-imc");

    if (!resultado) {

        resultado = document.createElement("div");

        resultado.className = "resultado-imc";

        imcForm.appendChild(resultado);
    }

    const imcFormatado = arredondar(imc, 1);

    // Posição aproximada do marcador
    let porcentagem = ((imc - 15) / (40 - 15)) * 100;

    porcentagem = Math.max(
        0,
        Math.min(100, porcentagem)
    );

    resultado.innerHTML = `

        <div class="resultado-header">

            <span class="resultado-label">
                Resultado
            </span>

            <h3>
                Seu Índice de Massa Corporal
            </h3>

            <p>
                O resultado calculado com base no seu peso e altura.
            </p>

        </div>

        <div class="imc-result-main">

            <strong class="imc-number">
                ${imcFormatado}
            </strong>

            <span class="imc-unit">
                kg/m²
            </span>

        </div>

        <div class="imc-classificacao ${classe}">

            <span>
                Classificação
            </span>

            <strong>
                ${classificacao}
            </strong>

        </div>

        <div class="imc-scale">

            <div class="imc-scale-track">

                <div
                    class="imc-marker"
                    style="left: ${porcentagem}%"
                ></div>

            </div>

            <div class="imc-scale-labels">

                <span>Baixo</span>
                <span>Normal</span>
                <span>Sobrepeso</span>
                <span>Obesidade</span>

            </div>

        </div>
    `;

    resultado.classList.remove("resultado-visible");

    void resultado.offsetWidth;

    resultado.classList.add("resultado-visible");
}


/* =========================================================
   CÁLCULO DE ÁGUA
========================================================= */

const calcularAgua = document.getElementById("calculateAgua");

calcularAgua?.addEventListener("click", () => {

    const peso = Number(
        document.getElementById("aguaPeso")?.value
    );

    const atividade = Number(
        document.getElementById("aguaAtividade")?.value || 0
    );

    const clima = Number(
        document.getElementById("aguaClima")?.value || 0
    );

    if (!numeroValido(peso)) {

        mostrarFeedback(
            "Digite seu peso para calcular a quantidade de água.",
            "error"
        );

        return;
    }

    if (peso < 20 || peso > 300) {

        mostrarFeedback(
            "Digite um peso válido.",
            "error"
        );

        return;
    }

    /*
       Base:
       35 mL de água por kg de peso

       Depois são adicionados os valores
       selecionados para atividade e clima.
    */

    const aguaBase = peso * 35;

    const aguaTotalMl =
        aguaBase +
        atividade +
        clima;

    const aguaLitros =
        aguaTotalMl / 1000;

    const resultado = document.getElementById("aguaResult");
    const texto = document.getElementById("aguaResultado");

    if (texto) {

        texto.textContent =
            `${arredondar(aguaLitros, 2)} L`;

    }

    resultado?.classList.remove("active");

    void resultado?.offsetWidth;

    resultado?.classList.add("active");

    mostrarFeedback(
        "Sua estimativa diária de água foi calculada!",
        "success"
    );

});


/* =========================================================
   MACRONUTRIENTES
========================================================= */

const macroFormElement = document.querySelector(".macro-form form");

macroFormElement?.addEventListener("submit", function(event) {

    event.preventDefault();

    const sexo =
        document.getElementById("sexo")?.value;

    const idade =
        Number(document.getElementById("idade")?.value);

    const peso =
        Number(document.getElementById("peso")?.value);

    const altura =
        Number(document.getElementById("altura")?.value);

    const atividade =
        document.getElementById("atividade")?.value;

    const objetivo =
        document.getElementById("objetivo")?.value;


    /* =========================
       VALIDAÇÃO
    ========================= */

    if (!sexo) {

        mostrarFeedback(
            "Selecione seu sexo.",
            "error"
        );

        return;
    }

    if (!numeroValido(idade) ||
        !numeroValido(peso) ||
        !numeroValido(altura)) {

        mostrarFeedback(
            "Preencha idade, peso e altura corretamente.",
            "error"
        );

        return;
    }

    if (!atividade) {

        mostrarFeedback(
            "Selecione seu nível de atividade.",
            "error"
        );

        return;
    }

    if (!objetivo) {

        mostrarFeedback(
            "Selecione seu objetivo.",
            "error"
        );

        return;
    }


    /* =========================
       VALIDAÇÕES DE FAIXA
    ========================= */

    if (idade < 10 || idade > 100) {

        mostrarFeedback(
            "Digite uma idade entre 10 e 100 anos.",
            "error"
        );

        return;
    }

    if (peso < 25 || peso > 300) {

        mostrarFeedback(
            "Digite um peso válido.",
            "error"
        );

        return;
    }

    if (altura < 100 || altura > 250) {

        mostrarFeedback(
            "Digite uma altura entre 100 cm e 250 cm.",
            "error"
        );

        return;
    }


    /* =====================================================
       TMB - MIFFLIN-ST JEOR
    ===================================================== */

    let tmb;

    if (sexo === "masculino") {

        tmb =
            (10 * peso) +
            (6.25 * altura) -
            (5 * idade) +
            5;

    } else {

        tmb =
            (10 * peso) +
            (6.25 * altura) -
            (5 * idade) -
            161;

    }


    /* =====================================================
       FATOR DE ATIVIDADE
    ===================================================== */

    const fatoresAtividade = {

        sedentario: 1.2,

        leve: 1.375,

        moderado: 1.55,

        ativo: 1.725,

        atleta: 1.9

    };


    const fator =
        fatoresAtividade[atividade];


    /*
       Gasto energético diário estimado
    */

    const gasto =
        tmb * fator;


    /* =====================================================
       AJUSTE POR OBJETIVO
    ===================================================== */

    let calorias;

    if (objetivo === "emagrecer") {

        calorias = gasto * 0.80;

    } else if (objetivo === "ganhar") {

        calorias = gasto * 1.10;

    } else {

        calorias = gasto;

    }


    /*
       Proteína:
       2 g por kg

       Gordura:
       25% das calorias

       Carboidratos:
       calorias restantes
    */

    const proteinaGramas =
        peso * 2;

    const gorduraGramas =
        (calorias * 0.25) / 9;

    const caloriasProteina =
        proteinaGramas * 4;

    const caloriasGordura =
        gorduraGramas * 9;

    const carboidratoGramas =
        Math.max(
            0,
            (calorias -
                caloriasProteina -
                caloriasGordura) / 4
        );


    /* =====================================================
       PORCENTAGENS
    ===================================================== */

    const percentualProteina =
        (caloriasProteina / calorias) * 100;

    const percentualGordura =
        (caloriasGordura / calorias) * 100;

    const percentualCarboidrato =
        (carboidratoGramas * 4 / calorias) * 100;


    criarResultadoMacros({

        calorias,

        proteina: proteinaGramas,

        carboidrato: carboidratoGramas,

        gordura: gorduraGramas,

        percentualProteina,

        percentualCarboidrato,

        percentualGordura,

        tmb,

        gasto

    });


    mostrarFeedback(
        "Seus macronutrientes foram calculados com sucesso!",
        "success"
    );

});


/* =========================================================
   RESULTADO DOS MACRONUTRIENTES
========================================================= */

function criarResultadoMacros(dados) {

    let resultado =
        document.querySelector(".resultado-macros");

    if (!resultado) {

        resultado = document.createElement("div");

        resultado.className =
            "resultado-macros";

        macroForm.appendChild(resultado);

    }


    resultado.innerHTML = `

        <div class="resultado-header">

            <span class="resultado-label">
                Resultado
            </span>

            <h3>
                Seus Macronutrientes
            </h3>

            <p>
                Estimativa diária baseada nos dados informados.
            </p>

        </div>


        <div class="resultado-calorias">

            <span>
                Necessidade energética estimada
            </span>

            <strong>
                ${Math.round(dados.calorias)}
                <small>kcal/dia</small>
            </strong>

        </div>


        <div class="macro-result-grid">


            <!-- PROTEÍNA -->

            <div class="macro-result-card">

                <div class="macro-card-icon">
                    P
                </div>

                <span>
                    Proteínas
                </span>

                <strong>
                    ${arredondar(dados.proteina, 0)} g
                </strong>

                <div class="macro-progress">

                    <span
                        style="width: ${Math.min(
                            dados.percentualProteina,
                            100
                        )}%"
                    ></span>

                </div>

                <small>
                    ${arredondar(
                        dados.percentualProteina,
                        0
                    )}% das calorias
                </small>

            </div>


            <!-- CARBOIDRATO -->

            <div class="macro-result-card">

                <div class="macro-card-icon">
                    C
                </div>

                <span>
                    Carboidratos
                </span>

                <strong>
                    ${arredondar(
                        dados.carboidrato,
                        0
                    )} g
                </strong>

                <div class="macro-progress">

                    <span
                        style="width: ${Math.min(
                            dados.percentualCarboidrato,
                            100
                        )}%"
                    ></span>

                </div>

                <small>
                    ${arredondar(
                        dados.percentualCarboidrato,
                        0
                    )}% das calorias
                </small>

            </div>


            <!-- GORDURA -->

            <div class="macro-result-card">

                <div class="macro-card-icon">
                    G
                </div>

                <span>
                    Gorduras
                </span>

                <strong>
                    ${arredondar(
                        dados.gordura,
                        0
                    )} g
                </strong>

                <div class="macro-progress">

                    <span
                        style="width: ${Math.min(
                            dados.percentualGordura,
                            100
                        )}%"
                    ></span>

                </div>

                <small>
                    ${arredondar(
                        dados.percentualGordura,
                        0
                    )}% das calorias
                </small>

            </div>

        </div>


        <div class="resultado-base">

            <div>

                <span>
                    TMB
                </span>

                <strong>
                    ${Math.round(dados.tmb)} kcal
                </strong>

            </div>


            <div>

                <span>
                    Gasto diário estimado
                </span>

                <strong>
                    ${Math.round(dados.gasto)} kcal
                </strong>

            </div>

        </div>

    `;


    resultado.classList.remove(
        "resultado-visible"
    );

    void resultado.offsetWidth;

    resultado.classList.add(
        "resultado-visible"
    );

}


/* =========================================================
   LOGIN / CADASTRO
========================================================= */

const btnLogin =
    document.getElementById("btnLogin");

const closeLogin =
    document.getElementById("closeLogin");

const criarConta =
    document.getElementById("criarConta");

const voltarLogin =
    document.getElementById("voltarLogin");

const loginForm =
    document.getElementById("loginForm");

const registerForm =
    document.getElementById("registerForm");

const loginTitle =
    document.getElementById("loginTitle");

const loginSubtitle =
    document.getElementById("loginSubtitle");


function abrirLogin() {

    const modal =
        document.querySelector(".login-modal");

    /*
       Caso seu HTML ainda não possua
       .login-modal, criamos a classe
       no elemento principal.
    */

    if (modal) {

        modal.classList.add("active");

        document.body.style.overflow = "hidden";
    }

}


function fecharLogin() {

    const modal =
        document.querySelector(".login-modal");

    if (modal) {

        modal.classList.remove("active");

        document.body.style.overflow = "";

    }

}


btnLogin?.addEventListener(
    "click",
    abrirLogin
);


closeLogin?.addEventListener(
    "click",
    fecharLogin
);


document.querySelector(
    ".login-overlay"
)?.addEventListener(
    "click",
    fecharLogin
);


criarConta?.addEventListener(
    "click",
    () => {

        if (loginForm)
            loginForm.style.display = "none";

        if (registerForm)
            registerForm.style.display = "block";

        if (loginTitle)
            loginTitle.textContent =
                "Criar sua conta";

        if (loginSubtitle)
            loginSubtitle.textContent =
                "Cadastre-se no NUTRIQ";

    }
);


voltarLogin?.addEventListener(
    "click",
    () => {

        if (registerForm)
            registerForm.style.display = "none";

        if (loginForm)
            loginForm.style.display = "block";

        if (loginTitle)
            loginTitle.textContent =
                "Entrar na sua conta";

        if (loginSubtitle)
            loginSubtitle.textContent =
                "Acesse sua conta no NUTRIQ";

    }
);


/* =========================================================
   FECHAR MODAL COM ESC
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (event.key === "Escape") {

            fecharLogin();

        }

    }
);

/* =========================================================
   MODO ESCURO - LUA / SOL
========================================================= */

const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");


function atualizarTema() {

    const modoEscuro =
        localStorage.getItem("nutriq-dark-mode") === "true";


    if (modoEscuro) {

        document.body.classList.add("dark-mode");

        if (themeIcon) {
            themeIcon.src = "img/foto-sol.png";
        }

        themeToggle?.setAttribute(
            "aria-label",
            "Desativar modo escuro"
        );

    } else {

        document.body.classList.remove("dark-mode");

        if (themeIcon) {
            themeIcon.src = "img/foto-lua.png";
        }

        themeToggle?.setAttribute(
            "aria-label",
            "Ativar modo escuro"
        );

    }

}


themeToggle?.addEventListener("click", () => {

    const modoEscuro =
        document.body.classList.toggle("dark-mode");

    localStorage.setItem(
        "nutriq-dark-mode",
        modoEscuro
    );

    atualizarTema();

});


/* Carrega o tema salvo */
atualizarTema();

/* =========================================================
   ANIMAÇÕES DE ENTRADA
========================================================= */

const elementosAnimados =
    document.querySelectorAll(
        ".benefit, .side-card, .about-section, .project, .team-member"
    );


elementosAnimados.forEach(
    elemento => {

        elemento.classList.add(
            "animate-ready"
        );

    }
);


const observer =
    new IntersectionObserver(
        entradas => {

            entradas.forEach(
                entrada => {

                    if (
                        entrada.isIntersecting
                    ) {

                        entrada.target.classList.add(
                            "animate-in"
                        );

                        observer.unobserve(
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
    elemento => {

        observer.observe(elemento);

    }
);


/* =========================================================
   FORMULÁRIO DE LOGIN
========================================================= */

loginForm?.addEventListener(
    "submit",
    event => {

        event.preventDefault();

        const email =
            document.getElementById(
                "loginEmail"
            )?.value.trim();

        const senha =
            document.getElementById(
                "loginPassword"
            )?.value.trim();


        if (!email || !senha) {

            mostrarFeedback(
                "Preencha seu e-mail e senha.",
                "error"
            );

            return;

        }


        /*
           Aqui futuramente você poderá
           conectar sua API/backend.
        */

        mostrarFeedback(
            "Login recebido. O sistema de autenticação poderá ser conectado ao backend.",
            "info"
        );

    }
);


/* =========================================================
   FORMULÁRIO DE CADASTRO
========================================================= */

registerForm?.addEventListener(
    "submit",
    event => {

        event.preventDefault();

        const senha =
            document.getElementById(
                "senhaCadastro"
            )?.value;

        const confirmar =
            document.getElementById(
                "confirmarSenha"
            )?.value;

        const termos =
            registerForm.querySelector(
                'input[type="checkbox"]'
            )?.checked;


        if (senha !== confirmar) {

            mostrarFeedback(
                "As senhas não são iguais.",
                "error"
            );

            return;

        }


        if (!termos) {

            mostrarFeedback(
                "Aceite os termos de uso para continuar.",
                "error"
            );

            return;

        }


        mostrarFeedback(
            "Cadastro preenchido com sucesso. A conexão com o backend poderá ser adicionada posteriormente.",
            "success"
        );

    }
);


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        mostrarAba("macros");

    }
);


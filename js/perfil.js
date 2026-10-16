
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);

  const form = $("perfilForm");
  const feedback = $("perfilFeedback");
  const storageKey = "nutriqPerfil";
  const preferenceKey = "nutriqPreferencias";

  const campos = [
    "nome",
    "email",
    "telefone",
    "cidade",
    "estado",
    "crn",
    "especialidade",
    "apresentacao"
  ];

  const preferencias = [
    "notificacoesEmail",
    "lembretesConsulta",
    "modoEscuro"
  ];

  let dadosOriginais = {};
  let preferenciasOriginais = {};
  let fotoTemporaria = null;

  function lerJSON(chave, padrao) {
    try {
      const valor = localStorage.getItem(chave);
      return valor ? JSON.parse(valor) : padrao;
    } catch {
      return padrao;
    }
  }

  function mostrarFeedback(mensagem, erro = false) {
    feedback.textContent = mensagem;
    feedback.style.color = erro ? "#c0392b" : "var(--perfil-primary)";
  }

  function lerCampo(id) {
    return $(id).value.trim();
  }

  function coletarDados() {
    return Object.fromEntries(
      campos.map((campo) => [campo, lerCampo(campo)])
    );
  }

  function coletarPreferencias() {
    return Object.fromEntries(
      preferencias.map((id) => [id, $(id).checked])
    );
  }

  function renderizarPerfil(dados) {
    $("nomeExibicao").textContent = dados.nome || "Meu perfil";
    $("cargoExibicao").textContent = dados.crn
      ? `Nutricionista · ${dados.crn}`
      : "Nutricionista";

    $("emailExibicao").textContent = dados.email || "Adicione seu e-mail";

    const local = [dados.cidade, dados.estado]
      .filter(Boolean)
      .join(", ");

    $("cidadeExibicao").textContent = local || "Adicione sua cidade";

    $("avatarInitial").textContent =
      (dados.nome || "N").trim().charAt(0).toUpperCase();
  }

  function preencherCampos(dados) {
    campos.forEach((campo) => {
      $(campo).value = dados[campo] || "";
    });

    renderizarPerfil(dados);
    atualizarContador();
  }

  function atualizarContador() {
    $("contadorApresentacao").textContent =
      $("apresentacao").value.length;
  }

  function aplicarPreferencias(dados) {
    preferencias.forEach((id) => {
      $(id).checked = Boolean(dados[id]);
    });

    document.body.classList.toggle(
      "dark-mode",
      Boolean(dados.modoEscuro)
    );
  }

  function salvarPreferencias() {
    const dados = coletarPreferencias();

    localStorage.setItem(preferenceKey, JSON.stringify(dados));
    preferenciasOriginais = { ...dados };
    aplicarPreferencias(dados);
  }

  function restaurarDados() {
    const dados = lerJSON(storageKey, {});
    const prefs = lerJSON(preferenceKey, {
      notificacoesEmail: true,
      lembretesConsulta: true,
      modoEscuro: false
    });

    preencherCampos(dados);
    aplicarPreferencias(prefs);

    dadosOriginais = coletarDados();
    preferenciasOriginais = coletarPreferencias();

    if (dados.foto) {
      mostrarFoto(dados.foto);
    }
  }

  function mostrarFoto(src) {
    const avatar = $("avatarPreview");
    avatar.replaceChildren();

    const img = document.createElement("img");
    img.src = src;
    img.alt = "Foto do perfil";

    img.addEventListener("error", () => {
      avatar.replaceChildren();
      $("avatarInitial").textContent =
        (lerCampo("nome") || "N").charAt(0).toUpperCase();
      avatar.appendChild($("avatarInitial"));
    }, { once: true });

    avatar.appendChild(img);
  }

  $("fotoPerfil").addEventListener("change", (event) => {
    const arquivo = event.target.files[0];

    if (!arquivo) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(arquivo.type)) {
      mostrarFeedback("Escolha uma imagem JPG, PNG ou WEBP.", true);
      event.target.value = "";
      return;
    }

    if (arquivo.size > 2 * 1024 * 1024) {
      mostrarFeedback("A foto deve ter no máximo 2 MB.", true);
      event.target.value = "";
      return;
    }

    const leitor = new FileReader();

    leitor.onload = () => {
      fotoTemporaria = leitor.result;
      mostrarFoto(fotoTemporaria);
      mostrarFeedback("Pré-visualização da foto atualizada.");
    };

    leitor.onerror = () => {
      mostrarFeedback("Não foi possível abrir esta imagem.", true);
    };

    leitor.readAsDataURL(arquivo);
  });

  form.addEventListener("input", (event) => {
    if (campos.includes(event.target.id)) {
      renderizarPerfil(coletarDados());
    }

    if (event.target.id === "apresentacao") {
      atualizarContador();
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!form.reportValidity()) return;

    const senhaAtual = $("senhaAtual").value;
    const novaSenha = $("novaSenha").value;
    const confirmarSenha = $("confirmarSenha").value;

    if (novaSenha || confirmarSenha || senhaAtual) {
      if (!senhaAtual || !novaSenha || !confirmarSenha) {
        mostrarFeedback(
          "Preencha a senha atual, a nova senha e a confirmação.",
          true
        );
        return;
      }

      if (novaSenha.length < 6) {
        mostrarFeedback(
          "A nova senha deve ter pelo menos 6 caracteres.",
          true
        );
        return;
      }

      if (novaSenha !== confirmarSenha) {
        mostrarFeedback("As senhas novas não coincidem.", true);
        return;
      }

      mostrarFeedback(
        "O perfil não foi salvo: conecte a troca de senha ao backend para alterar sua senha com segurança.",
        true
      );
      return;
    }

    const dados = coletarDados();
    const prefs = coletarPreferencias();
    const existentes = lerJSON(storageKey, {});

    if (fotoTemporaria) {
      dados.foto = fotoTemporaria;
    } else if (existentes.foto) {
      dados.foto = existentes.foto;
    }

    try {
      localStorage.setItem(storageKey, JSON.stringify(dados));
      localStorage.setItem(preferenceKey, JSON.stringify(prefs));

      dadosOriginais = { ...coletarDados() };
      preferenciasOriginais = { ...prefs };
      fotoTemporaria = null;

      aplicarPreferencias(prefs);
      renderizarPerfil(dados);

      mostrarFeedback("Perfil salvo neste navegador com sucesso.");
    } catch {
      mostrarFeedback(
        "Não foi possível salvar. A imagem pode ser muito grande para o armazenamento disponível.",
        true
      );
    }
  });

  $("descartarAlteracoes").addEventListener("click", () => {
    preencherCampos(dadosOriginais);
    aplicarPreferencias(preferenciasOriginais);

    fotoTemporaria = null;
    $("fotoPerfil").value = "";

    const salvos = lerJSON(storageKey, {});

    if (salvos.foto) {
      mostrarFoto(salvos.foto);
    } else {
      $("avatarPreview").replaceChildren($("avatarInitial"));
      $("avatarInitial").textContent =
        (dadosOriginais.nome || "N").charAt(0).toUpperCase();
    }

    $("senhaAtual").value = "";
    $("novaSenha").value = "";
    $("confirmarSenha").value = "";

    mostrarFeedback("Alterações não salvas foram descartadas.");
  });

  preferencias.forEach((id) => {
    $(id).addEventListener("change", () => {
      salvarPreferencias();
      mostrarFeedback("Preferência atualizada neste navegador.");
    });
  });

  document.querySelectorAll("[data-edit]").forEach((botao) => {
    botao.addEventListener("click", () => {
      const secao = $(botao.dataset.edit);
      const primeiroCampo = secao.querySelector("input, textarea");

      primeiroCampo?.focus();
    });
  });

  document.querySelectorAll(".perfil-menu-link").forEach((link) => {
    link.addEventListener("click", () => {
      document.querySelectorAll(".perfil-menu-link").forEach((item) => {
        item.classList.remove("active");
      });

      link.classList.add("active");
    });
  });

  restaurarDados();
});

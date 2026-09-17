/* ==========================================================================
  PROJETO GURIZADA — script.js
  Modular, sem dependências. Cada recurso se protege para que páginas que
  não possuam um elemento específico simplesmente ignorem esse bloco.
  ========================================================================== */

(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ------------------------------------------------------------------
      Cabeçalho: fundo sólido após rolagem além do hero
    ------------------------------------------------------------------ */
  const header = document.querySelector(".header");
  if (header) {
    const toggleHeader = () => {
      header.classList.toggle("active", window.scrollY > 60);
    };
    toggleHeader();
    window.addEventListener("scroll", toggleHeader, { passive: true });
  }

    /* ------------------------------------------------------------------
      Barra de progresso do cinto (elemento de destaque): preenche conforme
      a página é rolada
    ------------------------------------------------------------------ */
  const beltFill = document.querySelector(".belt-progress__fill");
  if (beltFill) {
    const updateBelt = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      beltFill.style.width = pct + "%";
    };
    updateBelt();
    window.addEventListener("scroll", updateBelt, { passive: true });
    window.addEventListener("resize", updateBelt);
  }

    /* ------------------------------------------------------------------
      Menu móvel
    ------------------------------------------------------------------ */
  const menuToggle = document.querySelector(".menu-toggle");
  const navMobile = document.querySelector(".nav-mobile");
  const navScrim = document.querySelector(".nav-scrim");

  const closeMenu = () => {
    menuToggle?.classList.remove("open");
    navMobile?.classList.remove("open");
    navScrim?.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  };

  if (menuToggle && navMobile) {
    menuToggle.addEventListener("click", () => {
      const isOpen = navMobile.classList.toggle("open");
      menuToggle.classList.toggle("open", isOpen);
      navScrim?.classList.toggle("open", isOpen);
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      document.body.style.overflow = isOpen ? "hidden" : "";
    });
    navScrim?.addEventListener("click", closeMenu);
    navMobile.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });
  }

    /* ------------------------------------------------------------------
      Rolagem suave para âncoras na mesma página (hashes da mesma rota)
    ------------------------------------------------------------------ */
  document.querySelectorAll('a[href*="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const url = new URL(this.href, window.location.href);
      const isSamePage = url.pathname === window.location.pathname;
      if (!isSamePage || !url.hash) return;
      const target = document.querySelector(url.hash);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
      history.pushState(null, "", url.hash);
    });
  });

    /* ------------------------------------------------------------------
      Revelação por scroll via IntersectionObserver
    ------------------------------------------------------------------ */
  const revealTargets = document.querySelectorAll("[data-reveal]");
  if (revealTargets.length) {
    if (prefersReducedMotion) {
      revealTargets.forEach((el) => el.classList.add("is-visible"));
    } else {
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
      );
      revealTargets.forEach((el) => revealObserver.observe(el));
    }
  }

    /* ------------------------------------------------------------------
      Contadores animados (estatísticas)
    ------------------------------------------------------------------ */
  const counters = document.querySelectorAll("[data-number]");
  if (counters.length) {
    const animateCounter = (el) => {
      const target = Number(el.dataset.number);
      const suffix = el.dataset.suffix || "";
      if (prefersReducedMotion) {
        el.textContent = target + suffix;
        return;
      }
      const duration = 1600;
      const start = performance.now();
      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target + suffix;
      };
      requestAnimationFrame(step);
    };

    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((c) => counterObserver.observe(c));
  }

    /* ------------------------------------------------------------------
      Botão voltar ao topo
    ------------------------------------------------------------------ */
  const topButton = document.querySelector(".top-button");
  if (topButton) {
    window.addEventListener(
      "scroll",
      () => topButton.classList.toggle("show", window.scrollY > 600),
      { passive: true }
    );
    topButton.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  }

    /* ------------------------------------------------------------------
      CAPTCHA de entrada
    ------------------------------------------------------------------ */
  const captchaModal = document.getElementById("captchaModal");
  if (captchaModal) {
    const captchaQuestion = document.getElementById("captchaQuestion");
    const captchaAnswer = document.getElementById("captchaAnswer");
    const captchaSubmit = document.getElementById("captchaSubmit");
    const captchaError = document.getElementById("captchaError");

    const challenges = [
      { question: "Qual é o resultado de 7 + 5?", answer: "12" },
      { question: "Digite a palavra jiujitsu sem traço.", answer: "jiujitsu" },
      { question: "Qual é a cor do nosso destaque principal?", answer: "ouro" }
    ];

    let expectedAnswer = "";

    const setCaptcha = () => {
      const challenge = challenges[Math.floor(Math.random() * challenges.length)];
      captchaQuestion.textContent = challenge.question;
      expectedAnswer = challenge.answer;
      captchaAnswer.value = "";
      captchaError.textContent = "";
      document.body.classList.add("captcha-open");
      captchaAnswer.focus();
    };

    const validateCaptcha = () => {
      const value = (captchaAnswer.value || "").trim().toLowerCase();
      if (!value) {
        captchaError.textContent = "Informe a resposta para continuar.";
        return false;
      }
      if (value !== expectedAnswer.toLowerCase()) {
        captchaError.textContent = "Resposta incorreta. Tente novamente.";
        return false;
      }
      return true;
    };

    const closeCaptcha = () => {
      captchaModal.style.display = "none";
      document.body.classList.remove("captcha-open");
    };

    const submitCaptcha = () => {
      if (validateCaptcha()) {
        closeCaptcha();
      }
    };

    captchaSubmit.addEventListener("click", submitCaptcha);
    captchaAnswer.addEventListener("keydown", (event) => {
      if (event.key === "Enter") submitCaptcha();
    });

    setCaptcha();
  }

    /* ------------------------------------------------------------------
      Lightbox da galeria
    ------------------------------------------------------------------ */
  const galleryLinks = document.querySelectorAll("[data-lightbox]");
  const lightbox = document.querySelector(".lightbox");
  if (galleryLinks.length && lightbox) {
    const lightboxImg = lightbox.querySelector("img");
    const closeBtn = lightbox.querySelector(".lightbox__close");

    const openLightbox = (src, alt) => {
      lightboxImg.src = src;
      lightboxImg.alt = alt || "";
      lightbox.classList.add("open");
      document.body.style.overflow = "hidden";
    };
    const closeLightbox = () => {
      lightbox.classList.remove("open");
      document.body.style.overflow = "";
    };

    galleryLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const fullImg = link.querySelector("img");
        openLightbox(link.getAttribute("href"), fullImg?.alt);
      });
    });
    closeBtn?.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeLightbox();
    });
  }

    /* ------------------------------------------------------------------
      Formulário de contato → validação + envio por e-mail
    ------------------------------------------------------------------ */
  const form = document.querySelector("#contato-form");
  if (form) {
    const emailTo = form.dataset.email || "devcode.roger@gmail.com";
    const fields = form.querySelectorAll("[data-required]");

    const showError = (field, message) => {
      const wrapper = field.closest(".field");
      const msg = wrapper?.querySelector(".field__msg");
      wrapper?.classList.add("has-error");
      if (msg) msg.textContent = message;
    };
    const clearError = (field) => {
      const wrapper = field.closest(".field");
      const msg = wrapper?.querySelector(".field__msg");
      wrapper?.classList.remove("has-error");
      if (msg) msg.textContent = "";
    };

    const validate = () => {
      let valid = true;
      fields.forEach((field) => {
        clearError(field);
        const value = field.value.trim();
        if (!value) {
          showError(field, "Preencha este campo.");
          valid = false;
        } else if (field.type === "tel" && value.replace(/\D/g, "").length < 10) {
          showError(field, "Informe um telefone com DDD.");
          valid = false;
        }
      });
      return valid;
    };

    fields.forEach((field) => {
      field.addEventListener("input", () => clearError(field));
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!validate()) return;

      const nome = form.querySelector("#nome")?.value.trim() || "";
      const telefone = form.querySelector("#telefone")?.value.trim() || "";
      const modalidade = form.querySelector("#modalidade")?.value || "";
      const mensagem = form.querySelector("#mensagem")?.value.trim() || "";
      const status = form.querySelector(".form-status");

      if (status) {
        status.textContent = "Enviando sua mensagem...";
        status.classList.remove("ok", "error");
        status.classList.add("show");
      }

      try {
        const response = await fetch("../salvar_lead.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest"
          },
          body: JSON.stringify({
            nome,
            telefone,
            modalidade,
            mensagem,
            email: emailTo
          })
        });

        const responseText = await response.text();
        let data = {};

        if (responseText) {
          try {
            data = JSON.parse(responseText);
          } catch (parseError) {
            console.error("Resposta do servidor inválida:", parseError, responseText);
            throw new Error("O servidor respondeu com uma mensagem inválida. Verifique a configuração do envio por e-mail.");
          }
        }

        if (!response.ok || data.status !== "success") {
          throw new Error(data.message || "Não foi possível enviar a mensagem.");
        }

        if (status) {
          status.textContent = "Mensagem enviada com sucesso! Em breve entraremos em contato por e-mail.";
          status.classList.add("ok");
        }
        form.reset();
      } catch (error) {
        if (status) {
          status.textContent = error.message || "Ocorreu um erro ao enviar a mensagem.";
          status.classList.add("error");
        }
      }
    });
  }

    /* ------------------------------------------------------------------
      Ano no rodapé
    ------------------------------------------------------------------ */
  const yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();

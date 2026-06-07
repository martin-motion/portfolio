export function AboutOverlay() {
  let restoreFocusTo = null;

  const overlay = document.createElement("div");
  overlay.className = "about-overlay";
  overlay.setAttribute("aria-hidden", "true");
  overlay.innerHTML = `
    <article class="about-overlay__panel" role="dialog" aria-modal="true" aria-labelledby="about-title" tabindex="-1">
      <button class="about-overlay__close" type="button" aria-label="Fermer">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
      </button>
      <div class="about-overlay__media" aria-hidden="true">
        <img src="./assets/logo/logo-liquid.png?v=20260607-premium-v13" alt="" loading="lazy" decoding="async" />
      </div>
      <div class="about-overlay__content">
        <p class="about-overlay__eyebrow">À propos</p>
        <h2 id="about-title"><span>Martin</span> <em>Motion</em></h2>
        <p class="about-overlay__intro">
          Concevoir des expériences uniques avec un fil rouge narratif fort pour des images qui racontent une histoire et marquent les esprits.
        </p>
        <p class="about-overlay__desc">
          Martin Motion est un studio de création et d'exploration visuelle spécialisé en Direction Artistique, Motion Design premium et intelligence artificielle générative pour concevoir des projets et des films à forte identité.
        </p>
        <div class="about-overlay__grid">
          <div class="about-overlay__section">
            <h3>Expertise</h3>
            <ul>
              <li>Direction Artistique</li>
              <li>Motion Design</li>
              <li>IA Générative & VFX</li>
              <li>Montage & Post-Production</li>
            </ul>
            <div class="about-overlay__contact">
              <a href="mailto:martinbarbe09@gmail.com" class="about-contact-link">
                <span>Nous contacter</span>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
            </div>
          </div>
          <div class="about-overlay__section">
            <h3>Stack Technique</h3>
            <div class="about-overlay__badges">
              <span class="about-badge">After Effects</span>
              <span class="about-badge">Cinema 4D</span>
              <span class="about-badge">Photoshop</span>
              <span class="about-badge">Illustrator</span>
              <span class="about-badge">Midjourney</span>
              <span class="about-badge">Kling</span>
              <span class="about-badge">Seedance</span>
              <span class="about-badge">Gemini</span>
              <span class="about-badge">Flux</span>
              <span class="about-badge">Premiere Pro</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  `;

  const panel = overlay.querySelector(".about-overlay__panel");
  const closeButton = overlay.querySelector(".about-overlay__close");

  const getFocusableElements = () => {
    return Array.from(
      panel.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    );
  };

  const handleFocusTrap = (event) => {
    if (overlay.getAttribute("aria-hidden") === "true") return;
    if (event.key !== "Tab") return;

    const focusables = getFocusableElements();
    if (focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  };

  const open = (trigger) => {
    restoreFocusTo = trigger ?? document.activeElement;
    if (restoreFocusTo && typeof restoreFocusTo.blur === "function") {
      restoreFocusTo.blur();
    }
    overlay.setAttribute("aria-hidden", "false");
    document.documentElement.classList.add("has-overlay");
    document.body.classList.add("has-overlay");
    
    // Attendre l'animation pour focus le panel ou le bouton fermer
    window.setTimeout(() => {
      const focusables = getFocusableElements();
      if (focusables.length > 0) {
        focusables[0].focus({ preventScroll: true });
      } else {
        panel.focus({ preventScroll: true });
      }
    }, 100);
  };

  const close = () => {
    overlay.setAttribute("aria-hidden", "true");
    document.documentElement.classList.remove("has-overlay");
    document.body.classList.remove("has-overlay");

    if (restoreFocusTo && typeof restoreFocusTo.focus === "function") {
      restoreFocusTo.focus({ preventScroll: true });
    }
  };

  closeButton.addEventListener("click", close);

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) close();
  });

  window.addEventListener("keydown", (event) => {
    if (overlay.getAttribute("aria-hidden") === "true") return;
    if (event.key === "Escape") close();
  });

  panel.addEventListener("keydown", handleFocusTrap);

  return {
    element: overlay,
    open,
    close,
  };
}

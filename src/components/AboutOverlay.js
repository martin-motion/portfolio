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
        <img src="./assets/logo/logo-liquid.png?v=20260604-final-cta" alt="" loading="lazy" decoding="async" />
      </div>
      <div class="about-overlay__content">
        <p class="about-overlay__eyebrow">À propos</p>
        <h2 id="about-title"><span>Martin</span> <em>Motion</em></h2>
        <p>
          Studio de création et d'exploration visuelle spécialisé en Direction Artistique et Motion Design. 
          La démarche repose sur une hybridation des workflows : l'alliance de l'art du mouvement traditionnel 
          avec l'exploration continue de l'intelligence artificielle générative pour concevoir des expériences 
          et des films à forte identité.
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
          </div>
          <div class="about-overlay__section">
            <h3>Stack Technique</h3>
            <div class="about-overlay__badges">
              <span class="about-badge">After Effects</span>
              <span class="about-badge">Cinema 4D</span>
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

  const open = (trigger) => {
    restoreFocusTo = trigger ?? document.activeElement;
    if (restoreFocusTo && typeof restoreFocusTo.blur === "function") {
      restoreFocusTo.blur();
    }
    overlay.setAttribute("aria-hidden", "false");
    document.documentElement.classList.add("has-overlay");
    document.body.classList.add("has-overlay");
    window.setTimeout(() => panel.focus({ preventScroll: true }), 60);
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

  return {
    element: overlay,
    open,
    close,
  };
}

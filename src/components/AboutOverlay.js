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
        <img src="./assets/logo/logo-liquid.png?v=20260604-candy-overlay" alt="" loading="lazy" decoding="async" />
      </div>
      <div class="about-overlay__content">
        <p class="about-overlay__eyebrow">À propos</p>
        <h2 id="about-title">Martin Motion</h2>
        <p>
          Motion designer et directeur artistique, je conçois des images en mouvement
          pour des films, interfaces, identités et expérimentations visuelles.
        </p>
        <p>
          Cette fiche servira bientôt à présenter le parcours, l'approche créative
          et une image dédiée.
        </p>
      </div>
    </article>
  `;

  const panel = overlay.querySelector(".about-overlay__panel");
  const closeButton = overlay.querySelector(".about-overlay__close");

  const open = (trigger) => {
    restoreFocusTo = trigger ?? document.activeElement;
    overlay.setAttribute("aria-hidden", "false");
    document.documentElement.classList.add("has-overlay");
    document.body.classList.add("has-overlay");
    panel.focus({ preventScroll: true });
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

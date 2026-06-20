import { makeMagnetic } from "../utils.js";

export function AboutOverlay() {
  let restoreFocusTo = null;

  const overlay = document.createElement("div");
  overlay.className = "about-overlay";
  overlay.setAttribute("aria-hidden", "true");
  overlay.inert = true;
  overlay.innerHTML = `
    <article class="about-overlay__panel" role="dialog" aria-modal="true" aria-labelledby="about-title" tabindex="-1">
      <button class="about-overlay__close" type="button" aria-label="Fermer">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
      </button>
      <div class="about-overlay__media" aria-hidden="true">
        <img src="./assets/logo/logo-liquid.png?v=20260620-responsive-final" alt="" loading="lazy" decoding="async" />
      </div>
      <div class="about-overlay__content">
        <p class="about-overlay__eyebrow">À propos</p>
        <h2 id="about-title"><span>Martin</span> <em>Motion</em></h2>
        <div class="about-overlay__presentation">
          <p>
            Concevoir des expériences uniques, guidées par un fil rouge narratif fort, pour façonner des univers visuels porteurs de sens et d’émotion.
          </p>
          <p>
            Directeur Artistique et Motion Designer indépendant, je développe une approche hybride, entre savoir-faire traditionnels, design de mouvement, direction visuelle et intelligence artificielle, pour donner vie à des projets et des films singuliers, à forte identité.
          </p>
        </div>
        <div class="about-overlay__grid">
          <div class="about-overlay__section">
            <h3>Expertise</h3>
            <ul>
              <li>Direction Artistique</li>
              <li>Motion Design</li>
              <li>IA & VFX</li>
              <li>Montage & Post-Production</li>
            </ul>
          </div>
          <div class="about-overlay__section">
            <h3>Stack Technique</h3>
            <div class="about-overlay__badges">
              <span class="about-badge">After Effects</span>
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
        <div class="about-overlay__contact">
          <a href="mailto:martinbarbe09@gmail.com" class="about-contact-btn" aria-label="Me contacter par email">
            <span>Contact</span>
          </a>
          <a href="https://www.instagram.com/martin.motion_/reels/" target="_blank" rel="noopener noreferrer" class="about-contact-btn" aria-label="Me suivre sur Instagram">
            <span>Instagram</span>
          </a>
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
    overlay.inert = false;
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
    overlay.inert = true;
    document.documentElement.classList.remove("has-overlay");
    document.body.classList.remove("has-overlay");

    if (restoreFocusTo && typeof restoreFocusTo.focus === "function") {
      restoreFocusTo.focus({ preventScroll: true });
    }
  };

  closeButton.addEventListener("click", close);

  overlay.querySelectorAll(".about-contact-btn").forEach((btn) => {
    makeMagnetic(btn, 0.2);
  });

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) close();
  });

  window.addEventListener("keydown", (event) => {
    if (overlay.getAttribute("aria-hidden") === "true") return;
    if (event.key === "Escape") close();
  });

  panel.addEventListener("keydown", handleFocusTrap);

  overlay.addEventListener("pointermove", (event) => {
    if (overlay.getAttribute("aria-hidden") === "true") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const rect = overlay.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    const mediaImg = overlay.querySelector(".about-overlay__media img");
    if (mediaImg) {
      mediaImg.style.transform = `translate(${x * 18}px, ${y * 18}px)`;
      mediaImg.style.transition = "transform 350ms cubic-bezier(0.25, 1, 0.5, 1)";
    }
  }, { passive: true });

  overlay.addEventListener("pointerleave", () => {
    const mediaImg = overlay.querySelector(".about-overlay__media img");
    if (mediaImg) {
      mediaImg.style.transform = "";
      mediaImg.style.transition = "transform 600ms cubic-bezier(0.25, 1, 0.5, 1)";
    }
  });

  return {
    element: overlay,
    open,
    close,
  };
}

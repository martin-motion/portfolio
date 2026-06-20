import { makeMagnetic } from "../utils.js";

export function Header({ onAboutOpen } = {}) {
  const header = document.createElement("header");
  header.className = "site-header";
  header.innerHTML = `
    <nav class="site-nav" aria-label="Navigation principale">
      <div class="site-nav__pill"></div>
      <a class="site-nav__link is-active" href="/" data-route-link="selection" aria-current="page">Home</a>
      <a class="site-nav__link" href="/portfolio" data-route-link="portfolio">Portfolio</a>
      <a class="site-nav__link" href="#about" data-about-link>À propos</a>
      <div class="site-nav__more">
        <button class="site-nav__more-trigger" type="button" aria-label="Plus d'options de contact" aria-expanded="false">
          <svg viewBox="0 0 24 24" aria-hidden="true" width="14" height="14"><path fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" d="M12 5v14M5 12h14"/></svg>
        </button>
        <div class="site-nav__dropdown" aria-hidden="true">
          <a class="site-nav__dropdown-item" href="mailto:martinbarbe09@gmail.com">
            <span>Email</span>
          </a>
          <a class="site-nav__dropdown-item" href="https://www.instagram.com/martin.motion_/reels/" target="_blank" rel="noopener noreferrer">
            <span>Instagram</span>
          </a>
        </div>
      </div>
    </nav>
  `;

  const nav = header.querySelector(".site-nav");
  const pill = header.querySelector(".site-nav__pill");
  const links = header.querySelectorAll(".site-nav__link");

  const updatePill = (target) => {
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const navRect = nav.getBoundingClientRect();
    pill.style.width = `${rect.width}px`;
    pill.style.transform = `translateX(${rect.left - navRect.left}px)`;
  };

  let pillFrame = 0;
  const syncPill = () => {
    window.cancelAnimationFrame(pillFrame);
    pillFrame = window.requestAnimationFrame(() => {
      updatePill(nav.querySelector(".is-active"));
    });
  };

  links.forEach((link) => {
    link.addEventListener("mouseenter", () => updatePill(link));
  });

  nav.addEventListener("mouseleave", () => {
    const activeLink = nav.querySelector(".is-active");
    if (activeLink) updatePill(activeLink);
    else pill.style.opacity = "0";
  });
  
  nav.addEventListener("mouseenter", () => {
    pill.style.opacity = "1";
  });

  // Positionner la pilule au chargement sans transition pour éviter le saut visuel
  const activeLink = nav.querySelector(".is-active");
  if (activeLink) {
    pill.style.transition = "none";
    pill.style.opacity = "1";
    updatePill(activeLink);
    // Forcer un reflow
    pill.offsetHeight;
    window.requestAnimationFrame(() => {
      pill.style.transition = "";
    });
  }

  // Logique du bouton dropdown "+"
  const moreContainer = header.querySelector(".site-nav__more");
  const moreTrigger = header.querySelector(".site-nav__more-trigger");
  const dropdown = header.querySelector(".site-nav__dropdown");

  if (moreTrigger && dropdown) {
    const closeMoreMenu = ({ restoreFocus = false } = {}) => {
      if (!moreContainer.classList.contains("is-open")) return;
      moreContainer.classList.remove("is-open");
      moreTrigger.setAttribute("aria-expanded", "false");
      dropdown.setAttribute("aria-hidden", "true");
      if (restoreFocus) moreTrigger.focus({ preventScroll: true });
    };

    moreTrigger.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = moreContainer.classList.toggle("is-open");
      moreTrigger.setAttribute("aria-expanded", isOpen ? "true" : "false");
      dropdown.setAttribute("aria-hidden", isOpen ? "false" : "true");
    });

    document.addEventListener("click", (e) => {
      if (moreContainer.classList.contains("is-open") && !moreContainer.contains(e.target)) {
        closeMoreMenu();
      }
    });

    moreContainer.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      closeMoreMenu({ restoreFocus: true });
    });

    // Rendre le bouton plus magnétique
    makeMagnetic(moreTrigger, 0.25);
  }

  const aboutLink = header.querySelector("[data-about-link]");
  aboutLink.addEventListener("click", (event) => {
    if (!onAboutOpen) return;

    event.preventDefault();
    aboutLink.blur();
    onAboutOpen(aboutLink);
  });

  header.querySelectorAll("[data-route-link]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      link.blur();
      window.history.pushState(null, "", link.getAttribute("href"));
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
  });

  header.querySelectorAll("a").forEach((link) => makeMagnetic(link, 0.2));

  const setActiveRoute = (route) => {
    let newActive = null;
    header.querySelectorAll("[data-route-link]").forEach((link) => {
      const isActive = link.dataset.routeLink === route;
      link.classList.toggle("is-active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "page");
        newActive = link;
      } else {
        link.removeAttribute("aria-current");
      }
    });
    if (newActive) syncPill();
  };

  window.addEventListener("resize", syncPill, { passive: true });
  window.addEventListener("orientationchange", syncPill, { passive: true });
  if ("ResizeObserver" in window) {
    new ResizeObserver(syncPill).observe(nav);
  }

  return {
    element: header,
    setActiveRoute,
  };
}

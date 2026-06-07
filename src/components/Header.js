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
      <a class="site-nav__link" href="mailto:martinbarbe09@gmail.com">Contact</a>
      <a class="site-nav__link" href="https://www.instagram.com/martin.motion_/reels/" target="_blank" rel="noopener noreferrer" aria-label="Suivre sur Instagram">Instagram</a>
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
    if (newActive) updatePill(newActive);
  };

  return {
    element: header,
    setActiveRoute,
  };
}

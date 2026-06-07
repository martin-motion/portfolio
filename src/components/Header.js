import { makeMagnetic } from "../utils.js";

export function Header({ onAboutOpen } = {}) {
  const header = document.createElement("header");
  header.className = "site-header";
  header.innerHTML = `
    <nav class="site-nav" aria-label="Navigation principale">
      <a class="site-nav__link is-active" href="/" data-route-link="selection" aria-current="page">Home</a>
      <a class="site-nav__link" href="/portfolio" data-route-link="portfolio">Portfolio</a>
      <a class="site-nav__link" href="#about" data-about-link>À propos</a>
      <a class="site-nav__link" href="mailto:martinbarbe09@gmail.com">Contact</a>
    </nav>
  `;

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
    header.querySelectorAll("[data-route-link]").forEach((link) => {
      const isActive = link.dataset.routeLink === route;
      link.classList.toggle("is-active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  return {
    element: header,
    setActiveRoute,
  };
}

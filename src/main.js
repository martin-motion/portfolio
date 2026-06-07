import { projects } from "./projects.js?v=20260607-premium-v26";
import { Header } from "./components/Header.js?v=20260607-premium-v26";
import { Hero } from "./components/Hero.js?v=20260607-premium-v26";
import { CustomCursor } from "./components/CustomCursor.js?v=20260607-premium-v26";
import { ProjectCarousel } from "./components/ProjectCarousel.js?v=20260607-premium-v26";
import { PortfolioGrid } from "./components/PortfolioGrid.js?v=20260607-premium-v26";
import { VideoOverlay } from "./components/VideoOverlay.js?v=20260607-premium-v26";
import { AboutOverlay } from "./components/AboutOverlay.js?v=20260607-premium-v26";




import { makeMagnetic } from "./utils.js";

const app = document.querySelector("#app");
const aboutOverlay = AboutOverlay();
const featuredProjects = projects.filter((project) => project.featured);
const selectionProjects = [
  ...featuredProjects.filter((project) => project.id === "interface"),
  ...featuredProjects.filter((project) => project.id === "souvenirs"),
  ...featuredProjects.filter((project) => project.id !== "interface"),
].filter((project, index, items) => items.findIndex((item) => item.id === project.id) === index);
const selectionView = document.createElement("div");
selectionView.className = "selection-view route-view";

const overlay = VideoOverlay({
  projects,
  onProjectChange: (index) => {
    const project = projects[index];
    const selectionIndex = selectionProjects.findIndex((item) => item.id === project.id);
    if (selectionIndex >= 0) carousel.setActiveIndex(selectionIndex);
  },
});

const carousel = ProjectCarousel({
  projects: selectionProjects,
  initialIndex: 0,
  onOpenProject: (project, _index, trigger) => {
    const projectIndex = projects.findIndex((item) => item.id === project.id);
    overlay.open(project, projectIndex, trigger);
  },
  onActiveChange: (project) => {
    // Teinte dynamique du halo de fond par projet
    const colors = {
      "lumen": "rgba(92, 120, 245, 0.05)",      // Bleu violacé
      "orbit": "rgba(225, 140, 50, 0.05)",      // Orange Magic Candy
      "rendez-vous": "rgba(235, 96, 210, 0.05)", // Magenta Big Bang
      "souvenirs": "rgba(140, 172, 245, 0.05)",  // Bleu Azur Pilot
      "interface": "rgba(50, 225, 180, 0.05)",   // Vert émeraude Happy New Year
      "neoforma": "rgba(150, 80, 240, 0.05)",    // Violet La Recette
      "epure": "rgba(228, 210, 170, 0.05)"       // Doré Generative
    };
    const glowColor = colors[project.id] || "rgba(120, 156, 245, 0.05)";
    document.documentElement.style.setProperty("--mouse-glow-color", glowColor);
  }
});

const portfolio = PortfolioGrid({
  projects,
  onOpenProject: (project, trigger) => {
    const projectIndex = projects.findIndex((item) => item.id === project.id);
    overlay.open(project, projectIndex, trigger);
  },
});

const header = Header({ onAboutOpen: (trigger) => aboutOverlay.open(trigger) });
const selectionActions = document.createElement("div");
selectionActions.className = "selection-actions";
selectionActions.innerHTML = `
  <a class="selection-actions__link" href="/portfolio">
    <span aria-hidden="true">+</span>
    <span><em>Découvrir</em> plus de projets</span>
  </a>
`;

selectionActions.querySelector("a").addEventListener("click", (event) => {
  event.preventDefault();
  event.currentTarget.blur();
  history.pushState(null, "", "/portfolio");
  setRoute();
});
makeMagnetic(selectionActions.querySelector("a"), 0.15);

selectionView.append(Hero(), carousel.element, selectionActions);

const heroLogo = selectionView.querySelector('.hero__logo');
const heroTitle = selectionView.querySelector('.hero__title');
if (heroLogo && heroTitle) {
  makeMagnetic(heroLogo, 0.5);
  makeMagnetic(heroTitle, 0.2);
}

const setRoute = () => {
  const shouldOpenAbout = window.location.hash === "#about";
  const route =
    window.location.pathname === "/portfolio" || window.location.hash === "#portfolio"
      ? "portfolio"
      : "selection";
  const updateDOM = () => {
    selectionView.hidden = route !== "selection";
    portfolio.element.hidden = route !== "portfolio";
    header.setActiveRoute(route);
  };

  if (document.startViewTransition) {
    document.startViewTransition(() => updateDOM());
  } else {
    updateDOM();
  }

  if (shouldOpenAbout) {
    aboutOverlay.open();
  }

  if (window.location.hash) {
    history.replaceState(null, "", route === "portfolio" ? "/portfolio" : "/");
  }
};

app.append(
  header.element,
  selectionView,
  portfolio.element,
  overlay.element,
  aboutOverlay.element,
  CustomCursor()
);

window.addEventListener("hashchange", setRoute);
window.addEventListener("popstate", setRoute);
setRoute();

// Halo Lumineux d'Arrière-plan Interactif & Suivi Souris Centralisé
const glowBg = document.createElement("div");
glowBg.className = "mouse-glow";
document.body.prepend(glowBg);

window.addEventListener("pointermove", (event) => {
  if (window.matchMedia("(pointer: coarse)").matches) return;
  document.body.classList.add("has-glow");
  
  // Coordonnées absolues pour le halo lumineux d'arrière-plan
  glowBg.style.setProperty("--mouse-glow-x", `${event.clientX}px`);
  glowBg.style.setProperty("--mouse-glow-y", `${event.clientY}px`);
  
  // Coordonnées normalisées pour l'inclinaison des cartes projet
  const x = (event.clientX / window.innerWidth - 0.5) * 2;
  const y = (event.clientY / window.innerHeight - 0.5) * 2;
  document.documentElement.style.setProperty("--mouse-x", x.toFixed(3));
  document.documentElement.style.setProperty("--mouse-y", y.toFixed(3));
}, { passive: true });

// Atténuation intelligente de la barre de défilement lors de l'inactivité
let scrollTimeout;
window.addEventListener("scroll", () => {
  document.documentElement.classList.add("is-scrolling");
  window.clearTimeout(scrollTimeout);
  scrollTimeout = window.setTimeout(() => {
    document.documentElement.classList.remove("is-scrolling");
  }, 1000);
}, { passive: true });



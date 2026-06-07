import { projects } from "./projects.js?v=20260607-premium-v2";
import { Header } from "./components/Header.js?v=20260607-premium-v2";
import { Hero } from "./components/Hero.js?v=20260607-premium-v2";
import { CustomCursor } from "./components/CustomCursor.js?v=20260607-premium-v2";
import { ProjectCarousel } from "./components/ProjectCarousel.js?v=20260607-premium-v2";
import { PortfolioGrid } from "./components/PortfolioGrid.js?v=20260607-premium-v2";
import { VideoOverlay } from "./components/VideoOverlay.js?v=20260607-premium-v2";
import { AboutOverlay } from "./components/AboutOverlay.js?v=20260607-premium-v2";
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

import { projects } from "./projects.js?v=20260604-candy-overlay";
import { Header } from "./components/Header.js?v=20260604-candy-overlay";
import { Hero } from "./components/Hero.js?v=20260604-candy-overlay";
import { CustomCursor } from "./components/CustomCursor.js?v=20260604-candy-overlay";
import { ProjectCarousel } from "./components/ProjectCarousel.js?v=20260604-candy-overlay";
import { PortfolioGrid } from "./components/PortfolioGrid.js?v=20260604-candy-overlay";
import { VideoOverlay } from "./components/VideoOverlay.js?v=20260604-candy-overlay";
import { AboutOverlay } from "./components/AboutOverlay.js?v=20260604-candy-overlay";

const app = document.querySelector("#app");
const aboutOverlay = AboutOverlay();
const featuredProjects = projects.filter((project) => project.featured);
const selectionProjects = [
  ...featuredProjects.filter((project) => project.id === "interface"),
  ...featuredProjects.filter((project) => project.id !== "interface"),
];
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
    <span>Voir plus de projets</span>
  </a>
`;

selectionActions.querySelector("a").addEventListener("click", (event) => {
  event.preventDefault();
  history.pushState(null, "", "/portfolio");
  setRoute();
});

selectionView.append(Hero(), carousel.element, selectionActions);

const setRoute = () => {
  const shouldOpenAbout = window.location.hash === "#about";
  const route =
    window.location.pathname === "/portfolio" || window.location.hash === "#portfolio"
      ? "portfolio"
      : "selection";
  selectionView.hidden = route !== "selection";
  portfolio.element.hidden = route !== "portfolio";
  header.setActiveRoute(route);

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

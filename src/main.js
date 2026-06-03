import { projects } from "./projects.js?v=20260603-portfolio-grid";
import { Header } from "./components/Header.js?v=20260603-portfolio-grid";
import { Hero } from "./components/Hero.js?v=20260603-portfolio-grid";
import { CustomCursor } from "./components/CustomCursor.js?v=20260603-portfolio-grid";
import { ProjectCarousel } from "./components/ProjectCarousel.js?v=20260603-portfolio-grid";
import { PortfolioGrid } from "./components/PortfolioGrid.js?v=20260603-portfolio-grid";
import { VideoOverlay } from "./components/VideoOverlay.js?v=20260603-portfolio-grid";
import { AboutOverlay } from "./components/AboutOverlay.js?v=20260603-portfolio-grid";

const app = document.querySelector("#app");
const aboutOverlay = AboutOverlay();
const featuredProjects = projects.filter((project) => project.featured);
const selectionView = document.createElement("div");
selectionView.className = "selection-view route-view";

const overlay = VideoOverlay({
  projects,
  onProjectChange: (index) => {
    const project = projects[index];
    const featuredIndex = featuredProjects.findIndex((item) => item.id === project.id);
    if (featuredIndex >= 0) carousel.setActiveIndex(featuredIndex);
  },
});

const carousel = ProjectCarousel({
  projects: featuredProjects,
  initialIndex: 3,
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

selectionView.append(Hero(), carousel.element);

const setRoute = () => {
  const route =
    window.location.pathname === "/portfolio" || window.location.hash === "#portfolio"
      ? "portfolio"
      : "selection";
  selectionView.hidden = route !== "selection";
  portfolio.element.hidden = route !== "portfolio";
  header.setActiveRoute(route);

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

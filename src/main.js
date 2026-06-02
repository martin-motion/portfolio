import { projects } from "./projects.js?v=20260602-liquid-bg";
import { Header } from "./components/Header.js?v=20260602-liquid-bg";
import { Hero } from "./components/Hero.js?v=20260602-liquid-bg";
import { CustomCursor } from "./components/CustomCursor.js?v=20260602-liquid-bg";
import { ProjectCarousel } from "./components/ProjectCarousel.js?v=20260602-liquid-bg";
import { VideoOverlay } from "./components/VideoOverlay.js?v=20260602-liquid-bg";
import { AboutOverlay } from "./components/AboutOverlay.js?v=20260602-liquid-bg";

const app = document.querySelector("#app");
const aboutOverlay = AboutOverlay();

const overlay = VideoOverlay({
  projects,
  onProjectChange: (index) => carousel.setActiveIndex(index),
});

const carousel = ProjectCarousel({
  projects,
  initialIndex: 3,
  onOpenProject: (project, index, trigger) => overlay.open(project, index, trigger),
});

app.append(
  Header({ onAboutOpen: (trigger) => aboutOverlay.open(trigger) }),
  Hero(),
  carousel.element,
  overlay.element,
  aboutOverlay.element,
  CustomCursor()
);

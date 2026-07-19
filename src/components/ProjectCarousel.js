import { ProjectCard } from "./ProjectCard.js";
import { CategoryFilters } from "./CategoryFilters.js";
import { makeMagnetic } from "../utils.js";

const FILTER_ORDER = [
  "Tous",
  "Clip",
  "Mini film RS",
  "Motion Design",
  "IA Générative",
  "VFX / Compositing",
];

const getDepth = (offset) => {
  const distance = Math.abs(offset);
  return [
    { scale: 1.22, x: 0, y: -20, rotate: 0, brightness: 1, opacity: 1 },
    { scale: 0.94, x: 1.08, y: 18, rotate: 3.8, brightness: 0.88, opacity: 1 },
    { scale: 0.8, x: 2.08, y: 42, rotate: 7, brightness: 0.74, opacity: 0.88 },
    { scale: 0.68, x: 3.02, y: 64, rotate: 10, brightness: 0.6, opacity: 0.62 },
  ][Math.min(distance, 3)];
};

export function ProjectCarousel({ projects, initialIndex = 0, onOpenProject, onActiveChange }) {
  let activeIndex = initialIndex;
  let activeFilter = "Tous";
  let visibleIndices = projects.map((_, index) => index);
  let dragStartX = 0;
  let dragDeltaX = 0;
  let lastDragDistance = 0;
  let isDragging = false;
  let isHovering = false;
  let ambientFrame = 0;
  let shiftTimer = 0;

  const section = document.createElement("section");
  section.id = "projects";
  section.className = "carousel";
  section.setAttribute("aria-label", "Galerie de projets");

  const availableCategories = new Set(projects.flatMap((project) => project.categories ?? []));
  const filters = CategoryFilters({
    filters: FILTER_ORDER.filter((filter) => filter === "Tous" || availableCategories.has(filter)),
    activeFilter,
    onChange: (filter) => applyFilter(filter),
  });
  filters.element.classList.add("carousel__filters");

  const stage = document.createElement("div");
  stage.className = "carousel__stage";
  stage.tabIndex = 0;
  stage.setAttribute("aria-roledescription", "carousel");
  stage.innerHTML = `
    <button class="carousel__arrow carousel__arrow--prev" type="button" aria-label="Projet précédent">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
    </button>
    <button class="carousel__arrow carousel__arrow--next" type="button" aria-label="Projet suivant">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
    </button>
    <div class="carousel__track" aria-hidden="true"></div>
    <div class="carousel__status" aria-live="off">
      <span class="carousel__current">01</span><span>/</span><span class="carousel__total">${String(projects.length).padStart(2, "0")}</span>
    </div>
    <p class="carousel__hint" aria-hidden="true">Glisser pour explorer</p>
  `;

  const prevButton = stage.querySelector(".carousel__arrow--prev");
  const nextButton = stage.querySelector(".carousel__arrow--next");
  const currentLabel = stage.querySelector(".carousel__current");
  const totalLabel = stage.querySelector(".carousel__total");
  makeMagnetic(prevButton, 0.16);
  makeMagnetic(nextButton, 0.16);

  const cards = projects.map((project, index) =>
    ProjectCard({
      project,
      index,
      onOpen: (_project, selectedIndex, trigger) => {
        noteInteraction();
        if (selectedIndex !== activeIndex) setActiveIndex(selectedIndex);
        else onOpenProject(projects[selectedIndex], selectedIndex, trigger);
      },
    })
  );
  stage.append(...cards);
  section.append(filters.element, stage);

  function noteInteraction() {
    stage.style.setProperty("--ambient-drift", "0px");
  }

  function getVisiblePosition(index) {
    return visibleIndices.indexOf(index);
  }

  function getCircularOffset(position, activePosition, total) {
    let offset = position - activePosition;
    const half = Math.floor(total / 2);
    if (offset > half) offset -= total;
    if (offset < -half) offset += total;
    return offset;
  }

  function render() {
    const activePosition = Math.max(0, getVisiblePosition(activeIndex));
    cards.forEach((card, index) => {
      const position = getVisiblePosition(index);
      const isVisible = position >= 0;
      card.hidden = !isVisible;
      if (!isVisible) return;

      const offset = getCircularOffset(position, activePosition, visibleIndices.length);
      const distance = Math.abs(offset);
      const depth = getDepth(offset);
      const direction = Math.sign(offset);
      card.classList.toggle("is-active", offset === 0);
      card.classList.toggle("is-outside", distance > 3);
      card.style.setProperty("--shift-x-mult", direction * depth.x);
      card.style.setProperty("--shift-y", `${depth.y}px`);
      card.style.setProperty("--scale", depth.scale);
      card.style.setProperty("--rotate-z", `${direction * depth.rotate}deg`);
      card.style.setProperty("--brightness", depth.brightness);
      card.style.setProperty("--card-opacity", distance > 3 ? 0 : depth.opacity);
      card.style.setProperty("--z", 100 - distance);
      card.style.setProperty("--float-phase", `${(index % 7) * -0.48}s`);
      card.dataset.carouselOffset = String(offset);
      card.tabIndex = distance <= 3 ? 0 : -1;
      card.setAttribute("aria-current", offset === 0 ? "true" : "false");
    });

    currentLabel.textContent = String(activePosition + 1).padStart(2, "0");
    totalLabel.textContent = String(visibleIndices.length).padStart(2, "0");
    stage.style.setProperty("--progress", `${((activePosition + 1) / visibleIndices.length) * 100}%`);
    onActiveChange?.(projects[activeIndex], activeIndex);
  }

  function setActiveIndex(index) {
    activeIndex = index;
    render();
  }

  function move(direction, { userInitiated = true } = {}) {
    if (userInitiated) noteInteraction();
    const position = getVisiblePosition(activeIndex);
    const nextPosition = (position + direction + visibleIndices.length) % visibleIndices.length;
    stage.dataset.direction = direction > 0 ? "next" : "previous";
    setActiveIndex(visibleIndices[nextPosition]);
    stage.classList.remove("is-shifting");
    window.requestAnimationFrame(() => stage.classList.add("is-shifting"));
    window.clearTimeout(shiftTimer);
    shiftTimer = window.setTimeout(() => stage.classList.remove("is-shifting"), 920);
  }

  function applyFilter(filter) {
    noteInteraction();
    activeFilter = filter;
    visibleIndices = projects
      .map((project, index) => ({ project, index }))
      .filter(({ project }) => filter === "Tous" || (project.categories ?? []).includes(filter))
      .map(({ index }) => index);
    if (!visibleIndices.includes(activeIndex)) activeIndex = visibleIndices[0];
    filters.setActive(filter);
    render();
  }

  prevButton.addEventListener("click", () => move(-1));
  nextButton.addEventListener("click", () => move(1));
  stage.addEventListener("mouseenter", () => { isHovering = true; });
  stage.addEventListener("mouseleave", () => {
    isHovering = false;
    cards.forEach((card) => {
      card.style.setProperty("--pointer-shift-x", "0px");
      card.style.setProperty("--pointer-shift-y", "0px");
    });
  });
  stage.addEventListener("focusin", noteInteraction);
  stage.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      move(event.key === "ArrowLeft" ? -1 : 1);
    }
  });
  stage.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button")) return;
    noteInteraction();
    isDragging = true;
    dragStartX = event.clientX;
    dragDeltaX = 0;
    stage.setPointerCapture(event.pointerId);
    stage.classList.add("is-dragging");
  });
  stage.addEventListener("pointermove", (event) => {
    if (isDragging) {
      dragDeltaX = event.clientX - dragStartX;
      stage.style.setProperty("--drag", `${dragDeltaX * 0.55}px`);
      return;
    }

    if (window.matchMedia("(pointer: coarse)").matches) return;
    const rect = stage.getBoundingClientRect();
    const normalizedX = (event.clientX - rect.left) / rect.width - 0.5;
    const normalizedY = (event.clientY - rect.top) / rect.height - 0.5;
    cards.forEach((card) => {
      if (card.hidden) return;
      const distance = Math.min(Math.abs(Number(card.dataset.carouselOffset ?? 0)), 3);
      const depth = 1 - distance * 0.16;
      card.style.setProperty("--pointer-shift-x", `${(normalizedX * 24 * depth).toFixed(2)}px`);
      card.style.setProperty("--pointer-shift-y", `${(normalizedY * 12 * depth).toFixed(2)}px`);
    });
  });

  const endDrag = (event) => {
    if (!isDragging) return;
    isDragging = false;
    lastDragDistance = Math.abs(dragDeltaX);
    if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
    stage.classList.remove("is-dragging");
    stage.style.setProperty("--drag", "0px");
    if (Math.abs(dragDeltaX) > 46) move(dragDeltaX > 0 ? -1 : 1);
  };
  stage.addEventListener("pointerup", endDrag);
  stage.addEventListener("pointercancel", endDrag);
  stage.addEventListener("click", (event) => {
    if (lastDragDistance <= 10) return;
    event.preventDefault();
    event.stopPropagation();
    lastDragDistance = 0;
  }, true);

  const updateAmbientDrift = (time) => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canAnimate =
      !document.hidden &&
      !isDragging &&
      !document.body.classList.contains("has-overlay") &&
      document.body.classList.contains("is-selection-route") &&
      !reducedMotion;
    const amplitude = isHovering ? 22 : 15;
    const drift = canAnimate ? Math.sin(time / 2600) * amplitude : 0;
    stage.style.setProperty("--ambient-drift", `${drift.toFixed(2)}px`);

    ambientFrame = window.requestAnimationFrame(updateAmbientDrift);
  };
  ambientFrame = window.requestAnimationFrame(updateAmbientDrift);

  render();
  return { element: section, setActiveIndex };
}

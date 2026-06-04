import { ProjectCard } from "./ProjectCard.js?v=20260604-final-cta";

const getCircularOffset = (index, activeIndex, total) => {
  const rawOffset = index - activeIndex;
  const half = Math.floor(total / 2);

  if (rawOffset > half) return rawOffset - total;
  if (rawOffset < -half) return rawOffset + total;
  return rawOffset;
};

const getDepth = (offset) => {
  const distance = Math.abs(offset);
  const depth = [
    { scale: 1.08, veil: 0, brightness: 1.02, saturation: 1, rotate: 0, y: 0, z: 92 },
    { scale: 0.82, veil: 0.14, brightness: 0.92, saturation: 0.96, rotate: 10, y: 10, z: 10 },
    { scale: 0.68, veil: 0.28, brightness: 0.82, saturation: 0.9, rotate: 19, y: 18, z: -50 },
    { scale: 0.56, veil: 0.44, brightness: 0.72, saturation: 0.84, rotate: 28, y: 26, z: -92 },
  ];

  return depth[Math.min(distance, depth.length - 1)];
};

export function ProjectCarousel({ projects, initialIndex = 0, onOpenProject }) {
  let activeIndex = initialIndex;
  let dragStartX = 0;
  let dragDeltaX = 0;
  let lastDragDistance = 0;
  let isDragging = false;
  let wheelDelta = 0;
  let wheelIsLocked = false;

  const section = document.createElement("section");
  section.id = "projects";
  section.className = "carousel";
  section.setAttribute("aria-label", "Projets");
  section.innerHTML = `
    <div class="carousel__stage" tabindex="0" aria-roledescription="carousel">
      <button class="carousel__arrow carousel__arrow--prev" type="button" aria-label="Projet precedent">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
      </button>
      <button class="carousel__arrow carousel__arrow--next" type="button" aria-label="Projet suivant">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
      </button>
    </div>
    <div class="carousel__dots" aria-label="Pagination des projets"></div>
  `;

  const stage = section.querySelector(".carousel__stage");
  const prevButton = section.querySelector(".carousel__arrow--prev");
  const nextButton = section.querySelector(".carousel__arrow--next");
  const dots = section.querySelector(".carousel__dots");

  const cards = projects.map((project, index) =>
    ProjectCard({
      project,
      index,
      onOpen: (selectedProject, selectedIndex, trigger) => {
        if (selectedIndex !== activeIndex) {
          setActiveIndex(selectedIndex);
          return;
        }

        openProjectAt(selectedIndex, trigger);
      },
    })
  );

  cards.forEach((card, index) => {
    card.dataset.projectIndex = index;
  });

  const dotButtons = projects.map((project, index) => {
    const dot = document.createElement("button");
    dot.className = "carousel__dot";
    dot.type = "button";
    dot.setAttribute("aria-label", `Afficher ${project.title}`);
    dot.addEventListener("click", () => setActiveIndex(index));
    return dot;
  });

  stage.append(...cards);
  dots.append(...dotButtons);

  const setActiveIndex = (index) => {
    activeIndex = (index + projects.length) % projects.length;
    render();
  };

  const move = (direction) => setActiveIndex(activeIndex + direction);

  const moveFromWheel = (delta) => {
    wheelDelta += delta;

    if (wheelIsLocked || Math.abs(wheelDelta) < 42) return;

    move(wheelDelta > 0 ? 1 : -1);
    wheelDelta = 0;
    wheelIsLocked = true;

    window.setTimeout(() => {
      wheelIsLocked = false;
    }, 220);
  };

  const openProjectAt = (index, trigger = cards[index]) => {
    activeIndex = index;
    render();
    onOpenProject(projects[index], index, trigger);
  };

  const getVisualCardAtPoint = (clientX, clientY) => {
    const candidates = cards
      .map((card, index) => {
        const rect = card.getBoundingClientRect();
        const contains =
          clientX >= rect.left &&
          clientX <= rect.right &&
          clientY >= rect.top &&
          clientY <= rect.bottom;

        if (!contains) return null;

        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        return {
          card,
          index,
          score: Math.abs(clientX - centerX) + Math.abs(clientY - centerY) * 0.22,
        };
      })
      .filter(Boolean);

    candidates.sort((a, b) => a.score - b.score);
    return candidates[0] ?? null;
  };

  const render = () => {
    cards.forEach((card, index) => {
      const offset = getCircularOffset(index, activeIndex, projects.length);
      const distance = Math.abs(offset);
      const depth = getDepth(offset);
      const direction = Math.sign(offset);
      const borderOpacity = [0.38, 0.09, 0.045, 0.02][Math.min(distance, 3)];

      card.classList.toggle("is-active", offset === 0);
      card.classList.toggle("is-dimmed", distance > 2);
      card.style.setProperty("--offset", offset);
      card.style.setProperty("--scale", depth.scale);
      card.style.setProperty("--veil-opacity", depth.veil);
      card.style.setProperty("--brightness", depth.brightness);
      card.style.setProperty("--saturation", depth.saturation);
      card.style.setProperty("--rotate-y", `${direction * -depth.rotate}deg`);
      card.style.setProperty("--shift-y", `${depth.y}px`);
      card.style.setProperty("--translate-z", `${depth.z}px`);
      card.style.setProperty("--z", 100 - distance);
      card.style.setProperty("--card-border-opacity", borderOpacity);
      card.style.transformOrigin =
        offset < 0 ? "right center" : offset > 0 ? "left center" : "center center";
      card.tabIndex = distance <= 2 ? 0 : -1;
      card.setAttribute("aria-current", offset === 0 ? "true" : "false");
    });

    dotButtons.forEach((dot, index) => {
      const offset = getCircularOffset(index, activeIndex, projects.length);
      const distance = Math.abs(offset);
      const dotOpacity = [0.86, 0.34, 0.16, 0][Math.min(distance, 3)];
      const dotScale = [1, 0.74, 0.56, 0.42][Math.min(distance, 3)];

      dot.classList.toggle("is-active", distance === 0);
      dot.classList.toggle("is-hidden", distance > 2);
      dot.style.setProperty("--dot-opacity", dotOpacity);
      dot.style.setProperty("--dot-scale", dotScale);
      dot.setAttribute("aria-current", distance === 0 ? "true" : "false");
    });
  };

  prevButton.addEventListener("click", () => move(-1));
  nextButton.addEventListener("click", () => move(1));

  stage.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      move(-1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      move(1);
    }
  });

  stage.addEventListener(
    "click",
    (event) => {
      if (event.target.closest(".carousel__arrow")) return;

      if (lastDragDistance > 10) {
        event.preventDefault();
        event.stopPropagation();
        lastDragDistance = 0;
        return;
      }

      const visualTarget = getVisualCardAtPoint(event.clientX, event.clientY);
      if (!visualTarget) return;

      event.preventDefault();
      event.stopPropagation();

      if (visualTarget.index !== activeIndex) {
        setActiveIndex(visualTarget.index);
        return;
      }

      openProjectAt(visualTarget.index, visualTarget.card);
    },
    true
  );

  stage.addEventListener(
    "wheel",
    (event) => {
      if (document.body.classList.contains("has-overlay")) return;

      const delta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (Math.abs(delta) < 2) return;

      event.preventDefault();
      moveFromWheel(delta);
    },
    { passive: false }
  );

  stage.addEventListener("pointerdown", (event) => {
    if (event.target.closest(".carousel__arrow")) return;

    isDragging = true;
    dragStartX = event.clientX;
    dragDeltaX = 0;
    stage.setPointerCapture(event.pointerId);
    stage.classList.add("is-dragging");
  });

  stage.addEventListener("pointermove", (event) => {
    if (!isDragging) return;
    dragDeltaX = event.clientX - dragStartX;
    stage.style.setProperty("--drag", `${dragDeltaX}px`);
  });

  const endDrag = (event) => {
    if (!isDragging) return;
    isDragging = false;
    lastDragDistance = Math.abs(dragDeltaX);
    stage.releasePointerCapture(event.pointerId);
    stage.classList.remove("is-dragging");
    stage.style.setProperty("--drag", "0px");

    if (Math.abs(dragDeltaX) > 48) {
      move(dragDeltaX > 0 ? -1 : 1);
    }
  };

  stage.addEventListener("pointerup", endDrag);
  stage.addEventListener("pointercancel", endDrag);

  window.addEventListener("keydown", (event) => {
    const overlayOpen = document.body.classList.contains("has-overlay");
    if (overlayOpen || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;

    if (event.key === "ArrowLeft") move(-1);
    if (event.key === "ArrowRight") move(1);
  });

  render();

  return {
    element: section,
    setActiveIndex,
  };
}

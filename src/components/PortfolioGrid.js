import { CategoryFilters } from "./CategoryFilters.js";
import { renderProjectTags } from "./ProjectCard.js";

const FILTER_ORDER = [
  "Tous",
  "Clip",
  "Mini film RS",
  "Motion Design",
  "IA Générative",
  "Logo & Animation",
  "VFX / Compositing",
  "Identité visuelle",
];

const getFilters = (projects) => {
  const availableCategories = new Set(
    projects.flatMap((project) => project.categories ?? [project.category])
  );
  return FILTER_ORDER.filter((filter) => filter === "Tous" || availableCategories.has(filter));
};

const projectMatchesFilter = (project, filter) =>
  filter === "Tous" || (project.categories ?? [project.category]).includes(filter);

export function PortfolioGrid({ projects, onOpenProject }) {
  let activeFilter = "Tous";

  const section = document.createElement("section");
  section.id = "portfolio";
  section.className = "portfolio-view route-view";
  section.setAttribute("aria-label", "Portfolio");
  section.hidden = true;

  const header = document.createElement("div");
  header.className = "portfolio-view__header";
  header.innerHTML = `
    <p class="portfolio-view__eyebrow">Portfolio</p>
    <h1><span>Vidéos en mouvement,</span> <em>directions visuelles.</em></h1>
  `;

  const filters = CategoryFilters({
    filters: getFilters(projects),
    activeFilter,
    onChange: (filter) => {
      activeFilter = filter;
      filters.setActive(filter);
      renderGrid();
    },
  });

  const count = document.createElement("p");
  count.className = "portfolio-view__count";
  count.setAttribute("aria-live", "polite");

  const toolbar = document.createElement("div");
  toolbar.className = "portfolio-view__toolbar";
  toolbar.append(filters.element, count);

  const grid = document.createElement("div");
  grid.className = "portfolio-grid";

  const renderGrid = () => {
    const visibleProjects = projects.filter((project) => projectMatchesFilter(project, activeFilter));
    count.textContent = `${visibleProjects.length} projet${visibleProjects.length > 1 ? "s" : ""}`;

    grid.innerHTML = "";
    visibleProjects.forEach((project, index) => {
      const card = document.createElement("button");
      card.className = "portfolio-card";
      card.style.setProperty("--card-index", index);
      card.type = "button";
      card.dataset.projectId = project.id;
      card.setAttribute("aria-label", `${project.title}, ${project.category}`);
      const media = project.thumbnail
        ? `<img src="${project.thumbnail}" alt="" loading="lazy" decoding="async" draggable="false" />`
        : `<span class="portfolio-card__placeholder" aria-hidden="true">${project.title}</span>`;
      card.innerHTML = `
        <span class="portfolio-card__media">
          ${media}
          <span class="portfolio-card__index" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>
          <span class="portfolio-card__cta" aria-hidden="true">Voir le projet</span>
          <span class="portfolio-card__media-tags" aria-hidden="true">
            ${renderProjectTags([project.category], "portfolio-card__tag")}
          </span>
        </span>
        <span class="portfolio-card__body">
          <span class="portfolio-card__title">${project.title}</span>
          <span class="portfolio-card__year">${project.year}</span>
        </span>
      `;
      card.addEventListener("pointermove", (event) => {
        if (window.matchMedia("(pointer: coarse)").matches) return;
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        card.style.setProperty("--card-pointer-x", `${(x * 100).toFixed(1)}%`);
        card.style.setProperty("--card-pointer-y", `${(y * 100).toFixed(1)}%`);
        card.style.setProperty("--card-tilt-x", `${((0.5 - y) * 2.2).toFixed(2)}deg`);
        card.style.setProperty("--card-tilt-y", `${((x - 0.5) * 2.2).toFixed(2)}deg`);
      }, { passive: true });
      card.addEventListener("pointerleave", () => {
        card.style.removeProperty("--card-tilt-x");
        card.style.removeProperty("--card-tilt-y");
      });
      card.addEventListener("click", () => onOpenProject(project, card));
      grid.append(card);
    });
  };

  section.append(header, toolbar, grid);
  renderGrid();

  return {
    element: section,
  };
}

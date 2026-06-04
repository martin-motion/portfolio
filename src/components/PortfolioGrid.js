import { CategoryFilters } from "./CategoryFilters.js?v=20260604-final-cta";
import { renderProjectTags } from "./ProjectCard.js?v=20260604-final-cta";

const FILTER_ORDER = [
  "Tous",
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
    <h1>Vidéos, images en mouvement et directions visuelles.</h1>
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

  const grid = document.createElement("div");
  grid.className = "portfolio-grid";

  const renderGrid = () => {
    const visibleProjects = projects.filter((project) => projectMatchesFilter(project, activeFilter));

    grid.innerHTML = "";
    visibleProjects.forEach((project) => {
      const card = document.createElement("button");
      card.className = "portfolio-card";
      card.type = "button";
      card.setAttribute("aria-label", `${project.title}, ${project.category}`);
      const media = project.thumbnail
        ? `<img src="${project.thumbnail}" alt="" loading="lazy" decoding="async" draggable="false" />`
        : `<span class="portfolio-card__placeholder" aria-hidden="true">${project.title}</span>`;
      card.innerHTML = `
        <span class="portfolio-card__media">
          ${media}
          <span class="portfolio-card__media-tags" aria-hidden="true">
            ${renderProjectTags(project.tags ?? [project.category], "portfolio-card__tag")}
          </span>
        </span>
        <span class="portfolio-card__body">
          <span class="portfolio-card__title">${project.title}</span>
        </span>
      `;
      card.addEventListener("click", () => onOpenProject(project, card));
      grid.append(card);
    });
  };

  section.append(header, filters.element, grid);
  renderGrid();

  return {
    element: section,
  };
}

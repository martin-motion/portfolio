import { CategoryFilters } from "./CategoryFilters.js?v=20260603-portfolio-grid";

const getFilters = (projects) => {
  const values = new Set(["Tous"]);

  projects.forEach((project) => {
    values.add(project.category);
    project.tags?.forEach((tag) => values.add(tag));
  });

  return Array.from(values);
};

const projectMatchesFilter = (project, filter) =>
  filter === "Tous" || project.category === filter || project.tags?.includes(filter);

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
      card.innerHTML = `
        <span class="portfolio-card__media">
          <img src="${project.thumbnail}" alt="" loading="lazy" decoding="async" draggable="false" />
        </span>
        <span class="portfolio-card__body">
          <span class="portfolio-card__tags">
            ${(project.tags ?? [project.category])
              .slice(0, 3)
              .map((tag) => `<span>${tag}</span>`)
              .join("")}
          </span>
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

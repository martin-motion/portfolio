export function CategoryFilters({ filters, activeFilter = "Tous", onChange }) {
  const wrap = document.createElement("div");
  wrap.className = "category-filters";
  wrap.setAttribute("aria-label", "Filtrer les projets");

  const buttons = filters.map((filter) => {
    const button = document.createElement("button");
    button.className = "category-filters__button";
    button.type = "button";
    button.textContent = filter;
    button.setAttribute("aria-pressed", filter === activeFilter ? "true" : "false");
    button.addEventListener("click", () => onChange(filter));
    wrap.append(button);
    return button;
  });

  const setActive = (filter) => {
    buttons.forEach((button) => {
      button.setAttribute("aria-pressed", button.textContent === filter ? "true" : "false");
    });
  };

  return {
    element: wrap,
    setActive,
  };
}

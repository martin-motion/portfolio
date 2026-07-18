export function CategoryFilters({ filters, activeFilter = "Tous", onChange }) {
  const wrap = document.createElement("div");
  wrap.className = "category-filters";
  wrap.setAttribute("role", "toolbar");
  wrap.setAttribute("aria-label", "Filtrer les projets");

  const buttons = filters.map((filter) => {
    const button = document.createElement("button");
    button.className = "category-filters__button";
    button.type = "button";
    button.textContent = filter;
    button.setAttribute("aria-pressed", filter === activeFilter ? "true" : "false");
    button.addEventListener("click", () => {
      onChange(filter);
      button.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "nearest",
        inline: "center",
      });
    });
    wrap.append(button);
    return button;
  });

  wrap.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;

    const currentIndex = buttons.indexOf(document.activeElement);
    if (currentIndex < 0) return;

    event.preventDefault();
    const nextIndex =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? buttons.length - 1
          : (currentIndex + (event.key === "ArrowRight" ? 1 : -1) + buttons.length) % buttons.length;
    buttons[nextIndex].focus({ preventScroll: true });
    buttons[nextIndex].scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "nearest",
      inline: "center",
    });
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

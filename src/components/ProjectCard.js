export function ProjectCard({ project, index, onOpen }) {
  const card = document.createElement("button");
  card.className = "project-card";
  card.type = "button";
  card.setAttribute("aria-label", `${project.title}, ${project.category}`);
  card.innerHTML = `
    <img
      class="project-card__image"
      src="${project.thumbnail}"
      alt=""
      loading="lazy"
      decoding="async"
      draggable="false"
    />
    <span class="project-card__shade" aria-hidden="true"></span>
    <span class="project-card__meta">
      <span class="project-card__category">${project.category}</span>
      <span class="project-card__title">${project.title}</span>
    </span>
  `;

  card.addEventListener("click", () => onOpen(project, index, card));

  return card;
}

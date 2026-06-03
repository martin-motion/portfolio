const TAG_COLORS = {
  "IA générative": { color: "190, 218, 255", tone: "108, 149, 220" },
  "Motion design": { color: "223, 232, 255", tone: "123, 151, 230" },
  Montage: { color: "235, 222, 198", tone: "188, 143, 92" },
  "Captation réel": { color: "216, 238, 220", tone: "86, 162, 111" },
  Illustration: { color: "240, 226, 154", tone: "188, 177, 48" },
  VFX: { color: "239, 203, 255", tone: "171, 102, 216" },
};

const renderTags = (tags = []) =>
  tags
    .map((tag) => {
      const tagColor = TAG_COLORS[tag] ?? { color: "242, 238, 232", tone: "180, 180, 180" };
      return `<span class="project-card__tag" style="--tag-color: ${tagColor.color}; --tag-tone: ${tagColor.tone};">${tag}</span>`;
    })
    .join("");

export function ProjectCard({ project, index, onOpen }) {
  const card = document.createElement("button");
  card.className = "project-card";
  card.type = "button";
  card.setAttribute("aria-label", `${project.title}, ${project.category}`);
  const tags = renderTags(project.tags);
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
      <span class="project-card__tags" aria-hidden="true">${tags}</span>
      <span class="project-card__title">${project.title}</span>
    </span>
  `;

  card.addEventListener("click", () => onOpen(project, index, card));

  return card;
}

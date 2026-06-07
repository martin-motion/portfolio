export const TAG_COLORS = {
  "Mini film RS": { color: "255, 153, 51", tone: "204, 102, 0" }, // Orange/Ambre
  "Mini film": { color: "255, 153, 51", tone: "204, 102, 0" },
  "IA générative": { color: "255, 51, 204", tone: "204, 0, 153" }, // Magenta/Rose Néon
  "IA Générative": { color: "255, 51, 204", tone: "204, 0, 153" },
  "Motion design": { color: "51, 153, 255", tone: "10, 102, 204" }, // Bleu Azur
  "Motion Design": { color: "51, 153, 255", tone: "10, 102, 204" },
  "Animation 2D": { color: "102, 204, 255", tone: "51, 153, 204" }, // Cyan
  Montage: { color: "235, 222, 198", tone: "188, 143, 92" }, // Gold
  "Captation réelle": { color: "245, 245, 245", tone: "150, 150, 150" }, // Blanc/Gris
  Illustration: { color: "255, 204, 51", tone: "204, 153, 0" }, // Jaune
  VFX: { color: "0, 255, 153", tone: "0, 153, 102" }, // Vert Émeraude
  "VFX compositing": { color: "0, 255, 153", tone: "0, 153, 102" },
  "VFX / Compositing": { color: "0, 255, 153", tone: "0, 153, 102" },
};

export const renderProjectTags = (tags = [], className = "project-card__tag") =>
  tags
    .map((tag) => {
      const tagColor = TAG_COLORS[tag] ?? { color: "242, 238, 232", tone: "180, 180, 180" };
      return `<span class="${className}" style="--tag-color: ${tagColor.color}; --tag-tone: ${tagColor.tone};">${tag}</span>`;
    })
    .join("");

export function ProjectCard({ project, index, onOpen }) {
  const card = document.createElement("button");
  card.className = "project-card";
  card.type = "button";
  card.setAttribute("aria-label", `${project.title}, ${project.category}`);
  const tags = renderProjectTags(project.tags);
  card.innerHTML = `
    <div class="project-card__inner">
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
        <span class="project-card__title">${project.title}</span>
        <span class="project-card__tags" aria-hidden="true">${tags}</span>
      </span>
    </div>
    <div class="project-card__reflection" aria-hidden="true">
      <img class="project-card__reflection-img" src="${project.thumbnail}" alt="" loading="lazy" decoding="async" />
      <span class="project-card__reflection-shade"></span>
    </div>
  `;


  card.addEventListener("click", () => onOpen(project, index, card));

  return card;
}

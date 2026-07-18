export function Hero() {
  const hero = document.createElement("section");
  hero.className = "hero";
  hero.setAttribute("aria-labelledby", "hero-title");
  hero.innerHTML = `
    <h1 id="hero-title" class="hero__title" aria-label="Martin Motion">
      <span class="hero__title-main">Martin</span>
      <span class="hero__title-mark" aria-hidden="true">Motion</span>
    </h1>
    <p class="hero__baseline">Direction artistique — Motion design — IA générative</p>
  `;
  return hero;
}

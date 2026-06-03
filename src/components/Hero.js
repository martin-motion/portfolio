export function Hero() {
  const hero = document.createElement("section");
  hero.className = "hero";
  hero.setAttribute("aria-labelledby", "hero-title");
  hero.innerHTML = `
    <img
      class="hero__logo"
      width="168"
      height="168"
      src="./assets/logo/logo-liquid.png?v=20260603-portfolio-grid"
      alt=""
      decoding="async"
      aria-hidden="true"
    />
    <h1 id="hero-title" class="hero__title" aria-label="Martin Motion">
      <span class="hero__title-main">Martin</span>
      <span class="hero__title-mark" aria-hidden="true">Motion</span>
    </h1>
    <p class="hero__baseline">
      <span class="hero__baseline-item">Motion designer</span>
      <span class="hero__baseline-item">Direction artistique</span>
      <span class="hero__baseline-item">IA générative</span>
    </p>
  `;

  return hero;
}

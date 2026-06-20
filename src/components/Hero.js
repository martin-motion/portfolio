export function Hero() {
  const hero = document.createElement("section");
  hero.className = "hero";
  hero.setAttribute("aria-labelledby", "hero-title");
  hero.innerHTML = `
    <img
      class="hero__logo"
      width="168"
      height="168"
      src="./assets/logo/logo-liquid.png?v=20260620-responsive-final"
      alt=""
      decoding="sync"
      fetchpriority="high"
      aria-hidden="true"
    />
    <h1 id="hero-title" class="hero__title" aria-label="Martin Motion">
      <span class="hero__title-main">Martin</span>
      <span class="hero__title-mark" aria-hidden="true">Motion</span>
    </h1>
    <p class="hero__baseline">
      <span class="hero__baseline-item">Motion Design</span>
      <span class="hero__baseline-item">Direction Artistique</span>
      <span class="hero__baseline-item">IA Générative</span>
    </p>
  `;

  return hero;
}

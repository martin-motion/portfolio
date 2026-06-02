export function Hero() {
  const hero = document.createElement("section");
  hero.className = "hero";
  hero.setAttribute("aria-labelledby", "hero-title");
  hero.innerHTML = `
    <img
      class="hero__logo"
      src="./assets/logo/martin-motion-loop.gif"
      width="120"
      height="120"
      alt="Martin Motion"
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

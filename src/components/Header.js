export function Header({ onAboutOpen } = {}) {
  const header = document.createElement("header");
  header.className = "site-header";
  header.innerHTML = `
    <nav class="site-nav" aria-label="Navigation principale">
      <a class="site-nav__link is-active" href="#projects" aria-current="page">Projets</a>
      <a class="site-nav__link" href="#about" data-about-link>À propos</a>
      <a class="site-nav__link" href="mailto:martinbarbe09@gmail.com">Contact</a>
    </nav>
  `;

  const aboutLink = header.querySelector("[data-about-link]");
  aboutLink.addEventListener("click", (event) => {
    if (!onAboutOpen) return;

    event.preventDefault();
    onAboutOpen(aboutLink);
  });

  return header;
}

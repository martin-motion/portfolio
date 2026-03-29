export function applySiteContent(siteContent) {
  if (!siteContent) {
    return;
  }

  const heroKicker = document.getElementById("heroKicker");
  const heroTitle = document.getElementById("heroTitle");
  const heroSubtitle = document.getElementById("heroSubtitle");
  const footerEmail = document.getElementById("footerEmail");
  const footerCity = document.getElementById("footerCity");
  const descriptionTag = document.querySelector('meta[name="description"]');

  if (typeof siteContent.pageTitle === "string" && siteContent.pageTitle.length > 0) {
    document.title = siteContent.pageTitle;
  }

  if (descriptionTag && typeof siteContent.pageDescription === "string") {
    descriptionTag.setAttribute("content", siteContent.pageDescription);
  }

  if (heroKicker && typeof siteContent.heroKicker === "string") {
    heroKicker.textContent = siteContent.heroKicker;
  }

  if (heroTitle && typeof siteContent.heroTitleHtml === "string") {
    heroTitle.innerHTML = siteContent.heroTitleHtml;
  }

  if (heroSubtitle && typeof siteContent.heroSubtitle === "string") {
    heroSubtitle.textContent = siteContent.heroSubtitle;
  }

  if (footerEmail && typeof siteContent.footerEmail === "string") {
    footerEmail.textContent = siteContent.footerEmail;
    footerEmail.setAttribute("href", `mailto:${siteContent.footerEmail}`);
  }

  if (footerCity && typeof siteContent.footerCity === "string") {
    footerCity.textContent = siteContent.footerCity;
  }
}

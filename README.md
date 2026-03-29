# Portfolio Martin Motion

Maquette one-page minimaliste avec galerie type cover-flow et ouverture projet en overlay (sans changement de page).

## Lancer le site

Option rapide:

```bash
python3 -m http.server 8080
```

Puis ouvre `http://localhost:8080`.

## Mise En Ligne Auto Avec GitHub + Vercel

Le flux recommandé pour ce portfolio est :

1. créer un repo GitHub vide
2. pousser ce dossier vers ce repo
3. importer ce repo dans Vercel
4. laisser Vercel redéployer automatiquement à chaque `git push`

### Première mise en ligne

Crée d’abord un repo GitHub vide, puis lance :

```bash
./scripts/publish-github.sh https://github.com/TON-USER/TON-REPO.git "Initial portfolio"
```

Ensuite dans Vercel :

1. `Add New...` -> `Project`
2. sélectionne le repo GitHub
3. `Framework Preset`: `Other`
4. laisse `Build Command` vide
5. laisse `Output Directory` vide
6. clique sur `Deploy`

### Mises à jour suivantes

Après le premier branchement Vercel/GitHub, chaque push redéploie automatiquement :

```bash
./scripts/publish-github.sh https://github.com/TON-USER/TON-REPO.git "Update portfolio"
```

Tu peux aussi utiliser le flux Git classique :

```bash
git add .
git commit -m "Update portfolio"
git push
```

## Structure (refactor)

- `assets/` : images et vidéos
- `data/projects.js` : données des projets (galerie + overlay)
- `data/site-content.js` : textes éditables du site (header, footer, SEO)
- `js/portfolio-app.js` : logique interactions galerie + overlay
- `js/content.js` : injection des textes éditables
- `js/main.js` : point d’entrée
- `styles/main.css` : styles globaux, composants, overlay et responsive
- `vercel.json` : configuration statique Vercel
- `scripts/publish-github.sh` : push GitHub pour déclencher le déploiement auto

Arborescence:

```text
New project/
├─ assets/
├─ data/
│  ├─ projects.js
│  └─ site-content.js
├─ js/
│  ├─ main.js
│  ├─ content.js
│  └─ portfolio-app.js
├─ styles/
│  └─ main.css
├─ index.html
└─ README.md
```

## Interactions

- Scroll / flèches / swipe: naviguer dans la galerie
- Clic sur la carte centrale: ouvrir le projet
- Overlay: `Esc` pour fermer, flèches pour projet précédent/suivant

## Où éditer quoi

- Changer les projets: `data/projects.js`
- Changer les textes du header/footer/SEO: `data/site-content.js`
- Ajuster les interactions: `js/portfolio-app.js`
- Ajuster la structure HTML: `index.html`
- Ajuster le style: `styles/main.css`

Le but est de ne plus toucher à la logique principale quand on met simplement à jour le portfolio.

## Mettre à jour le contenu

### Ajouter/modifier un projet

Éditer `data/projects.js`.

Champs utilisés:

- `title`: nom du projet
- `category`: catégorie affichée
- `description`: texte court
- `tags`: mots-clés
- `thumbnail`: miniature
- `video`: vidéo unique
- `videos`: liste de vidéos (si projet multi-vidéos)
- `provider`: optionnel, utiliser `"youtube"` pour un embed YouTube
- `videoWidth` / `videoHeight` ou `width` / `height`: ratio conseillé pour un rendu stable

Règle simple:

- `video` pour un projet avec une seule vidéo
- `videos` pour un projet avec plusieurs médias
- Toujours renseigner `width` et `height` quand c’est possible pour stabiliser les layouts portrait/paysage
- Pour YouTube, tu peux soit garder `provider: "youtube"` au niveau du projet, soit le mettre directement dans l’objet média

Exemple ratio portrait:

```js
{
  label: "Portrait film",
  src: "./assets/portrait-film.mp4",
  poster: "./assets/portrait-film-thumb.jpg",
  width: 768,
  height: 1376,
}
```

Exemple YouTube recommandé:

```js
{
  title: "Showreel",
  video: {
    provider: "youtube",
    src: "https://youtu.be/VIDEO_ID",
    poster: "./assets/thumb.jpg",
    width: 1080,
    height: 1920
  }
}
```

### Modifier les textes du site

Éditer `data/site-content.js`.

- `heroKicker`
- `heroTitleHtml`
- `heroSubtitle`
- `footerEmail`
- `footerCity`
- `pageTitle`
- `pageDescription`

## Notes de maintenance

- La home repose sur un coverflow custom: éviter de remplacer cette logique par un slider externe.
- Les états overlay sont gérés par classes dans `js/portfolio-app.js`, puis stylés dans `styles/main.css`.
- Si un média n’a pas de miniature, la carte garde un fallback graphique.
- Après modification locale importante, faire un refresh navigateur forcé si l’ancien rendu reste affiché.

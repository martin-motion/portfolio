export function VideoOverlay({ projects, onProjectChange }) {
  let activeIndex = 0;
  let restoreFocusTo = null;
  let loadingTimer = null;
  let currentVideo = null;

  const overlay = document.createElement("div");
  overlay.className = "video-overlay";
  overlay.setAttribute("aria-hidden", "true");
  overlay.innerHTML = `
    <div class="video-overlay__panel" role="dialog" aria-modal="true" aria-label="Lecteur video" tabindex="-1">
      <div class="video-overlay__topbar">
        <div class="video-overlay__meta"></div>
        <button class="video-overlay__close" type="button" aria-label="Fermer">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
        </button>
      </div>
      <button class="video-overlay__nav video-overlay__nav--prev" type="button" aria-label="Video precedente">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
      </button>
      <div class="video-overlay__player-shell">
        <div class="video-overlay__loading" aria-live="polite">Chargement</div>
        <div class="video-overlay__player"></div>
      </div>
      <button class="video-overlay__nav video-overlay__nav--next" type="button" aria-label="Video suivante">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
      </button>
    </div>
  `;

  const panel = overlay.querySelector(".video-overlay__panel");
  const meta = overlay.querySelector(".video-overlay__meta");
  const player = overlay.querySelector(".video-overlay__player");
  const loading = overlay.querySelector(".video-overlay__loading");
  const closeButton = overlay.querySelector(".video-overlay__close");
  const prevButton = overlay.querySelector(".video-overlay__nav--prev");
  const nextButton = overlay.querySelector(".video-overlay__nav--next");

  const setLoading = (isLoading) => {
    loading.classList.toggle("is-visible", isLoading);
  };

  const unloadVideo = () => {
    clearTimeout(loadingTimer);
    setLoading(false);
    player.innerHTML = "";
    currentVideo = null;
    player.classList.remove("is-portrait", "is-landscape");
    player.style.removeProperty("--video-aspect");
    player.style.removeProperty("--video-ratio");
    player.style.removeProperty("--video-width");
    panel.style.removeProperty("--overlay-width");
  };

  const updatePlayerFrame = (video) => {
    if (!video.videoWidth || !video.videoHeight) return;

    const aspect = video.videoWidth / video.videoHeight;
    const overlayStyle = window.getComputedStyle(overlay);
    const panelStyle = window.getComputedStyle(panel);
    const paddingX =
      parseFloat(overlayStyle.paddingLeft) + parseFloat(overlayStyle.paddingRight);
    const paddingY =
      parseFloat(overlayStyle.paddingTop) + parseFloat(overlayStyle.paddingBottom);
    const panelGap = parseFloat(panelStyle.gap) || 0;
    const topbarHeight = overlay.querySelector(".video-overlay__topbar").offsetHeight;
    const mobileNavReserve = window.matchMedia("(max-width: 620px)").matches ? 74 : 0;
    const availableWidth = Math.max(280, window.innerWidth - paddingX);
    const availableHeight = Math.max(
      280,
      window.innerHeight - paddingY - topbarHeight - panelGap - mobileNavReserve
    );
    const idealWidth = Math.min(1500, availableWidth, availableHeight * aspect);

    player.style.setProperty("--video-aspect", aspect.toFixed(5));
    player.style.setProperty("--video-ratio", `${video.videoWidth} / ${video.videoHeight}`);
    player.style.setProperty("--video-width", `${Math.round(idealWidth)}px`);
    panel.style.setProperty("--overlay-width", `${Math.round(idealWidth)}px`);
    player.classList.toggle("is-portrait", aspect < 1);
    player.classList.toggle("is-landscape", aspect >= 1);
  };

  const renderProject = () => {
    const project = projects[activeIndex];

    meta.innerHTML = `
      <p>${project.category} <span></span> ${project.year}</p>
      <h2>${project.title}</h2>
      <small>${project.role}</small>
    `;

    unloadVideo();
    loadingTimer = window.setTimeout(() => setLoading(true), 300);

    const video = document.createElement("video");
    video.src = project.videoUrl;
    video.poster = project.thumbnail;
    video.controls = true;
    video.autoplay = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.volume = 1;
    currentVideo = video;

    video.addEventListener("loadedmetadata", () => {
      updatePlayerFrame(video);
    });

    video.addEventListener("loadeddata", () => {
      clearTimeout(loadingTimer);
      setLoading(false);
    });

    video.addEventListener("playing", () => {
      clearTimeout(loadingTimer);
      setLoading(false);
    });

    player.append(video);

    const playPromise = video.play();
    if (playPromise) {
      playPromise.catch(() => {
        clearTimeout(loadingTimer);
        setLoading(false);
      });
    }

    onProjectChange(activeIndex);
  };

  const move = (direction) => {
    activeIndex = (activeIndex + direction + projects.length) % projects.length;
    renderProject();
  };

  const open = (project, index, trigger) => {
    activeIndex = index;
    restoreFocusTo = trigger ?? document.activeElement;
    overlay.setAttribute("aria-hidden", "false");
    document.documentElement.classList.add("has-overlay");
    document.body.classList.add("has-overlay");
    renderProject(project);
    panel.focus({ preventScroll: true });
  };

  const close = () => {
    unloadVideo();
    overlay.setAttribute("aria-hidden", "true");
    document.documentElement.classList.remove("has-overlay");
    document.body.classList.remove("has-overlay");

    if (restoreFocusTo && typeof restoreFocusTo.focus === "function") {
      restoreFocusTo.focus({ preventScroll: true });
    }
  };

  closeButton.addEventListener("click", close);
  prevButton.addEventListener("click", () => move(-1));
  nextButton.addEventListener("click", () => move(1));

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) close();
  });

  window.addEventListener("keydown", (event) => {
    if (overlay.getAttribute("aria-hidden") === "true") return;

    if (event.key === "Escape") close();
    if (event.key === "ArrowLeft") move(-1);
    if (event.key === "ArrowRight") move(1);
  });

  window.addEventListener("resize", () => {
    if (overlay.getAttribute("aria-hidden") === "true" || !currentVideo) return;
    updatePlayerFrame(currentVideo);
  });

  return {
    element: overlay,
    open,
  };
}

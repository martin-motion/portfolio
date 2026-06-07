export function VideoOverlay({ projects, onProjectChange }) {
  let activeIndex = 0;
  let restoreFocusTo = null;
  let loadingTimer = null;
  let controlsTimer = null;
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
    clearTimeout(controlsTimer);
    setLoading(false);
    player.innerHTML = "";
    currentVideo = null;
    player.classList.remove("is-controls-hidden");
    player.classList.remove("is-portrait", "is-landscape");
    player.style.removeProperty("--video-aspect");
    player.style.removeProperty("--video-ratio");
    player.style.removeProperty("--video-width");
    panel.style.removeProperty("--overlay-width");
  };

  const showUnavailable = () => {
    clearTimeout(loadingTimer);
    clearTimeout(controlsTimer);
    setLoading(false);
    currentVideo = null;
    player.innerHTML = `<div class="video-overlay__empty">Vidéo bientôt disponible</div>`;
    player.style.setProperty("--video-ratio", "1 / 1");
    player.style.setProperty("--video-width", "620px");
    panel.style.setProperty("--overlay-width", "620px");
  };

  const setNativeControls = (video, isVisible) => {
    if (currentVideo !== video) return;
    video.controls = isVisible;
    player.classList.toggle("is-controls-hidden", !isVisible);
  };

  const revealNativeControls = (video, hideAfter = 1400) => {
    if (currentVideo !== video) return;
    clearTimeout(controlsTimer);
    setNativeControls(video, true);

    if (!video.paused && !video.ended) {
      controlsTimer = window.setTimeout(() => {
        setNativeControls(video, false);
      }, hideAfter);
    }
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

    if (!project.videoUrl) {
      showUnavailable();
      onProjectChange(activeIndex);
      return;
    }

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
      revealNativeControls(video, 700);
    });

    video.addEventListener("playing", () => {
      clearTimeout(loadingTimer);
      setLoading(false);
      revealNativeControls(video, 700);
    });

    video.addEventListener("pause", () => {
      clearTimeout(controlsTimer);
      setNativeControls(video, true);
    });

    video.addEventListener("ended", () => {
      clearTimeout(controlsTimer);
      setNativeControls(video, true);
    });

    video.addEventListener("error", () => {
      if (currentVideo !== video) return;
      showUnavailable();
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

  const getFocusableElements = () => {
    return Array.from(
      panel.querySelectorAll('button, video, [href], [tabindex]:not([tabindex="-1"])')
    ).filter(el => {
      // Filtrer les flèches si elles sont masquées par CSS en responsive/mobile
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });
  };

  const handleFocusTrap = (event) => {
    if (overlay.getAttribute("aria-hidden") === "true") return;
    if (event.key !== "Tab") return;

    const focusables = getFocusableElements();
    if (focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  };

  const open = (project, index, trigger) => {
    activeIndex = index;
    restoreFocusTo = trigger ?? document.activeElement;
    overlay.setAttribute("aria-hidden", "false");
    document.documentElement.classList.add("has-overlay");
    document.body.classList.add("has-overlay");
    renderProject(project);
    
    window.setTimeout(() => {
      const focusables = getFocusableElements();
      if (focusables.length > 0) {
        focusables[0].focus({ preventScroll: true });
      } else {
        panel.focus({ preventScroll: true });
      }
    }, 100);
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

  player.addEventListener("pointermove", () => {
    if (!currentVideo) return;
    revealNativeControls(currentVideo);
  });

  player.addEventListener("pointerdown", () => {
    if (!currentVideo) return;
    revealNativeControls(currentVideo, 2200);
  });

  panel.addEventListener("keydown", handleFocusTrap);

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) close();
  });

  window.addEventListener("keydown", (event) => {
    if (overlay.getAttribute("aria-hidden") === "true") return;

    if (event.key === "Escape") {
      event.preventDefault();
      close();
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      move(-1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      move(1);
    }
    if (event.key === " " || event.key === "Spacebar") {
      event.preventDefault();
      if (currentVideo) {
        if (currentVideo.paused) {
          currentVideo.play().catch(() => {});
        } else {
          currentVideo.pause();
        }
      }
    }
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

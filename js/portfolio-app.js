export function initPortfolioApp(projects) {
  const ACTIVE_INDEX_FALLBACK = 2;
  const COMPACT_BREAKPOINT = 720;
  const DEFAULT_VIDEO_VOLUME = 0.5;
  const MIN_MEDIA_RATIO = 0.52;
  const MAX_MEDIA_RATIO = 2.4;
  const PORTRAIT_RATIO_THRESHOLD = 0.95;
  const SWIPE_THRESHOLD = 42;
  const WHEEL_LOCK_MS = 220;
  const SWIPE_LOCK_MS = 260;
  const OPACITY_SCALE = [1, 0.9, 0.78, 0.64, 0.5, 0.38, 0.3];
  const OVERLAY_LAYOUT_CLASSES = [
    "is-gallery",
    "has-portrait",
    "is-dual-portrait",
    "is-single",
    "is-single-portrait",
  ];
  const CARD_PALETTES = [
    ["#8a6d4e", "#1a1714"],
    ["#2e4460", "#101216"],
    ["#7f7f7f", "#141414"],
    ["#49606d", "#13171b"],
    ["#5f4d72", "#17131b"],
    ["#755b45", "#171412"],
    ["#45546b", "#12151a"],
  ];

  // Centralized DOM references keep interaction code predictable and easy to scan.
  const elements = {
    track: document.getElementById("coverflowTrack"),
    viewport: document.getElementById("coverflowViewport"),
    prevBtn: document.getElementById("prevBtn"),
    nextBtn: document.getElementById("nextBtn"),
    metaCategory: document.getElementById("metaCategory"),
    metaTitle: document.getElementById("metaTitle"),
    metaDescription: document.getElementById("metaDescription"),
    overlay: document.getElementById("projectOverlay"),
    overlayCloseBtn: document.getElementById("overlayCloseBtn"),
    overlayCategory: document.getElementById("overlayCategory"),
    overlayTitle: document.getElementById("overlayTitle"),
    overlayDescription: document.getElementById("overlayDescription"),
    overlayTags: document.getElementById("overlayTags"),
    overlayVideoWrap: document.getElementById("overlayVideoWrap"),
    overlayHeadPrev: document.getElementById("overlayHeadPrev"),
    overlayHeadNext: document.getElementById("overlayHeadNext"),
  };

  const missingElementNames = Object.entries(elements)
    .filter(([, element]) => !(element instanceof HTMLElement))
    .map(([name]) => name);

  if (missingElementNames.length > 0) {
    console.warn("Portfolio app init aborted. Missing elements:", missingElementNames.join(", "));
    return;
  }

  const state = {
    activeIndex: Math.min(ACTIVE_INDEX_FALLBACK, Math.max(projects.length - 1, 0)),
    overlayIndex: 0,
    overlayMediaIndex: 0,
    wheelLocked: false,
    pointerStartX: 0,
    pointerStartY: 0,
    pointerActive: false,
    swipeLock: false,
    lastFocusedElement: null,
  };

  let cards = [];

  function paletteFor(index) {
    return CARD_PALETTES[index % CARD_PALETTES.length];
  }

  function wrapIndex(index) {
    return (index + projects.length) % projects.length;
  }

  function mediaCountFor(project) {
    if (Array.isArray(project.videos) && project.videos.length > 0) {
      return project.videos.length;
    }

    if (typeof project.video === "string") {
      return project.video.length > 0 ? 1 : 0;
    }

    return project.video && typeof project.video === "object" ? 1 : 0;
  }

  function wrapMediaIndex(index, length) {
    if (length <= 0) {
      return 0;
    }

    return ((index % length) + length) % length;
  }

  function parseMediaSize(widthValue, heightValue) {
    const width = Number(widthValue);
    const height = Number(heightValue);

    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
      return null;
    }

    return { width, height };
  }

  function isHttpOrigin(value) {
    return typeof value === "string" && /^(https?):\/\//.test(value);
  }

  function getYouTubeVideoId(url) {
    if (typeof url !== "string" || url.length === 0) {
      return null;
    }

    try {
      const parsedUrl = new URL(url);
      const hostname = parsedUrl.hostname.replace(/^www\./, "");

      if (hostname === "youtu.be") {
        return parsedUrl.pathname.slice(1) || null;
      }

      if (hostname === "youtube.com" || hostname === "m.youtube.com" || hostname === "music.youtube.com") {
        if (parsedUrl.pathname.startsWith("/shorts/")) {
          return parsedUrl.pathname.split("/")[2] || null;
        }

        if (parsedUrl.pathname === "/watch") {
          return parsedUrl.searchParams.get("v");
        }

        if (parsedUrl.pathname.startsWith("/embed/")) {
          return parsedUrl.pathname.split("/")[2] || null;
        }
      }
    } catch {
      return null;
    }

    return null;
  }

  function normalizeMediaEntry(project, entry) {
    if (typeof entry === "string") {
      return resolveMediaMetrics({
        provider: project.provider,
        src: entry,
        poster: project.thumbnail,
        label: project.title,
        width: project.videoWidth,
        height: project.videoHeight,
      });
    }

    if (!entry || typeof entry !== "object") {
      return null;
    }

    return resolveMediaMetrics({
      provider: entry.provider ?? project.provider,
      src: entry.src ?? project.video,
      poster: entry.poster ?? project.thumbnail,
      label: entry.label ?? project.title,
      width: entry.width ?? project.videoWidth,
      height: entry.height ?? project.videoHeight,
    });
  }

  function normalizeProjectVideo(project) {
    if (typeof project.video === "string") {
      return normalizeMediaEntry(project, {
        provider: project.provider,
        src: project.video,
        poster: project.thumbnail,
        label: project.title,
        width: project.videoWidth,
        height: project.videoHeight,
      });
    }

    if (project.video && typeof project.video === "object") {
      return normalizeMediaEntry(project, project.video);
    }

    return null;
  }

  function getEmbedSource(videoData, options = {}) {
    const { autoplay = false, muted = false } = options;
    const source = typeof videoData.src === "string" ? videoData.src : "";

    if (videoData.provider !== "youtube") {
      return source;
    }

    const videoId = getYouTubeVideoId(source);
    if (!videoId) {
      return "";
    }

    const params = new URLSearchParams({
      autoplay: autoplay ? "1" : "0",
      mute: muted ? "1" : "0",
      controls: "1",
      playsinline: "1",
      rel: "0",
      modestbranding: "1",
      iv_load_policy: "3",
    });

    if (isHttpOrigin(window.location.origin)) {
      params.set("origin", window.location.origin);
    }

    if (isHttpOrigin(window.location.href)) {
      params.set("widget_referrer", window.location.href);
    }

    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  }

  function getMediaPoster(videoData) {
    if (typeof videoData.poster === "string" && videoData.poster.length > 0) {
      return videoData.poster;
    }

    if (videoData.provider === "youtube") {
      const videoId = getYouTubeVideoId(videoData.src);
      if (videoId) {
        return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
      }
    }

    return "";
  }

  function resolveMediaMetrics(entry) {
    const size = parseMediaSize(entry.width, entry.height);
    const ratio = size ? size.width / size.height : 16 / 9;
    const safeRatio = Math.max(MIN_MEDIA_RATIO, Math.min(MAX_MEDIA_RATIO, ratio));
    const provider = entry.provider === "youtube" ? "youtube" : "local";

    return {
      ...entry,
      provider,
      width: size ? size.width : undefined,
      height: size ? size.height : undefined,
      ratio: safeRatio,
      isPortrait: safeRatio < PORTRAIT_RATIO_THRESHOLD,
    };
  }

  function isOverlayOpen() {
    return elements.overlay.classList.contains("is-open");
  }

  function setText(element, value) {
    if (element) {
      element.textContent = typeof value === "string" ? value : "";
    }
  }

  function updatePortraitClass(imageElement) {
    if (!(imageElement instanceof HTMLImageElement)) {
      return;
    }

    if (imageElement.naturalWidth > 0 && imageElement.naturalHeight > 0) {
      imageElement.classList.toggle("is-portrait", imageElement.naturalHeight > imageElement.naturalWidth);
    }
  }

  function applyPortraitClass(imageElement) {
    if (!(imageElement instanceof HTMLImageElement)) {
      return;
    }

    if (imageElement.dataset.portraitBound !== "true") {
      imageElement.addEventListener("load", () => {
        updatePortraitClass(imageElement);
      });
      imageElement.dataset.portraitBound = "true";
    }

    updatePortraitClass(imageElement);
  }

  function getCardsAtPoint(clientX, clientY) {
    return document
      .elementsFromPoint(clientX, clientY)
      .map((node) => (node instanceof HTMLElement ? node.closest(".project-card") : null))
      .filter((node, nodeIndex, array) => node && array.indexOf(node) === nodeIndex);
  }

  function buildCardMarkup(project, index) {
    const [colorA, colorB] = paletteFor(index);
    const mediaCount = mediaCountFor(project);
    const hasStack = mediaCount > 1;
    const thumbnailMarkup =
      typeof project.thumbnail === "string" && project.thumbnail.length > 0
        ? `<img src="${project.thumbnail}" alt="${project.title}" loading="lazy" />`
        : "";

    return `
      <button class="project-card${hasStack ? " has-stack" : ""}" type="button" data-index="${index}" aria-label="${project.title}">
        <div class="media" style="--card-a:${colorA}; --card-b:${colorB};">
          <span class="thumb-fallback" aria-hidden="true"></span>
          ${thumbnailMarkup}
          ${hasStack ? `<span class="stack-count" aria-hidden="true">${mediaCount}</span>` : ""}
          <span class="glass" aria-hidden="true"></span>
        </div>
      </button>
    `;
  }

  function handleCardAction(index) {
    const project = projects[index];
    const mediaEntries = normalizeOverlayVideos(project);
    const primaryMedia = mediaEntries[0];

    if (index !== state.activeIndex) {
      setActive(index);
      return;
    }

    if (mediaEntries.length === 1 && primaryMedia?.provider === "youtube" && primaryMedia.src) {
      window.location.assign(primaryMedia.src);
      return;
    }

    openOverlay(index);
  }

  function buildCards() {
    elements.track.innerHTML = projects.map(buildCardMarkup).join("");
    cards = [...elements.track.querySelectorAll(".project-card")];

    cards.forEach((card) => {
      const image = card.querySelector("img");
      if (image) {
        applyPortraitClass(image);
        image.addEventListener("error", () => {
          image.classList.add("is-missing");
        });
      }

      card.addEventListener("click", () => {
        if (state.swipeLock) {
          return;
        }

        handleCardAction(Number(card.dataset.index));
      });
    });
  }

  function getMotionMetrics() {
    const compact = window.innerWidth <= COMPACT_BREAKPOINT;

    return {
      spread: compact ? 92 : 164,
      depth: compact ? 84 : 112,
      centerDepth: compact ? 130 : 232,
      rotation: compact ? 29 : 46,
      scaleStep: compact ? 0.102 : 0.084,
      riseStep: compact ? 4 : 8,
    };
  }

  function updateProjectMeta(project) {
    setText(elements.metaCategory, project.category);
    setText(elements.metaTitle, project.title);
    setText(elements.metaDescription, project.description);
  }

  function renderCoverflow() {
    const { spread, depth, centerDepth, rotation, scaleStep, riseStep } = getMotionMetrics();
    const total = projects.length;
    const maxOffset = Math.floor(total / 2);
    const viewportWidth = elements.viewport.clientWidth || window.innerWidth;
    const firstCard = cards[0];
    const cardWidth = firstCard ? firstCard.getBoundingClientRect().width : 220;
    const fitSpread =
      maxOffset > 0
        ? Math.max(spread < 100 ? 52 : 72, (viewportWidth * 0.5 - cardWidth * 0.56 - 10) / maxOffset)
        : spread;
    const effectiveSpread = Math.min(spread, fitSpread);

    cards.forEach((card, index) => {
      let offset = index - state.activeIndex;
      if (offset > total / 2) {
        offset -= total;
      }
      if (offset < -total / 2) {
        offset += total;
      }

      const absOffset = Math.abs(offset);
      const bounded = Math.min(absOffset, 6);
      const translateX = offset * effectiveSpread;
      const translateY = offset === 0 ? 0 : bounded * riseStep;
      const translateZ = offset === 0 ? centerDepth : -bounded * depth;
      const rotateY = offset === 0 ? 0 : offset > 0 ? -rotation : rotation;
      const scale = offset === 0 ? 1 : Math.max(0.56, 1 - absOffset * scaleStep);
      const opacity = OPACITY_SCALE[Math.min(absOffset, OPACITY_SCALE.length - 1)];
      const isActive = index === state.activeIndex;

      card.style.transform = `translate(-50%, -50%) translateX(${translateX}px) translateY(${translateY}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`;
      card.style.opacity = String(opacity);
      card.style.zIndex = isActive ? "1000" : String(400 - absOffset);
      card.classList.toggle("is-active", isActive);
      card.setAttribute("aria-current", isActive ? "true" : "false");
    });

    updateProjectMeta(projects[state.activeIndex]);
  }

  function setActive(index) {
    state.activeIndex = wrapIndex(index);
    renderCoverflow();
  }

  function move(delta) {
    setActive(state.activeIndex + delta);
  }

  function handleWheel(event) {
    event.preventDefault();

    if (state.wheelLocked || isOverlayOpen()) {
      return;
    }

    state.wheelLocked = true;
    const value = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    move(value > 0 ? 1 : -1);

    window.setTimeout(() => {
      state.wheelLocked = false;
    }, WHEEL_LOCK_MS);
  }

  function handlePointerStart(event) {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    state.pointerActive = true;
    state.pointerStartX = event.clientX;
    state.pointerStartY = event.clientY;
  }

  function handlePointerEnd(event) {
    if (!state.pointerActive) {
      return;
    }

    state.pointerActive = false;
    const deltaX = event.clientX - state.pointerStartX;
    const deltaY = event.clientY - state.pointerStartY;

    if (Math.abs(deltaX) > SWIPE_THRESHOLD && Math.abs(deltaX) > Math.abs(deltaY)) {
      move(deltaX < 0 ? 1 : -1);
      state.swipeLock = true;
      window.setTimeout(() => {
        state.swipeLock = false;
      }, SWIPE_LOCK_MS);
    }
  }

  function normalizeOverlayVideos(project) {
    if (!Array.isArray(project.videos) || project.videos.length === 0) {
      const normalizedVideo = normalizeProjectVideo(project);
      if (!normalizedVideo) {
        return [];
      }

      return [normalizedVideo];
    }

    return project.videos
      .map((entry) => normalizeMediaEntry(project, entry))
      .filter((entry) => entry && typeof entry.src === "string" && entry.src.length > 0);
  }

  function clearOverlayLayout() {
    elements.overlayVideoWrap.classList.remove(...OVERLAY_LAYOUT_CLASSES);
  }

  function getOverlayLayout(overlayVideos, activeVideo) {
    const isGallery = overlayVideos.length > 1;
    const hasPortraitMedia = overlayVideos.some((videoData) => videoData.isPortrait);
    const allPortraitMedia = isGallery && overlayVideos.every((videoData) => videoData.isPortrait);
    const isDualPortrait = allPortraitMedia && overlayVideos.length === 2;

    return {
      isGallery,
      hasPortraitMedia,
      isDualPortrait,
      isSinglePortrait: !isGallery && Boolean(activeVideo?.isPortrait),
    };
  }

  function applyOverlayLayout(layout) {
    clearOverlayLayout();
    elements.overlayVideoWrap.classList.toggle("is-gallery", layout.isGallery);
    elements.overlayVideoWrap.classList.toggle("has-portrait", layout.hasPortraitMedia);
    elements.overlayVideoWrap.classList.toggle("is-dual-portrait", layout.isDualPortrait);
    elements.overlayVideoWrap.classList.toggle("is-single", !layout.isGallery);
    elements.overlayVideoWrap.classList.toggle("is-single-portrait", layout.isSinglePortrait);
  }

  function createManagedVideo(videoData, autoplay) {
    const video = document.createElement("video");
    video.src = getEmbedSource(videoData);
    video.controls = true;
    video.autoplay = autoplay;
    video.defaultMuted = false;
    video.muted = false;
    video.volume = DEFAULT_VIDEO_VOLUME;
    video.playsInline = true;
    video.preload = "metadata";

    video.addEventListener(
      "loadedmetadata",
      () => {
        video.volume = DEFAULT_VIDEO_VOLUME;
      },
      { once: true },
    );

    if (videoData.poster) {
      video.poster = videoData.poster;
    }

    return video;
  }

  function createExternalVideoLink(videoData, options = {}) {
    const { className = "overlay-video-helper-link", label = "Open in YouTube" } = options;
    const sourceUrl = typeof videoData.src === "string" ? videoData.src : "";
    const helperLink = document.createElement("a");
    helperLink.className = className;
    helperLink.href = sourceUrl;
    helperLink.rel = "noreferrer";
    helperLink.textContent = label;
    return helperLink;
  }

  function createYouTubeLaunch(videoData) {
    const posterSource = getMediaPoster(videoData);
    const launchLabel = videoData.label ?? "Lire la vidéo";
    const launchLink = createExternalVideoLink(videoData, {
      className: "overlay-video-launch",
      label: "",
    });

    launchLink.setAttribute("aria-label", `Ouvrir ${launchLabel} sur YouTube`);

    if (posterSource) {
      const posterImage = document.createElement("img");
      posterImage.src = posterSource;
      posterImage.alt = "";
      posterImage.loading = "eager";
      launchLink.append(posterImage);
    }

    const playBadge = document.createElement("span");
    playBadge.className = "overlay-video-play";
    playBadge.setAttribute("aria-hidden", "true");
    playBadge.textContent = "YouTube";

    const helper = document.createElement("span");
    helper.className = "overlay-video-helper";
    helper.textContent = "Watch on YouTube";

    launchLink.append(playBadge);
    launchLink.append(helper);
    return launchLink;
  }

  function buildOverlayVideoItem(videoData, options = {}) {
    const { autoplay = false, asMain = false } = options;
    const item = document.createElement("div");
    item.className = asMain ? "overlay-video-item overlay-video-main" : "overlay-video-item";
    item.style.setProperty("--item-ratio", String(videoData.ratio ?? 16 / 9));
    item.classList.toggle("is-portrait", Boolean(videoData.isPortrait));
    item.classList.toggle("is-landscape", !videoData.isPortrait);

    if (videoData.provider === "youtube") {
      item.append(createYouTubeLaunch(videoData));
      return item;
    }

    item.append(createManagedVideo(videoData, autoplay));
    return item;
  }

  function buildOverlayThumb(project, videoData, indexValue) {
    const thumbButton = document.createElement("button");
    const thumbImage = document.createElement("img");
    const posterSource = getMediaPoster(videoData) || project.thumbnail;

    thumbButton.type = "button";
    thumbButton.className = "overlay-video-thumb";
    thumbButton.setAttribute("aria-label", `Ouvrir ${videoData.label ?? `video ${indexValue + 1}`}`);
    thumbButton.style.setProperty("--thumb-ratio", String(videoData.ratio ?? 4 / 5));
    thumbButton.classList.toggle("is-portrait", Boolean(videoData.isPortrait));
    thumbButton.dataset.mediaIndex = String(indexValue);

    if (typeof posterSource === "string" && posterSource.length > 0) {
      thumbImage.src = posterSource;
      thumbImage.alt = "";
      thumbImage.loading = "lazy";
      thumbButton.append(thumbImage);
    }
    thumbButton.addEventListener("click", () => {
      const nextIndex = Number(thumbButton.dataset.mediaIndex);
      if (!Number.isFinite(nextIndex) || nextIndex === state.overlayMediaIndex) {
        return;
      }

      renderOverlay(state.overlayIndex, nextIndex);
    });

    return thumbButton;
  }

  // Overlay layout is kept in CSS; JS only decides which structural state is active.
  function renderOverlayMedia(project, overlayVideos, mediaIndex) {
    const safeMediaIndex = wrapMediaIndex(mediaIndex, overlayVideos.length);
    const selectedVideo = overlayVideos[safeMediaIndex];
    const layout = getOverlayLayout(overlayVideos, selectedVideo);

    state.overlayMediaIndex = safeMediaIndex;
    applyOverlayLayout(layout);

    if (!layout.isGallery) {
      elements.overlayVideoWrap.replaceChildren(buildOverlayVideoItem(selectedVideo, { autoplay: true, asMain: true }));
      return;
    }

    const mainItem = buildOverlayVideoItem(selectedVideo, { autoplay: true, asMain: true });
    const rail = document.createElement("div");
    rail.className = "overlay-video-rail";

    overlayVideos.forEach((videoData, indexValue) => {
      if (indexValue === safeMediaIndex) {
        return;
      }

      rail.append(buildOverlayThumb(project, videoData, indexValue));
    });

    elements.overlayVideoWrap.replaceChildren(mainItem, rail);
  }

  function updateOverlayCopy(project) {
    const tags = Array.isArray(project.tags) ? project.tags : [];

    setText(elements.overlayCategory, project.category);
    setText(elements.overlayTitle, project.title);
    setText(elements.overlayDescription, project.description);
    elements.overlayTags.replaceChildren(
      ...tags.map((tag) => {
        const tagItem = document.createElement("li");
        tagItem.textContent = tag;
        return tagItem;
      }),
    );
  }

  function renderOverlay(index, mediaIndex = 0) {
    const project = projects[index];
    const overlayVideos = normalizeOverlayVideos(project);

    updateOverlayCopy(project);

    if (overlayVideos.length === 0) {
      elements.overlayVideoWrap.replaceChildren();
      clearOverlayLayout();
      return;
    }

    renderOverlayMedia(project, overlayVideos, mediaIndex);
  }

  function openOverlay(index) {
    state.overlayIndex = wrapIndex(index);
    state.overlayMediaIndex = 0;
    renderOverlay(state.overlayIndex, state.overlayMediaIndex);
    setActive(state.overlayIndex);

    state.lastFocusedElement = document.activeElement;
    document.body.classList.add("no-scroll");
    elements.overlay.classList.add("is-open");
    elements.overlay.setAttribute("aria-hidden", "false");
    elements.overlayCloseBtn.focus();
  }

  function closeOverlay() {
    if (!isOverlayOpen()) {
      return;
    }

    elements.overlay.classList.remove("is-open");
    elements.overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
    elements.overlayVideoWrap.innerHTML = "";
    clearOverlayLayout();

    if (state.lastFocusedElement instanceof HTMLElement) {
      state.lastFocusedElement.focus();
    }
  }

  function stepOverlay(delta) {
    state.overlayIndex = wrapIndex(state.overlayIndex + delta);
    state.overlayMediaIndex = 0;
    renderOverlay(state.overlayIndex, state.overlayMediaIndex);
    setActive(state.overlayIndex);
  }

  function trapOverlayFocus(event) {
    if (event.key !== "Tab") {
      return;
    }

    const focusable = [...elements.overlay.querySelectorAll("button, [href], [tabindex]:not([tabindex='-1'])")]
      .filter((node) => node instanceof HTMLElement && !node.hasAttribute("disabled"));

    if (focusable.length === 0) {
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
      return;
    }

    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function handleViewportClick(event) {
    if (state.swipeLock || isOverlayOpen()) {
      return;
    }

    const target = event.target;
    if (!(target instanceof HTMLElement) || target.closest(".nav-btn")) {
      return;
    }

    const stackedCards = getCardsAtPoint(event.clientX, event.clientY);
    if (stackedCards.length === 0) {
      return;
    }

    const underneathCard = stackedCards.find((node) => Number(node?.dataset.index) !== state.activeIndex);
    if (underneathCard) {
      event.preventDefault();
      event.stopPropagation();
      setActive(Number(underneathCard.dataset.index));
      return;
    }

    const activeCard = stackedCards.find((node) => Number(node?.dataset.index) === state.activeIndex);
    if (activeCard) {
      event.preventDefault();
      event.stopPropagation();
      openOverlay(state.activeIndex);
    }
  }

  function handleKeyDown(event) {
    if (isOverlayOpen()) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeOverlay();
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        stepOverlay(1);
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        stepOverlay(-1);
      }

      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      move(1);
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      move(-1);
    }

    if (event.key === "Enter") {
      event.preventDefault();
      openOverlay(state.activeIndex);
    }
  }

  function bindEvents() {
    elements.prevBtn.addEventListener("click", () => move(-1));
    elements.nextBtn.addEventListener("click", () => move(1));

    elements.viewport.addEventListener("wheel", handleWheel, { passive: false });
    elements.viewport.addEventListener("click", handleViewportClick, true);
    elements.viewport.addEventListener("pointerdown", handlePointerStart);
    elements.viewport.addEventListener("pointerup", handlePointerEnd);
    elements.viewport.addEventListener("pointercancel", () => {
      state.pointerActive = false;
    });

    elements.overlay.addEventListener("click", (event) => {
      const target = event.target;
      if (target instanceof HTMLElement && target.dataset.closeOverlay !== undefined) {
        closeOverlay();
      }
    });

    elements.overlayCloseBtn.addEventListener("click", closeOverlay);
    elements.overlayHeadPrev.addEventListener("click", () => stepOverlay(-1));
    elements.overlayHeadNext.addEventListener("click", () => stepOverlay(1));
    elements.overlay.addEventListener("keydown", trapOverlayFocus);
    document.addEventListener("keydown", handleKeyDown);

    let resizeRaf = 0;
    window.addEventListener("resize", () => {
      window.cancelAnimationFrame(resizeRaf);
      resizeRaf = window.requestAnimationFrame(renderCoverflow);
    });
  }

  function init() {
    if (projects.length === 0) {
      return;
    }

    buildCards();
    bindEvents();
    renderCoverflow();
  }

  init();
}

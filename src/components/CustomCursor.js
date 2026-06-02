export function CustomCursor() {
  const cursor = document.createElement("div");
  cursor.className = "custom-cursor";
  cursor.setAttribute("aria-hidden", "true");
  cursor.innerHTML = `
    <span class="custom-cursor__trail"></span>
    <span class="custom-cursor__dot"></span>
  `;

  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!finePointer || reducedMotion) return cursor;

  document.body.classList.add("has-custom-cursor");

  let moveTimer = 0;
  let idleTimer = 0;

  const move = (event) => {
    cursor.style.setProperty("--cursor-x", `${event.clientX}px`);
    cursor.style.setProperty("--cursor-y", `${event.clientY}px`);
    cursor.classList.add("is-visible");
    cursor.classList.add("is-moving");

    const isInteractive = Boolean(
      event.target.closest("a, button, video, input, textarea, select, [role='button']")
    );
    cursor.classList.toggle("is-interactive", isInteractive);

    window.clearTimeout(moveTimer);
    window.clearTimeout(idleTimer);
    moveTimer = window.setTimeout(() => cursor.classList.remove("is-moving"), 120);
    idleTimer = window.setTimeout(() => cursor.classList.remove("is-visible"), 1200);
  };

  window.addEventListener("pointermove", move, { passive: true });
  window.addEventListener("pointerleave", () => cursor.classList.remove("is-visible"));

  return cursor;
}

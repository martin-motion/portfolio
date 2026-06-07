export const makeMagnetic = (element, strength = 0.3) => {
  if (!element || window.matchMedia("(pointer: coarse)").matches) return;

  const onPointerMove = (event) => {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = event.clientX - centerX;
    const deltaY = event.clientY - centerY;

    element.style.transform = `translate(${deltaX * strength}px, ${deltaY * strength}px) scale(1.02)`;
  };

  const onPointerLeave = () => {
    element.style.transform = "";
  };

  element.addEventListener("pointermove", onPointerMove, { passive: true });
  element.addEventListener("pointerleave", onPointerLeave);
};

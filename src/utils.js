export const makeMagnetic = (element, strength = 0.3) => {
  if (!element || window.matchMedia("(pointer: coarse)").matches) return;

  const onPointerMove = (event) => {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = event.clientX - centerX;
    const deltaY = event.clientY - centerY;

    // Mouvement ultra-léger (30% de la force initiale) et transition amortie
    const softStrength = strength * 0.3;
    element.style.transition = "transform 450ms cubic-bezier(0.25, 1, 0.5, 1)";
    element.style.transform = `translate(${deltaX * softStrength}px, ${deltaY * softStrength}px) scale(1.015)`;
  };

  const onPointerLeave = () => {
    // Retour progressif à l'état initial
    element.style.transition = "transform 600ms cubic-bezier(0.25, 1, 0.5, 1)";
    element.style.transform = "";
  };

  element.addEventListener("pointermove", onPointerMove, { passive: true });
  element.addEventListener("pointerleave", onPointerLeave);
};

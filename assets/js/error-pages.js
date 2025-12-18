/* =========================================
   ERROR PAGES INTERACTIVITY
   Path: assets/js/pages/error-pages.js
   ========================================= */

document.addEventListener("mousemove", (e) => {
  const mouseX = e.clientX;
  const mouseY = e.clientY;

  // --- 1. Ghost Eyes Tracking ---
  const eyesContainer = document.getElementById("ghostEyes");
  if (eyesContainer) {
    const rekt = eyesContainer.getBoundingClientRect();
    const anchorX = rekt.left + rekt.width / 2;
    const anchorY = rekt.top + rekt.height / 2;

    const eyes = document.querySelectorAll(".eye");
    eyes.forEach((eye) => {
      // Batasi pergerakan agar mata tidak keluar
      const dx = (mouseX - window.innerWidth / 2) / 30;
      const dy = (mouseY - window.innerHeight / 2) / 30;

      const moveX = Math.min(Math.max(dx, -5), 5);
      const moveY = Math.min(Math.max(dy, -3), 3);

      eye.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });
  }

  // --- 2. Parallax Orbs ---
  const orb1 = document.getElementById("orb1");
  const orb2 = document.getElementById("orb2");

  if (orb1 && orb2) {
    const x = (window.innerWidth - mouseX) / 100;
    const y = (window.innerHeight - mouseY) / 100;

    orb1.style.transform = `translate(${x * 2}px, ${y * 2}px)`;
    orb2.style.transform = `translate(${x * -2}px, ${y * -2}px)`;
  }

  // --- 3. Card Tilt Effect ---
  const content = document.getElementById("contentBox");
  if (content) {
    const tiltX = (window.innerWidth / 2 - mouseX) / 50;
    const tiltY = (window.innerHeight / 2 - mouseY) / 50;
    content.style.transform = `rotateY(${tiltX}deg) rotateX(${-tiltY}deg)`;
  }
});

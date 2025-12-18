document.addEventListener("DOMContentLoaded", () => {
  // --- 1. Reveal Animation on Scroll ---
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll(".fade-up, .reveal, .scale-in").forEach((el) => {
    observer.observe(el);
  });

  // --- 2. Advanced 3D Tilt (Desktop Only) ---
  const tiltCard = document.getElementById("tiltCard");
  const heroSection = document.querySelector(".hero");

  if (window.matchMedia("(min-width: 1024px)").matches && tiltCard) {
    heroSection.addEventListener("mousemove", (e) => {
      const { offsetWidth: width, offsetHeight: height } = heroSection;
      const { clientX: x, clientY: y } = e;

      // Calculate rotation (Max 15 deg)
      const xRotation = (y / height - 0.5) * 20;
      const yRotation = (x / width - 0.5) * -20;

      requestAnimationFrame(() => {
        tiltCard.style.transform = `perspective(1000px) rotateX(${xRotation}deg) rotateY(${yRotation}deg) scale(1.02)`;
      });
    });

    heroSection.addEventListener("mouseleave", () => {
      tiltCard.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`;
    });
  }

  // --- 3. Navbar Glass Effect ---
  const navbar = document.querySelector(".navbar");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 20) {
      navbar.style.background = "rgba(5, 5, 5, 0.9)";
      navbar.style.borderBottom = "1px solid rgba(255,255,255,0.1)";
    } else {
      navbar.style.background = "rgba(5, 5, 5, 0.8)";
      navbar.style.borderBottom = "1px solid rgba(255,255,255,0.05)";
    }
  });

  // --- 4. Magnetic Buttons ---
  const magnets = document.querySelectorAll(".magnetic");
  magnets.forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });

    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "translate(0, 0)";
    });
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".topics .topic").forEach((element, index) => {
  element.style.setProperty("--delay", `${index * 70}ms`);
});

document.querySelectorAll(".bio-facts > div").forEach((element, index) => {
  element.style.setProperty("--delay", `${index * 55}ms`);
});

document.querySelectorAll(".story-photo").forEach((element, index) => {
  element.style.setProperty("--delay", `${index * 90}ms`);
});

document.querySelectorAll(".gallery .gallery-item").forEach((element, index) => {
  element.style.setProperty("--delay", `${(index % 3) * 60}ms`);
});

document.querySelectorAll(".reveal").forEach((element) => {
  revealObserver.observe(element);
});

const photoLoop = document.querySelector(".photo-loop");

if (photoLoop) {
  const photoLoopTrack = photoLoop.querySelector(".photo-loop-track");
  const photoLoopSet = photoLoop.querySelector(".photo-loop-set");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let dragStartX = 0;
  let dragStartScroll = 0;
  let resumeAfter = 0;
  let previousFrame = performance.now();
  let autoplayWasActive = false;

  const createLoopClone = () => {
    const clone = photoLoopSet.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    clone.querySelectorAll("img").forEach((image) => image.setAttribute("alt", ""));
    return clone;
  };

  photoLoopTrack.prepend(createLoopClone());
  photoLoopTrack.append(createLoopClone());

  requestAnimationFrame(() => {
    photoLoop.scrollLeft = photoLoopSet.offsetWidth;
  });

  const pauseAutoplay = (duration = 2800) => {
    resumeAfter = performance.now() + duration;
    photoLoop.classList.remove("is-autoplaying");
    autoplayWasActive = false;
  };

  const runAutoplay = (timestamp) => {
    const loopWidth = photoLoopSet.offsetWidth;
    const elapsed = Math.min(timestamp - previousFrame, 48);

    if (loopWidth > 0) {
      if (photoLoop.scrollLeft >= loopWidth * 2) photoLoop.scrollLeft -= loopWidth;
      if (photoLoop.scrollLeft <= 0) photoLoop.scrollLeft += loopWidth;

      const autoplayIsActive = !reducedMotion.matches && timestamp >= resumeAfter && !photoLoop.classList.contains("is-interacting");

      if (autoplayIsActive !== autoplayWasActive) {
        photoLoop.classList.toggle("is-autoplaying", autoplayIsActive);
        autoplayWasActive = autoplayIsActive;
      }

      if (autoplayIsActive) {
        photoLoop.scrollLeft += elapsed * 0.026;
      }
    }

    previousFrame = timestamp;
    requestAnimationFrame(runAutoplay);
  };

  requestAnimationFrame(runAutoplay);

  const stopInteraction = (event) => {
    if (!photoLoop.classList.contains("is-interacting")) return;
    photoLoop.classList.remove("is-interacting");
    photoLoop.classList.remove("is-dragging");
    pauseAutoplay();
    if (event.pointerId !== undefined && photoLoop.hasPointerCapture(event.pointerId)) {
      photoLoop.releasePointerCapture(event.pointerId);
    }
  };

  photoLoop.addEventListener("pointerdown", (event) => {
    pauseAutoplay();
    photoLoop.classList.add("is-interacting");
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    dragStartX = event.clientX;
    dragStartScroll = photoLoop.scrollLeft;
    photoLoop.classList.add("is-dragging");
    photoLoop.setPointerCapture(event.pointerId);
  });

  photoLoop.addEventListener("pointermove", (event) => {
    if (!photoLoop.classList.contains("is-dragging")) return;
    event.preventDefault();
    photoLoop.scrollLeft = dragStartScroll - (event.clientX - dragStartX);
  });

  photoLoop.addEventListener("pointerup", stopInteraction);
  photoLoop.addEventListener("pointercancel", stopInteraction);
  photoLoop.addEventListener("wheel", () => pauseAutoplay(), { passive: true });
  photoLoop.addEventListener("focus", () => pauseAutoplay(), { passive: true });

  photoLoop.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    pauseAutoplay();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    photoLoop.scrollBy({ left: direction * Math.min(photoLoop.clientWidth * 0.72, 520), behavior: "smooth" });
  });
}

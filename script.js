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

const siteLogo = document.querySelector(".logo");

siteLogo?.addEventListener("click", (event) => {
  event.preventDefault();
  window.location.reload();
});

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
  let dragStartX = 0;
  let dragStartScroll = 0;
  let resumeTimer;

  const createLoopClone = () => {
    const clone = photoLoopSet.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    clone.querySelectorAll("img").forEach((image) => image.setAttribute("alt", ""));
    return clone;
  };

  photoLoopTrack.prepend(createLoopClone());
  photoLoopTrack.append(createLoopClone());

  const syncLoopDistance = () => {
    photoLoopTrack.style.setProperty("--loop-distance", `-${photoLoopSet.offsetWidth}px`);
  };

  syncLoopDistance();
  new ResizeObserver(syncLoopDistance).observe(photoLoopSet);

  requestAnimationFrame(() => {
    photoLoop.scrollLeft = photoLoopSet.offsetWidth;
    photoLoop.classList.add("is-ready");
  });

  const pauseAutoplay = (duration = 2800) => {
    window.clearTimeout(resumeTimer);
    photoLoop.classList.add("is-paused");
    resumeTimer = window.setTimeout(() => {
      if (!photoLoop.classList.contains("is-interacting")) {
        photoLoop.classList.remove("is-paused");
      }
    }, duration);
  };

  const normalizeLoopPosition = () => {
    const loopWidth = photoLoopSet.offsetWidth;
    if (loopWidth === 0) return;
    if (photoLoop.scrollLeft < loopWidth * 0.35) photoLoop.scrollLeft += loopWidth;
    if (photoLoop.scrollLeft > loopWidth * 1.65) photoLoop.scrollLeft -= loopWidth;
  };

  const stopInteraction = (event) => {
    if (!photoLoop.classList.contains("is-interacting")) return;
    photoLoop.classList.remove("is-interacting");
    photoLoop.classList.remove("is-dragging");
    normalizeLoopPosition();
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

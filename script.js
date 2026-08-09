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
  element.style.setProperty("--delay", `${(index % 2) * 70}ms`);
});

document.querySelectorAll(".gallery .gallery-item").forEach((element, index) => {
  element.style.setProperty("--delay", `${(index % 3) * 60}ms`);
});

document.querySelectorAll(".reveal").forEach((element) => {
  revealObserver.observe(element);
});

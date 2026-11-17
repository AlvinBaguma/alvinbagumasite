(() => {
  "use strict";\n  document.documentElement.classList.add("js");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  // Type only the hero identity; the complete text remains available without JS.
  const typed = document.getElementById("whoami-cmd");
  if (typed && !reduceMotion) {
    const text = typed.dataset.text || typed.textContent;
    typed.textContent = "";
    let index = 0;
    const typeNext = () => {
      if (index >= text.length) return;
      typed.textContent += text.charAt(index++);
      window.setTimeout(typeNext, 85);
    };
    window.setTimeout(typeNext, 260);
  }

  // Reveal sections progressively, while keeping all content visible without JS.
  const sections = document.querySelectorAll(".terminal-section");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -35px 0px" });
    sections.forEach((section) => revealObserver.observe(section));
  } else {
    sections.forEach((section) => section.classList.add("is-visible"));
  }

  // East Africa Time, independent of the device's configured timezone.
  const clock = document.getElementById("eat-clock");
  const updateClock = () => {
    if (!clock) return;
    clock.textContent = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Africa/Kampala", hour: "2-digit", minute: "2-digit", hour12: false
    }).format(new Date()) + " EAT";
  };
  updateClock();
  window.setInterval(updateClock, 60000);

  // Active section tracking for the compact header navigation.
  const navLinks = Array.from(document.querySelectorAll(".site-nav a"));
  const navTargets = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);
  if ("IntersectionObserver" in window && navTargets.length) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          const active = link.getAttribute("href") === "#" + entry.target.id;
          link.classList.toggle("is-active", active);
          if (active) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-25% 0px -65% 0px", threshold: 0 });
    navTargets.forEach((target) => navObserver.observe(target));
  }

  // Small scroll progress indicator.
  const progress = document.getElementById("scroll-progress");
  let ticking = false;
  const updateProgress = () => {
    if (progress) {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const amount = scrollable > 0 ? window.scrollY / scrollable : 0;
      progress.style.transform = "scaleX(" + Math.min(1, Math.max(0, amount)) + ")";
    }
    ticking = false;
  };
  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(updateProgress);
      ticking = true;
    }
  }, { passive: true });
  updateProgress();

  // Project filters are buttons with real pressed state for keyboard and screen readers.
  const filterButtons = document.querySelectorAll("[data-filter]");
  const projectCards = document.querySelectorAll(".project-card[data-kind]");
  const emptyMessage = document.getElementById("filter-empty");
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      let visible = 0;
      filterButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      projectCards.forEach((card) => {
        const show = filter === "all" || card.dataset.kind === filter;
        card.hidden = !show;
        if (show) visible += 1;
      });
      if (emptyMessage) emptyMessage.hidden = visible > 0;
    });
  });

  // Respect reduced-motion preferences for the back-to-top control.
  document.querySelectorAll(".back-to-top, a[href='#top']").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (link.getAttribute("href") !== "#top") return;
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      history.replaceState(null, "", "#top");
    });
  });
})();
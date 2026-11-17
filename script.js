(() => {
  "use strict";

  // Progressive enhancement: without JavaScript, every section remains visible.
  document.documentElement.classList.add("js");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  // Calculate age from the birthday at seven-decimal precision (Kampala time).
  const ageNode = document.getElementById("user-age");
  if (ageNode) {
    const birthday = new Date("2003-03-20T21:00:00.000Z"); // 21 March, 00:00 EAT
    const tropicalYearMs = 365.2425 * 24 * 60 * 60 * 1000;
    const updateAge = () => {
      const age = (Date.now() - birthday.getTime()) / tropicalYearMs;
      ageNode.textContent = age.toFixed(7);
    };
    updateAge();
    window.setInterval(updateAge, 1000);
  }

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  // A short, deliberate terminal-style identity reveal.
  const typed = document.getElementById("whoami-cmd");
  if (typed && !reduceMotion) {
    const completeText = typed.dataset.text || typed.textContent.trim();
    typed.textContent = "";
    let index = 0;
    const typeNext = () => {
      if (index >= completeText.length) return;
      typed.textContent += completeText.charAt(index++);
      window.setTimeout(typeNext, 78);
    };
    window.setTimeout(typeNext, 320);
  }

  // Prepare small staggered entrances for repeated content.
  document.querySelectorAll(".terminal-section").forEach((section) => {
    [
      ".category-list .category-row",
      ".project-grid .project-card",
      ".results-table tbody tr"
    ].forEach((selector) => {
      section.querySelectorAll(selector).forEach((item, index) => {
        item.style.setProperty("--reveal-delay", Math.min(index * 65, 390) + "ms");
      });
    });
    section.querySelectorAll(".fastfetch-info dl > div").forEach((item, index) => {
      item.style.transitionDelay = Math.min(index * 38, 420) + "ms";
    });
  });

  // Reveal each section once, only as it approaches the viewport.
  const sections = document.querySelectorAll(".terminal-section");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -42px 0px" });
    sections.forEach((section) => revealObserver.observe(section));
  } else {
    sections.forEach((section) => section.classList.add("is-visible"));
  }

  // East Africa Time, independent of the device timezone.
  const clock = document.getElementById("eat-clock");
  const updateClock = () => {
    if (!clock) return;
    clock.textContent = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Africa/Kampala",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).format(new Date()) + " EAT";
  };
  updateClock();
  window.setInterval(updateClock, 60000);

  // Scroll-aware navigation.
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

  // Smooth, frame-synchronised reading progress.
  const progress = document.getElementById("scroll-progress");
  let progressQueued = false;
  const updateProgress = () => {
    if (progress) {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      progress.style.transform = "scaleX(" + Math.min(1, Math.max(0, ratio)) + ")";
    }
    progressQueued = false;
  };
  window.addEventListener("scroll", () => {
    if (progressQueued) return;
    progressQueued = true;
    window.requestAnimationFrame(updateProgress);
  }, { passive: true });
  window.addEventListener("resize", updateProgress);
  updateProgress();

  // Accessible project filters.
  const filterButtons = document.querySelectorAll("[data-filter]");
  const projectCards = document.querySelectorAll(".project-card[data-kind]");
  const emptyMessage = document.getElementById("filter-empty");
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter || "all";
      let visibleCount = 0;
      filterButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      projectCards.forEach((card) => {
        const show = filter === "all" || card.dataset.kind === filter;
        card.hidden = !show;
        if (show) visibleCount += 1;
      });
      if (emptyMessage) emptyMessage.hidden = visibleCount > 0;
    });
  });

  // Pointer-following light and restrained 3D tilt on desktop project cards.
  if (finePointer && !reduceMotion) {
    projectCards.forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const bounds = card.getBoundingClientRect();
        const x = event.clientX - bounds.left;
        const y = event.clientY - bounds.top;
        const px = x / bounds.width;
        const py = y / bounds.height;
        card.style.setProperty("--pointer-x", (px * 100).toFixed(1) + "%");
        card.style.setProperty("--pointer-y", (py * 100).toFixed(1) + "%");
        const rotateY = (px - 0.5) * 2.2;
        const rotateX = (0.5 - py) * 2.2;
        card.style.transform = "perspective(900px) translateY(-3px) rotateX(" +
          rotateX.toFixed(2) + "deg) rotateY(" + rotateY.toFixed(2) + "deg)";
      });
      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
        card.style.removeProperty("--pointer-x");
        card.style.removeProperty("--pointer-y");
      });
    });
  }

  // Respect reduced-motion preferences for return-to-top navigation.
  document.querySelectorAll(".back-to-top, a[href='#top']").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (link.getAttribute("href") !== "#top") return;
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      history.replaceState(null, "", "#top");
    });
  });
})();

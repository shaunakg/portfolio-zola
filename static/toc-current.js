(() => {
  const toc = document.querySelector(".post-layout .toc");
  const article = document.querySelector(".post-layout .post-article");
  if (!toc || !article) {
    return;
  }

  const links = Array.from(toc.querySelectorAll("a[href*='#']"));
  if (links.length === 0) {
    return;
  }

  const entries = links
    .map((link) => {
      const href = link.getAttribute("href");
      if (!href) {
        return null;
      }

      let id = "";
      try {
        const parsed = new URL(href, window.location.href);
        id = decodeURIComponent(parsed.hash.replace(/^#/, ""));
      } catch (_error) {
        return null;
      }

      if (!id) {
        return null;
      }

      const heading = article.querySelector(`#${CSS.escape(id)}`);
      if (!heading) {
        return null;
      }

      return { id, link, heading };
    })
    .filter(Boolean);

  if (entries.length === 0) {
    return;
  }

  const setCurrent = (id) => {
    entries.forEach(({ id: entryId, link }) => {
      const isCurrent = entryId === id;
      link.classList.toggle("is-current", isCurrent);
      if (isCurrent) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  const getCurrentId = () => {
    const triggerY = window.scrollY + window.innerHeight * 0.25;
    let current = entries[0];
    entries.forEach((entry) => {
      if (entry.heading.offsetTop <= triggerY) {
        current = entry;
      }
    });
    return current.id;
  };

  let ticking = false;
  const updateCurrent = () => {
    ticking = false;
    setCurrent(getCurrentId());
  };

  const scheduleUpdate = () => {
    if (ticking) {
      return;
    }
    ticking = true;
    window.requestAnimationFrame(updateCurrent);
  };

  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", scheduleUpdate);
  window.addEventListener("hashchange", scheduleUpdate);
  window.addEventListener("load", scheduleUpdate);

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(scheduleUpdate).catch(() => {});
  }

  scheduleUpdate();
})();

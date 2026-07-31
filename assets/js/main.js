/* ==========================================================================
   Pirates Booster Club — shared interactions
   Vanilla JS, no dependencies. All motion respects prefers-reduced-motion.
   ========================================================================== */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var onFrame = (function () {
    var queued = false;
    var jobs = [];
    return function (fn) {
      if (jobs.indexOf(fn) === -1) jobs.push(fn);
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () {
        queued = false;
        var list = jobs.slice();
        jobs.length = 0;
        list.forEach(function (j) {
          j();
        });
      });
    };
  })();

  /* ----------------------------------------------------------------------
     1. Sticky header + scroll progress + back-to-top
     ---------------------------------------------------------------------- */
  var header = document.querySelector(".site-header");
  var progress = document.querySelector(".progress span");
  var toTop = document.querySelector(".to-top");

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;

    if (header) header.classList.toggle("is-stuck", y > 40);
    if (toTop) toTop.classList.toggle("is-on", y > 600);

    if (progress) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.setProperty("--p", max > 0 ? Math.min(y / max, 1).toFixed(4) : 0);
    }

    // Hero parallax (cheap: single transform on the image)
    if (heroImg && !reduced && y < window.innerHeight * 1.4) {
      heroImg.style.setProperty("--par", (y * -0.12).toFixed(2) + "px");
    }
  }

  var heroImg = document.querySelector(".hero__media img");
  window.addEventListener(
    "scroll",
    function () {
      onFrame(onScroll);
    },
    { passive: true }
  );
  onScroll();

  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    });
  }

  /* ----------------------------------------------------------------------
     2. Mobile drawer
     ---------------------------------------------------------------------- */
  var burger = document.querySelector(".burger");
  var drawer = document.getElementById("drawer");

  function setDrawer(open) {
    if (!burger || !drawer) return;
    burger.setAttribute("aria-expanded", String(open));
    drawer.classList.toggle("is-open", open);
    document.body.classList.toggle("nav-open", open);
  }

  if (burger && drawer) {
    burger.addEventListener("click", function () {
      setDrawer(burger.getAttribute("aria-expanded") !== "true");
    });
    drawer.addEventListener("click", function (e) {
      if (e.target.tagName === "A") setDrawer(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setDrawer(false);
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 960) setDrawer(false);
    });
  }

  /* ----------------------------------------------------------------------
     3. Scroll reveals (IntersectionObserver) + stagger groups
     ---------------------------------------------------------------------- */
  // data-stagger="80" on a parent -> children get incremental --delay
  document.querySelectorAll("[data-stagger]").forEach(function (group) {
    var gap = parseInt(group.getAttribute("data-stagger"), 10) || 90;
    Array.prototype.forEach.call(group.children, function (child, i) {
      if (!child.hasAttribute("data-reveal")) child.setAttribute("data-reveal", "");
      child.style.setProperty("--delay", i * gap + "ms");
    });
  });

  var revealables = document.querySelectorAll("[data-reveal]");

  if (reduced || !("IntersectionObserver" in window)) {
    revealables.forEach(function (el) {
      el.classList.add("in");
    });
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 }
    );
    revealables.forEach(function (el) {
      io.observe(el);
    });
  }

  /* ----------------------------------------------------------------------
     4. Count-up numbers
     ---------------------------------------------------------------------- */
  var counters = document.querySelectorAll("[data-count]");

  function runCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var dur = parseInt(el.getAttribute("data-count-dur"), 10) || 1600;
    var decimals = (el.getAttribute("data-count").split(".")[1] || "").length;

    if (reduced) {
      el.textContent = target.toFixed(decimals);
      return;
    }

    var start = performance.now();
    (function tick(now) {
      var t = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = (target * eased).toFixed(decimals);
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = target.toFixed(decimals);
    })(start);
  }

  if (counters.length) {
    if (!("IntersectionObserver" in window)) {
      counters.forEach(runCount);
    } else {
      var cio = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            runCount(entry.target);
            cio.unobserve(entry.target);
          });
        },
        { threshold: 0.6 }
      );
      counters.forEach(function (el) {
        cio.observe(el);
      });
    }
  }

  /* ----------------------------------------------------------------------
     5. Pointer-tracked glows (hero torchlight + card spotlights)
     ---------------------------------------------------------------------- */
  if (!reduced && window.matchMedia("(hover: hover)").matches) {
    var hero = document.querySelector(".hero");
    if (hero) {
      hero.addEventListener(
        "pointermove",
        function (e) {
          var r = hero.getBoundingClientRect();
          hero.style.setProperty("--mx", (((e.clientX - r.left) / r.width) * 100).toFixed(1) + "%");
          hero.style.setProperty("--my", (((e.clientY - r.top) / r.height) * 100).toFixed(1) + "%");
        },
        { passive: true }
      );
    }

    document.querySelectorAll(".card").forEach(function (card) {
      card.addEventListener(
        "pointermove",
        function (e) {
          var r = card.getBoundingClientRect();
          card.style.setProperty("--cx", (((e.clientX - r.left) / r.width) * 100).toFixed(1) + "%");
          card.style.setProperty("--cy", (((e.clientY - r.top) / r.height) * 100).toFixed(1) + "%");
        },
        { passive: true }
      );
    });
  }

  /* ----------------------------------------------------------------------
     6. Footer year
     ---------------------------------------------------------------------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();

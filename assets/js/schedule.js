/* ==========================================================================
   Pirates Booster Club — XC meet schedule page
   Reads the meet cards already in the HTML (progressive enhancement):
     data-date = "YYYY-MM-DDTHH:MM"  (local time)
     data-type = "trial" | "invite" | "league" | "champ"
   Adds: past/next flagging, live countdown, category filtering.
   ========================================================================== */
(function () {
  "use strict";

  var list = document.querySelector("[data-meets]");
  if (!list) return;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var meets = Array.prototype.slice.call(list.querySelectorAll(".meet"));
  var now = new Date();

  var records = meets
    .map(function (el) {
      var raw = el.getAttribute("data-date");
      var date = raw ? new Date(raw) : null;
      return {
        el: el,
        date: date && !isNaN(date) ? date : null,
        type: el.getAttribute("data-type") || "invite"
      };
    })
    .filter(function (r) {
      return r.date;
    });

  /* ---------- 1. Past / next flags ---------- */
  var upcoming = records
    .filter(function (r) {
      // a meet stays "current" until 8 hours after its start time
      return r.date.getTime() + 8 * 3600 * 1000 > now.getTime();
    })
    .sort(function (a, b) {
      return a.date - b.date;
    });

  var next = upcoming[0] || null;

  records.forEach(function (r) {
    var isPast = r.date.getTime() + 8 * 3600 * 1000 <= now.getTime();
    r.el.classList.toggle("is-past", isPast);
    if (isPast) {
      var side = r.el.querySelector(".meet__side");
      if (side && !side.querySelector(".badge--done")) {
        var done = document.createElement("span");
        done.className = "badge badge--done";
        done.textContent = "Completed";
        side.appendChild(done);
      }
    }
  });

  if (next) {
    next.el.classList.add("is-next");
    var side = next.el.querySelector(".meet__side");
    if (side) {
      var flag = document.createElement("span");
      flag.className = "badge badge--next";
      flag.textContent = "Up Next";
      side.insertBefore(flag, side.firstChild);
    }
  }

  /* ---------- 2. Countdown to the next meet ---------- */
  var box = document.querySelector("[data-countdown]");

  if (box) {
    if (!next) {
      box.innerHTML =
        '<div><p class="countdown__label">Season complete</p>' +
        '<p class="countdown__name">See you on the track this spring</p>' +
        '<p class="countdown__meta">Track &amp; Field schedule posts in February.</p></div>';
    } else {
      var nameEl = box.querySelector("[data-cd-name]");
      var metaEl = box.querySelector("[data-cd-meta]");
      var title = next.el.querySelector("h3");
      var place = next.el.getAttribute("data-place") || "";

      if (nameEl && title) nameEl.textContent = title.textContent.trim();
      if (metaEl) {
        metaEl.textContent =
          next.date.toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric"
          }) +
          " · " +
          next.date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }) +
          (place ? " · " + place : "");
      }

      var units = {
        d: box.querySelector("[data-cd='d']"),
        h: box.querySelector("[data-cd='h']"),
        m: box.querySelector("[data-cd='m']"),
        s: box.querySelector("[data-cd='s']")
      };

      var pad = function (n) {
        return n < 10 ? "0" + n : String(n);
      };

      var tick = function () {
        var diff = next.date.getTime() - Date.now();
        if (diff < 0) diff = 0;
        var d = Math.floor(diff / 86400000);
        var h = Math.floor((diff % 86400000) / 3600000);
        var m = Math.floor((diff % 3600000) / 60000);
        var s = Math.floor((diff % 60000) / 1000);
        if (units.d) units.d.textContent = pad(d);
        if (units.h) units.h.textContent = pad(h);
        if (units.m) units.m.textContent = pad(m);
        if (units.s) units.s.textContent = pad(s);
      };

      tick();
      setInterval(tick, 1000);
    }
  }

  /* ---------- 3. Category filters ---------- */
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip[data-filter]"));
  var counter = document.querySelector("[data-visible-count]");
  var empty = document.querySelector(".empty");

  function tally(key) {
    if (key === "all") return records.length;
    if (key === "upcoming") {
      return records.filter(function (r) {
        return !r.el.classList.contains("is-past");
      }).length;
    }
    return records.filter(function (r) {
      return r.type === key;
    }).length;
  }

  chips.forEach(function (chip) {
    var slot = chip.querySelector("small");
    if (slot) slot.textContent = tally(chip.getAttribute("data-filter"));
  });

  var firstRun = true;

  function apply(key) {
    var shown = 0;

    records.forEach(function (r) {
      var match =
        key === "all" ||
        (key === "upcoming" ? !r.el.classList.contains("is-past") : r.type === key);

      r.el.classList.toggle("meet--hidden", !match);

      if (match) {
        shown++;
        if (!reduced && !firstRun) {
          // quick re-entrance so filtering feels alive
          r.el.style.setProperty("--delay", shown * 45 + "ms");
          r.el.classList.remove("in");
          // force reflow, then re-add
          void r.el.offsetWidth;
          r.el.classList.add("in");
        }
      }
    });

    if (counter) counter.textContent = shown + (shown === 1 ? " meet" : " meets");
    if (empty) empty.classList.toggle("is-on", shown === 0);
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) {
        c.setAttribute("aria-pressed", String(c === chip));
      });
      apply(chip.getAttribute("data-filter"));
    });
  });

  var initial = chips.filter(function (c) {
    return c.getAttribute("aria-pressed") === "true";
  })[0];
  apply(initial ? initial.getAttribute("data-filter") : "all");
  firstRun = false;
})();

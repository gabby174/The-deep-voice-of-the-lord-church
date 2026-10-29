document.addEventListener("DOMContentLoaded", function () {
  // ---- Edit service times here (day: 0 = Sunday ... 6 = Saturday; 24-hour time) ----
  var SERVICES = [
    { day: 0, hour: 9,  min: 0, name: "Sunday Worship Service" },
    { day: 2, hour: 18, min: 0, name: "Tuesday Bible Study" },
    { day: 5, hour: 18, min: 0, name: "Friday Prayer and Praise" }
  ];
  var DURATION_HOURS = 2; // how long a service counts as "happening now"

  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  function fmtTime(h, m) {
    var ap = h >= 12 ? "PM" : "AM";
    return ((h + 11) % 12 + 1) + ":" + (m < 10 ? "0" : "") + m + " " + ap;
  }

  // Next start time for a service, counting from now
  function nextStart(s, now) {
    var d = new Date(now);
    d.setHours(s.hour, s.min, 0, 0);
    d.setDate(d.getDate() + ((s.day - d.getDay() + 7) % 7));
    return d;
  }

  function updateNext() {
    var now = new Date(), best = null, live = null;
    SERVICES.forEach(function (s) {
      // Is a service on right now?
      var today = new Date(now);
      if (today.getDay() === s.day) {
        var start = new Date(now); start.setHours(s.hour, s.min, 0, 0);
        var end = new Date(start.getTime() + DURATION_HOURS * 3600000);
        if (now >= start && now < end) live = s;
      }
      var t = nextStart(s, now);
      if (t <= now) t.setDate(t.getDate() + 7);
      if (!best || t < best.time) best = { s: s, time: t };
    });

    var nameEl = document.getElementById("next-name");
    var whenEl = document.getElementById("next-when");
    var countEl = document.getElementById("next-count");

    if (live) {
      nameEl.textContent = live.name;
      whenEl.textContent = "Started at " + fmtTime(live.hour, live.min);
      countEl.textContent = "Happening now. Come and join us.";
      return;
    }
    var ms = best.time - now;
    var days = Math.floor(ms / 86400000);
    var hours = Math.floor(ms / 3600000) % 24;
    var mins = Math.floor(ms / 60000) % 60;
    nameEl.textContent = best.s.name;
    whenEl.textContent = DAYS[best.s.day] + " at " + fmtTime(best.s.hour, best.s.min);
    countEl.textContent = "Starts in " + (days ? days + "d " : "") + hours + "h " + mins + "m";
  }
  updateNext();
  setInterval(updateNext, 30000);

  // Mark today's service card
  var todayNum = new Date().getDay();
  document.querySelectorAll(".day").forEach(function (card) {
    card.classList.toggle("is-today", Number(card.dataset.day) === todayNum);
  });

  // Mobile menu
  var toggle = document.querySelector(".menu-toggle");
  var menu = document.getElementById("main-nav");
  var links = document.querySelectorAll("#main-nav a");
  function closeMenu() {
    menu.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.textContent = "Menu";
  }
  toggle.addEventListener("click", function () {
    var open = menu.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
    toggle.textContent = open ? "Close" : "Menu";
  });
  links.forEach(function (l) { l.addEventListener("click", closeMenu); });

  // Highlight nav link for the section on screen
  var sections = Array.prototype.map.call(links, function (l) {
    return document.querySelector(l.getAttribute("href"));
  });
  function setActive() {
    var y = window.scrollY + 120, current = null;
    sections.forEach(function (s) { if (s && s.offsetTop <= y) current = s; });
    links.forEach(function (l, i) {
      l.classList.toggle("active", !l.classList.contains("nav-cta") && sections[i] === current);
    });
  }
  window.addEventListener("scroll", setActive);
  setActive();

  // Contact form
  document.getElementById("contact-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var name = this.elements.name.value.trim();
    document.getElementById("form-msg").textContent =
      "Thank you, " + name + ". We have received your message and will reply soon.";
    this.reset();
  });

  document.getElementById("year").textContent = new Date().getFullYear();
});

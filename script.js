// Interactive layer for the portfolio. Everything here is decoration: the page
// reads fine without it, and motion is skipped for prefers-reduced-motion.
(function () {
  var root = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer: fine)').matches;

  function cssVar(name) {
    return getComputedStyle(root).getPropertyValue(name).trim();
  }

  /* ── Neural-network canvas behind the hero ─────────────────────────── */
  var canvas = document.querySelector('.net');
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext('2d');
    var nodes = [], w = 0, h = 0, dpr = 1, running = true, pointer = { x: -9999, y: -9999 };
    var colors = {};

    function readColors() {
      colors.ink = cssVar('--ink');
      colors.accent = cssVar('--accent');
    }

    function resize() {
      var rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width; h = rect.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.round(Math.min(90, Math.max(28, (w * h) / 14000)));
      nodes = [];
      for (var i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * w, y: Math.random() * h,
          vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35,
          r: Math.random() * 1.8 + 1, hot: Math.random() < .14
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      var link = Math.min(150, Math.max(90, w / 9));
      for (var i = 0; i < nodes.length; i++) {
        var a = nodes[i];
        if (!reduced) {
          // drift, with a gentle pull towards the pointer
          var dxp = pointer.x - a.x, dyp = pointer.y - a.y, dp = Math.hypot(dxp, dyp);
          if (dp < 180 && dp > 1) { a.vx += dxp / dp * .012; a.vy += dyp / dp * .012; }
          a.vx *= .992; a.vy *= .992;
          a.x += a.vx; a.y += a.vy;
          if (a.x < 0 || a.x > w) a.vx *= -1;
          if (a.y < 0 || a.y > h) a.vy *= -1;
        }
        for (var j = i + 1; j < nodes.length; j++) {
          var b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < link) {
            var near = Math.hypot(pointer.x - (a.x + b.x) / 2, pointer.y - (a.y + b.y) / 2) < 160;
            ctx.globalAlpha = (1 - d / link) * (near ? .55 : .16);
            ctx.strokeStyle = near || (a.hot && b.hot) ? colors.accent : colors.ink;
            ctx.lineWidth = near ? 1.2 : .8;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      for (var k = 0; k < nodes.length; k++) {
        var n = nodes[k];
        ctx.globalAlpha = n.hot ? .9 : .35;
        ctx.fillStyle = n.hot ? colors.accent : colors.ink;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.hot ? n.r + .8 : n.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function loop() {
      if (running) draw();
      if (!reduced) requestAnimationFrame(loop);
    }

    readColors();
    resize();
    loop();
    window.addEventListener('resize', function () { resize(); if (reduced) draw(); });
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () { readColors(); draw(); });
    canvas.parentElement.addEventListener('pointermove', function (e) {
      var r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top;
    });
    canvas.parentElement.addEventListener('pointerleave', function () { pointer.x = pointer.y = -9999; });
    // Pause when the hero is off screen
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) { running = entries[0].isIntersecting; }).observe(canvas);
    }
  }

  /* ── Name "decoding" on load ───────────────────────────────────────── */
  var glyphs = '01<>/{}[]#*+=_-ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  function scramble(el, delay) {
    var text = el.dataset.text, frame = 0, total = 26 + text.length * 2;
    setTimeout(function tick() {
      var out = '';
      for (var i = 0; i < text.length; i++) {
        out += frame > 10 + i * 2 ? text[i] : glyphs[Math.floor(Math.random() * glyphs.length)];
      }
      el.textContent = out;
      if (++frame <= total) requestAnimationFrame(tick); else el.textContent = text;
    }, delay);
  }
  if (!reduced) {
    document.querySelectorAll('.scramble').forEach(function (el, i) { scramble(el, 150 + i * 180); });
  }
  requestAnimationFrame(function () { root.classList.add('loaded'); });

  /* ── Typed line ────────────────────────────────────────────────────── */
  var typed = document.querySelector('.typed');
  if (typed && !reduced) {
    var words = typed.dataset.words.split('|'), wi = 0, ci = words[0].length, deleting = true;
    setTimeout(function step() {
      var word = words[wi];
      if (deleting) {
        ci--;
        if (ci <= 0) { deleting = false; wi = (wi + 1) % words.length; word = words[wi]; }
      } else {
        ci++;
        if (ci >= word.length) { deleting = true; typed.textContent = word; return setTimeout(step, 2200); }
      }
      typed.textContent = word.slice(0, Math.max(ci, 0));
      setTimeout(step, deleting ? 35 : 70);
    }, 2600);
  }

  /* ── Scroll reveal + counters ──────────────────────────────────────── */
  function countUp(el) {
    var to = parseInt(el.dataset.to, 10), start = performance.now(), dur = 1400;
    (function tick(now) {
      var t = Math.min(1, (now - start) / dur), eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(to * eased);
      if (t < 1) requestAnimationFrame(tick);
    })(start);
  }
  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    document.querySelectorAll('[data-reveal]').forEach(function (el) { io.observe(el); });

    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { countUp(e.target); co.unobserve(e.target); } });
    }, { threshold: .6 });
    document.querySelectorAll('.count').forEach(function (el) { el.textContent = '0'; co.observe(el); });
  } else {
    document.querySelectorAll('[data-reveal]').forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ── Timeline progress line ────────────────────────────────────────── */
  var timeline = document.querySelector('.timeline');
  if (timeline) {
    var jobs = timeline.querySelectorAll('.job');
    var ticking = false;
    function updateTimeline() {
      ticking = false;
      var r = timeline.getBoundingClientRect(), mark = window.innerHeight * .6;
      var p = Math.min(1, Math.max(0, (mark - r.top) / r.height));
      timeline.style.setProperty('--progress', reduced ? 1 : p.toFixed(3));
      jobs.forEach(function (job) {
        job.classList.toggle('is-lit', reduced || job.getBoundingClientRect().top + 26 < mark);
      });
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(updateTimeline); } }, { passive: true });
    window.addEventListener('resize', updateTimeline);
    updateTimeline();
  }

  /* ── Project cards: cursor spotlight + slight tilt ─────────────────── */
  document.querySelectorAll('.project').forEach(function (card) {
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      card.style.setProperty('--mx', x + 'px');
      card.style.setProperty('--my', y + 'px');
      if (finePointer && !reduced) {
        card.style.setProperty('--ry', ((x / r.width - .5) * 6).toFixed(2) + 'deg');
        card.style.setProperty('--rx', ((.5 - y / r.height) * 6).toFixed(2) + 'deg');
      }
    });
    card.addEventListener('pointerleave', function () {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });

  /* ── Project filters ───────────────────────────────────────────────── */
  var chips = document.querySelectorAll('.chip');
  var projects = document.querySelectorAll('.project');
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var filter = chip.dataset.filter;
      chips.forEach(function (c) {
        var on = c === chip;
        c.classList.toggle('is-on', on);
        c.setAttribute('aria-pressed', String(on));
      });
      projects.forEach(function (p) {
        p.hidden = filter !== 'all' && p.dataset.tags.split(' ').indexOf(filter) === -1;
        if (!p.hidden) p.classList.add('is-in');
      });
    });
  });

  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();

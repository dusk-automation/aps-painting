/* A.P.S Adam's Painting Solutions: design preview by Dusk.
   Visuals only. Nothing on this site sends data anywhere. */
(function () {
  'use strict';
  window.__aps = 1;
  var d = document, root = d.documentElement;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function store(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) { return null; } }
  function drop(el) { if (el && el.parentNode) el.parentNode.removeChild(el); }
  function ready() { root.classList.add('ready'); }

  /* ---------- intro ---------- */
  var intro = $('#intro');
  if (intro && root.classList.contains('has-intro')) {
    var over = false;
    var endIntro = function () {
      if (over) return; over = true;
      root.classList.remove('intro-lock');
      ready();
      drop(intro);
    };
    var skip = $('.intro-skip', intro);
    if (skip) skip.addEventListener('click', endIntro);
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape') endIntro(); });
    setTimeout(ready, 2150);                                              // the page comes alive as the rollers lift
    setTimeout(function () { root.classList.remove('intro-lock'); }, 2700);
    setTimeout(endIntro, 3450);
  } else {
    drop(intro);
    root.classList.remove('intro-lock');
    setTimeout(ready, root.classList.contains('wipe-in') ? 300 : 60);
  }
  setTimeout(function () { root.classList.remove('wipe-in'); }, 1100);

  /* ---------- mobile menu ---------- */
  var burger = $('.burger'), menu = $('#menu');
  function setMenu(open) {
    root.classList.toggle('menu-open', open);
    if (burger) { burger.setAttribute('aria-expanded', open ? 'true' : 'false'); burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); }
    if (menu) { if (open) menu.removeAttribute('inert'); else menu.setAttribute('inert', ''); }
  }
  if (burger && menu) {
    setMenu(false);
    burger.addEventListener('click', function () { setMenu(!root.classList.contains('menu-open')); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && root.classList.contains('menu-open')) { setMenu(false); burger.focus(); } });
    window.addEventListener('resize', function () { if (window.innerWidth >= 920) setMenu(false); });
  }

  /* ---------- moving between pages: three coats wipe across ---------- */
  d.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href]') : null;
    if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var href = a.getAttribute('href');
    if (!href || href.charAt(0) === '#' || a.target === '_blank' || a.hasAttribute('download')) return;
    if (/^(tel:|mailto:|sms:)/i.test(href)) return;
    var url; try { url = new URL(a.href, location.href); } catch (err) { return; }
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname && url.search === location.search && url.hash) { setMenu(false); return; }
    store('aps-nav', '1'); // tells the next page this was a move inside the site, so no intro
    if (reduce) return;
    e.preventDefault();
    root.classList.add('wipe-out');
    setTimeout(function () { location.href = a.href; }, 500);
  });
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) { root.classList.remove('wipe-out', 'wipe-in', 'menu-open'); ready(); }
  });

  /* ---------- header + sticky bar ---------- */
  var hdr = $('.hdr'), bar = $('.bar');
  var onScroll = function () {
    var y = window.pageYOffset || 0;
    if (hdr) hdr.classList.toggle('is-scrolled', y > 8);
    if (bar) bar.classList.toggle('is-on', y > 260 && !bar.dataset.hide);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (bar) {
    root.classList.add('has-bar');
    // keep the bar out of the way while someone is typing
    d.addEventListener('focusin', function (e) { if (e.target.matches && e.target.matches('input,select,textarea')) { bar.dataset.hide = '1'; onScroll(); } });
    d.addEventListener('focusout', function () { delete bar.dataset.hide; onScroll(); });
  }

  /* ---------- reveal on scroll ---------- */
  var revealEls = $$('[data-r]');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- hero: photographs that wipe across, one at a time ---------- */
  var clamp = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
  var hero = $('.hero');
  $$('[data-show]').forEach(function (show) {
    var slides = $$('.show-slide', show), marks = $$('.show-bar i', show), at = 0, timer = null, visible = true;
    if (slides.length < 2 || reduce) return;
    var go = function () {
      var prev = slides[at];
      at = (at + 1) % slides.length;
      slides.forEach(function (sl) { sl.classList.remove('is-prev'); });
      prev.classList.remove('is-on'); prev.classList.add('is-prev');
      slides[at].classList.add('is-on');
      show.classList.remove('is-wiping'); void show.offsetWidth; show.classList.add('is-wiping');
      marks.forEach(function (mk, k) { mk.classList.toggle('is-done', k < at); mk.classList.toggle('is-on', k === at); });
      setTimeout(function () { prev.classList.remove('is-prev'); }, 1300);
    };
    var start = function () { if (!timer && visible) timer = setInterval(go, 5600); };
    var stop = function () { clearInterval(timer); timer = null; };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; show.classList.toggle('is-paused', !visible); if (visible) start(); else stop(); }, { threshold: 0.2 }).observe(show);
    }
    d.addEventListener('visibilitychange', function () { if (d.hidden) stop(); else start(); });
    setTimeout(start, root.classList.contains('has-intro') ? 2400 : 400);
  });

  /* ---------- the scroll story: four steps, four site photos ---------- */
  var story = $('.story'), track = $('.story-track'), stage = $('.story-stage'), storyTick = null;
  if (story && track && stage && !reduce && window.CSS && CSS.supports && CSS.supports('position', 'sticky')) {
    root.classList.add('story-on');
    var shots = $$('.sc-shot', story), slis = $$('.story-steps .step', story), sbars = $$('.story-bars i', story);
    var edge = $('.sc-edge', story), count = $('.sc-count b', story), lastStep = -1, stageTop = 0;
    $$('img', story).forEach(function (im) { im.loading = 'eager'; });
    var setStory = function (p) {
      var n = shots.length, seg = p * n, idx = Math.min(n - 1, Math.floor(seg));
      shots.forEach(function (sh, k) {
        // each photo wipes in over the first part of its step, then settles while the step is read
        sh.style.setProperty('--w', (k === 0 || p >= 1 ? 1 : clamp((seg - k) / 0.45)).toFixed(3));
        sh.style.setProperty('--z', clamp(seg - k).toFixed(3));
      });
      var w = idx > 0 ? clamp((seg - idx) / 0.45) : 0;
      if (edge) { edge.style.setProperty('--e', w.toFixed(3)); edge.style.setProperty('--eo', w > 0.004 && w < 0.996 ? 1 : 0); }
      sbars.forEach(function (bar, k) { bar.style.setProperty('--f', clamp(seg - k).toFixed(3)); });
      if (idx !== lastStep) {
        lastStep = idx;
        slis.forEach(function (li, k) { li.classList.toggle('is-on', k === idx); li.classList.toggle('is-past', k < idx); });
        if (count) count.textContent = '0' + (idx + 1);
      }
    };
    var measureStory = function () { stageTop = parseFloat(getComputedStyle(stage).top) || 0; };
    storyTick = function () {
      var r = track.getBoundingClientRect(), dist = track.offsetHeight - stage.offsetHeight;
      setStory(dist > 0 ? clamp((stageTop - r.top) / dist) : 0);
    };
    measureStory();
    window.addEventListener('resize', function () { measureStory(); storyTick(); });
    window.addEventListener('load', function () { measureStory(); storyTick(); });
  }

  /* ---------- things that follow the scroll ---------- */
  var ticking = false;
  var onFrame = function () {
    ticking = false;
    if (hero && !reduce) {
      var hr = hero.getBoundingClientRect();
      if (hr.bottom > 0) hero.style.setProperty('--hs', clamp(-hr.top / hr.height).toFixed(3));
    }
    if (storyTick) storyTick();
  };
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onFrame); } }, { passive: true });
  onFrame();

  /* ---------- numbers that count up once, and sections that mark themselves seen ---------- */
  if ('IntersectionObserver' in window && !reduce) {
    $$('[data-count]').forEach(function (el) {
      var end = parseFloat(el.dataset.count), dec = (el.dataset.count.split('.')[1] || '').length;
      el.textContent = (0).toFixed(dec);
      var io2 = new IntersectionObserver(function (en) {
        if (!en[0].isIntersecting) return;
        io2.disconnect();
        var t0 = null, dur = 1300;
        var stepUp = function (t) {
          if (t0 === null) t0 = t;
          var k = clamp((t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
          el.textContent = (end * e).toFixed(dec);
          if (k < 1) requestAnimationFrame(stepUp); else el.textContent = el.dataset.count;
        };
        requestAnimationFrame(stepUp);
      }, { threshold: 0.6 });
      io2.observe(el);
    });
    $$('.cta').forEach(function (el) {
      var io3 = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { el.classList.add('is-seen'); io3.disconnect(); } }, { threshold: 0.25 });
      io3.observe(el);
    });
  }

  /* ---------- before / after, rolled on ---------- */
  $$('[data-ba]').forEach(function (ba) {
    var btns = $$('.ba-btn', ba), tag = $('.ba-tag', ba), timer;
    var labels = { before: ba.dataset.a || 'Before', after: ba.dataset.b || 'After' };
    function show(which) {
      var after = which === 'after';
      if (ba.classList.contains('is-after') === after) return;
      ba.classList.add('is-rolling');
      ba.classList.toggle('is-after', after);
      clearTimeout(timer);
      timer = setTimeout(function () { ba.classList.remove('is-rolling'); }, reduce ? 0 : 980);
      setTimeout(function () { if (tag) tag.textContent = labels[which]; }, reduce ? 0 : 420);
      btns.forEach(function (b) { var on = b.dataset.show === which; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    }
    btns.forEach(function (b) { b.addEventListener('click', function () { ba.dataset.touched = '1'; show(b.dataset.show); }); });
    var stage = $('.ba-stage', ba);
    if (stage) stage.addEventListener('click', function () { ba.dataset.touched = '1'; show(ba.classList.contains('is-after') ? 'before' : 'after'); });
    // fetch both pictures a little before the pair scrolls into view
    if ('IntersectionObserver' in window) {
      var near = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { near.disconnect(); $$('img', ba).forEach(function (im) { im.loading = 'eager'; }); }
      }, { rootMargin: '900px 0px' });
      near.observe(ba);
    } else $$('img', ba).forEach(function (im) { im.loading = 'eager'; });
    // roll the "after" on by itself the first time it is properly in view
    if ('IntersectionObserver' in window && !reduce) {
      var seen = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { seen.disconnect(); setTimeout(function () { if (!ba.dataset.touched) show('after'); }, 700); }
      }, { threshold: 0.6 });
      seen.observe(ba);
    }
  });

  /* ---------- colour: a swatch shown across a wall panel ---------- */
  $$('[data-viz]').forEach(function (viz) {
    var face = $('.board-face', viz), coat = $('.board-coat', viz), name = $('.board-name', viz);
    var chips = $$('.viz-chip', viz), busy = false, queued = null;
    if (!face || !coat) return;
    // dark lettering on light colours, light lettering on dark ones
    var ink = function (hex) {
      var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b2 = n & 255;
      return (0.299 * r + 0.587 * g + 0.114 * b2) > 150 ? '#0c0c0d' : '#f5efe3';
    };
    function paint(chip) {
      if (busy) { queued = chip; return; }
      var c = chip.dataset.c;
      chips.forEach(function (x) { var on = x === chip; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      var finish = function () { face.style.setProperty('--c', c); face.style.setProperty('--tc', ink(c)); if (name) name.textContent = chip.dataset.n; };
      if (reduce) { finish(); return; }
      busy = true;
      coat.style.setProperty('--n', c);
      coat.classList.add('go');
      setTimeout(function () { face.style.setProperty('--tc', ink(c)); if (name) name.textContent = chip.dataset.n; }, 420);
      setTimeout(function () {
        finish();
        coat.classList.remove('go');
        busy = false;
        if (queued && queued !== chip) { var q = queued; queued = null; paint(q); } else queued = null;
      }, 940);
    }
    chips.forEach(function (chip) { chip.addEventListener('click', function () { paint(chip); }); });
  });

  /* ---------- gallery: filter + lightbox ---------- */
  var gal = $('[data-gal]');
  if (gal) {
    var items = $$('.gal-item', gal), filters = $$('.filter');
    filters.forEach(function (f) {
      f.addEventListener('click', function () {
        var cat = f.dataset.cat;
        filters.forEach(function (x) { var on = x === f; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', on ? 'true' : 'false'); });
        items.forEach(function (it) { it.hidden = !(cat === 'all' || (it.dataset.cat || '').split(' ').indexOf(cat) > -1); });
      });
    });
    var lb = $('#lb');
    if (lb) {
      var lbImg = $('img', lb), lbCap = $('.lb-cap', lb), lbCount = $('.lb-count', lb), cur = 0, list = [], opener = null;
      var render = function () {
        var it = list[cur], im = $('img', it);
        lbImg.src = im.getAttribute('src'); lbImg.alt = im.alt;
        lbCap.textContent = $('span', it).textContent;
        lbCount.textContent = (cur + 1) + ' / ' + list.length;
      };
      var openLb = function (it) {
        list = items.filter(function (x) { return !x.hidden; });
        cur = Math.max(0, list.indexOf(it)); opener = it; render();
        lb.classList.add('is-open'); lb.removeAttribute('inert'); root.style.overflow = 'hidden';
        $('.lb-close', lb).focus();
      };
      var closeLb = function () { lb.classList.remove('is-open'); lb.setAttribute('inert', ''); root.style.overflow = ''; if (opener) opener.focus(); };
      var step = function (n) { cur = (cur + n + list.length) % list.length; render(); };
      lb.setAttribute('inert', '');
      items.forEach(function (it) { it.addEventListener('click', function () { openLb(it); }); });
      $('.lb-close', lb).addEventListener('click', closeLb);
      $('.lb-prev', lb).addEventListener('click', function () { step(-1); });
      $('.lb-next', lb).addEventListener('click', function () { step(1); });
      lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('lb-stage')) closeLb(); });
      d.addEventListener('keydown', function (e) {
        if (!lb.classList.contains('is-open')) return;
        if (e.key === 'Escape') closeLb(); else if (e.key === 'ArrowLeft') step(-1); else if (e.key === 'ArrowRight') step(1);
      });
      var x0 = null;
      lb.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
      lb.addEventListener('touchend', function (e) {
        if (x0 === null) return;
        var dx = e.changedTouches[0].clientX - x0; x0 = null;
        if (Math.abs(dx) > 44) step(dx < 0 ? 1 : -1);
      }, { passive: true });
    }
  }

  /* ---------- today's hours ---------- */
  $$('.hours [data-day]').forEach(function (row) { if (+row.dataset.day === new Date().getDay()) row.classList.add('is-today'); });

  /* ---------- quote form: three steps, nothing is sent ---------- */
  var form = $('[data-quote]');
  if (form) {
    var steps = $$('.q-step', form), qbar = $('.q-bar', form), qlabels = $$('.q-labels li', form), at = 0;
    var go = function (n, focus) {
      at = n;
      steps.forEach(function (s, i) { s.classList.toggle('is-on', i === n); });
      qlabels.forEach(function (l, i) { l.classList.toggle('is-on', i <= n); });
      if (qbar) { var cut = 'inset(0 ' + (100 - ((n + 1) / steps.length) * 100).toFixed(2) + '% 0 0)'; qbar.style.clipPath = cut; qbar.style.webkitClipPath = cut; }
      if (focus) {
        var lg = $('legend', steps[n]); if (lg) { lg.setAttribute('tabindex', '-1'); lg.focus({ preventScroll: true }); }
        var top = form.getBoundingClientRect().top + window.pageYOffset - (hdr ? hdr.offsetHeight : 0) - 14;
        if (Math.abs(window.pageYOffset - top) > 40) window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
      }
    };
    var fail = function (field, msg) {
      var wrap = field.closest('.q-field'), err = wrap && $('.q-err', wrap);
      if (wrap) wrap.classList.add('is-bad');
      if (err) { err.textContent = msg; err.hidden = false; }
      field.setAttribute('aria-invalid', 'true');
      return false;
    };
    var clear = function (field) {
      var wrap = field.closest('.q-field'), err = wrap && $('.q-err', wrap);
      if (wrap) wrap.classList.remove('is-bad');
      if (err) err.hidden = true;
      field.removeAttribute('aria-invalid');
    };
    var check = function (n) {
      var s = steps[n], ok = true, first = null;
      if (n === 0) {
        var any = $$('input[name="job"]:checked', s).length > 0, e0 = $('.q-err', s);
        if (e0) e0.hidden = any;
        if (!any) { ok = false; first = $('input[name="job"]', s); }
      }
      $$('[required]', s).forEach(function (f) {
        clear(f);
        var v = (f.value || '').trim(), good = true;
        if (!v) good = fail(f, f.dataset.msg || 'Please fill this in.');
        else if (f.type === 'tel' && v.replace(/\D/g, '').length < 8) good = fail(f, 'That number looks too short. Include the area code for a landline.');
        if (!good) { ok = false; first = first || f; }
      });
      $$('input[type="email"]', s).forEach(function (f) {
        var v = (f.value || '').trim();
        if (v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { fail(f, 'Check the email address, something is missing.'); ok = false; first = first || f; }
      });
      if (first) first.focus();
      return ok;
    };
    form.addEventListener('input', function (e) { if (e.target.closest('.q-field')) clear(e.target); if (e.target.name === 'job') { var e0 = $('.q-step .q-err', form); if (e0) e0.hidden = true; } });
    $$('[data-next]', form).forEach(function (b) { b.addEventListener('click', function () { if (check(at)) go(at + 1, true); }); });
    $$('[data-back]', form).forEach(function (b) { b.addEventListener('click', function () { go(at - 1, true); }); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!check(at)) return;
      var nm = ((form.elements.name && form.elements.name.value) || '').trim().split(/\s+/)[0];
      var who = $('.q-who', form); if (who) who.textContent = nm ? ', ' + nm : '';
      form.classList.add('is-done');
      var h = $('.q-done .h3', form); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    });
    var again = $('[data-again]', form);
    if (again) again.addEventListener('click', function () { form.reset(); form.classList.remove('is-done'); go(0, true); });
    // arriving from a service page: tick that job for them
    try {
      var want = new URLSearchParams(location.search).get('job');
      if (want) $$('input[name="job"]', form).forEach(function (i) { if (i.value.toLowerCase() === want.toLowerCase()) i.checked = true; });
    } catch (err) {}
    go(0, false);
  }
})();

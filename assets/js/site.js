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

  /* ---------- hero video: play when seen, rest when not ---------- */
  $$('video[data-auto]').forEach(function (v) {
    v.muted = true;
    var play = function () { var p = v.play(); if (p && p.catch) p.catch(function () {}); };
    if (reduce) { v.removeAttribute('autoplay'); v.pause(); return; }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { if (en[0].isIntersecting) play(); else v.pause(); }, { threshold: 0.15 }).observe(v);
    } else play();
  });

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

  /* ---------- colour visualiser ---------- */
  $$('[data-viz]').forEach(function (viz) {
    var wall = $('.viz-wall', viz), coat = $('.viz-coat', viz), label = $('.viz-label', viz), name = $('.viz-label b', viz);
    var chips = $$('.viz-chip', viz), busy = false, queued = null;
    if (!wall || !coat) return;
    function paint(chip) {
      if (busy) { queued = chip; return; }
      var c = chip.dataset.c;
      chips.forEach(function (x) { var on = x === chip; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      if (name) name.textContent = chip.dataset.n;
      if (label) label.style.setProperty('--c', c);
      if (reduce) { wall.setAttribute('fill', c); return; }
      busy = true;
      $$('rect', coat).forEach(function (r) { r.setAttribute('fill', c); });
      coat.classList.add('go');
      setTimeout(function () {
        wall.setAttribute('fill', c);
        coat.classList.add('reset'); coat.classList.remove('go');
        void coat.getBoundingClientRect();
        coat.classList.remove('reset');
        busy = false;
        if (queued && queued !== chip) { var q = queued; queued = null; paint(q); } else queued = null;
      }, 860);
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

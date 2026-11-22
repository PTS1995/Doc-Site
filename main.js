// Κίνηση και διαδραστικότητα της ιστοσελίδας
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');

  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // --- Κεφαλίδα: διάφανη στην κορυφή, λευκή μετά την κύλιση ή με ανοιχτό μενού
  function updateHeader() {
    if (!header) return;
    var menuOpen = nav && nav.classList.contains('is-open');
    header.classList.toggle('is-solid', window.scrollY > 24 || menuOpen);
  }

  // --- Μενού για κινητά
  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    updateHeader();
  }
  if (toggle && nav) {
    toggle.addEventListener('click', function () { setMenu(!nav.classList.contains('is-open')); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); toggle.focus(); }
    });
  }

  // --- Τίτλοι που εμφανίζονται λέξη-λέξη
  document.querySelectorAll('[data-split]').forEach(function (el) {
    if (!reduce) {
      var text = el.textContent.trim();
      var words = text.split(/\s+/);
      el.innerHTML = '<span class="sr-only">' + esc(text) + '</span>' + words.map(function (w, i) {
        return '<span class="w" aria-hidden="true"><span style="--i:' + i + '">' + esc(w) + '</span></span>';
      }).join(' ');
    }
    el.classList.add('is-split');
  });

  // --- Εμφάνιση στοιχείων όταν μπαίνουν στην οθόνη
  var revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // --- Απόφθεγμα: οι λέξεις «ανάβουν» καθώς κάνετε κύλιση
  var quote = document.querySelector('[data-words]');
  var qWords = [];
  if (quote && !reduce) {
    var qText = quote.textContent.trim();
    quote.innerHTML = '<span class="sr-only">' + esc(qText) + '</span>' + qText.split(/\s+/).map(function (w) {
      return '<span class="qw" aria-hidden="true">' + esc(w) + '</span>';
    }).join(' ');
    qWords = quote.querySelectorAll('.qw');
    quote.classList.add('is-armed');
  }
  function updateQuote() {
    if (!qWords.length) return;
    var r = quote.getBoundingClientRect();
    var vh = window.innerHeight;
    var p = (vh * 0.82 - r.top) / (r.height + vh * 0.3);
    p = Math.max(0, Math.min(1, p));
    var n = Math.round(p * qWords.length);
    for (var i = 0; i < qWords.length; i++) qWords[i].classList.toggle('on', i < n);
  }

  // --- Ελαφρύ parallax στη φωτογραφία της αρχικής (μόνο σε μεγάλες οθόνες)
  var par = document.querySelector('[data-parallax]');
  function updateParallax() {
    if (!par || reduce) return;
    if (window.innerWidth < 1024) { par.style.transform = ''; return; }
    var y = Math.min(window.scrollY, 1000);
    par.style.transform = 'translate3d(0,' + (y * -0.08).toFixed(1) + 'px,0)';
  }

  // --- Φωτεινό σημείο που ακολουθεί τον κέρσορα στις κάρτες
  document.querySelectorAll('[data-spotlight]').forEach(function (card) {
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  // --- «Σε αυτή τη σελίδα»: επισήμανση της ενότητας που διαβάζετε
  var tocLinks = document.querySelectorAll('.toc a[href^="#"]');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var byId = {};
    tocLinks.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        tocLinks.forEach(function (a) { a.classList.remove('is-active'); });
        if (byId[en.target.id]) byId[en.target.id].classList.add('is-active');
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    Object.keys(byId).forEach(function (id) {
      var t = document.getElementById(id);
      if (t) spy.observe(t);
    });
  }

  // --- Βίντεο φόντου: σταματά για όσους προτιμούν λιγότερη κίνηση
  if (reduce) document.querySelectorAll('.hero-video').forEach(function (v) { v.pause(); });

  // --- Ένας κοινός βρόχος κύλισης
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      updateHeader(); updateQuote(); updateParallax();
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  updateHeader(); updateQuote(); updateParallax();

  // --- Τρέχον έτος στο υποσέλιδο
  var year = String(new Date().getFullYear());
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = year; });
})();

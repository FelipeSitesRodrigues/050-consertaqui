/* Consertaqui Suzano */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- WhatsApp: monta o link com a mensagem já preenchida --------- */
  var WA = 'https://wa.me/5511940119097';
  document.querySelectorAll('[data-wa]').forEach(function (el) {
    el.href = WA + '?text=' + encodeURIComponent(el.getAttribute('data-wa'));
  });

  /* ---- conversao do Google Ads ------------------------------------
     Um listener na captura pega os ~40 botoes de WhatsApp e o telefone
     de uma vez. transport_type beacon e o que importa aqui: o clique
     leva a pessoa pra fora do site, e sem beacon a requisicao morre no
     meio da navegacao e a conversao se perde. */
  var CONV_WA  = 'AW-17736470012/TCfACPy17u0cEPybtIlC';
  var CONV_TEL = 'AW-17736470012/YUqtCP-17u0cEPybtIlC';

  document.addEventListener('click', function (ev) {
    var a = ev.target.closest && ev.target.closest('a');
    if (!a || typeof window.gtag !== 'function') return;

    var alvo = null;
    if (a.hasAttribute('data-wa') || a.href.indexOf('wa.me/') !== -1) alvo = CONV_WA;
    else if (a.protocol === 'tel:') alvo = CONV_TEL;
    if (!alvo) return;

    window.gtag('event', 'conversion', {
      send_to: alvo,
      transport_type: 'beacon'
    });
  }, true);

  /* ---- header sticky ---------------------------------------------- */
  var head = document.getElementById('head');
  var waFloat = document.getElementById('waFloat');
  var toTop = document.getElementById('toTop');

  function onScroll() {
    var y = window.scrollY;
    head.classList.toggle('is-stuck', y > 12);
    waFloat.classList.toggle('is-on', y > 380);
    toTop.classList.toggle('is-on', y > 900);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  });

  /* ---- menu mobile ------------------------------------------------- */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('menu');

  function setMenu(open) {
    head.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  }
  burger.addEventListener('click', function () {
    setMenu(!head.classList.contains('is-open'));
  });
  menu.addEventListener('click', function (e) {
    if (e.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
  });

  /* ---- reveal on scroll -------------------------------------------- */
  var rv = document.querySelectorAll('[data-rv]');
  if (reduce || !('IntersectionObserver' in window)) {
    rv.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-in');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    rv.forEach(function (el) { io.observe(el); });
  }

  /* ---- FAQ --------------------------------------------------------- */
  document.querySelectorAll('.faq__item').forEach(function (item) {
    var btn = item.querySelector('.faq__q');
    var panel = item.querySelector('.faq__a');
    var inner = panel.firstElementChild;

    btn.addEventListener('click', function () {
      var open = item.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(open));
      panel.style.height = open ? inner.offsetHeight + 'px' : '0px';
    });

    panel.addEventListener('transitionend', function (e) {
      if (e.propertyName === 'height' && item.classList.contains('is-open')) {
        panel.style.height = 'auto';
      }
    });

    window.addEventListener('resize', function () {
      if (item.classList.contains('is-open')) panel.style.height = 'auto';
    });
  });

  var faqMore = document.getElementById('faqMore');
  if (faqMore) {
    faqMore.addEventListener('click', function () {
      var faq = faqMore.closest('.faq');
      var full = faq.classList.toggle('is-full');
      faqMore.textContent = full ? 'Ver menos perguntas' : 'Ver todas as perguntas';
    });
  }

  /* ---- dots do carrossel de depoimentos (mobile) ------------------- */
  var grid = document.getElementById('depGrid');
  var dots = document.getElementById('depDots');

  if (grid && dots) {
    var cards = Array.prototype.slice.call(grid.children);

    function buildDots() {
      var scrollable = grid.scrollWidth > grid.clientWidth + 4;
      dots.style.display = scrollable ? 'flex' : 'none';
      if (!scrollable || dots.children.length === cards.length) return;
      dots.innerHTML = '';
      cards.forEach(function (card, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', 'Avaliação ' + (i + 1));
        b.addEventListener('click', function () {
          grid.scrollTo({ left: card.offsetLeft - grid.offsetLeft, behavior: reduce ? 'auto' : 'smooth' });
        });
        dots.appendChild(b);
      });
      syncDots();
    }

    function syncDots() {
      if (dots.style.display === 'none') return;
      var left = grid.scrollLeft;
      var best = 0, bestD = Infinity;
      cards.forEach(function (card, i) {
        var d = Math.abs(card.offsetLeft - grid.offsetLeft - left);
        if (d < bestD) { bestD = d; best = i; }
      });
      Array.prototype.forEach.call(dots.children, function (b, i) {
        b.classList.toggle('is-on', i === best);
      });
    }

    grid.addEventListener('scroll', syncDots, { passive: true });
    window.addEventListener('resize', buildDots);
    buildDots();
  }
})();

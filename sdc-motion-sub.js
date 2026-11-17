/* sdc-motion-sub.js — the same subtle card motion as on www, for the subdomain sites (loaded by sdc-nav-sub.js).
   Cards fade up once as they enter the screen; mouse devices get a 3 px lift on hover. Nothing moves when the visitor
   prefers reduced motion. Hidden state only exists once this script has run; if anything is missing the cards stay visible.
   Skips elements a site already animates itself (.reveal, .rv) and anything inside a sliding rail. Test switch: ?motion=off */
(function () {
  if (window.__sdcMotionSub) return; window.__sdcMotionSub = true;
  try {
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!('IntersectionObserver' in window)) return;
    if (window.self !== window.top) return;
    if (/[?&]motion=off/.test(location.search)) return;
    var T = '.stu-card,.infra-card,.up-item,a.row,.flow-step';
    var H = '.stu-card,.infra-card,.up-item';
    function inRail(e) { var a = e.parentElement; while (a && a !== document.body) { var o = getComputedStyle(a).overflowX; if ((o === 'auto' || o === 'scroll' || o === 'hidden') && a.scrollWidth > a.clientWidth + 2) return true; a = a.parentElement } return false }
    function go() {
      var els = [].slice.call(document.querySelectorAll(T)).filter(function (e) { return !e.classList.contains('sdc-ms-t') && !e.closest('.reveal,.rv') && !inRail(e) });
      if (!els.length) return;
      var st = document.createElement('style');
      st.textContent = '@media (prefers-reduced-motion: no-preference){html.sdc-ms .sdc-ms-t{opacity:0;transform:translateY(36px);transition:opacity .8s cubic-bezier(.16,1,.3,1) var(--sdc-d,0ms),transform .9s cubic-bezier(.16,1,.3,1) var(--sdc-d,0ms)}html.sdc-ms .sdc-ms-t.sdc-ms-in{opacity:1;transform:none}html.sdc-ms .sdc-ms-t.sdc-ms-done{transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease}}@media (prefers-reduced-motion: no-preference) and (hover:hover) and (pointer:fine){html.sdc-ms .sdc-ms-h.sdc-ms-done:hover{transform:translateY(-3px);box-shadow:0 12px 24px -16px rgba(0,0,0,.38)}}';
      document.head.appendChild(st);
      document.documentElement.classList.add('sdc-ms');
      var fired = false;
      var io = new IntersectionObserver(function (es) {
        fired = true; var n = 0;
        es.forEach(function (x) {
          if (!x.isIntersecting) return; var el = x.target; io.unobserve(el);
          el.style.setProperty('--sdc-d', Math.min(n++, 5) * 110 + 'ms');
          el.classList.add('sdc-ms-in');
          setTimeout(function () { el.classList.add('sdc-ms-done'); el.style.removeProperty('--sdc-d') }, 1400);
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
      els.forEach(function (e) { e.classList.add('sdc-ms-t'); if (e.matches(H)) e.classList.add('sdc-ms-h'); io.observe(e) });
      function showAll() { els.forEach(function (e) { e.classList.add('sdc-ms-in', 'sdc-ms-done') }) }
      window.addEventListener('beforeprint', showAll);
      setTimeout(function () { if (!fired) showAll() }, 3000);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
  } catch (err) { /* motion is optional: never break the page */ }
})();

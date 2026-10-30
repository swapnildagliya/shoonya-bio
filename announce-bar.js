/* ─────────────────────────────────────────────────────────────────────────
   announce-bar.js — the dated announcement bar for three sites.

   WHY THIS EXISTS
   Squarespace's own announcement bar is typed by hand and nothing ever
   expires it. "Proefweek 14–19 sep" and "Opendeurdag 13 sep" both stayed up
   days after the date, and in Oct 2026 "Je kan nog instappen" outlived the
   close of registration. This bar reads announcements.json and picks today's
   message itself, so a message switches on and off on its own dates.

   USE — one tag per page, brand in data-brand (shoonya | abc | swapnil):

     <script src="https://links.shoonyadance.com/announce-bar.js"
             data-brand="abc" defer></script>

   Optional data-feed="<url>" points at another announcements.json (local
   preview / QA). No live message, a failed fetch, or a bad file = no bar,
   never a broken page.

   FIXED HEADERS — the bar sits in the page flow at the very top and scrolls
   away. A header that is position:fixed/sticky at top:0 would cover it, so
   name it in data-push=".site-header": while the bar is on screen the header
   sits just below it, and slides back to top:0 once the bar has scrolled off.

   LANGUAGE — picks text.nl when <html lang> starts with "nl", else text.en,
   and re-renders when Weglot switches the lang attribute. The bar is marked
   data-wg-notranslate so Weglot does not translate (and bill) it again.
   ───────────────────────────────────────────────────────────────────────── */
(function () {
  var me = document.currentScript;
  if (!me) return;
  var brand = me.getAttribute('data-brand');
  var feed = me.getAttribute('data-feed') || 'https://links.shoonyadance.com/announcements.json';
  var pushSel = me.getAttribute('data-push');
  if (!brand) return;

  // Each site's own look: Shoonya mirrors the native Squarespace bar it
  // replaces; ABC sits on its marigold; Swapnil on black (D-125).
  var LOOK = {
    shoonya: { bg: '#000000', fg: '#FFFFFF' },
    abc:     { bg: '#FBC70F', fg: '#000000' },
    swapnil: { bg: '#000000', fg: '#FFFFFF' }
  };
  var look = LOOK[brand] || LOOK.shoonya;

  // Today in Ghent, as YYYY-MM-DD — en-CA formats dates that way.
  var today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Brussels', year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(new Date());

  function pick(list) {
    var live = (list || []).filter(function (m) {
      return m && m.approved === true && m.text &&
        (!m.from || m.from <= today) && (!m.until || today <= m.until);
    });
    live.sort(function (a, b) { return (a.priority || 9) - (b.priority || 9); });
    return live[0] || null;
  }

  var DISMISS_KEY = 'announce-bar-dismissed';
  function dismissed(id) {
    try { return sessionStorage.getItem(DISMISS_KEY) === brand + ':' + id; } catch (e) { return false; }
  }

  function textFor(msg) {
    var nl = /^nl/i.test(document.documentElement.lang || '');
    return (nl ? msg.text.nl : msg.text.en) || msg.text.en || msg.text.nl || '';
  }

  function paint(msg) {
    var css = document.createElement('style');
    css.textContent =
      '.announce-bar{position:relative;z-index:2;display:block;background:' + look.bg + ';color:' + look.fg + ';' +
      // Squarespace sets its font per element, not on <body>: use its token.
      'font:inherit;font-family:var(--body-font-font-family,inherit);font-size:16px;line-height:1.4;text-align:center;padding:14px 48px;margin:0}' +
      '.announce-bar a{color:inherit;text-decoration:none}' +
      '.announce-bar a:hover,.announce-bar a:focus-visible{text-decoration:underline;text-underline-offset:3px}' +
      '.announce-bar button{position:absolute;right:8px;top:50%;transform:translateY(-50%);width:36px;height:36px;' +
      'border:0;background:none;color:inherit;font:inherit;font-size:20px;line-height:1;cursor:pointer;opacity:.8}' +
      '.announce-bar button:hover{opacity:1}' +
      '@media (max-width:600px){.announce-bar{font-size:15px;padding:12px 44px}}';
    document.head.appendChild(css);

    var bar = document.createElement('div');
    bar.className = 'announce-bar';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Announcement');
    bar.setAttribute('data-wg-notranslate', '');
    bar.setAttribute('data-announce-id', msg.id || '');

    var label = document.createElement(msg.link ? 'a' : 'span');
    if (msg.link) label.href = msg.link;
    label.textContent = textFor(msg);
    bar.appendChild(label);

    var close = document.createElement('button');
    close.type = 'button';
    close.setAttribute('aria-label', 'Close announcement');
    close.textContent = '×';
    bar.appendChild(close);

    document.body.insertBefore(bar, document.body.firstChild);

    // Keep an overlaid header below the bar. fixed/sticky: follow the bar
    // until it scrolls off. absolute (Squarespace over a hero): shift by the
    // overlap once. Position is re-read each time — some headers switch to
    // fixed on scroll.
    var header = pushSel && document.querySelector(pushSel);
    function place() {
      if (!header) return;
      header.style.top = '';
      if (!bar.isConnected) return;
      var cs = getComputedStyle(header);
      if (cs.position === 'fixed' || cs.position === 'sticky') {
        var gap = Math.max(0, bar.getBoundingClientRect().bottom);
        if (gap) header.style.top = gap + 'px';
      } else if (cs.position === 'absolute') {
        var overlap = bar.getBoundingClientRect().bottom - header.getBoundingClientRect().top;
        if (overlap > 0) header.style.top = ((parseFloat(cs.top) || 0) + overlap) + 'px';
      }
    }
    if (header) {
      place();
      window.addEventListener('scroll', place, { passive: true });
      window.addEventListener('resize', place);
    }

    close.addEventListener('click', function () {
      try { sessionStorage.setItem(DISMISS_KEY, brand + ':' + msg.id); } catch (e) {}
      bar.remove();
      place();
    });

    new MutationObserver(function () { label.textContent = textFor(msg); })
      .observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  }

  fetch(feed, { cache: 'no-cache' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (data) {
      var msg = data && pick(data[brand]);
      if (!msg || dismissed(msg.id)) return;
      if (document.body) paint(msg);
      else document.addEventListener('DOMContentLoaded', function () { paint(msg); });
    })
    .catch(function () { /* no bar beats a broken page */ });
})();

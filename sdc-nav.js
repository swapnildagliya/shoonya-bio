/* ─────────────────────────────────────────────────────────────────────────
   sdc-nav.js — new menu for www.shoonyadance.com, as a LAYER on top of the
   native Squarespace menu. PREVIEW build (15 Nov 2026), not live.

   SAFETY MODEL
   - The native menu stays in the served HTML and keeps working. This script
     reads its real links, builds the new menu from them, and only as the very
     last step adds class "sdc-nav-on" to <html>, which hides the native menu
     (visibility only, layout space is kept).
   - Blocked, not loaded, or throwing at any point before that last step: the
     class is never set, the half-built nodes are removed, the native menu stays.
   - After start-up, any error in one of our own handlers tears the new menu
     down (class off, nodes removed) so the native menu comes back.
   - No address exists only in this file except those marked source "config"
     below; every other address comes from a native menu or footer link.
   - Remove = delete the one <script> line. Nothing in Squarespace's navigation
     settings changes.
   ───────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';
  if (window.top !== window) return;                // top page only, not the chat/video iframes
  if (window.SDC_NAV || window.__sdcNavStarted) return;  // never run twice, even if the script is loaded twice within the start-up window
  window.__sdcNavStarted = true;

  /* ═══════════════ CONFIG ═══════════════ */
  var CONFIG = {
    // Breakpoint (px): below it the phone layout is used. Squarespace's own
    // switch is 800; the Dutch labels need a little more room on one row.
    phoneBelow: 1000,

    // Homepage strip with three choices under the hero. Separate switch: set false to run the menu without it.
    // Countdown inside the live announcement bar (www only). A message in announcements.json may carry
    // "countdown_to" (ISO instant WITH offset) and "countdown_label": {nl,en}. Set false to switch off.
    countdown: true,

    homeChoices: false,   // 15 Nov: off at go-live (owner has not approved the strip yet); set true to show it

    // Addresses may be written as a path ("/faq") or a full URL. "@cta" means
    // "the address of the native header button" (today: Weekly Class Schedule).
    // fixed:true = the address is allowed to come from this config because it
    // is not a native link (each was seen answering 200 on 15 Nov 2026).
    items: [
      { id: 'classes', nl: 'Danslessen', en: 'Classes', kind: 'group',
        links: [
          { addr: '@cta', nl: 'Weekrooster (sep \u2013 jan)', en: 'Weekly schedule (Sep \u2013 Jan)' }   /* owner 15 Nov: label the period until the spring timetable exists */,
          { addr: 'https://styles.shoonyadance.com/', nl: 'Alle stijlen', en: 'All styles' },
          { addr: '/private-class', nl: 'Privé- en groepslessen', en: 'Private & group classes' }
        ],
        // The native Courses folder, three headings. A style that is in the
        // folder but not listed here goes to "Meer / More".
        styleFolder: '/courses-old',
        styleGroups: [
          { nl: 'Partner & sociaal', en: 'Partner & social', addrs: [
            '/argentijnse-tango-danslessen-gent', '/bachata-dance-classes-in-ghent', '/bachata-solo-style-gent',
            '/cuban-salsa-in-gent', '/kizomba-danslessen-in-gent', '/lindy-hop-danslessen-in-gent',
            '/rueda-de-casino-danslessen-gent'] },
          { nl: 'Klassiek & techniek', en: 'Classical & technique', addrs: [
            '/ballet-voor-volwassenen-in-gent', '/professional-morning-training-gent', '/flamenco-danslessen-in-gent',
            '/indian-dance-in-belgium', '/kathak-danslessen-in-gent', '/oriental-flow-gent',
            '/solo-jazz-danslessen-in-gent', '/tapdans-lessen-in-gent'] },
          { nl: 'Cultuur & wellness', en: 'Culture & wellness', addrs: [
            '/afrikaanse-congolese-dans-gent', '/bhangra-danslessen-in-gent', '/bollyfolk-danslessen-in-gent',
            '/bollywood-danslessen-in-gent', '/burlesque-lessen-in-gent', '/cissy-ball-danslessen-in-gent',
            '/pilates-voor-dansers-gent', '/raqs-sharqi-danslessen-in-gent', '/yoga-lessen-in-gent'] }
        ] },
      { id: 'workshops', nl: 'Workshops & festivals', en: 'Workshops & festivals', kind: 'group',
        nativeFolder: '/events-and-festivals',
        linksAfter: [ { addr: 'https://links.shoonyadance.com/go/workshop/', nl: 'Inschrijven voor workshops', en: 'Register for workshops' } ] },          // the native items, native labels
      { id: 'agenda', nl: 'Agenda', en: 'Calendar', kind: 'group',
        links: [
          { addr: '/calendar', nl: 'Alles', en: 'All' },
          { addr: '/social-dance-calendar', nl: 'Social nights', en: 'Social nights', fixed: true },
          { addr: '/calendar?category=Performance', nl: 'Voorstellingen', en: 'Performances', fixed: true },
          { addr: 'https://links.shoonyadance.com/go/ticket/', nl: 'Tickets', en: 'Tickets' }
        ] },
      { id: 'new', nl: 'Nieuw hier?', en: 'New here?', kind: 'link', addr: 'https://info.shoonyadance.com/' },
      { id: 'centre', nl: 'Het centrum', en: 'The centre', kind: 'group', align: 'right',
        links: [
          { addr: 'https://info.shoonyadance.com/about/', nl: 'Over ons', en: 'About us' },
          { addr: 'https://info.shoonyadance.com/our-studios/', nl: "Onze studio's", en: 'Our studios' },
          { addr: '/house-rules', nl: 'Huisregels', en: 'House rules' },                       // footer, if present
          { addr: '/who-is-a-shoonya-member', nl: 'Wie is Shoonya-lid?', en: 'Who is a Shoonya member?' }  // footer, if present
        ] }
    ],
    // Dutch style names, exactly as on https://schedule.shoonyadance.com/nl/styles/ (matched by www address).
    // English uses the native labels; a style not listed here keeps its native label in both languages.
    nlNames: {
      "/argentijnse-tango-danslessen-gent": "Argentijnse Tango",
      "/bachata-dance-classes-in-ghent": "Bachata",
      "/bachata-solo-style-gent": "Bachata Solo Style",
      "/cuban-salsa-in-gent": "Cubaanse Salsa",
      "/kizomba-danslessen-in-gent": "Kizomba",
      "/lindy-hop-danslessen-in-gent": "Lindy Hop",
      "/rueda-de-casino-danslessen-gent": "Rueda de Casino",
      "/ballet-voor-volwassenen-in-gent": "Ballet",
      "/professional-morning-training-gent": "Professional Morning Training",
      "/flamenco-danslessen-in-gent": "Flamenco",
      "/indian-dance-in-belgium": "Indische Danstechniek",
      "/kathak-danslessen-in-gent": "Indisch Semi-klassiek (Kathak)",
      "/oriental-flow-gent": "Oriental Flow",
      "/solo-jazz-danslessen-in-gent": "Solo Jazz",
      "/tapdans-lessen-in-gent": "Tapdans",
      "/afrikaanse-congolese-dans-gent": "Afrikaanse Congolese Dans",
      "/bhangra-danslessen-in-gent": "Bhangra",
      "/bollyfolk-danslessen-in-gent": "Bollyfolk",
      "/bollywood-danslessen-in-gent": "Bollywood",
      "/burlesque-lessen-in-gent": "Burlesque",
      "/cissy-ball-danslessen-in-gent": "Cissy Ball",
      "/pilates-voor-dansers-gent": "Pilates voor Dansers",
      "/raqs-sharqi-danslessen-in-gent": "Raqs Sharqi (Buikdans)",
      "/yoga-lessen-in-gent": "Yoga"
    },
    register: { addr: '/register', nl: 'Inschrijven', en: 'Register' },
    meer: { nl: 'Meer', en: 'More', align: 'right' },
    // Native links that land in "Meer" get these labels instead of the native
    // text (the native text "Workshops & festivals" / "Tickets" is ambiguous there).
    labelOverrides: {
      'links.shoonyadance.com/go/workshop/': { nl: 'Inschrijven voor workshops & festivals', en: 'Register for workshops & festivals' },
      'links.shoonyadance.com/go/ticket/': { nl: 'Tickets kopen', en: 'Buy tickets' }
    },
    small: [
      { addr: '/faq', nl: 'Veelgestelde vragen', en: 'FAQ' },
      { addr: '/gift-voucher', nl: 'Cadeaubon', en: 'Gift voucher' },
      { addr: '/newsletter', nl: 'Nieuwsbrief', en: 'Newsletter' },
      { addr: '/contact', nl: 'Contact', en: 'Contact' },
      { addr: 'https://portal.shoonyadance.com/student/login', nl: 'Mijn Shoonya', en: 'My Shoonya', fixed: true }
    ],
    ui: {
      mainNav: { nl: 'Hoofdmenu', en: 'Main menu' },
      smallNav: { nl: 'Snelle links', en: 'Quick links' },
      menu: { nl: 'Menu', en: 'Menu' },
      close: { nl: 'Menu sluiten', en: 'Close menu' },
      back: { nl: 'Terug', en: 'Back' },
      lang: { nl: 'Taal', en: 'Language' }
    },
    languages: [ { code: 'nl', short: 'NL', name: 'Nederlands' }, { code: 'en', short: 'EN', name: 'English' } ]
  };

  /* ═══════════════ helpers ═══════════════ */
  var NS = 'sdc';
  var state = { on: false, torn: false, nodes: [], observers: [], cleanups: [], report: null };
  var doc = document;

  function isNl() { return /^nl/i.test(doc.documentElement.lang || ''); }
  function t(o) { return isNl() ? o.nl : o.en; }
  function norm(s) { return (s || '').replace(/\s+/g, ' ').trim(); }

  // Same-site addresses compare by path+query, others by host+path+query.
  function keyOf(href) {
    var u;
    try { u = new URL(href, location.href); } catch (e) { return null; }
    if (!/^(https?:|mailto:|tel:)$/.test(u.protocol)) return null;     // only ordinary links are mirrored
    var path = u.pathname.length > 1 ? u.pathname.replace(/\/+$/, '') : u.pathname;
    var host = u.hostname.toLowerCase();
    var same = host === 'www.shoonyadance.com' || host === location.hostname.toLowerCase();
    var k = (same ? '' : host) + path + u.search;
    return u.pathname === '/' && !same ? host + '/' + u.search : k;
  }
  function keyNoSlashHost(href) {                      // for labelOverrides lookup
    var u; try { u = new URL(href, location.href); } catch (e) { return ''; }
    return u.hostname.toLowerCase() + u.pathname + u.search;
  }
  function h(tag, attrs, kids) {
    var el = doc.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (attrs[k] === null || attrs[k] === undefined || attrs[k] === false) continue;
      if (k === 'text') el.textContent = attrs[k]; else el.setAttribute(k, attrs[k] === true ? '' : attrs[k]);
    }
    (kids || []).forEach(function (c) { if (c) el.appendChild(c); });
    return el;
  }
  var CHEV = '<svg viewBox="0 0 12 8" width="11" height="7" aria-hidden="true" focusable="false"><path d="M1 1.5l5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.25"/></svg>';
  var ICON_BACK = '<svg viewBox="0 0 8 12" width="8" height="12" aria-hidden="true" focusable="false"><path d="M6.5 1l-5 5 5 5" fill="none" stroke="currentColor" stroke-width="1.25"/></svg>';
  var ICON_X = '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path d="M4 4l16 16M20 4L4 20" fill="none" stroke="currentColor" stroke-width="1.25"/></svg>';
  var uid = 0;
  function nid(p) { uid += 1; return NS + '-' + p + '-' + uid; }

  // Wrap every handler of ours: an error after start-up removes the new menu
  // and hands the page back to the native one.
  function guard(fn) {
    return function () {
      try { return fn.apply(this, arguments); }
      catch (e) { try { console.warn('[sdc-nav] error, native menu restored', e); } catch (e2) {} teardown(); }
    };
  }
  function on(target, ev, fn, opt) { var g = guard(fn); target.addEventListener(ev, g, opt); state.cleanups.push(function () { target.removeEventListener(ev, g, opt); }); }

  function teardown() {
    state.torn = true;
    var hadFocus = false;
    try { hadFocus = state.nodes.some(function (n) { return n.contains && n.contains(doc.activeElement); }) || doc.activeElement === doc.body; } catch (e) {}
    doc.documentElement.classList.remove('sdc-nav-on', 'sdc-nav-open', 'sdc-nolang');
    state.nodes.forEach(function (n) { if (n.parentNode) n.parentNode.removeChild(n); });
    state.observers.forEach(function (o) { try { o.disconnect(); } catch (e) {} });
    state.cleanups.forEach(function (f) { try { f(); } catch (e) {} });
    var wr = doc.getElementById('siteWrapper'); if (wr) wr.removeAttribute('inert');
    var ab = doc.querySelector('.announce-bar'); if (ab) ab.removeAttribute('inert');      // the announcement must stay usable
    if (hadFocus) {                                                                           // give focus back to the native menu control
      try {
        var c = Array.prototype.filter.call(doc.querySelectorAll('#header .header-burger-btn, #header .header-nav-item a, #header .header-title a'), function (x) { return x.getClientRects().length; })[0];
        if (c && c.focus) c.focus();
      } catch (e) {}
    }
    state.nodes = []; state.observers = []; state.cleanups = []; state.on = false;
    window.SDC_NAV = undefined;
  }

  /* ═══════════════ 1. read the native menu ═══════════════ */
  function readNative() {
    var hdr = doc.getElementById('header');
    if (!hdr) throw new Error('no #header');
    var list = hdr.querySelector('.header-display-desktop .header-nav-list') || hdr.querySelector('.header-nav-list');
    if (!list) throw new Error('no native nav list');
    var all = {};                                       // key -> {href,text,target,source,el}
    var folders = {};                                   // data-href -> [{key,...}]
    function add(a, source) {
      var href = a.getAttribute('href'); if (!href || href.charAt(0) === '#') return null;
      var k = keyOf(href); if (!k) return null;
      var rec = all[k] || (all[k] = { key: k, href: href, text: norm(a.textContent), target: a.getAttribute('target'), source: source, el: a });
      return rec;
    }
    var order = [];
    list.querySelectorAll('.header-nav-item').forEach(function (item) {
      var btn = item.querySelector('button.header-nav-folder-title');
      if (btn) {
        var fk = btn.getAttribute('data-href') || btn.getAttribute('aria-controls');
        var arr = folders[fk] = [];
        item.querySelectorAll('.header-nav-folder-content a[href]').forEach(function (a) { var r = add(a, 'menu'); if (r) { arr.push(r); order.push(r); } });
      } else {
        item.querySelectorAll('a[href]').forEach(function (a) { var r = add(a, 'menu'); if (r) order.push(r); });
      }
    });
    var ctaA = hdr.querySelector('.header-actions-action--cta a[href]');
    var cta = ctaA ? add(ctaA, 'menu') : null;
    if (cta) cta.isCta = true;
    if (!order.length) throw new Error('native menu has no links');
    // footer links (only those not already in the menu)
    doc.querySelectorAll('footer a[href]').forEach(function (a) { add(a, 'footer'); });
    return { hdr: hdr, list: list, all: all, folders: folders, order: order, cta: cta };
  }

  // Squarespace fades its header items in on load, so a computed colour read
  // too early can be transparent. Opaque values are used as read; a see-through
  // one is replaced by the header's own colour tokens.
  function opaque(c) { var m = /rgba?\(([^)]+)\)/.exec(c || ''); if (!m) return !!c && c !== 'transparent'; var p = m[1].split(','); return p.length < 4 || parseFloat(p[3]) > 0.99; }
  function probe(hdr, value) {
    var el = doc.createElement('span'); el.style.cssText = 'position:absolute;visibility:hidden;color:' + value;
    hdr.appendChild(el); var c = getComputedStyle(el).color; hdr.removeChild(el); return opaque(c) ? c : null;
  }
  function readTheme(nat) {
    var hdr = nat.hdr, cs = function (el) { return el ? getComputedStyle(el) : null; };
    var navEl = hdr.querySelector('.header-nav-folder-title') || hdr.querySelector('.header-nav-item a');
    var ctaEl = hdr.querySelector('.header-actions-action--cta a');
    var n = cs(navEl), c = cs(ctaEl), hd = cs(hdr), body = cs(doc.body);
    var bg = (hd && opaque(hd.backgroundColor)) ? hd.backgroundColor : (probe(hdr, 'var(--solidHeaderBackgroundColor)') || '#fff');
    var color = (n && opaque(n.color)) ? n.color : (probe(hdr, 'var(--solidHeaderNavigationColor)') || '#000');
    var btnBg = (c && opaque(c.backgroundColor)) ? c.backgroundColor : color;
    var btnFg = (c && opaque(c.color)) ? c.color : bg;
    return {
      font: (n && n.fontFamily) || (body && body.fontFamily) || 'serif',
      size: (n && n.fontSize) || '16px', weight: (n && n.fontWeight) || '400',
      color: color, ls: (n && n.letterSpacing) || 'normal', tt: (n && n.textTransform) || 'none',
      bg: bg, btnBg: btnBg, btnFg: btnFg, btnRadius: (c && c.borderRadius) || '10px'
    };
  }
  function applyTheme(el, th) {
    var s = el.style;
    s.setProperty('--sdc-font', th.font); s.setProperty('--sdc-size', th.size); s.setProperty('--sdc-weight', th.weight);
    s.setProperty('--sdc-color', th.color); s.setProperty('--sdc-ls', th.ls); s.setProperty('--sdc-tt', th.tt);
    s.setProperty('--sdc-bg', th.bg); s.setProperty('--sdc-btn-bg', th.btnBg); s.setProperty('--sdc-btn-fg', th.btnFg);
    s.setProperty('--sdc-btn-radius', th.btnRadius);
  }

  /* ═══════════════ 2. place links ═══════════════ */
  // Returns the model: a list of top items, each with resolved links.
  function buildModel(nat) {
    var placed = {}, missing = [], rows = [];                // rows = report lines
    function resolve(addr, fixed) {
      if (addr === '@cta') return nat.cta ? { rec: nat.cta, source: 'menu' } : null;
      var k = keyOf(addr), rec = k && nat.all[k];
      if (rec) return { rec: rec, source: rec.source };
      if (fixed) return { rec: { key: k, href: addr, text: '', target: null, source: 'config' }, source: 'config' };
      missing.push(addr); return null;
    }
    function mark(res, label, group) {
      placed[res.rec.key] = true;
      rows.push({ group: group, label: label, href: res.rec.href, source: res.source });
    }
    function link(spec, group) {
      var res = resolve(spec.addr, spec.fixed); if (!res) return null;
      var o = { nl: spec.nl, en: spec.en, href: res.rec.href, target: res.rec.target, key: res.rec.key, source: res.source, native: null };
      mark(res, spec.en + ' / ' + spec.nl, group); return o;
    }
    var top = [];
    CONFIG.items.forEach(function (it) {
      var top1 = { id: it.id, nl: it.nl, en: it.en, kind: it.kind, align: it.align || 'left', links: [], groups: [] };
      if (it.kind === 'link') {
        var l = link({ addr: it.addr, nl: it.nl, en: it.en }, it.en);
        if (!l) return; top1.href = l.href; top1.target = l.target; top.push(top1); return;
      }
      (it.links || []).forEach(function (s) { var l = link(s, it.en); if (l) top1.links.push(l); });
      if (it.nativeFolder) {
        (nat.folders[it.nativeFolder] || []).forEach(function (rec) {
          if (placed[rec.key]) return;
          placed[rec.key] = true; rows.push({ group: it.en, label: rec.text + ' (native label)', href: rec.href, source: 'menu' });
          top1.links.push({ nl: null, en: null, href: rec.href, target: rec.target, key: rec.key, source: 'menu', native: rec });
        });
      }
      (it.linksAfter || []).forEach(function (sp) { var l = link(sp, it.en); if (l) top1.links.push(l); });
      if (it.styleFolder) {
        var folder = nat.folders[it.styleFolder] || [];
        it.styleGroups.forEach(function (g) {
          var gg = { nl: g.nl, en: g.en, links: [] };
          g.addrs.forEach(function (a) {
            var k = keyOf(a), rec = k && nat.all[k];
            if (!rec) { missing.push(a); return; }
            placed[rec.key] = true; rows.push({ group: it.en + ' / ' + g.en, label: rec.text + ' (native label)', href: rec.href, source: 'menu' });
            gg.links.push({ nl: null, en: null, nlName: CONFIG.nlNames[a] || null, href: rec.href, target: rec.target, key: rec.key, source: 'menu', native: rec });
          });
          if (gg.links.length) top1.groups.push(gg);
        });
        top1._folder = folder;
      }
      if (!top1.links.length && !top1.groups.length) return;
      top.push(top1);
    });
    // button
    var reg = resolve(CONFIG.register.addr, true);
    var register = { nl: CONFIG.register.nl, en: CONFIG.register.en, href: reg.rec.href, target: null, source: reg.source };
    mark(reg, 'Register button', 'button');
    // small bar
    var small = [];
    CONFIG.small.forEach(function (s) { var l = link(s, 'small bar'); if (l) small.push(l); });
    // everything native not placed -> Meer. (footer-only links are footer's business)
    var meerLinks = [];
    var classes = CONFIG.items[0];
    nat.order.concat(nat.cta ? [nat.cta] : []).forEach(function (rec) {
      if (placed[rec.key] || rec.source !== 'menu') return;
      placed[rec.key] = true;
      var ov = CONFIG.labelOverrides[keyNoSlashHost(rec.href)];
      if (/*SDC_NO_MEER*/ false) return;
      meerLinks.push({ nl: ov ? ov.nl : null, en: ov ? ov.en : null, href: rec.href, target: rec.target, key: rec.key, source: 'menu', native: ov ? null : rec });
      rows.push({ group: 'Meer / More', label: (ov ? ov.en : rec.text + ' (native label)'), href: rec.href, source: 'menu' });
    });
    if (meerLinks.length) top.push({ id: 'meer', nl: CONFIG.meer.nl, en: CONFIG.meer.en, kind: 'group', align: 'right', links: meerLinks, groups: [] });
    return { top: top, register: register, small: small, rows: rows, missing: missing };
  }

  /* ═══════════════ 3. DOM ═══════════════ */
  var labelRefs = [];            // {el, spec} : text follows language
  function lbl(spec, extraCls) {
    var s = h('span', { 'class': 'sdc-lbl' + (extraCls ? ' ' + extraCls : '') });
    labelRefs.push({ el: s, spec: spec });
    return s;
  }
  function a(spec, cls) {
    var rel = spec.target === '_blank' ? 'noopener' : null;
    var el = h('a', { href: spec.href, 'class': cls || 'sdc-link', target: spec.target || null, rel: rel, 'data-sdc-source': spec.source || null }, [lbl(spec)]);
    return el;
  }
  function linkList(links, cls) {
    var ul = h('ul', { 'class': cls || 'sdc-list' });
    links.forEach(function (l) { ul.appendChild(h('li', null, [a(l)])); });
    return ul;
  }
  function groupBody(top, mode, accs) {   // shared body used by desktop dropdown and phone panel view
    var body = h('div', { 'class': 'sdc-body' });
    if (top.links.length && top.groups.length) {
      var left = h('div', { 'class': 'sdc-col sdc-col-lead' }, [linkList(top.links)]);
      body.appendChild(left);
    } else if (top.links.length) {
      body.appendChild(h('div', { 'class': 'sdc-col' }, [linkList(top.links)]));
    }
    top.groups.forEach(function (g) {
      var hid = nid('gh');
      if (mode === 'phone') {                      // phone: collapsed accordion, real button + hidden list
        var bid = nid('gb');
        var btn = h('button', { type: 'button', 'class': 'sdc-acc', id: hid, 'aria-expanded': 'false', 'aria-controls': bid }, [lbl(g, 'sdc-gh')]);
        btn.insertAdjacentHTML('beforeend', CHEV);
        var pul = linkList(g.links); pul.setAttribute('id', bid); pul.setAttribute('role', 'group'); pul.setAttribute('aria-labelledby', hid); pul.hidden = true;
        body.appendChild(h('div', { 'class': 'sdc-col sdc-accwrap' }, [btn, pul]));
        if (accs) accs.push({ btn: btn, list: pul });
        return;
      }
      var head = lbl(g, 'sdc-gh'); head.setAttribute('id', hid);
      var ul = linkList(g.links); ul.setAttribute('aria-labelledby', hid);
      body.appendChild(h('div', { 'class': 'sdc-col' }, [head, ul]));
    });
    return body;
  }

  function build(model, nat, th) {
    var root = h('div', { id: 'sdc-nav', 'data-wg-notranslate': true, 'class': 'sdc-root' });
    applyTheme(root, th);
    // --- desktop main bar
    var mainNav = h('nav', { 'class': 'sdc-main' });
    var navLabel = lbl(CONFIG.ui.mainNav); var mainUl = h('ul', { 'class': 'sdc-row' });
    var triggers = [];
    model.top.forEach(function (top) {
      var li = h('li', { 'class': 'sdc-item' + (top.align === 'right' ? ' sdc-right' : '') });
      if (top.kind === 'link') {
        li.appendChild(a(top, 'sdc-link sdc-top'));
      } else {
        var pid = nid('drop'), tid = nid('trg');
        var btn = h('button', { type: 'button', 'class': 'sdc-trigger sdc-top', id: tid, 'aria-expanded': 'false', 'aria-controls': pid }, [lbl(top)]);
        btn.insertAdjacentHTML('beforeend', CHEV);
        var drop = h('div', { 'class': 'sdc-drop' + (top.id === 'classes' ? ' sdc-wide' : ''), id: pid, hidden: true }, [groupBody(top)]);
        li.appendChild(btn); li.appendChild(drop);
        triggers.push({ li: li, btn: btn, drop: drop, pinned: false, timer: null });
      }
      mainUl.appendChild(li);
    });
    var regLi = h('li', { 'class': 'sdc-item sdc-regli' }, [a(model.register, 'sdc-reg')]);
    mainUl.appendChild(regLi);
    mainNav.appendChild(mainUl);
    // --- small bar
    var smallNav = h('nav', { 'class': 'sdc-small' });
    var smallUl = h('ul', { 'class': 'sdc-row' });
    model.small.forEach(function (l) { smallUl.appendChild(h('li', null, [a(l, 'sdc-link sdc-sm')])); });
    var langLi = h('li', { 'class': 'sdc-langli' }, [langSwitch('desk')]);
    smallUl.appendChild(langLi);
    smallNav.appendChild(smallUl);
    // --- phone menu button
    var burger = h('button', { type: 'button', 'class': 'sdc-burger', 'aria-expanded': 'false', 'aria-controls': 'sdc-panel' },
      [h('span', { 'class': 'sdc-bars', 'aria-hidden': 'true' }, [h('i'), h('i'), h('i')]), h('span', { 'class': 'sdc-vh' }, [lbl(CONFIG.ui.menu)])]);
    root.appendChild(smallNav); root.appendChild(mainNav); root.appendChild(burger);
    // --- phone panel (own element on <body>, so the page can be made inert)
    var panel = h('div', { id: 'sdc-panel', 'class': 'sdc-panel', role: 'dialog', 'aria-modal': 'true', hidden: true, 'data-wg-notranslate': true });
    applyTheme(panel, th);
    var topbar = h('div', { 'class': 'sdc-ptop' }, [langSwitch('phone'),
      h('button', { type: 'button', 'class': 'sdc-close' }, [h('span', { 'class': 'sdc-x', 'aria-hidden': 'true' }), h('span', { 'class': 'sdc-vh' }, [lbl(CONFIG.ui.close)])])]);
    topbar.querySelector('.sdc-x').insertAdjacentHTML('beforeend', ICON_X);
    var scroll = h('div', { 'class': 'sdc-pscroll' });
    var mainView = h('div', { 'class': 'sdc-view sdc-view-main' });
    var pnav = h('nav', { 'class': 'sdc-pnav' }); var pul = h('ul', { 'class': 'sdc-plist' });
    var views = [];
    model.top.forEach(function (top) {
      var li = h('li');
      if (top.kind === 'link') li.appendChild(a(top, 'sdc-prow'));
      else {
        var vid = nid('view'), rid = nid('row');
        var row = h('button', { type: 'button', 'class': 'sdc-prow', id: rid, 'aria-expanded': 'false', 'aria-controls': vid }, [lbl(top)]);
        row.insertAdjacentHTML('beforeend', '<svg viewBox="0 0 8 12" width="8" height="12" aria-hidden="true" focusable="false"><path d="M1.5 1l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.25"/></svg>');
        var vtitle = lbl(top, 'sdc-vtitle'); var vtid = nid('vt'); vtitle.setAttribute('id', vtid);
        var back = h('button', { type: 'button', 'class': 'sdc-back' }, [h('span', { 'class': 'sdc-bk', 'aria-hidden': 'true' }), lbl(CONFIG.ui.back)]);
        back.querySelector('.sdc-bk').insertAdjacentHTML('beforeend', ICON_BACK);
        var accs = [];
        var view = h('div', { 'class': 'sdc-view', id: vid, hidden: true, role: 'group', 'aria-labelledby': vtid }, [back, vtitle, groupBody(top, 'phone', accs)]);
        li.appendChild(row); views.push({ row: row, view: view, back: back, accs: accs });
      }
      pul.appendChild(li);
    });
    pnav.appendChild(pul);
    var regRow = h('div', { 'class': 'sdc-pregwrap' }, [a(model.register, 'sdc-reg sdc-reg-phone')]);
    var psmall = h('nav', { 'class': 'sdc-psmall' }, [linkList(model.small, 'sdc-plist sdc-plist-small')]);
    psmall.querySelectorAll('a').forEach(function (x) { x.className = 'sdc-prow sdc-prow-sm'; });
    mainView.appendChild(pnav); mainView.appendChild(regRow); mainView.appendChild(psmall);
    scroll.appendChild(mainView);
    views.forEach(function (v) { scroll.appendChild(v.view); });
    panel.appendChild(topbar); panel.appendChild(scroll);
    // aria-labels for the navs (kept in sync with language)
    var navLabels = [[mainNav, CONFIG.ui.mainNav], [smallNav, CONFIG.ui.smallNav], [pnav, CONFIG.ui.mainNav], [psmall, CONFIG.ui.smallNav]];
    return { root: root, panel: panel, triggers: triggers, burger: burger, views: views, navLabels: navLabels, mainView: mainView, scroll: scroll, closeBtn: topbar.querySelector('.sdc-close') };
  }

  // Weglot excludes some pages from translation (calendar, register, news, ...): there the NL/EN buttons would do nothing.
  function langAvailable() {
    try {
      var rules = (window.Weglot && Weglot.options && Weglot.options.excluded_paths) || [], p = location.pathname;
      for (var i = 0; i < rules.length; i++) {
        var r = rules[i]; if (!r || !r.regex) continue;
        var langs = r.excluded_languages || [], hit = false;
        try { hit = new RegExp(r.regex).test(p); } catch (e) {}
        if (hit && (langs.length === 0 || langs.indexOf('nl') !== -1 || langs.indexOf('en') !== -1)) return false;
      }
    } catch (e) {}
    return true;
  }
  function syncLang() { doc.documentElement.classList.toggle('sdc-nolang', !langAvailable()); }

  var langGroups = [];
  function langSwitch(kind) {
    var g = h('div', { 'class': 'sdc-lang', role: 'group' });
    CONFIG.languages.forEach(function (L) {
      g.appendChild(h('button', { type: 'button', 'class': 'sdc-langbtn', lang: L.code, 'data-code': L.code, 'aria-label': L.name, 'aria-pressed': 'false', text: L.short }));
    });
    langGroups.push(g);
    return g;
  }

  /* ═══════════════ 4. behaviour ═══════════════ */
  function refresh(ui) {
    var nl = isNl();
    labelRefs.forEach(function (r) {
      var s = r.spec, txt;
      if (s.native && s.nlName) {              // style: Dutch from the config, English from the native label
        if (nl) txt = s.nlName;
        else { var nt = norm(s.native.el.textContent); if (nt && nt !== s.nlName) s.enText = nt; txt = s.enText || s.native.text; }
      }
      else if (s.native) txt = norm(s.native.el.textContent) || s.native.text;
      else txt = nl ? s.nl : s.en;
      if (r.el.textContent !== txt) r.el.textContent = txt;
    });
    ui.navLabels.forEach(function (p) { p[0].setAttribute('aria-label', t(p[1])); });
    var cur = nl ? 'nl' : 'en';
    syncLang();
    if (state.cdTick) state.cdTick();
    ui.panel.setAttribute('aria-label', t(CONFIG.ui.menu));
    langGroups.forEach(function (g) {
      g.setAttribute('aria-label', t(CONFIG.ui.lang));
      g.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-code') === cur ? 'true' : 'false'); });
    });
  }

  function wire(ui, nat) {
    var html = doc.documentElement;
    var mqPhone = window.matchMedia('(max-width:' + (CONFIG.phoneBelow - 1) + 'px)');
    var canHover = window.matchMedia('(hover:hover) and (pointer:fine)');

    /* ---- desktop dropdowns ---- */
    function setOpen(tr, open) {
      if (open) ui.triggers.forEach(function (o) { if (o !== tr) setOpen(o, false); });
      tr.btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) { layoutVars(); tr.drop.hidden = false; clamp(tr.drop); } else { tr.drop.hidden = true; tr.drop.style.transform = ''; tr.pinned = false; }
    }
    function clamp(drop) {
      drop.style.transform = '';
      var r = drop.getBoundingClientRect(), vw = html.clientWidth, dx = 0;
      if (r.right > vw - 12) dx = vw - 12 - r.right;
      if (r.left + dx < 12) dx = 12 - r.left;
      if (dx) drop.style.transform = 'translateX(' + Math.round(dx) + 'px)';
    }
    ui.triggers.forEach(function (tr) {
      on(tr.btn, 'click', function () {
        var open = tr.btn.getAttribute('aria-expanded') === 'true';
        if (!open) { setOpen(tr, true); tr.pinned = true; }
        else if (!tr.pinned) tr.pinned = true;              // opened by hover: a click keeps it open
        else setOpen(tr, false);
      });
      if (canHover.matches) {
        on(tr.li, 'pointerenter', function (e) { if (e.pointerType !== 'mouse') return; clearTimeout(tr.timer); tr.timer = setTimeout(guard(function () { if (!mqPhone.matches) setOpen(tr, true); }), 60); });
        on(tr.li, 'pointerleave', function (e) { if (e.pointerType !== 'mouse') return; clearTimeout(tr.timer); tr.timer = setTimeout(guard(function () { if (!tr.pinned) setOpen(tr, false); }), 180); });
      }
      on(tr.li, 'focusout', function (e) { if (!e.relatedTarget || !tr.li.contains(e.relatedTarget)) { if (e.relatedTarget) setOpen(tr, false); } });
    });
    on(doc, 'pointerdown', function (e) { ui.triggers.forEach(function (tr) { if (!tr.li.contains(e.target)) setOpen(tr, false); }); });
    on(doc, 'keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (panelOpen()) { e.preventDefault(); var oa = activeView && openAcc(activeView); if (oa) { setAcc(oa, false, activeView); oa.btn.focus(); } else if (activeView) closeView(true); else closePanel(true); return; }
      ui.triggers.forEach(function (tr) {
        if (tr.btn.getAttribute('aria-expanded') === 'true') {
          var inside = tr.li.contains(doc.activeElement);
          setOpen(tr, false); if (inside) tr.btn.focus();
        }
      });
    });

    /* ---- phone panel ---- */
    var activeView = null, lastFocus = null, bottomTimer = null;
    state.cleanups.push(function () { if (bottomTimer) clearInterval(bottomTimer); });
    function setAcc(a, open, v) {
      if (open) v.accs.forEach(function (o) { if (o !== a) setAcc(o, false, v); });
      a.btn.setAttribute('aria-expanded', open ? 'true' : 'false'); a.list.hidden = !open;
    }
    function openAcc(v) { return v.accs.filter(function (a) { return a.btn.getAttribute('aria-expanded') === 'true'; })[0]; }
    ui.views.forEach(function (v) {
      v.accs.forEach(function (a) {
        on(a.btn, 'click', function () {
          var open = a.btn.getAttribute('aria-expanded') === 'true';
          setAcc(a, !open, v);
          if (!open) setTimeout(guard(function () { var r = a.btn.getBoundingClientRect(), sr = ui.scroll.getBoundingClientRect(); if (r.top < sr.top || r.bottom > sr.bottom) a.btn.scrollIntoView({ block: 'start' }); }), 0);
        });
      });
    });
    function panelOpen() { return !ui.panel.hidden; }
    function cookieOffset() {
      var b = doc.querySelector('.gdpr-cookie-banner, .sqs-cookie-banner-v2'), off = 0;
      if (b) { var r = b.getBoundingClientRect(); if (r.height > 0 && r.top > innerHeight / 3 && r.bottom > 0) off = Math.max(0, innerHeight - r.top); }
      ui.panel.style.setProperty('--sdc-bottom', (off ? off + 16 : 16) + 'px');
    }
    function openPanel() {
      lastFocus = ui.burger;
      ui.panel.hidden = false; html.classList.add('sdc-nav-open');
      ui.burger.setAttribute('aria-expanded', 'true');
      var wr = doc.getElementById('siteWrapper'); if (wr) wr.setAttribute('inert', '');
      var ab = doc.querySelector('.announce-bar'); if (ab) ab.setAttribute('inert', '');
      cookieOffset(); bottomTimer = setInterval(guard(cookieOffset), 400);
      ui.scroll.scrollTop = 0;
      (ui.panel.querySelector('.sdc-prow, .sdc-close')).focus();
    }
    function closePanel(refocus) {
      if (activeView) closeView(false);
      ui.panel.hidden = true; html.classList.remove('sdc-nav-open');
      ui.burger.setAttribute('aria-expanded', 'false'); clearInterval(bottomTimer);
      var wr = doc.getElementById('siteWrapper'); if (wr) wr.removeAttribute('inert');
      var ab = doc.querySelector('.announce-bar'); if (ab) ab.removeAttribute('inert');
      if (refocus !== false) ui.burger.focus();
    }
    function openView(v) {
      activeView = v; ui.mainView.hidden = true; v.view.hidden = false; v.row.setAttribute('aria-expanded', 'true');
      ui.scroll.scrollTop = 0; v.back.focus();
    }
    function closeView(focusRow) {
      var v = activeView; if (!v) return;
      v.accs.forEach(function (a) { setAcc(a, false, v); });
      v.view.hidden = true; v.row.setAttribute('aria-expanded', 'false'); ui.mainView.hidden = false; activeView = null;
      ui.scroll.scrollTop = 0; if (focusRow) v.row.focus();
    }
    on(ui.burger, 'click', function () { if (panelOpen()) closePanel(true); else openPanel(); });
    on(ui.closeBtn, 'click', function () { closePanel(true); });
    ui.views.forEach(function (v) {
      on(v.row, 'click', function () { openView(v); });
      on(v.back, 'click', function () { closeView(true); });
    });
    // links inside the panel navigate away; close first so a same-page hash or bfcache return is clean
    on(ui.panel, 'click', function (e) { var A = e.target.closest && e.target.closest('a[href]'); if (A) closePanel(false); });
    on(ui.panel, 'keydown', function (e) {                // keep Tab inside the open menu
      if (e.key !== 'Tab') return;
      var f = Array.prototype.filter.call(ui.panel.querySelectorAll('a[href],button'), function (x) { return !x.closest('[hidden]') && x.getClientRects().length; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1], cur = doc.activeElement;
      if (!ui.panel.contains(cur)) { e.preventDefault(); first.focus(); }
      else if (e.shiftKey && cur === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && cur === last) { e.preventDefault(); first.focus(); }
    });
    on(doc, 'mercury:load', function () { syncLang(); });
    on(window, 'resize', function () { if (panelOpen()) { if (!mqPhone.matches) closePanel(false); else cookieOffset(); } layoutVars(); });

    /* ---- language: drive the real Weglot control ---- */
    langGroups.forEach(function (g) {
      g.querySelectorAll('button').forEach(function (b) {
        on(b, 'click', function () { var code = b.getAttribute('data-code'); if (window.Weglot && Weglot.switchTo) Weglot.switchTo(code); });
      });
    });
    var mo = new MutationObserver(guard(function () { if (!state.torn) refresh(ui); }));
    mo.observe(doc.documentElement, { attributes: true, attributeFilter: ['lang'] });
    mo.observe(nat.list, { childList: true, subtree: true, characterData: true });   // page translation of native labels
    state.observers.push(mo);
    if (window.Weglot && Weglot.on) { try { Weglot.on('languageChanged', guard(function () { if (state.torn) return; refresh(ui); setTimeout(guard(function () { if (!state.torn) refresh(ui); }), 600); })); } catch (e) {} }

    /* ---- left offset next to the native logo ---- */
    function layoutVars() {
      var inner = nat.hdr.querySelector('.header-inner'), logo = nat.hdr.querySelector('.header-display-desktop .header-title-logo');
      if (!inner || !logo) return;
      var ir = inner.getBoundingClientRect(), lr = logo.getBoundingClientRect();
      if (lr.width) ui.root.style.setProperty('--sdc-left', Math.round(lr.right - ir.left + 16) + 'px');
      var rr = ui.root.getBoundingClientRect(), hr = nat.hdr.getBoundingClientRect();     // panels hang from the header's bottom edge
      if (rr.height && hr.height) ui.root.style.setProperty('--sdc-drop-top', Math.round(hr.bottom - rr.top) + 'px');
    }
    layoutVars();
  }

  /* ═══════════════ 5. CSS ═══════════════
     DESIGN SYSTEM (visual pass, 15 Nov 2026)
     Spacing scale (px): 4 · 8 · 12 · 16 · 24 · 32 · 48   (--s1 … --s7). Every gap, padding and margin comes from it, with four
                         optical / target-size exceptions: 6 (item padding and chevron gap between 1000 and 1139 px, to fit Dutch labels),
                         9 (pulls the language switch's last letter flush with the Register button's edge), 36 (language button width),
                         44 (touch row height of the open style lists on the phone).
     Type scale (px):    14 small (small bar, language, quiet links) · 16 base (the page's own nav size: dropdown links, phone sub-links)
                         · 18 large (phone top links, group headings) · 24 display (phone main rows, phone view title).
     Faces:              the page's own nav face (PT Serif) for everything; the site's heading face (Marcellus) only for group
                         headings and the phone's main rows / titles. One weight (400) everywhere except the active language (700).
     Borders:            one hairline, 1px, the menu's own text colour at 20% (--sdc-hair). Used for panel edges and 3 dividers.
     States:             hover / open = 1px underline (offset 4px)   ·  focus = 2px ring in the Shoonya purple #B564F7 (3.4:1 on white)
                         pressed (phone) = 60% opacity            ·  Register hover = purple fill, black text (6.1:1).
     Colour:             nothing new. Text = the page's nav colour; secondary text = the same colour at 80% (12.6:1); the only accent is the
                         logo purple, used for focus rings and the Register hover.
     Radius:             the page's own button radius (Register, panel bottom corners).
     Motion:             120 ms opacity fades only; none under prefers-reduced-motion.
     ═════════════════════════════════════════════════════════════════════════ */
  var CSS = [
    '#sdc-nav{display:none}',
    '#sdc-nav,.sdc-panel{--s1:4px;--s2:8px;--s3:12px;--s4:16px;--s5:24px;--s6:32px;--s7:48px;--t-sm:14px;--t-md:var(--sdc-size,16px);--t-lg:18px;--t-xl:24px;',
    '--sdc-display:Marcellus,var(--sdc-font);--sdc-accent:#B564F7;--sdc-quiet:var(--sdc-color);--sdc-hair:rgba(0,0,0,.2);--sdc-line:1px solid var(--sdc-hair)}',
    '@supports (color:color-mix(in srgb,red,blue)){#sdc-nav,.sdc-panel{--sdc-quiet:color-mix(in srgb,var(--sdc-color) 80%,transparent);--sdc-hair:color-mix(in srgb,var(--sdc-color) 20%,transparent)}}',
    '.sdc-panel[hidden],.sdc-drop[hidden],.sdc-view[hidden]{display:none!important}',
    // native menu: hidden but still occupying its space, so nothing moves
    'html.sdc-nav-on #header .header-nav,html.sdc-nav-on #header .header-actions,html.sdc-nav-on #header .header-burger{visibility:hidden!important}',
    'html.sdc-nav-open,html.sdc-nav-open body{overflow:hidden!important}',
    'html.sdc-nav-open [id^="boei"]{display:none!important}',
    'html.sdc-nav-on #sdc-nav{display:flex;position:absolute;z-index:3;top:0;bottom:0;right:0;left:var(--sdc-left,220px);flex-direction:column;align-items:flex-end;justify-content:center;gap:var(--s1);',
    'font-family:var(--sdc-font);font-size:var(--t-md);font-weight:var(--sdc-weight);color:var(--sdc-color);letter-spacing:var(--sdc-ls);text-transform:var(--sdc-tt);line-height:1.3}',
    '#sdc-nav *,.sdc-panel *{box-sizing:border-box}',
    '#sdc-nav ul,.sdc-panel ul,#sdc-nav li,.sdc-panel li{list-style:none;margin:0;padding:0}',
    '#sdc-nav a,.sdc-panel a{color:var(--sdc-color)!important;font:inherit!important;letter-spacing:inherit!important;text-transform:inherit!important;text-decoration:none;background:none}',
    '#sdc-nav button,.sdc-panel button{font:inherit;letter-spacing:inherit;text-transform:inherit;color:inherit;background:none;border:0;margin:0;padding:0;cursor:pointer;-webkit-tap-highlight-color:transparent}',
    '#sdc-nav :focus-visible,.sdc-panel :focus-visible{outline:2px solid var(--sdc-accent);outline-offset:2px}',
    '.sdc-vh{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}',
    // ── desktop: small bar (secondary) ──
    '.sdc-small{flex:none;height:var(--s6);display:flex;align-items:center;font-size:var(--t-sm)}',
    '.sdc-small .sdc-row{display:flex;align-items:center;gap:var(--s5)}',
    '#sdc-nav a.sdc-sm{display:inline-flex;align-items:center;min-height:var(--s6);color:var(--sdc-quiet)!important}',
    '#sdc-nav a.sdc-sm:hover{color:var(--sdc-color)!important;text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:4px}',
    '#sdc-nav .sdc-langli{position:relative;margin-right:-9px}',
    '.sdc-langli::before{content:"";position:absolute;left:calc(var(--s3) * -1);top:50%;height:var(--t-sm);transform:translateY(-50%);border-left:var(--sdc-line)}',
    '.sdc-lang{display:inline-flex;align-items:center}',
    '.announce-bar .sdc-cd{font-variant-numeric:tabular-nums}',
    'html.sdc-nolang .sdc-lang,html.sdc-nolang #sdc-nav .sdc-langli,html.sdc-nolang #sdc-nav .sdc-langli::before{display:none!important}',
    '#sdc-nav .sdc-langbtn{font-size:var(--t-sm);min-width:36px;min-height:var(--s6);color:var(--sdc-quiet)}',
    '#sdc-nav .sdc-langbtn:hover,.sdc-panel .sdc-langbtn:hover{color:var(--sdc-color)}',
    '#sdc-nav .sdc-langbtn[aria-pressed="true"],.sdc-panel .sdc-langbtn[aria-pressed="true"]{color:var(--sdc-color);font-weight:700}',
    '.sdc-panel .sdc-langbtn{color:var(--sdc-quiet)}',
    // ── desktop: main bar (primary) ──
    '.sdc-main{flex:none;display:flex;align-items:center}',
    '.sdc-main>.sdc-row{display:flex;align-items:center}',
    '.sdc-item{display:flex;align-items:center}',
    '#sdc-nav .sdc-top{display:inline-flex;align-items:center;gap:var(--s2);min-height:var(--s7);padding:0 var(--s3);white-space:nowrap}',
    '#sdc-nav .sdc-top:hover,#sdc-nav .sdc-trigger[aria-expanded="true"]{text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:6px}',
    '.sdc-trigger svg{flex:none;opacity:.75;transition:transform .12s}',
    '.sdc-trigger[aria-expanded="true"] svg{transform:rotate(180deg);opacity:1}',
    '#sdc-nav a.sdc-reg,.sdc-panel a.sdc-reg{display:inline-flex;align-items:center;justify-content:center;min-height:var(--s7);padding:0 var(--s5);margin-left:var(--s3);white-space:nowrap;background:var(--sdc-btn-bg);color:var(--sdc-btn-fg)!important;border-radius:var(--sdc-btn-radius);transition:background-color .12s,color .12s}',
    '#sdc-nav a.sdc-reg:hover,.sdc-panel a.sdc-reg:active{background:var(--sdc-accent);color:var(--sdc-color)!important}',
    // ── desktop: dropdown panels. Attached to the header edge, hairline + one soft shadow, fade only ──
    '.sdc-drop{position:absolute;top:var(--sdc-drop-top,100%);left:auto;z-index:5;min-width:240px;margin-left:calc(var(--s3) * -1);padding:var(--s5);background:var(--sdc-bg);color:var(--sdc-color);',
    'border:var(--sdc-line);border-radius:0 0 var(--sdc-btn-radius) var(--sdc-btn-radius);box-shadow:0 24px 32px -24px rgba(0,0,0,.28);animation:sdc-in .12s ease-out}',
    '.sdc-drop::before{content:"";position:absolute;left:0;right:0;top:calc(var(--s4) * -1);height:var(--s4)}',      // hover bridge, short enough not to cover the bar's own buttons
    '.sdc-right .sdc-drop{right:0;margin-left:0}',
    // inside a short window the body (not the panel, so the hover bridge is not clipped) scrolls; the 4px keeps focus rings from being cut
    '.sdc-drop .sdc-body{display:flex;gap:var(--s6);align-items:flex-start;max-height:calc(100vh - var(--sdc-drop-top,0px) - 56px);overflow-y:auto;overscroll-behavior:contain;padding:var(--s1);margin:calc(var(--s1) * -1)}',
    '.sdc-drop.sdc-wide .sdc-body{display:grid;grid-template-columns:repeat(3,max-content);column-gap:var(--s7);row-gap:0}',
    '.sdc-drop .sdc-col{min-width:0}',
    '.sdc-drop.sdc-wide .sdc-col-lead{grid-column:1/-1;padding-bottom:var(--s4);margin-bottom:var(--s5);border-bottom:var(--sdc-line)}',
    '.sdc-drop.sdc-wide .sdc-col-lead .sdc-list{display:flex;gap:var(--s6)}',
    '.sdc-drop .sdc-list{line-height:var(--s5)}',      // 24px on 16px = 1.5; the links inherit it (their font shorthand resets line-height)
    '.sdc-drop .sdc-list a{display:block;padding:var(--s1) 0;white-space:nowrap}',
    '#sdc-nav .sdc-drop .sdc-list a:hover{text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:4px}',
    '.sdc-gh{display:block;font-family:var(--sdc-display);font-size:var(--t-lg);font-weight:400;line-height:var(--s5);letter-spacing:0;text-transform:none;margin-bottom:var(--s3)}',
    // owner 15 Nov: group headings stronger, a dash in front of each style (desktop dropdowns with groups only)
    '.sdc-drop.sdc-wide .sdc-col:not(.sdc-col-lead) .sdc-gh{font-size:var(--t-xl);line-height:var(--s5);padding-bottom:var(--s2);margin-bottom:var(--s3);border-bottom:2px solid var(--sdc-color)}',
    '.sdc-drop.sdc-wide .sdc-col:not(.sdc-col-lead) .sdc-list a::before{content:"\\2013";content:"\\2013" / "";display:inline-block;width:var(--s4);color:var(--sdc-quiet)}',
    // ── homepage: three choices in one slim strip directly under the hero (hero video and headline untouched) ──
    '.sdc-hc{background:var(--sdc-bg,#fff);color:var(--sdc-color,#000);font-family:var(--sdc-font);border-bottom:1px solid rgba(0,0,0,.2);position:relative;z-index:1}',
    '.sdc-hc,.sdc-hc *{box-sizing:border-box}',
    '.sdc-hc-in{max-width:1200px;margin:0 auto;padding:0 24px;display:grid;grid-template-columns:repeat(3,1fr)}',
    '.sdc-hc-d+.sdc-hc-d{border-left:1px solid rgba(0,0,0,.2);padding-left:24px}',
    '.sdc-hc a{display:block;padding:24px 24px 24px 0;color:inherit!important;text-decoration:none;font:inherit}',
    '.sdc-hc a:hover .sdc-hc-t span:first-child{text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:5px}',
    '.sdc-hc a:focus-visible{outline:2px solid #B564F7;outline-offset:-2px}',
    '.sdc-hc-t{display:flex;justify-content:space-between;gap:16px;font-family:Marcellus,var(--sdc-font);font-size:24px;line-height:32px;margin:0}',
    '.sdc-hc-t::after{content:none}',
    '.sdc-hc-arr{flex:none}',
    '.sdc-hc-x{display:block;font-size:16px;line-height:24px;opacity:.8}',
    'html:not([lang^="nl"]) .sdc-hc [data-l="nl"]{display:none!important}html[lang^="nl"] .sdc-hc [data-l="en"]{display:none!important}',
    '@media (max-width:' + (CONFIG.phoneBelow - 1) + 'px){.sdc-hc-in{grid-template-columns:1fr;padding:0 24px}.sdc-hc-d+.sdc-hc-d{border-left:0;border-top:1px solid rgba(0,0,0,.2);padding-left:0}.sdc-hc a{padding:16px 0;min-height:64px}}',
    // ── homepage: the free-trial box (built by classes.shoonyadance.com/trial-banner.js) restyled to match the menu: white, black type, black button ──
    'html.sdc-nav-on .st{background:transparent!important;border:0!important;border-radius:0!important;box-shadow:none!important;padding:0!important}',
    'html.sdc-nav-on .st .st-h{font-family:Marcellus,var(--sdc-font,inherit)!important;font-size:28px!important;line-height:36px!important;font-weight:400!important;color:#000!important;margin:0 0 12px!important}',
    'html.sdc-nav-on .st .st-b{font-size:18px!important;line-height:28px!important;color:#000!important}',
    'html.sdc-nav-on .st .st-b strong{font-weight:700!important;color:#000!important}',
    'html.sdc-nav-on .st .st-s{display:block!important;margin-top:12px!important;font-size:16px!important;line-height:24px!important;color:rgba(0,0,0,.8)!important}',
    'html.sdc-nav-on .st .st-c{display:inline-flex!important;align-items:center!important;min-height:48px!important;margin-top:24px!important;padding:0 28px!important;background:#000!important;color:#fff!important;border-radius:8px!important;font-size:16px!important;line-height:1.2!important;letter-spacing:0!important;text-transform:none!important;font-weight:400!important;text-decoration:none!important;border:0!important}',
    'html.sdc-nav-on .st .st-c:hover{background:#B564F7!important;color:#000!important}',
    'html.sdc-nav-on .st .st-c:focus-visible{outline:2px solid #B564F7!important;outline-offset:2px!important}',
    '@keyframes sdc-in{from{opacity:0}to{opacity:1}}',
    '.sdc-burger{display:none}',
    // narrow desktops: tighter spacing so the Dutch labels fit beside the logo
    '@media (min-width:' + CONFIG.phoneBelow + 'px) and (max-width:1139px){',
    '#sdc-nav .sdc-top{padding:0 6px;gap:6px}',
    '#sdc-nav a.sdc-reg{padding:0 var(--s3);margin-left:var(--s1)}',
    '.sdc-small .sdc-row{gap:var(--s4)}',
    '#sdc-nav .sdc-langli::before{left:calc(var(--s2) * -1)}',
    '}',
    '@media (prefers-reduced-motion:reduce){.sdc-drop,.sdc-panel{animation:none}.sdc-trigger svg,#sdc-nav a.sdc-reg,.sdc-panel a.sdc-reg{transition:none}}',
    // ── phone: header button ──
    '@media (max-width:' + (CONFIG.phoneBelow - 1) + 'px){',
    'html.sdc-nav-on #sdc-nav{left:auto;width:auto;flex-direction:row;align-items:center;justify-content:flex-end}',
    '#sdc-nav .sdc-small,#sdc-nav .sdc-main{display:none}',
    '#sdc-nav .sdc-burger{display:inline-flex;align-items:center;justify-content:center;width:48px;height:48px;margin-right:-8px}',
    '.sdc-bars{display:block;width:28px;position:relative;height:18px}',
    '.sdc-bars i{position:absolute;left:0;right:0;height:1px;background:currentColor}',
    '.sdc-bars i:nth-child(1){top:0}.sdc-bars i:nth-child(2){top:8px}.sdc-bars i:nth-child(3){top:16px}',
    '}',
    // ── phone: full-screen panel ──
    '.sdc-panel{position:fixed;z-index:200000;inset:0;display:flex;flex-direction:column;background:var(--sdc-bg);color:var(--sdc-color);animation:sdc-in .12s ease-out;',
    'font-family:var(--sdc-font);font-size:var(--t-md);font-weight:var(--sdc-weight);letter-spacing:var(--sdc-ls);text-transform:var(--sdc-tt);line-height:1.3}',
    '.sdc-panel a:active,.sdc-panel button:active{background:rgba(0,0,0,.06)}',
    '.sdc-ptop{flex:none;display:flex;align-items:center;justify-content:space-between;padding:0 var(--s3) 0 var(--s5);border-bottom:var(--sdc-line);min-height:64px}',
    '.sdc-ptop .sdc-lang{margin-left:calc(var(--s3) * -1)}',
    '.sdc-ptop .sdc-langbtn{min-width:var(--s7);min-height:var(--s7);font-size:var(--t-md)}',
    '.sdc-close{width:var(--s7);height:var(--s7);display:inline-flex;align-items:center;justify-content:center}',
    '.sdc-x{display:flex}',
    '.sdc-pscroll{flex:1;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;padding:var(--s2) var(--s5) var(--sdc-bottom,16px)}',
    // main view: five rows, no rules between them
    '.sdc-pnav{font-family:var(--sdc-display);font-size:var(--t-xl)}',
    '.sdc-panel .sdc-prow{display:flex;align-items:center;justify-content:space-between;width:100%;min-height:56px;padding:var(--s2) 0;text-align:left}',
    '.sdc-panel .sdc-prow svg{flex:none;opacity:.75}',
    '.sdc-pregwrap{margin:var(--s5) 0 var(--s6)}',
    '.sdc-panel a.sdc-reg-phone{display:flex;width:100%;margin-left:0;min-height:56px;font-size:var(--t-lg)!important}',
    '.sdc-psmall{font-size:var(--t-md)}',
    '.sdc-panel .sdc-plist-small{display:grid;grid-template-columns:max-content max-content;column-gap:var(--s6)}',
    '.sdc-panel .sdc-psmall a.sdc-prow-sm{min-height:44px;padding:var(--s1) 0;color:var(--sdc-quiet)!important;white-space:nowrap}',
    // sub views
    '.sdc-panel .sdc-back{display:flex;align-items:center;gap:var(--s2);min-height:var(--s7);width:100%;text-align:left;color:var(--sdc-quiet)}',
    '.sdc-bk{display:flex}',
    '.sdc-vtitle{display:block;font-family:var(--sdc-display);font-size:var(--t-xl);line-height:1.2;margin:var(--s2) 0 var(--s4)}',
    '.sdc-view .sdc-body{display:block}',
    '.sdc-view .sdc-col{margin:0}',
    '.sdc-view .sdc-col-lead{margin-bottom:var(--s5)}',
    '.sdc-panel .sdc-view ul[hidden]{display:none!important}',
    '.sdc-view .sdc-list{font-size:var(--t-lg)}',
    '.sdc-view .sdc-list a{display:flex;align-items:center;min-height:var(--s7);padding:var(--s1) 0}',
    // accordions: the only ruled rows in the phone menu
    '.sdc-view .sdc-accwrap{border-bottom:var(--sdc-line)}',
    '.sdc-view .sdc-col-lead+.sdc-accwrap{border-top:var(--sdc-line)}',
    '.sdc-panel .sdc-acc{display:flex;align-items:center;justify-content:space-between;width:100%;min-height:56px;padding:var(--s2) 0;text-align:left;font-family:var(--sdc-display);font-size:var(--t-lg)}',
    '.sdc-panel .sdc-acc .sdc-gh{display:inline;margin:0;font-size:inherit;line-height:inherit}',
    '.sdc-panel .sdc-acc svg{flex:none;opacity:.75;transition:transform .12s}',
    '.sdc-panel .sdc-acc[aria-expanded="true"] svg{transform:rotate(180deg);opacity:1}',
    '.sdc-panel .sdc-accwrap .sdc-list{padding:0 0 var(--s3) var(--s4);font-size:var(--t-md)}',
    '.sdc-panel .sdc-accwrap .sdc-list a{min-height:44px}',
    '@media (prefers-reduced-motion:reduce){.sdc-panel .sdc-acc svg{transition:none}}',
    '@media (min-width:' + CONFIG.phoneBelow + 'px){.sdc-panel{display:none!important}}'
  ].join('\n');

  /* ═══════════════ 6. start ═══════════════ */
  function weglotReady(cb, giveUpMs) {
    var done = false, t0 = Date.now();
    (function poll() {
      if (done) return;
      if (window.Weglot && Weglot.switchTo && Weglot.initialized !== false) { done = true; cb(true); return; }
      if (Date.now() - t0 > giveUpMs) { done = true; cb(false); return; }
      setTimeout(poll, 100);
    })();
  }

  /* ═══════════════ 5b. countdown in the announcement bar ═══════════════ */
  // The shared announce-bar.js is NOT changed (abcdans.com and swapnil.dance read it too). This adds its own <span> after the bar's text.
  // The dated text always stays, so the bar is complete without the countdown; the span is aria-hidden so a screen reader is not interrupted.
  // Instants are absolute (ISO with offset): the device's time zone does not matter. At or after the instant the span goes, the text stays.
  function startCountdown() {
    var stopped = false, timer = null, tries = 0, el = null, bar = null, to = NaN, lab = null;
    function nudge() { try { window.dispatchEvent(new Event('resize')); } catch (e) {} }   // announce-bar.js re-places the header on resize
    function stop() {
      stopped = true; if (timer) { clearInterval(timer); timer = null; }
      var had = !!(el && el.parentNode); if (had) el.parentNode.removeChild(el); el = null; state.cdTick = null;
      if (had) nudge();
    }
    state.cleanups.push(function () { stopped = true; if (timer) clearInterval(timer); if (el && el.parentNode) el.parentNode.removeChild(el); el = null; state.cdTick = null; });
    function fmt(ms) {
      var nl = isNl(), mins = Math.floor(ms / 60000), d = Math.floor(mins / 1440), hh = Math.floor((mins % 1440) / 60), m = mins % 60;
      if (mins < 1) return nl ? 'minder dan 1 min' : 'under 1 min';
      var parts = [];
      if (d > 0) parts.push(d + (nl ? (d === 1 ? ' dag' : ' dagen') : (d === 1 ? ' day' : ' days')));
      if (d > 0 || hh > 0) parts.push(hh + (nl ? ' uur' : ' h'));
      parts.push(m + ' min');
      var s = parts.join(' \u00b7 '), l = lab && (nl ? lab.nl : lab.en);
      return (nl ? 'nog ' : '') + s + (l ? ' ' + l : '');
    }
    function tick() {
      if (stopped) return;
      if (!bar || !bar.isConnected) { stop(); return; }
      var left = to - Date.now();
      if (!(left > 0)) { stop(); return; }
      var h0 = bar.offsetHeight, s = ' \u00b7 ' + fmt(left);
      if (el.textContent !== s) el.textContent = s;
      if (bar.offsetHeight !== h0) nudge();
    }
    function begin(msg) {
      to = Date.parse(msg.countdown_to); lab = msg.countdown_label || null;
      if (isNaN(to) || to <= Date.now() || !bar.isConnected) return;
      el = h('span', { 'class': 'sdc-cd', 'aria-hidden': 'true', 'data-wg-notranslate': true });
      bar.insertBefore(el, bar.querySelector('button') || null);
      state.cdTick = tick; tick(); nudge();
      // Any later height change of the bar (translation, fonts, narrow rotate) re-places the header, not only our own tick.
      try {
        if (window.ResizeObserver) {
          var ro = new ResizeObserver(function () { if (!stopped) nudge(); });
          ro.observe(bar);
          state.cleanups.push(function () { try { ro.disconnect(); } catch (e) {} });
        }
      } catch (e) {}
      timer = setInterval(guard(tick), 30000);
      on(doc, 'visibilitychange', function () { if (doc.visibilityState === 'visible') tick(); });
    }
    (function find() {
      if (stopped) return;
      var b = doc.querySelector('.announce-bar[data-announce-id]');
      if (b) {
        bar = b; var id = b.getAttribute('data-announce-id');
        fetch('https://links.shoonyadance.com/announcements.json').then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
          if (stopped || !d) return;
          var m = (d.shoonya || []).filter(function (x) { return x && x.id === id; })[0];
          if (m && m.countdown_to) begin(m);
        }).catch(function () {});
        return;
      }
      if (++tries < 40) setTimeout(guard(find), 500);
    })();
  }

  // Homepage only: three choices in a slim strip right under the hero (the hero video and its headline are not touched).
  // Own try/catch: if anything here fails the strip is removed and the menu itself carries on.
  var HOME_CHOICES = [
    { nl: 'Bekijk de wekelijkse lessen', en: 'See the weekly classes',
      nlh: 'https://schedule.shoonyadance.com/nl/styles/', enh: 'https://schedule.shoonyadance.com/styles/' },
    { nl: 'Probeer eerst', en: 'Try first',
      nlh: '/try-a-class', enh: '/try-a-class' },
    { nl: 'Workshops & events', en: 'Workshops & events',
      nlh: '/calendar', enh: '/calendar' }
  ];
  function homeChoices(ui, nodes) {
    var el = null;
    try {
      var path = (location.pathname || '/').replace(/\/+$/, '') || '/';
      if (!CONFIG.homeChoices) return;
      if (path !== '/' && path !== '/home') return;
      var hero = doc.querySelector('#sections > section.page-section') || doc.querySelector('main section.page-section');
      if (!hero || !hero.parentNode || hero.nextSibling === null) return;
      var cs = window.getComputedStyle(ui.root), bc = window.getComputedStyle(doc.body).color;
      el = h('section', { 'class': 'sdc-hc', 'data-wg-notranslate': true,
        style: '--sdc-font:' + cs.fontFamily + ';--sdc-color:' + (bc && !/rgba?\(255, ?255, ?255/.test(bc) ? bc : '#000') + ';--sdc-bg:#fff' });
      var inner = h('div', { 'class': 'sdc-hc-in' });
      HOME_CHOICES.forEach(function (c) {
        var d = h('div', { 'class': 'sdc-hc-d' });
        ['nl', 'en'].forEach(function (l) {
          var a = h('a', { href: c[l + 'h'], 'data-l': l }, [
            h('span', { 'class': 'sdc-hc-t' }, [h('span', { text: c[l] }), h('span', { 'class': 'sdc-hc-arr', 'aria-hidden': 'true', text: '\u2192' })])
          ]);
          d.appendChild(a);
        });
        inner.appendChild(d);
      });
      el.appendChild(inner);
      hero.parentNode.insertBefore(el, hero.nextSibling);
      nodes.push(el);
    } catch (e) {
      try { if (el && el.parentNode) el.parentNode.removeChild(el); } catch (x) {}
    }
  }

  function init() {
    var nodes = [], styleEl = null;
    try {
      var nat = readNative();
      var th = readTheme(nat);
      var model = buildModel(nat);
      /*SDC_FAULT_A*/
      var ui = build(model, nat, th);
      refresh(ui);
      styleEl = h('style', { id: 'sdc-nav-css', text: CSS });
      doc.head.appendChild(styleEl); nodes.push(styleEl);
      /*SDC_FAULT_B*/
      var inner = nat.hdr.querySelector('.header-inner');
      if (!inner) throw new Error('no .header-inner');
      inner.appendChild(ui.root); nodes.push(ui.root);
      doc.body.appendChild(ui.panel); nodes.push(ui.panel);
      state.nodes = nodes;
      wire(ui, nat);
      homeChoices(ui, nodes);
      /*SDC_FAULT_C*/
      state.report = {
        version: 'preview-2026-11-15', rows: model.rows, missing: model.missing,
        meer: (model.top.filter(function (x) { return x.id === 'meer'; })[0] || { links: [] }).links.map(function (l) { return l.href; })
      };
      window.SDC_NAV = { report: state.report, config: CONFIG, teardown: teardown };
      // LAST STEP: only now does the native menu get hidden.
      doc.documentElement.classList.add('sdc-nav-on');
      state.on = true;
      if (CONFIG.countdown) { try { startCountdown(); } catch (e) {} }   // own try: a failure here never takes the menu down
    } catch (e) {
      nodes.forEach(function (n) { if (n.parentNode) n.parentNode.removeChild(n); });
      state.nodes = []; state.cleanups.forEach(function (f) { try { f(); } catch (x) {} });
      doc.documentElement.classList.remove('sdc-nav-on', 'sdc-nolang');
      window.SDC_NAV = undefined;
      try { console.warn('[sdc-nav] not started, native menu stays:', e && e.message); } catch (x) {}
    }
  }

  // If the visitor opened the NATIVE phone menu before this script arrived, leave the native menu in charge until it is closed.
  function nativeMenuOpen() { return !!(doc.body && doc.body.classList.contains('header--menu-open')); }
  function whenNativeClosed(fn) {
    if (!nativeMenuOpen()) { fn(); return; }
    var mo = new MutationObserver(function () { if (!nativeMenuOpen()) { mo.disconnect(); fn(); } });
    mo.observe(doc.body, { attributes: true, attributeFilter: ['class'] });
  }

  function start() {
    // Wait for Weglot (the real language control) up to 6 s; without it the
    // new menu would have a dead language switch, so we do not start at all.
    weglotReady(function (ok) { if (ok) whenNativeClosed(init); else { try { console.warn('[sdc-nav] Weglot not found, native menu stays'); } catch (e) {} } }, 6000);
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', start); else start();
})();

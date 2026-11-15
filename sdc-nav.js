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

    // Addresses may be written as a path ("/faq") or a full URL. "@cta" means
    // "the address of the native header button" (today: Weekly Class Schedule).
    // fixed:true = the address is allowed to come from this config because it
    // is not a native link (each was seen answering 200 on 15 Nov 2026).
    items: [
      { id: 'classes', nl: 'Danslessen', en: 'Classes', kind: 'group',
        links: [
          { addr: '@cta', nl: 'Weekrooster', en: 'Weekly schedule' },
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
  var state = { on: false, nodes: [], observers: [], cleanups: [], report: null };
  var doc = document;

  function isNl() { return /^nl/i.test(doc.documentElement.lang || ''); }
  function t(o) { return isNl() ? o.nl : o.en; }
  function norm(s) { return (s || '').replace(/\s+/g, ' ').trim(); }

  // Same-site addresses compare by path+query, others by host+path+query.
  function keyOf(href) {
    var u;
    try { u = new URL(href, location.href); } catch (e) { return null; }
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
  var CHEV = '<svg viewBox="0 0 12 8" width="11" height="8" aria-hidden="true" focusable="false"><path d="M1 1.5l5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>';
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
    doc.documentElement.classList.remove('sdc-nav-on', 'sdc-nav-open');
    state.nodes.forEach(function (n) { if (n.parentNode) n.parentNode.removeChild(n); });
    state.observers.forEach(function (o) { try { o.disconnect(); } catch (e) {} });
    state.cleanups.forEach(function (f) { try { f(); } catch (e) {} });
    var wr = doc.getElementById('siteWrapper'); if (wr) wr.removeAttribute('inert');
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
      h('button', { type: 'button', 'class': 'sdc-close' }, [h('span', { 'class': 'sdc-x', 'aria-hidden': 'true', text: '×' }), h('span', { 'class': 'sdc-vh' }, [lbl(CONFIG.ui.close)])])]);
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
        row.insertAdjacentHTML('beforeend', '<svg viewBox="0 0 8 12" width="8" height="12" aria-hidden="true" focusable="false"><path d="M1.5 1l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>');
        var vtitle = lbl(top, 'sdc-vtitle'); var vtid = nid('vt'); vtitle.setAttribute('id', vtid);
        var back = h('button', { type: 'button', 'class': 'sdc-back' }, [h('span', { 'aria-hidden': 'true', text: '‹ ' }), lbl(CONFIG.ui.back)]);
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
      if (open) { tr.drop.hidden = false; clamp(tr.drop); } else { tr.drop.hidden = true; tr.drop.style.transform = ''; tr.pinned = false; }
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
    on(window, 'resize', function () { if (panelOpen()) { if (!mqPhone.matches) closePanel(false); else cookieOffset(); } layoutVars(); });

    /* ---- language: drive the real Weglot control ---- */
    langGroups.forEach(function (g) {
      g.querySelectorAll('button').forEach(function (b) {
        on(b, 'click', function () { var code = b.getAttribute('data-code'); if (window.Weglot && Weglot.switchTo) Weglot.switchTo(code); });
      });
    });
    var mo = new MutationObserver(guard(function () { refresh(ui); }));
    mo.observe(doc.documentElement, { attributes: true, attributeFilter: ['lang'] });
    mo.observe(nat.list, { childList: true, subtree: true, characterData: true });   // page translation of native labels
    state.observers.push(mo);
    if (window.Weglot && Weglot.on) { try { Weglot.on('languageChanged', guard(function () { refresh(ui); setTimeout(guard(function () { refresh(ui); }), 600); })); } catch (e) {} }

    /* ---- left offset next to the native logo ---- */
    function layoutVars() {
      var inner = nat.hdr.querySelector('.header-inner'), logo = nat.hdr.querySelector('.header-display-desktop .header-title-logo');
      if (!inner || !logo) return;
      var ir = inner.getBoundingClientRect(), lr = logo.getBoundingClientRect();
      if (lr.width) ui.root.style.setProperty('--sdc-left', Math.round(lr.right - ir.left + 16) + 'px');
    }
    layoutVars();
  }

  /* ═══════════════ 5. CSS ═══════════════ */
  var CSS = [
    '#sdc-nav{display:none}',
    '.sdc-panel[hidden],.sdc-drop[hidden],.sdc-view[hidden]{display:none!important}',
    // native menu: hidden but still occupying its space, so nothing moves
    'html.sdc-nav-on #header .header-nav,html.sdc-nav-on #header .header-actions,html.sdc-nav-on #header .header-burger{visibility:hidden!important}',
    'html.sdc-nav-open,html.sdc-nav-open body{overflow:hidden!important}',
    'html.sdc-nav-open [id^="boei"]{display:none!important}',
    'html.sdc-nav-on #sdc-nav{display:flex;position:absolute;z-index:3;top:0;bottom:0;right:0;left:var(--sdc-left,220px);flex-direction:column;align-items:flex-end;justify-content:space-between;',
    'font-family:var(--sdc-font);font-size:var(--sdc-size);font-weight:var(--sdc-weight);color:var(--sdc-color);letter-spacing:var(--sdc-ls);text-transform:var(--sdc-tt);line-height:1.2}',
    '#sdc-nav *,.sdc-panel *{box-sizing:border-box}',
    '#sdc-nav ul,.sdc-panel ul{list-style:none;margin:0;padding:0}',
    '#sdc-nav a,.sdc-panel a{color:var(--sdc-color)!important;font:inherit!important;letter-spacing:inherit!important;text-transform:inherit!important;text-decoration:none;background:none}',
    '#sdc-nav button,.sdc-panel button{font:inherit;letter-spacing:inherit;text-transform:inherit;color:inherit;background:none;border:0;margin:0;padding:0;cursor:pointer}',
    '#sdc-nav :focus-visible,.sdc-panel :focus-visible{outline:2px solid currentColor;outline-offset:3px}',
    '.sdc-vh{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}',
    // desktop
    '.sdc-small{height:36px;display:flex;align-items:center}',
    '.sdc-small .sdc-row{display:flex;align-items:center;gap:20px}',
    '#sdc-nav a.sdc-sm{font-size:14px!important;display:inline-flex;align-items:center;min-height:32px}',
    '.sdc-sm:hover{text-decoration:underline;text-underline-offset:3px}',
    '.sdc-lang{display:inline-flex;gap:2px;align-items:center}',
    '.sdc-langbtn{font-size:14px;min-width:32px;min-height:32px;border-radius:6px;opacity:.65}',
    '.sdc-langbtn[aria-pressed="true"]{opacity:1;text-decoration:underline;text-underline-offset:4px;text-decoration-thickness:2px}',
    '.sdc-main{flex:1;display:flex;align-items:center}',
    '.sdc-main>.sdc-row{display:flex;align-items:center;gap:6px}',
    '.sdc-item{position:relative;display:flex;align-items:center}',
    '.sdc-top{display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0 10px;white-space:nowrap}',
    '.sdc-top:hover{text-decoration:underline;text-underline-offset:4px}',
    '.sdc-trigger svg{transition:transform .15s}',
    '.sdc-trigger[aria-expanded="true"] svg{transform:rotate(180deg)}',
    '#sdc-nav a.sdc-reg,.sdc-panel a.sdc-reg{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 22px;margin-left:10px;white-space:nowrap;background:var(--sdc-btn-bg);color:var(--sdc-btn-fg)!important;border-radius:var(--sdc-btn-radius)}',
    '.sdc-reg:hover{opacity:.88}',
    '#sdc-nav .sdc-reg:focus-visible{outline-color:var(--sdc-btn-bg)}',
    '.sdc-drop{position:absolute;top:calc(100% + 6px);left:0;z-index:5;background:var(--sdc-bg);color:var(--sdc-color);padding:22px 26px;border:1px solid var(--sdc-color);border-radius:var(--sdc-btn-radius);box-shadow:0 12px 24px 0 rgba(0,0,0,.12);min-width:240px;animation:sdc-in .12s ease-out}',
    '.sdc-right .sdc-drop{left:auto;right:0}',
    '.sdc-drop .sdc-body{display:flex;gap:34px;align-items:flex-start}',
    '.sdc-drop .sdc-col{min-width:180px}',
    '.sdc-drop .sdc-col-lead{min-width:190px;padding-right:6px}',
    '.sdc-drop .sdc-list li+li{margin-top:2px}',
    '.sdc-drop .sdc-list a{display:block;padding:7px 0;white-space:nowrap}',
    '.sdc-drop .sdc-list a:hover{text-decoration:underline;text-underline-offset:3px}',
    '.sdc-gh{display:block;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;margin-bottom:6px}',
    '@keyframes sdc-in{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}',
    '.sdc-burger,.sdc-vtitle-dummy{display:none}',
    // narrow desktops: tighter spacing so the Dutch labels fit beside the logo
    '@media (min-width:' + CONFIG.phoneBelow + 'px) and (max-width:1139px){',
    '#sdc-nav .sdc-top{padding:0 5px;gap:5px;font-size:15px}',
    '.sdc-main>.sdc-row{gap:0}',
    '#sdc-nav a.sdc-reg{padding:0 14px;margin-left:6px;font-size:15px!important}',
    '.sdc-small .sdc-row{gap:14px}',
    '}',
    '@media (prefers-reduced-motion:reduce){.sdc-drop{animation:none}.sdc-trigger svg{transition:none}}',
    // phone layout
    '@media (max-width:' + (CONFIG.phoneBelow - 1) + 'px){',
    'html.sdc-nav-on #sdc-nav{left:auto;width:auto;flex-direction:row;align-items:center;justify-content:flex-end}',
    '#sdc-nav .sdc-small,#sdc-nav .sdc-main{display:none}',
    '#sdc-nav .sdc-burger{display:inline-flex;align-items:center;justify-content:center;width:48px;height:48px;margin-right:-8px}',
    '.sdc-bars{display:block;width:28px;position:relative;height:18px}',
    '.sdc-bars i{position:absolute;left:0;right:0;height:1px;background:currentColor}',
    '.sdc-bars i:nth-child(1){top:0}.sdc-bars i:nth-child(2){top:8px}.sdc-bars i:nth-child(3){top:16px}',
    '}',
    '.sdc-panel{position:fixed;z-index:200000;inset:0;display:flex;flex-direction:column;background:var(--sdc-bg);color:var(--sdc-color);',
    'font-family:var(--sdc-font);font-size:calc(var(--sdc-size) + 2px);font-weight:var(--sdc-weight);letter-spacing:var(--sdc-ls);text-transform:var(--sdc-tt);line-height:1.25}',
    '.sdc-ptop{flex:none;display:flex;align-items:center;justify-content:space-between;padding:6px 14px 6px 20px;border-bottom:1px solid var(--sdc-color);min-height:60px}',
    '.sdc-ptop .sdc-langbtn{min-width:44px;min-height:44px;font-size:16px}',
    '.sdc-close{width:48px;height:48px;display:inline-flex;align-items:center;justify-content:center}',
    '.sdc-x{font-size:34px;line-height:1}',
    '.sdc-pscroll{flex:1;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;padding:6px 20px var(--sdc-bottom,16px)}',
    '.sdc-panel .sdc-prow{display:flex;align-items:center;justify-content:space-between;width:100%;min-height:56px;padding:10px 0;text-align:left;border-bottom:1px solid var(--sdc-color)}',
    '.sdc-panel .sdc-prow-sm{min-height:44px;font-size:15px;border-bottom:0}',
    '.sdc-psmall{margin-top:6px;padding-top:4px;border-top:1px solid var(--sdc-color)}',
    '.sdc-pregwrap{margin:18px 0 12px}',
    '.sdc-panel a.sdc-reg-phone{display:flex;width:100%;margin-left:0;min-height:52px}',
    '.sdc-back{display:flex;align-items:center;min-height:48px;width:100%;text-align:left}',
    '.sdc-vtitle{display:block;font-size:calc(var(--sdc-size) + 6px);margin:6px 0 10px}',
    '.sdc-view .sdc-body{display:block}',
    '.sdc-view .sdc-col{margin-bottom:14px}',
    '.sdc-panel .sdc-view ul[hidden]{display:none!important}',
    '.sdc-view .sdc-list a{display:flex;align-items:center;min-height:48px;padding:8px 0;border-bottom:1px solid var(--sdc-color);font-size:var(--sdc-size)}',
    '.sdc-view .sdc-gh{margin:18px 0 4px}',
    '.sdc-view .sdc-accwrap{margin-bottom:0}',
    '.sdc-panel .sdc-acc{display:flex;align-items:center;justify-content:space-between;width:100%;min-height:52px;padding:8px 0;text-align:left;border-bottom:1px solid var(--sdc-color);font-size:var(--sdc-size)}',
    '.sdc-panel .sdc-acc .sdc-gh{display:inline;margin:0;font-size:inherit;font-weight:inherit;text-transform:none;letter-spacing:inherit}',
    '.sdc-panel .sdc-acc svg{flex:none;transition:transform .15s}',
    '.sdc-panel .sdc-acc[aria-expanded="true"] svg{transform:rotate(180deg)}',
    '.sdc-panel .sdc-accwrap .sdc-list{padding-left:14px}',
    '.sdc-panel .sdc-plist-small{display:grid;grid-template-columns:1fr 1fr;column-gap:16px}',
    '.sdc-panel .sdc-psmall a.sdc-prow-sm{min-height:44px;padding:4px 0;font-size:15px!important}',
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
      /*SDC_FAULT_C*/
      state.report = {
        version: 'preview-2026-11-15', rows: model.rows, missing: model.missing,
        meer: (model.top.filter(function (x) { return x.id === 'meer'; })[0] || { links: [] }).links.map(function (l) { return l.href; })
      };
      window.SDC_NAV = { report: state.report, config: CONFIG, teardown: teardown };
      // LAST STEP: only now does the native menu get hidden.
      doc.documentElement.classList.add('sdc-nav-on');
      state.on = true;
    } catch (e) {
      nodes.forEach(function (n) { if (n.parentNode) n.parentNode.removeChild(n); });
      state.nodes = []; state.cleanups.forEach(function (f) { try { f(); } catch (x) {} });
      doc.documentElement.classList.remove('sdc-nav-on');
      window.SDC_NAV = undefined;
      try { console.warn('[sdc-nav] not started, native menu stays:', e && e.message); } catch (x) {}
    }
  }

  function start() {
    // Wait for Weglot (the real language control) up to 6 s; without it the
    // new menu would have a dead language switch, so we do not start at all.
    weglotReady(function (ok) { if (ok) init(); else { try { console.warn('[sdc-nav] Weglot not found, native menu stays'); } catch (e) {} } }, 6000);
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', start); else start();
})();

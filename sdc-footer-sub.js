/* sdc-footer-sub.js — the www footer (address, link columns, social icons) on the subdomain sites. Loaded by sdc-nav-sub.js.
   Mirrors the Squarespace footer on www.shoonyadance.com (captured 17 Nov 2026). English or Dutch follows <html lang>.
   Fail-safe: the page's own footer is only hidden after the new one is in place; ?footer=old shows the old one (test switch). */
(function () {
  if (window.__sdcFooterSub) return; window.__sdcFooterSub = true;
  try {
    if (/[?&]footer=old/.test(location.search)) return;
    var WWW = 'https://www.shoonyadance.com';
    var nl = /^nl/i.test(document.documentElement.lang || '');
    var L = function (en, du) { return nl ? du : en; };
    var cols = [
      [[L('About Us', 'Over ons'), '/about'], [L('Our Studios', "Onze studio's"), '/our-studios'], [L('Calendar', 'Agenda'), '/calendar'], [L('News', 'Nieuws'), '/news']],
      [[L('Privacy Policy', 'Privacybeleid'), '/privacy-policy'], [L('FAQ', 'Veelgestelde vragen'), '/faq'], [L('House Rules', 'Huisregels'), '/house-rules'], [L('Gift voucher', 'Cadeaubon'), '/gift-voucher'], [L('Newsletter', 'Nieuwsbrief'), '/newsletter'], [L('Contact', 'Contact'), '/contact'], [L('Logos & usage', 'Logo’s & gebruik'), 'https://tickets.shoonyadance.com/brand-resources?lang=' + (nl ? 'nl' : 'en')]],
      [[L('Who is a Shoonya member?', 'Wie is lid van Shoonya?'), '/who-is-a-shoonya-member'], [L('ABC a bollywood company', 'ABC, een Bollywood-bedrijf'), 'https://www.abcbollywoodbelgium.com']]
    ];
    var ICON = {
      Instagram: '<rect x="8" y="8" width="48" height="48" rx="14" fill="none" stroke="currentColor" stroke-width="5"/><circle cx="32" cy="32" r="11" fill="none" stroke="currentColor" stroke-width="5"/><circle cx="46" cy="18" r="3.4" fill="currentColor"/>',
      Facebook: '<path fill="currentColor" d="M36 60V36h8l1.4-9H36v-5.6c0-2.6 1.3-4.4 4.6-4.4H46V9.2C45 9.1 42.3 9 39.2 9 32.6 9 28 13 28 20.4V27h-8v9h8v24z"/>',
      YouTube: '<rect x="4" y="14" width="56" height="36" rx="11" fill="currentColor"/><path d="M26 23l16 9-16 9z" fill="#000"/>',
      Spotify: '<circle cx="32" cy="32" r="26" fill="currentColor"/><path d="M17 24c10-3 22-2 31 3M18.5 33c8.5-2.4 18-1.6 25.5 2.6M20 41.5c7-2 14.5-1.3 20.5 2" fill="none" stroke="#000" stroke-width="4" stroke-linecap="round"/>'
    };
    var soc = [['Instagram', 'https://www.instagram.com/shoonyadance'], ['Facebook', 'https://www.facebook.com/shoonyadance'], ['YouTube', 'https://www.youtube.com/@shoonyadance'], ['Spotify', 'https://open.spotify.com/user/shoonyadance']];
    function abs(h) { return /^\//.test(h) ? WWW + h : h; }
    var css = '#sdc-foot{margin:0!important;border:0!important;max-width:none!important;background:#000;color:#fff;font:16px/24px "PT Serif",Georgia,serif;padding:48px 38px 48px;box-sizing:border-box;width:100%;position:relative;z-index:1}#sdc-foot *{box-sizing:border-box}#sdc-foot .sf-in{max-width:1204px;margin:0 auto;display:grid;grid-template-columns:401fr 152fr 153fr 254fr 245fr;align-items:start}#sdc-foot .sf-brand{font:400 25.2px/29.5px Marcellus,Georgia,serif;letter-spacing:-.5px;margin:0 0 48px;text-transform:uppercase;color:#fff}#sdc-foot .sf-addr{margin:0;color:#fff}#sdc-foot ul{list-style:none;margin:0;padding:0}#sdc-foot li{margin:0}#sdc-foot a{color:#f2b8b4;text-decoration:underline;text-underline-offset:3px}#sdc-foot a:hover{color:#fff}#sdc-foot .sf-soc{display:flex;gap:14px}#sdc-foot .sf-soc a{display:block;width:24px;height:24px;color:#fff;text-decoration:none}#sdc-foot .sf-soc svg{display:block;width:24px;height:24px}@media(max-width:900px){#sdc-foot .sf-in{grid-template-columns:1fr 1fr;gap:0 28px}#sdc-foot .sf-b{grid-column:1/-1}#sdc-foot .sf-brand{margin-bottom:24px}#sdc-foot .sf-addr{margin-bottom:24px}#sdc-foot .sf-c3 li{margin-top:0}#sdc-foot .sf-soc{justify-content:center}#sdc-foot .sf-c3{grid-column:1/-1;margin-top:0}#sdc-foot .sf-s{grid-column:1/-1;margin-top:24px}}@media(max-width:560px){#sdc-foot{padding:26px 23px 32px}}';
    function build() {
      if (document.getElementById('sdc-foot')) return;
      var f = document.createElement('footer'); f.id = 'sdc-foot'; f.setAttribute('role', 'contentinfo');
      var h = '<div class="sf-in"><div class="sf-b"><p class="sf-brand">Shoonya Dance VZW</p><p class="sf-addr">Stapelplein 41, 9000 Gent, Belgium</p></div>';
      cols.forEach(function (c, i) { h += '<ul class="sf-c' + (i + 1) + '">' + c.map(function (l) { return '<li><a href="' + abs(l[1]) + '"' + (/^\//.test(l[1]) ? '' : ' target="_blank" rel="noopener"') + '>' + l[0].replace(/&/g, '&amp;') + '</a></li>'; }).join('') + '</ul>'; });
      h += '<div class="sf-s sf-soc">' + soc.map(function (s) { return '<a href="' + s[1] + '" target="_blank" rel="noopener" aria-label="' + s[0] + '"><svg viewBox="0 0 64 64" aria-hidden="true">' + ICON[s[0]] + '</svg></a>'; }).join('') + '</div></div>';
      f.innerHTML = h;
      var st = document.createElement('style'); st.id = 'sdc-foot-css'; st.textContent = css; document.head.appendChild(st);
      var old = document.querySelector('footer:not(#sdc-foot)');
      if (old && old.parentNode) { old.parentNode.insertBefore(f, old); old.style.display = 'none'; old.setAttribute('data-sdc-replaced', '1'); }
      else document.body.appendChild(f);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
  } catch (err) { /* the old footer simply stays */ }
})();

// Captures the live www header (menu structure + theme) into sdc-sub-snapshot.json. Run when the www menu changes, then: node build-sub-menu.mjs

import { chromium } from 'playwright';
import fs from 'fs';
const out='.'; const b=await chromium.launch();
const c=await b.newContext({viewport:{width:1280,height:900}}); const p=await c.newPage();
await p.goto('https://www.shoonyadance.com/?x='+Date.now(),{waitUntil:'load'}); await p.waitForTimeout(9000);
const snap=await p.evaluate(()=>{
  const hdr=document.getElementById('header'); const list=hdr.querySelector('.header-display-desktop .header-nav-list')||hdr.querySelector('.header-nav-list');
  const items=[]; list.querySelectorAll('.header-nav-item').forEach(it=>{const btn=it.querySelector('button.header-nav-folder-title');if(btn){items.push({folder:true,text:btn.textContent.trim(),key:btn.getAttribute('data-href')||btn.getAttribute('aria-controls'),links:[...it.querySelectorAll('.header-nav-folder-content a[href]')].map(a=>({href:a.getAttribute('href'),text:a.textContent.trim().replace(/\s+/g,' '),target:a.getAttribute('target')}))})}else{const a=it.querySelector('a[href]');if(a)items.push({folder:false,href:a.getAttribute('href'),text:a.textContent.trim(),target:a.getAttribute('target')})}});
  const ctaA=hdr.querySelector('.header-actions-action--cta a[href]');
  const foot=[...document.querySelectorAll('footer a[href]')].map(a=>({href:a.getAttribute('href'),text:a.textContent.trim().replace(/\s+/g,' '),target:a.getAttribute('target')}));
  const navEl=hdr.querySelector('.header-nav-folder-title')||hdr.querySelector('.header-nav-item a'); const cs=el=>el?getComputedStyle(el):null; const n=cs(navEl),c=cs(ctaA),h=cs(hdr),bd=cs(document.body);
  const logo=hdr.querySelector('.header-title-logo img, .header-title img'); 
  return {items,cta:ctaA?{href:ctaA.getAttribute('href'),text:ctaA.textContent.trim(),target:ctaA.getAttribute('target')}:null,foot,
   theme:{font:n&&n.fontFamily,size:n&&n.fontSize,weight:n&&n.fontWeight,color:n&&n.color,ls:n&&n.letterSpacing,tt:n&&n.textTransform,bg:h&&h.backgroundColor,btnBg:c&&c.backgroundColor,btnFg:c&&c.color,btnRadius:c&&c.borderRadius,bodyFont:bd&&bd.fontFamily},
   logo:logo?{src:logo.currentSrc||logo.src,alt:logo.alt,w:logo.getBoundingClientRect().width,h:logo.getBoundingClientRect().height}:null,
   headerH:Math.round(hdr.getBoundingClientRect().height),
   rootExists:!!document.getElementById('sdc-nav'), bodyFontLink:[...document.querySelectorAll('link[href*=fonts]')].map(l=>l.href).slice(0,4)}});
fs.writeFileSync(out+'/sdc-sub-snapshot.json',JSON.stringify(snap,null,1)); console.log(JSON.stringify({items:snap.items.map(i=>i.text+(i.folder?'('+i.links.length+')':'')),cta:snap.cta,foot:snap.foot.length,theme:snap.theme,logo:snap.logo,headerH:snap.headerH,root:snap.rootExists,fonts:snap.bodyFontLink},null,0));
await b.close();

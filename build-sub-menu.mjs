// Builds sdc-nav-sub.js from sdc-nav-sub.template.js + sdc-sub-snapshot.json.
// To refresh the snapshot after the www menu changes: run capture-sub-snapshot.mjs (Playwright, reads the live header), then this file.
import fs from 'fs';
const snap = JSON.parse(fs.readFileSync(new URL('./sdc-sub-snapshot.json', import.meta.url), 'utf8'));
const tpl = fs.readFileSync(new URL('./sdc-nav-sub.template.js', import.meta.url), 'utf8');
const slim = { items: snap.items, cta: snap.cta, foot: snap.foot, theme: snap.theme, logo: snap.logo };
fs.writeFileSync(new URL('./sdc-nav-sub.js', import.meta.url), tpl.replace('/*SNAP*/null', JSON.stringify(slim)));
console.log('sdc-nav-sub.js written');

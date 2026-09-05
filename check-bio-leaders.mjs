#!/usr/bin/env node
/**
 * Fail the sync if the link-in-bio's visible rows lead with no workshop.
 *
 * Why: links.shoonyadance.com is the Instagram destination — the highest-traffic
 * entry point in the estate. Its ranking is `boost` first, then start date, then
 * a hard cut at VM_LIMIT. Sorting by start date buries workshops behind courses
 * that merely began earlier, so on 2026-09-05 four sellable workshops sat at
 * positions 10, 11, 13 and below, and from 10 Sep the visible rows contained no
 * workshop at all. `boost` fixes that, but a forgotten boost reproduces it
 * silently — nothing looks at a page that renders fine.
 *
 * This runs the page's own rule against its own EVENTS array. No second copy of
 * the data, nothing to keep in sync.
 *
 * Usage:  node check-bio-leaders.mjs [--at YYYY-MM-DD] [--json]
 * Exit 1 when no workshop card is above the fold.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.join(HERE, 'index.html'), 'utf8');

const atArg = process.argv.indexOf('--at');
const today = atArg > -1 ? new Date(process.argv[atArg + 1] + 'T00:00:00') : new Date();
today.setHours(0, 0, 0, 0);

const blob = html.slice(html.indexOf('const EVENTS'), html.indexOf('\n  ];', html.indexOf('const EVENTS')));
const str = (b, k) => (b.match(new RegExp(k + "\\s*:\\s*'([^']*)'")) || [])[1];

const events = [];
for (const m of blob.matchAll(/\{([^{}]|\{[^{}]*\})*?\}/gs)) {
  const b = m[0], start = str(b, 'date');
  if (!start) continue;
  const aud = str(b, 'audience');
  if (aud && aud !== 'shoonya' && aud !== 'both') continue;
  events.push({
    title: str(b, 'title') || '?', start, end: str(b, 'endDate') || start,
    url: str(b, 'url') || '', group: str(b, 'group'),
    boost: /boost\s*:\s*true/.test(b), pinned: /pinned\s*:\s*true/.test(b),
  });
}

const d = s => new Date(s + 'T00:00:00');
const live = events.filter(e => d(e.end) >= today);

const groupMin = {};
for (const e of live) if (e.group) groupMin[e.group] = Math.min(groupMin[e.group] ?? d(e.start), d(e.start));
const key = e => (e.group && groupMin[e.group] != null) ? groupMin[e.group] : +d(e.start);
live.sort((a, b) => (b.boost - a.boost) || (key(a) - key(b)) || (d(a.start) - d(b.start)));

const pinned = live.find(e => e.pinned);
const rows = [];
const seen = new Set();
for (const e of live) {                       // a group renders as ONE <li>
  if (e === pinned) continue;
  const k = e.group || e.title;
  if (seen.has(k)) continue;
  seen.add(k); rows.push(e);
}

const vmLimit = (today < new Date('2026-09-20T00:00:00')) ? 7 : 5;
const above = rows.slice(0, vmLimit);
const workshops = above.filter(e => e.url.includes('workshops.shoonyadance.com'));
const buried = rows.slice(vmLimit).filter(e => e.url.includes('workshops.shoonyadance.com'));

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ date: today.toISOString().slice(0, 10), vmLimit, above: above.map(e => e.title), workshops: workshops.length, buried: buried.map(e => e.title) }, null, 2));
  process.exit(workshops.length ? 0 : 1);
}

console.log(`bio-leaders — ${today.toISOString().slice(0, 10)}, showing ${above.length} of ${rows.length} rows (VM_LIMIT ${vmLimit})`);
above.forEach((e, i) => console.log(`  ${i + 1}. ${e.url.includes('workshops.shoonyadance.com') ? 'W' : ' '} ${e.start}  ${e.title.slice(0, 46)}`));

if (!workshops.length) {
  console.log(`\n  ✕ No workshop card is above the fold.`);
  if (buried.length) console.log(`    Buried below it: ${buried.map(e => e.title).join(', ')}`);
  console.log(`    Set boost:true on the workshop you are selling, or raise VM_LIMIT.`);
  process.exit(1);
}
console.log(`\nbio-leaders ✓ — ${workshops.length} workshop card(s) above the fold.`);

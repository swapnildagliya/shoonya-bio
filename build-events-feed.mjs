#!/usr/bin/env node
/* ─────────────────────────────────────────────────────────────────────────
   build-events-feed.mjs — events.json for the Studio TV, from this page.

   WHY THIS EXISTS
   The link-in-bio is already the one list of upcoming Shoonya events that
   somebody keeps current: it is generated from workshops.json / socials.json,
   it hides past events, and it ships on every deploy. The Studio TV board
   (projects/shoonya/tv-event-display) needs the same list as JSON. Rather
   than invent a second source that would drift within a fortnight, this
   script re-publishes THIS page's own EVENTS array as a feed next to it:

       https://links.shoonyadance.com/events.json

   Same repo, same deploy, same rsync. GitHub Pages already answers with
   `access-control-allow-origin: *`, so the TV can fetch it cross-origin.

   RUN ORDER — after inject-bios / gen-gentse-feesten / gen-bio-events and
   before the rsync. SYNC-TO-GITHUB.command does this. Running it by hand:

       node build-events-feed.mjs            # write events.json
       node build-events-feed.mjs --dry      # print it, write nothing

   WHAT IT WILL NOT DO
   It never invents a clock time. A bio entry carries `startTime`/`endTime`
   only where its own copy states them; everything else is published as a
   date with `start_known` / `end_known` false, and the board then shows the
   date without a time rather than a plausible-looking lie on a wall screen.
   ───────────────────────────────────────────────────────────────────────── */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import vm from 'node:vm';

const HERE = dirname(fileURLToPath(import.meta.url));
const DRY = process.argv.includes('--dry');
const BIO = resolve(HERE, 'index.html');
const OUT = resolve(HERE, 'events.json');
const ORIGIN = 'https://links.shoonyadance.com/';
const TZ = 'Europe/Brussels';
/* The board line contract caps the sentence under the featured event at 90
   chars (events.sample.json). Longer copy is dropped whole, never trimmed —
   half a sentence on a TV is worse than none. */
const DESC_MAX = 90;

/* ── Pull EVENTS + AUDIENCE straight out of the page ─────────────────────── */
function readBio() {
  const src = readFileSync(BIO, 'utf8');
  const events = src.match(/const EVENTS = \[[\s\S]*?\n\];/);
  const audience = src.match(/const AUDIENCE = '([^']+)';/);
  if (!events) throw new Error('EVENTS array not found in index.html — did the block get renamed?');
  if (!audience) throw new Error('AUDIENCE constant not found in index.html');
  const ctx = Object.create(null);
  vm.createContext(ctx);
  vm.runInContext(`${events[0]}\nglobalThis.__EVENTS = EVENTS;`, ctx, { timeout: 5000 });
  return { events: ctx.__EVENTS, audience: audience[1] };
}

/* ── Local wall time → an ISO stamp carrying Brussels' offset for that date ─
   The TV compares against the studio's own clock, so the offset has to be the
   real one for that day (+01:00 in winter, +02:00 in summer) — a fixed offset
   would put every event in the other half of the year an hour out. */
function offsetAt(ts) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: TZ, hour12: false,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    }).formatToParts(ts).map((x) => [x.type, x.value]),
  );
  return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute, +p.second) - ts;
}
function isoLocal(dateISO, h, m, s = 0) {
  const [Y, M, D] = dateISO.split('-').map(Number);
  const wall = Date.UTC(Y, M - 1, D, h, m, s);
  let off = offsetAt(wall);
  off = offsetAt(wall - off);          // second pass settles the DST edge cases
  const sign = off >= 0 ? '+' : '-';
  const a = Math.abs(off) / 60000;
  const p2 = (n) => String(n).padStart(2, '0');
  return `${dateISO}T${p2(h)}:${p2(m)}:${p2(s)}${sign}${p2(Math.floor(a / 60))}:${p2(a % 60)}`;
}
const hm = (t) => { const [h, m] = String(t).split(':').map(Number); return { h, m }; };
const addDay = (dateISO) => {
  const [Y, M, D] = dateISO.split('-').map(Number);
  return new Date(Date.UTC(Y, M - 1, D + 1)).toISOString().slice(0, 10);
};
const todayISO = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' })
    .format(new Date());

/* ── One bio entry → one feed entry ──────────────────────────────────────── */
function toFeed(e, today) {
  const endDate = e.endDate || e.date;
  const multiDay = endDate !== e.date;
  const live = e.date <= today;          // the bio's own pre-launch / live copy swap

  const startKnown = Boolean(e.startTime);
  const endKnown = Boolean(e.endTime);

  const st = startKnown ? hm(e.startTime) : { h: 0, m: 0 };
  const start = isoLocal(e.date, st.h, st.m);

  let end;
  if (endKnown) {
    const et = hm(e.endTime);
    /* "social till 01:00" ends the morning after it starts. Only a single-day
       event can roll like that; on a range the end time belongs to endDate. */
    const rollover = !multiDay && (et.h * 60 + et.m) <= (st.h * 60 + st.m);
    end = isoLocal(rollover ? addDay(endDate) : endDate, et.h, et.m);
  } else {
    end = isoLocal(endDate, 23, 59, 59);
  }

  const title = (live && e.titleLive) || e.title;
  const subtitle = (live && e.subtitleLive) || e.subtitle || '';
  const dateLabel = (live && e.dateLabelLive) || e.dateLabel || '';

  const out = {
    id: e.id,
    title,
    start_time: start,
    end_time: end,
    /* The three flags the board reads before it prints a clock. Without them
       an unknown time renders as 00:00 and the screen states something no
       source says (D-013b — never confirm what you have not verified). */
    start_known: startKnown,
    end_known: endKnown,
    multi_day: multiDay,
  };
  if (subtitle && subtitle.length <= DESC_MAX) out.description = subtitle;
  if (dateLabel) out.date_label = dateLabel;
  if (e.location) out.location = e.location;
  if (e.image) out.image = /^https?:/.test(e.image) ? e.image : ORIGIN + e.image.replace(/^\/+/, '');
  if (e.url) out.url = e.url;
  if (e.cta) out.cta = e.cta;
  return out;
}

/* ── Build ───────────────────────────────────────────────────────────────── */
const { events, audience } = readBio();
const today = todayISO();

const kept = events
  /* Same two filters the page itself applies, so the board and the bio can
     never disagree about what is on. */
  .filter((e) => !e.audience || e.audience === audience || e.audience === 'both')
  .filter((e) => (e.endDate || e.date) >= today)
  .map((e) => toFeed(e, today))
  .sort((a, b) => Date.parse(a.start_time) - Date.parse(b.start_time));

const payload = {
  _comment:
    'Generated by projects/shoonya/social-media/links-in-bio/build-events-feed.mjs from this page\'s own EVENTS array — do not hand-edit. Edit workshops.json / socials.json / index.html, then re-run SYNC-TO-GITHUB.command. Contract: projects/shoonya/tv-event-display/events.sample.json.',
  _times:
    'start_known / end_known say whether a real clock time was published for this event. False means only the date is known — the board must show the date without a time rather than 00:00. multi_day marks a course, festival or weekend that runs over a date range: it has no single start, so no countdown and no progress bar.',
  events: kept,
};

const json = JSON.stringify(payload, null, 2) + '\n';

/* A run that changes nothing must leave the file byte-identical, so a deploy
   diff only ever shows real programme changes. Nothing here is timestamped. */
if (DRY) {
  console.log(json);
  console.log(`[dry] ${kept.length} event(s) · ${kept.filter((e) => e.start_known).length} with a published start time`);
} else {
  let prev = null;
  try { prev = readFileSync(OUT, 'utf8'); } catch { /* first run */ }
  if (prev === json) console.log(`= events.json: no change (${kept.length} events)`);
  else { writeFileSync(OUT, json); console.log(`✓ events.json — ${kept.length} event(s)`); }
}

const vague = kept.filter((e) => !e.start_known && !e.multi_day);
if (vague.length)
  console.log(
    `  ⓘ ${vague.length} single-day event(s) publish a date but no time: ` +
    vague.map((e) => e.id).join(', ') +
    `\n    Add startTime (and endTime) at the source once the real time is confirmed — the board shows the date alone until then.`,
  );

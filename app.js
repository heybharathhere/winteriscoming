/* =========================================================================
   JALORI LINE — app.js
   State mgmt · IndexedDB · Geolocation/Orientation · Leaflet · UI routing
   ========================================================================= */
'use strict';

/* ---------------------------------------------------------------------- */
/* 1. TRIP DATA                                                            */
/* ---------------------------------------------------------------------- */
const TRIP = {
  title: 'Jalori Line',
  start: '2027-01-18',
};

const DAYS = [
  { n: 1, date: 'Mon · 18 Jan', place: 'Chandigarh', title: 'Arrival & Bike Handover',
    desc: 'Land at Chandigarh (IXC) late morning, pick up the Royal Enfield Himalayan 411 from the rental booth in Sector 42-C, sort riding gear, cash and a local SIM. Easy night in Chandigarh before the hills start tomorrow.',
    meta: ['✈ MAA–IXC 08:35–11:30', '🏍 Himalayan 411 pickup', '🌙 Chandigarh'], star: '', lat: 30.7333, lng: 76.7794 },
  { n: 2, date: 'Tue · 19 Jan', place: 'Jibhi', title: 'Ride Out to Jibhi',
    desc: 'Early start via Bilaspur → Mandi → Aut → Banjar → Jibhi. Elevation climbs fast past the Aut tunnel — watch for black ice in shaded curves from here on. Overnight in a wooden homestay above the Jibhi stream.',
    meta: ['🛣 ~245 km', '⛰ ~1650 m', '🌡 cold from Aut'], star: '', lat: 31.5333, lng: 77.3333 },
  { n: 3, date: 'Wed · 20 Jan', place: 'Shoja', title: 'Short Hop to Shoja',
    desc: 'A slow riding day — Jibhi waterfall and the old Chehni Kothi tower in the morning, then a short climb up to Shoja for wide valley views and an early prep for the Jalori push.',
    meta: ['🛣 ~16 km', '⛰ ~2400 m'], star: 'Shoja sits above the tree line — clear nights here are some of the best on the loop. Winter Triangle (Sirius/Procyon/Betelgeuse) rises early; a wide-angle lens on the homestay balcony works well before moonrise.', lat: 31.5606, lng: 77.3856 },
  { n: 4, date: 'Thu · 21 Jan', place: 'Jalori Pass', title: 'Jalori Pass & Raghupur Fort',
    desc: 'Ride to Jalori Pass, then trek on to the Raghupur Fort ruins — and the frozen Serolsar Lake trail if snowpack allows. Return to Shoja/Jibhi for the night.',
    meta: ['⛰ Jalori 3,120 m', '⛰ Raghupur 3,550 m', '🥾 trek day'], star: '', lat: 31.5228, lng: 77.3644 },
  { n: 5, date: 'Fri · 22 Jan', place: 'Tirthan Valley', title: 'Down to Tirthan Valley',
    desc: 'Descend riverside into Gushaini, Tirthan Valley — trout streams, the GHNP buffer zone, and a riverside campfire evening.',
    meta: ['🛣 ~35 km', '⛰ ~1650 m'], star: 'River valley with partial tree cover — good for a quieter, low-horizon session. Listen for the river as ambient sound while shooting long exposures.', lat: 31.6167, lng: 77.4000 },
  { n: 6, date: 'Sat · 23 Jan', place: 'Bahu', title: 'Tirthan to Bahu',
    desc: 'A deliberately quiet day — short walks around the forest village of Bahu, local dhaba food, and mountain pace with nothing to chase.',
    meta: ['🛣 ~20 km'], star: '', lat: 31.6500, lng: 77.4300 },
  { n: 7, date: 'Sun · 24 Jan', place: 'Shangarh', title: 'Onward to Shangarh',
    desc: 'Ride to Shangarh, the "mini Switzerland" meadow of Sainj Valley — ringed by deodar forest with snowline peaks behind it.',
    meta: ['🛣 ~40 km', '⛰ ~2200 m'], star: 'The best dark-sky stop on the loop — open meadow, near-zero light pollution. Orion and the winter Milky Way band are both worth the tripod.', lat: 31.6270, lng: 77.4630 },
  { n: 8, date: 'Mon · 25 Jan', place: 'Barot', title: 'Cross to Barot Valley',
    desc: 'A longer transfer through Aut → Jogindernagar to Barot — the trout hatchery, the old hydel-project heritage trail, and dense pine cover.',
    meta: ['🛣 ~110 km'], star: '', lat: 32.0450, lng: 76.8280 },
  { n: 9, date: 'Tue · 26 Jan', place: 'Chandigarh', title: 'Return to Chandigarh',
    desc: 'Ride back to Chandigarh, return the Himalayan 411, and catch the IXC → MAA return flight home.',
    meta: ['🛣 ~230 km', '✈ IXC–MAA 12:05–15:05', '🏍 bike return'], star: '', lat: 30.7333, lng: 76.7794 },
];

const MILESTONES = [
  { name: 'Chandigarh', alt: '350 m' },
  { name: 'Jibhi', alt: '1,650 m' },
  { name: 'Shoja', alt: '2,400 m' },
  { name: 'Jalori Pass', alt: '3,120 m' },
  { name: 'Raghupur Fort', alt: '3,550 m' },
  { name: 'Shangarh', alt: '2,200 m' },
  { name: 'Barot', alt: '1,900 m' },
];

const CHECKLIST_DEFAULTS = {
  bike: { label: 'Bike Spares', items: [
    'Puncture repair kit & CO2 inflator', 'Spare clutch cable', 'Engine oil (1 L, cold-rated)',
    'Tow rope / recovery strap', 'Multi-tool & tyre lever', 'Spare fuses & bulbs', 'Cable ties & insulation tape',
  ]},
  cold: { label: 'Cold Weather Gear', items: [
    'Thermal base layers (2 sets)', 'Riding jacket with liner', 'Balaclava', 'Insulated riding gloves',
    'Wool socks (3 pairs)', 'Down jacket', 'Rain cover / poncho',
  ]},
  docs: { label: 'Documents', items: [
    'Driving licence', 'Bike RC + insurance copy', 'Photo ID proof', 'Travel insurance', 'Flight ticket printout', 'Emergency contact card',
  ]},
  electronics: { label: 'Electronics', items: [
    'Power bank (20,000 mAh)', 'Phone handlebar mount', 'Headlamp + spare batteries', 'Offline maps downloaded', 'Charging cables', 'Action camera',
  ]},
};

const SCROLL_DATA = {
  fire: { label: 'Fire', icon: '🔥', entries: [
    { title: 'Dakota Fire Hole', body: 'Dig two connected holes: a narrow flue and a wider fire pit angled to feed it air from underneath. Burns hotter with less visible flame and far less smoke — useful in wind and in areas where a low profile matters.' },
    { title: 'Pine Resin Tinder', body: 'Look for hardened amber resin blisters on pine bark, or fatwood from a dead pine stump/knot. Both light even when everything else nearby is damp, and burn long enough to catch thicker kindling.' },
    { title: 'Flint & Spark', body: 'Scrape the striker down the rod at a steady, shallow angle onto tinder held close underneath. Build a loose tinder "nest" first so a single spark has somewhere to catch — don\'t strike onto bare ground.' },
  ]},
  water: { label: 'Ice', icon: '❄️', entries: [
    { title: 'Spotting Black Ice', body: 'Watch for road surface that looks slightly darker and glossier than the tarmac around it — usually in shaded curves, under tree cover, and on bridges/culverts that cool faster than open road. Reduce speed well before the shaded patch, not on it.' },
    { title: 'Cold-Start Tricks', body: 'Carbureted: let the choke fully warm the idle before moving off. Fuel-injected: a 30–60s idle lets oil circulate before load. Either way, first kilometre stays gentle — cold rubber and cold oil both need warming.' },
    { title: 'Tyre Pressure in Cold', body: 'Pressure drops roughly 1 psi per 5–6°C. Check and top up at each fuel stop through big altitude/temperature swings rather than relying on a morning reading.' },
  ]},
  earth: { label: 'Knots', icon: '⛰️', entries: [
    { title: 'Bowline', body: 'Forms a fixed loop that won\'t slip or jam under load, and still unties easily after. Good for a stable anchor point on a pannier rack or tent guy line.' },
    { title: 'Taut-Line Hitch', body: 'A sliding hitch that holds under tension but can be adjusted by hand — the standard for tent guy lines that need to be re-tensioned as ropes stretch overnight.' },
    { title: 'Trucker\'s Hitch', body: 'Creates a mechanical-advantage loop partway down a line so it can be cinched drum-tight before finishing the tie-off. The one to know for strapping luggage or a jerry can flat to the rack.' },
    { title: 'Figure-8 Loop', body: 'Quick, strong, and easy to inspect at a glance — a reliable stopper or clip-in loop when you don\'t need the bowline\'s adjustability.' },
  ]},
  air: { label: 'Altitude', icon: '🌬️', entries: [
    { title: 'AMS Symptom Tracker', body: 'Watch for headache, nausea, dizziness or unusual fatigue above ~2,500 m — Jalori and Raghupur both cross that line. Mild symptoms: stop ascending and rest. Any confusion, breathlessness at rest, or worsening symptoms: descend immediately.' },
    { title: 'Hydration Rules', body: 'Cold air masks how much moisture you\'re losing through breath and altitude. Drink on a schedule, not by thirst — small amounts often, and go easy on alcohol at the higher stops.' },
    { title: 'Descent Protocol', body: 'Descent is the only reliable treatment for worsening AMS. Losing even 300–500 m of elevation is often enough — don\'t wait for symptoms to force the decision.' },
  ]},
};

/* ---------------------------------------------------------------------- */
/* 2. STORAGE — localStorage (light state) + IndexedDB (media/links)      */
/* ---------------------------------------------------------------------- */
const LS = {
  get(key, fallback) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } },
  set(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { console.warn('LS write failed', e); } },
};

const STATE = {
  tab: LS.get('jl_lastTab', 'itinerary'),
  checklist: LS.get('jl_checklist', {}),     // { itemId: true }
  customItems: LS.get('jl_customItems', {}), // { category: [{id, text}] }
  openDay: LS.get('jl_openDay', 1),
  scrollEl: 'fire',
};

const DB_NAME = 'jalori-line-db';
const DB_VERSION = 1;
let dbPromise = null;

function openDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('links')) db.createObjectStore('links', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('media')) db.createObjectStore('media', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('journal')) db.createObjectStore('journal', { keyPath: 'id' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

async function idbAll(storeName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const req = tx.objectStore(storeName).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}
async function idbPut(storeName, value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).put(value);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
async function idbDelete(storeName, id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

/* ---------------------------------------------------------------------- */
/* 3. TOAST                                                                */
/* ---------------------------------------------------------------------- */
let toastTimer = null;
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}

/* ---------------------------------------------------------------------- */
/* 4. MODALS                                                               */
/* ---------------------------------------------------------------------- */
const modalRoot = document.getElementById('modalRoot');
function openModal(id) {
  modalRoot.classList.add('open');
  document.getElementById(id).classList.add('open');
}
function closeModals() {
  modalRoot.classList.remove('open');
  document.querySelectorAll('.modal.open').forEach(m => m.classList.remove('open'));
}
modalRoot.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-backdrop') || e.target.hasAttribute('data-close')) closeModals();
});

/* ---------------------------------------------------------------------- */
/* 5. TAB ROUTING                                                          */
/* ---------------------------------------------------------------------- */
const mainView = document.getElementById('mainView');
const renderers = {}; // tab -> function

function setTab(tab) {
  STATE.tab = tab;
  LS.set('jl_lastTab', tab);
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  mainView.innerHTML = '';
  renderers[tab] && renderers[tab]();
  window.scrollTo({ top: 0 });
}
document.querySelectorAll('.tab-btn').forEach(btn => btn.addEventListener('click', () => setTab(btn.dataset.tab)));

/* ---------------------------------------------------------------------- */
/* 6. DAY RAIL                                                             */
/* ---------------------------------------------------------------------- */
function renderDayRail() {
  const rail = document.getElementById('dayRail');
  rail.innerHTML = '';
  DAYS.forEach(d => {
    const pip = document.createElement('button');
    pip.className = 'day-rail__pip' + (STATE.openDay === d.n ? ' active' : '');
    pip.textContent = String(d.n).padStart(2, '0');
    pip.title = d.place;
    pip.addEventListener('click', () => {
      STATE.openDay = d.n;
      LS.set('jl_openDay', d.n);
      if (STATE.tab !== 'itinerary') setTab('itinerary'); else renderItinerary();
      renderDayRail();
      const card = document.querySelector(`.day-card[data-day="${d.n}"]`);
      card && card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    rail.appendChild(pip);
  });
}

/* ---------------------------------------------------------------------- */
/* 7. ITINERARY TAB                                                        */
/* ---------------------------------------------------------------------- */
async function renderItinerary() {
  const wrap = document.createElement('div');
  wrap.className = 'fade-in';
  wrap.innerHTML = `<div class="section-title">9-Day Route · Chandigarh Loop</div>`;
  mainView.appendChild(wrap);

  const links = await idbAll('links');

  for (const d of DAYS) {
    const tpl = document.getElementById('tpl-day-card').content.cloneNode(true);
    const card = tpl.querySelector('.day-card');
    card.dataset.day = d.n;
    if (d.n === STATE.openDay) card.classList.add('open');

    card.querySelector('.day-card__badge').textContent = String(d.n).padStart(2, '0');
    card.querySelector('.day-card__date').textContent = d.date;
    card.querySelector('.day-card__title').textContent = d.title;
    card.querySelector('.day-card__route').textContent = d.place;
    card.querySelector('.day-card__desc').textContent = d.desc;

    const meta = card.querySelector('.day-card__meta');
    d.meta.forEach(m => {
      const p = document.createElement('span');
      p.className = 'meta-pill';
      p.textContent = m;
      meta.appendChild(p);
    });

    const starEl = card.querySelector('.day-card__stargazing');
    if (d.star) {
      starEl.classList.add('has-content');
      starEl.innerHTML = `✨ <strong>Stargazing —</strong> ${d.star}`;
    }

    const linksWrap = card.querySelector('.day-card__links');
    links.filter(l => l.dayId === d.n).forEach(l => linksWrap.appendChild(buildLinkChip(l)));

    card.querySelector('.day-card__head').addEventListener('click', () => {
      const willOpen = !card.classList.contains('open');
      card.classList.toggle('open', willOpen);
      if (willOpen) { STATE.openDay = d.n; LS.set('jl_openDay', d.n); renderDayRail(); }
    });

    card.querySelector('.link-add-btn').addEventListener('click', () => {
      document.getElementById('linkLabelInput').value = '';
      document.getElementById('linkUrlInput').value = '';
      document.getElementById('linkSaveBtn').dataset.dayId = d.n;
      openModal('modal-link');
    });

    mainView.appendChild(card);
  }
}

function buildLinkChip(l) {
  const tpl = document.getElementById('tpl-link-chip').content.cloneNode(true);
  const chip = tpl.querySelector('.link-chip');
  chip.href = l.url;
  chip.querySelector('.link-chip__label').textContent = l.label;
  chip.querySelector('.link-chip__del').addEventListener('click', async (e) => {
    e.preventDefault(); e.stopPropagation();
    await idbDelete('links', l.id);
    chip.remove();
    toast('Link removed');
  });
  return chip;
}

document.getElementById('linkSaveBtn').addEventListener('click', async (e) => {
  const label = document.getElementById('linkLabelInput').value.trim();
  let url = document.getElementById('linkUrlInput').value.trim();
  if (!label || !url) { toast('Add a label and a URL'); return; }
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  const dayId = Number(e.target.dataset.dayId);
  const record = { id: uid(), dayId, label, url, created: Date.now() };
  await idbPut('links', record);
  closeModals();
  toast('Link saved');
  if (STATE.tab === 'itinerary') renderItinerary();
});

/* ---------------------------------------------------------------------- */
/* 8. CHECKLIST TAB                                                        */
/* ---------------------------------------------------------------------- */
function allChecklistEntries(cat) {
  const base = CHECKLIST_DEFAULTS[cat].items.map((text, i) => ({ id: `${cat}_d${i}`, text, custom: false }));
  const custom = (STATE.customItems[cat] || []).map(it => ({ id: it.id, text: it.text, custom: true }));
  return [...base, ...custom];
}

function renderChecklist() {
  const wrap = document.createElement('div');
  wrap.className = 'fade-in';
  wrap.innerHTML = `<div class="section-title">Expedition Checklist</div>`;
  mainView.appendChild(wrap);

  Object.keys(CHECKLIST_DEFAULTS).forEach(cat => {
    const entries = allChecklistEntries(cat);
    const doneCount = entries.filter(it => STATE.checklist[it.id]).length;

    const catWrap = document.createElement('div');
    catWrap.className = 'checklist-cat';
    catWrap.innerHTML = `
      <div class="checklist-cat__head">
        <span>${CHECKLIST_DEFAULTS[cat].label}</span>
        <span class="checklist-cat__progress">${doneCount}/${entries.length}</span>
      </div>
      <ul class="check-list" data-cat="${cat}"></ul>
    `;
    const list = catWrap.querySelector('.check-list');
    entries.forEach(it => list.appendChild(buildCheckItem(cat, it)));
    mainView.appendChild(catWrap);
  });

  const addRow = document.createElement('button');
  addRow.className = 'link-add-btn';
  addRow.style.marginTop = '4px';
  addRow.textContent = '+ Add packing item';
  addRow.addEventListener('click', () => {
    document.getElementById('checkItemInput').value = '';
    openModal('modal-checklist-add');
  });
  mainView.appendChild(addRow);
}

function buildCheckItem(cat, item) {
  const tpl = document.getElementById('tpl-checklist-item').content.cloneNode(true);
  const li = tpl.querySelector('.check-item');
  const done = !!STATE.checklist[item.id];
  li.classList.toggle('done', done);
  li.querySelector('.check-label__text').textContent = item.text;

  li.querySelector('.check-box').addEventListener('click', () => {
    const nowDone = !STATE.checklist[item.id];
    STATE.checklist[item.id] = nowDone;
    LS.set('jl_checklist', STATE.checklist);
    li.classList.toggle('done', nowDone);
    updateCategoryProgress(cat);
  });

  const delBtn = li.querySelector('.check-del');
  if (item.custom) {
    delBtn.addEventListener('click', () => {
      STATE.customItems[cat] = (STATE.customItems[cat] || []).filter(x => x.id !== item.id);
      LS.set('jl_customItems', STATE.customItems);
      delete STATE.checklist[item.id];
      LS.set('jl_checklist', STATE.checklist);
      li.remove();
      updateCategoryProgress(cat);
    });
  } else {
    delBtn.remove();
  }
  return li;
}

function updateCategoryProgress(cat) {
  const entries = allChecklistEntries(cat);
  const doneCount = entries.filter(it => STATE.checklist[it.id]).length;
  const progressEl = document.querySelector(`.check-list[data-cat="${cat}"]`)?.closest('.checklist-cat')?.querySelector('.checklist-cat__progress');
  if (progressEl) progressEl.textContent = `${doneCount}/${entries.length}`;
}

document.getElementById('checkAddBtn').addEventListener('click', () => {
  const cat = document.getElementById('checkCategorySelect').value;
  const text = document.getElementById('checkItemInput').value.trim();
  if (!text) { toast('Enter an item name'); return; }
  STATE.customItems[cat] = STATE.customItems[cat] || [];
  STATE.customItems[cat].push({ id: uid(), text });
  LS.set('jl_customItems', STATE.customItems);
  closeModals();
  toast('Item added');
  if (STATE.tab === 'checklist') renderChecklist();
});

/* ---------------------------------------------------------------------- */
/* 9. FIELD TAB — compass, altimeter, GPS map                              */
/* ---------------------------------------------------------------------- */
let leafletMap = null, leafletBeacon = null, watchId = null, orientationBound = false;

function renderField() {
  const wrap = document.createElement('div');
  wrap.className = 'fade-in';
  wrap.innerHTML = `
    <div class="section-title">Field Sensors</div>

    <div class="field-card compass-wrap">
      <svg class="compass-dial" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="94" fill="none" stroke="#334155" stroke-width="1.5"/>
        <circle cx="100" cy="100" r="70" fill="none" stroke="#1e293b" stroke-width="1"/>
        <g id="compassTicks"></g>
        <g id="compassLabels" font-family="IBM Plex Mono" font-size="11" fill="#94A3B8" text-anchor="middle"></g>
        <g id="compassNeedle">
          <polygon points="100,26 108,100 100,92 92,100" fill="#FB923C"/>
          <polygon points="100,174 108,100 100,108 92,100" fill="#475569"/>
        </g>
        <circle cx="100" cy="100" r="5" fill="#F1F5F9"/>
      </svg>
      <div class="compass-readout"><span id="compassDeg">--°</span><small id="compassCardinal">Tap enable to start</small></div>
      <button class="perm-btn" id="enableCompassBtn">Enable Compass</button>
    </div>

    <div class="field-card">
      <div class="stat-grid">
        <div class="stat-box"><div class="stat-box__val" id="altM">--</div><div class="stat-box__label">Altitude (m)</div></div>
        <div class="stat-box"><div class="stat-box__val" id="altFt">--</div><div class="stat-box__label">Altitude (ft)</div></div>
        <div class="stat-box"><div class="stat-box__val" id="gpsAcc">--</div><div class="stat-box__label">GPS Accuracy (m)</div></div>
        <div class="stat-box"><div class="stat-box__val" id="gpsSpeed">--</div><div class="stat-box__label">Speed (km/h)</div></div>
      </div>
      <button class="perm-btn" id="enableGpsBtn" style="margin-top:12px;">Enable Live GPS</button>
      <p class="map-tile-status">Altitude uses device GPS; treat as ±20–50 m without a barometric sensor.</p>
      <div class="milestone-list">
        ${MILESTONES.map(m => `<div class="milestone"><span class="milestone__name">${m.name}</span><span class="milestone__alt">${m.alt}</span></div>`).join('')}
      </div>
    </div>

    <div class="field-card">
      <div class="section-title" style="margin-bottom:8px;">Offline Route Map</div>
      <div id="leafletMap"></div>
      <p class="map-tile-status" id="tileStatus">Tiles cache automatically as you view them — revisit each area once online.</p>
    </div>
  `;
  mainView.appendChild(wrap);
  drawCompassTicks();
  initMap();

  document.getElementById('enableCompassBtn').addEventListener('click', enableCompass);
  document.getElementById('enableGpsBtn').addEventListener('click', enableGps);
}

function drawCompassTicks() {
  const ticks = document.getElementById('compassTicks');
  const labels = document.getElementById('compassLabels');
  if (!ticks) return;
  const dirs = [['N', 0], ['E', 90], ['S', 180], ['W', 270]];
  for (let deg = 0; deg < 360; deg += 10) {
    const major = deg % 90 === 0;
    const len = major ? 14 : 7;
    const rad = (deg - 90) * Math.PI / 180;
    const x1 = 100 + Math.cos(rad) * 94, y1 = 100 + Math.sin(rad) * 94;
    const x2 = 100 + Math.cos(rad) * (94 - len), y2 = 100 + Math.sin(rad) * (94 - len);
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1); line.setAttribute('y1', y1);
    line.setAttribute('x2', x2); line.setAttribute('y2', y2);
    line.setAttribute('stroke', major ? '#7DD3FC' : '#334155');
    line.setAttribute('stroke-width', major ? 2 : 1);
    ticks.appendChild(line);
  }
  dirs.forEach(([label, deg]) => {
    const rad = (deg - 90) * Math.PI / 180;
    const x = 100 + Math.cos(rad) * 78, y = 100 + Math.sin(rad) * 78;
    const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    t.setAttribute('x', x); t.setAttribute('y', y + 4);
    t.textContent = label;
    labels.appendChild(t);
  });
}

function enableCompass() {
  const start = () => {
    orientationBound = true;
    toast('Compass enabled');
    window.addEventListener('deviceorientationabsolute', handleOrientation, true);
    window.addEventListener('deviceorientation', handleOrientation, true);
  };
  if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
    DeviceOrientationEvent.requestPermission().then(state => {
      if (state === 'granted') start(); else toast('Compass permission denied');
    }).catch(() => toast('Compass unavailable'));
  } else if ('DeviceOrientationEvent' in window) {
    start();
  } else {
    toast('No orientation sensor on this device');
  }
}

function handleOrientation(e) {
  let heading = e.webkitCompassHeading != null ? e.webkitCompassHeading : (e.alpha != null ? 360 - e.alpha : null);
  if (heading == null || isNaN(heading)) return;
  heading = (heading + 360) % 360;
  const needle = document.getElementById('compassNeedle');
  if (needle) needle.setAttribute('transform', `rotate(${-heading} 100 100)`);
  const degEl = document.getElementById('compassDeg');
  const cardEl = document.getElementById('compassCardinal');
  if (degEl) degEl.textContent = `${Math.round(heading)}°`;
  if (cardEl) cardEl.textContent = headingToCardinal(heading);
}

function headingToCardinal(h) {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return dirs[Math.round(h / 22.5) % 16];
}

function enableGps() {
  if (!navigator.geolocation) { toast('Geolocation unavailable'); return; }
  if (watchId != null) { navigator.geolocation.clearWatch(watchId); watchId = null; }
  watchId = navigator.geolocation.watchPosition(handlePosition, (err) => {
    toast('GPS error: ' + err.message);
  }, { enableHighAccuracy: true, maximumAge: 3000, timeout: 15000 });
  toast('Live GPS started');
}

function handlePosition(pos) {
  const { latitude, longitude, altitude, accuracy, speed } = pos.coords;
  const altM = document.getElementById('altM'), altFt = document.getElementById('altFt');
  const gpsAcc = document.getElementById('gpsAcc'), gpsSpeed = document.getElementById('gpsSpeed');
  if (altM) altM.textContent = altitude != null ? Math.round(altitude) : '--';
  if (altFt) altFt.textContent = altitude != null ? Math.round(altitude * 3.28084) : '--';
  if (gpsAcc) gpsAcc.textContent = accuracy != null ? Math.round(accuracy) : '--';
  if (gpsSpeed) gpsSpeed.textContent = speed != null && speed >= 0 ? Math.round(speed * 3.6) : '--';

  if (leafletMap && window.L) {
    if (!leafletBeacon) {
      const icon = L.divIcon({ className: '', html: '<div class="you-are-here-beacon"></div>', iconSize: [16, 16] });
      leafletBeacon = L.marker([latitude, longitude], { icon }).addTo(leafletMap).bindPopup('You are here');
    } else {
      leafletBeacon.setLatLng([latitude, longitude]);
    }
  }
}

function initMap() {
  if (!window.L) return;
  const el = document.getElementById('leafletMap');
  if (!el) return;
  leafletMap = L.map(el, { zoomControl: true }).setView([31.4, 77.2], 9);

  const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 16,
  });
  tileLayer.addTo(leafletMap);

  const bounds = L.latLngBounds(DAYS.map(d => [d.lat, d.lng]));
  leafletMap.fitBounds(bounds.pad(0.25));

  const routeLine = L.polyline(DAYS.map(d => [d.lat, d.lng]), { color: '#38BDF8', weight: 3, dashArray: '6 6' }).addTo(leafletMap);

  DAYS.forEach(d => {
    const icon = L.divIcon({
      className: '',
      html: `<div style="background:#FB923C;color:#1a1006;font-family:IBM Plex Mono,monospace;font-weight:700;font-size:11px;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #fff;">${d.n}</div>`,
      iconSize: [22, 22],
    });
    L.marker([d.lat, d.lng], { icon }).addTo(leafletMap).bindPopup(`<strong>Day ${d.n} · ${d.place}</strong><br>${d.title}`);
  });

  let tilesLoaded = 0;
  tileLayer.on('load', () => {
    tilesLoaded++;
    const status = document.getElementById('tileStatus');
    if (status) status.textContent = `Map tiles cached for offline use in this area.`;
  });
}

/* ---------------------------------------------------------------------- */
/* 10. WAYFARER'S SCROLL TAB                                               */
/* ---------------------------------------------------------------------- */
function renderScroll() {
  const wrap = document.createElement('div');
  wrap.className = 'fade-in scroll-shell';
  wrap.innerHTML = `
    <div class="scroll-title">The Wayfarer's Scroll</div>
    <div class="scroll-sub">field wisdom for the high passes</div>
    <div class="element-tabs">
      ${Object.entries(SCROLL_DATA).map(([key, el]) => `<button class="element-tab" data-el="${key}">${el.icon}<br>${el.label}</button>`).join('')}
    </div>
    <div id="scrollEntries"></div>
  `;
  mainView.appendChild(wrap);
  renderScrollEntries(STATE.scrollEl);
  wrap.querySelectorAll('.element-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      STATE.scrollEl = btn.dataset.el;
      renderScrollEntries(STATE.scrollEl);
      wrap.querySelectorAll('.element-tab').forEach(b => b.classList.toggle('active', b.dataset.el === STATE.scrollEl));
    });
  });
  wrap.querySelectorAll('.element-tab').forEach(b => b.classList.toggle('active', b.dataset.el === STATE.scrollEl));
}

function renderScrollEntries(elKey) {
  const container = document.getElementById('scrollEntries');
  const data = SCROLL_DATA[elKey];
  container.innerHTML = data.entries.map(en => `
    <div class="scroll-entry">
      <div class="scroll-entry__title">${data.icon} ${en.title}</div>
      <div class="scroll-entry__body">${en.body}</div>
    </div>
  `).join('');
}

/* ---------------------------------------------------------------------- */
/* 11. JOURNAL & GALLERY TAB                                               */
/* ---------------------------------------------------------------------- */
async function renderJournal() {
  const wrap = document.createElement('div');
  wrap.className = 'fade-in';
  wrap.innerHTML = `
    <div class="section-title">Expedition Journal</div>
    <button class="link-add-btn" id="newCheckinBtn" style="margin-bottom:14px;">+ New check-in</button>
    <div id="journalList"></div>
    <div class="section-title" style="margin-top:22px;">Media Gallery</div>
    <div class="gallery-grid" id="galleryGrid"></div>
    <div class="empty-state" id="galleryEmpty" style="display:none;">No photos or clips yet — tap the camera button to add your first one.</div>
  `;
  mainView.appendChild(wrap);

  const daySelect = document.getElementById('journalDaySelect');
  daySelect.innerHTML = DAYS.map(d => `<option value="${d.n}">Day ${d.n} · ${d.place}</option>`).join('');

  document.getElementById('newCheckinBtn').addEventListener('click', () => {
    document.getElementById('journalLocInput').value = '';
    document.getElementById('journalNoteInput').value = '';
    openModal('modal-journal-add');
  });

  const entries = (await idbAll('journal')).sort((a, b) => b.created - a.created);
  const list = document.getElementById('journalList');
  if (!entries.length) {
    list.innerHTML = `<div class="empty-state">No check-ins logged yet.</div>`;
  } else {
    entries.forEach(en => {
      const tpl = document.getElementById('tpl-journal-entry').content.cloneNode(true);
      tpl.querySelector('.journal-entry__day').textContent = `DAY ${en.dayId}`;
      tpl.querySelector('.journal-entry__time').textContent = new Date(en.created).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      tpl.querySelector('.journal-entry__loc').textContent = en.location || '';
      tpl.querySelector('.journal-entry__note').textContent = en.note || '';
      list.appendChild(tpl);
    });
  }

  const media = (await idbAll('media')).sort((a, b) => b.created - a.created);
  const grid = document.getElementById('galleryGrid');
  document.getElementById('galleryEmpty').style.display = media.length ? 'none' : 'block';
  media.forEach(m => grid.appendChild(buildGalleryItem(m)));

  ensureFab();
}

function buildGalleryItem(m) {
  const tpl = document.getElementById('tpl-gallery-item').content.cloneNode(true);
  const fig = tpl.querySelector('.gallery-item');
  const isVideo = m.type && m.type.startsWith('video');
  fig.classList.toggle('is-video', !!isVideo);
  const url = URL.createObjectURL(m.blob);
  if (isVideo) {
    const v = fig.querySelector('video');
    v.src = url;
  } else {
    fig.querySelector('img').src = url;
  }
  fig.querySelector('figcaption').textContent = m.caption || `Day ${m.dayId}`;
  fig.addEventListener('click', () => {
    const content = document.getElementById('lightboxContent');
    content.innerHTML = isVideo
      ? `<video src="${url}" controls autoplay playsinline></video>`
      : `<img src="${url}" alt="" />`;
    document.getElementById('lightboxCaption').textContent = `${m.caption || ''} — Day ${m.dayId} · ${new Date(m.created).toLocaleDateString()}`;
    openModal('modal-lightbox');
  });
  return fig;
}

document.getElementById('journalSaveBtn').addEventListener('click', async () => {
  const dayId = Number(document.getElementById('journalDaySelect').value);
  const location = document.getElementById('journalLocInput').value.trim();
  const note = document.getElementById('journalNoteInput').value.trim();
  if (!location && !note) { toast('Add a location or a note'); return; }
  await idbPut('journal', { id: uid(), dayId, location, note, created: Date.now() });
  closeModals();
  toast('Check-in logged');
  if (STATE.tab === 'journal') renderJournal();
});

function ensureFab() {
  if (document.getElementById('mediaFab')) return;
  const fab = document.createElement('button');
  fab.id = 'mediaFab';
  fab.className = 'fab';
  fab.innerHTML = `<svg viewBox="0 0 24 24" width="24" height="24"><path fill="#1a1006" d="M9 3l-1.5 2H4a1 1 0 00-1 1v13a1 1 0 001 1h16a1 1 0 001-1V6a1 1 0 00-1-1h-3.5L15 3H9zm3 5a5 5 0 110 10 5 5 0 010-10zm0 2a3 3 0 100 6 3 3 0 000-6z"/></svg>`;
  fab.addEventListener('click', () => document.getElementById('mediaFileInput').click());
  document.body.appendChild(fab);
}
function removeFab() {
  const fab = document.getElementById('mediaFab');
  if (fab) fab.remove();
}

document.getElementById('mediaFileInput').addEventListener('change', async (e) => {
  const files = Array.from(e.target.files || []);
  for (const file of files) {
    await idbPut('media', { id: uid(), blob: file, type: file.type, dayId: STATE.openDay, caption: '', created: Date.now() });
  }
  e.target.value = '';
  if (files.length) { toast(`${files.length} item(s) added`); if (STATE.tab === 'journal') renderJournal(); }
});

/* ---------------------------------------------------------------------- */
/* 12. WIRE UP RENDERERS + TAB TEARDOWN                                    */
/* ---------------------------------------------------------------------- */
renderers.itinerary = renderItinerary;
renderers.checklist = renderChecklist;
renderers.field = renderField;
renderers.scroll = renderScroll;
renderers.journal = renderJournal;

const originalSetTab = setTab;
window.setTab = function (tab) {
  if (STATE.tab !== 'journal') removeFab();
  originalSetTab(tab);
};
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.replaceWith(btn.cloneNode(true)); // clear old listener
});
document.querySelectorAll('.tab-btn').forEach(btn => btn.addEventListener('click', () => window.setTab(btn.dataset.tab)));

/* ---------------------------------------------------------------------- */
/* 13. CONNECTIVITY PILL                                                   */
/* ---------------------------------------------------------------------- */
function updateConnPill() {
  const pill = document.getElementById('connStatus');
  const online = navigator.onLine;
  pill.classList.toggle('offline', !online);
  pill.querySelector('.txt').textContent = online ? 'ONLINE' : 'OFFLINE MODE';
}
window.addEventListener('online', updateConnPill);
window.addEventListener('offline', updateConnPill);

/* ---------------------------------------------------------------------- */
/* 14. PWA INSTALL PROMPT                                                  */
/* ---------------------------------------------------------------------- */
let deferredInstallPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  document.getElementById('installBtn').classList.remove('hidden');
});
document.getElementById('installBtn').addEventListener('click', async () => {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  document.getElementById('installBtn').classList.add('hidden');
});

/* ---------------------------------------------------------------------- */
/* 15. SERVICE WORKER REGISTRATION                                         */
/* ---------------------------------------------------------------------- */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(err => console.warn('SW registration failed', err));
  });
}

/* ---------------------------------------------------------------------- */
/* 16. INIT                                                                 */
/* ---------------------------------------------------------------------- */
renderDayRail();
updateConnPill();
setTab(STATE.tab);

/**
 * TravelTie — modals.js  (v2 — full fix)
 * ─────────────────────────────────────────
 * Renders Saved Places + Saved Calculations modals.
 * Injects its own <style> block once so styles are guaranteed
 * regardless of main.css load order or cascade conflicts.
 * Exposes: window.TTModals = { openSavedPlaces, openSavedCalcs }
 */

/* ═══════════════════════════════════════════════════════════
   INJECT CRITICAL CSS (once, on first load)
═══════════════════════════════════════════════════════════ */
(function injectModalCSS() {
  if (document.getElementById('tt-modals-style')) return;
  const s = document.createElement('style');
  s.id = 'tt-modals-style';
  s.textContent = `
/* ── Modal overlay / container ── */
.modal-overlay{position:fixed;inset:0;background:rgba(10,22,40,.62);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);z-index:99990;display:flex;align-items:center;justify-content:center;padding:16px;opacity:0;visibility:hidden;transition:opacity .3s,visibility .3s}
.modal-overlay.active{opacity:1;visibility:visible}
.modal-container{background:#fff;border-radius:24px;width:100%;max-width:520px;max-height:88vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 32px 80px rgba(10,22,40,.35);transform:scale(.95) translateY(20px);transition:transform .35s cubic-bezier(.34,1.56,.64,1)}
.modal-overlay.active .modal-container{transform:scale(1) translateY(0)}
.modal-header{display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border-bottom:1px solid #e2e8f0;background:linear-gradient(135deg,#0a1628,#1e3a5f);flex-shrink:0}
.modal-header h3{font-family:'DM Serif Display',Georgia,serif;font-size:1.3rem;color:#fff;display:flex;align-items:center;gap:10px;margin:0}
.modal-header h3 i{color:#f87171}
.modal-close{width:36px;height:36px;border-radius:50%;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.1);color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:1rem;transition:background .22s,transform .22s;flex-shrink:0}
.modal-close:hover{background:rgba(255,255,255,.22);transform:rotate(90deg)}
.modal-body{flex:1;overflow-y:auto;overflow-x:hidden;padding:20px 22px 32px;scroll-behavior:smooth;overscroll-behavior:contain;-webkit-overflow-scrolling:touch}

/* ── States ── */
.tt-loading-state{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:56px 20px;text-align:center;color:#64748b;gap:12px}
.tt-loading-state p{margin:0;font-size:.9rem}
.tt-empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:44px 20px;text-align:center}
.tt-empty-icon{width:72px;height:72px;border-radius:50%;background:#f1f5f9;display:flex;align-items:center;justify-content:center;margin-bottom:18px}
.tt-empty-icon i{font-size:2rem;color:#94a3b8}
.tt-empty-state h4{font-family:'DM Serif Display',Georgia,serif;font-size:1.1rem;color:#0a1628;margin:0 0 8px}
.tt-empty-state p{font-size:.875rem;color:#64748b;line-height:1.6;margin:0 0 20px;max-width:280px}
.tt-btn-primary{display:inline-flex;align-items:center;gap:8px;padding:12px 24px;background:#0a1628;color:#fff;border:none;border-radius:9999px;font-weight:600;font-size:.875rem;cursor:pointer;transition:background .22s,transform .22s;font-family:'DM Sans',system-ui,sans-serif;text-decoration:none}
.tt-btn-primary:hover{background:#2563eb;transform:translateY(-2px)}

/* ── Place list cards ── */
.tt-modal-list{display:flex;flex-direction:column;gap:10px}
.tt-place-card{display:flex;align-items:center;gap:14px;padding:14px 16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;cursor:pointer;transition:background .2s,border-color .2s,box-shadow .2s,transform .2s}
.tt-place-card:hover{background:#fff;border-color:#2563eb;box-shadow:0 4px 16px rgba(37,99,235,.1);transform:translateX(3px)}
.tt-place-card:focus-visible{outline:2px solid #2563eb;outline-offset:2px}
.tt-place-thumb{width:62px;height:62px;border-radius:12px;overflow:hidden;flex-shrink:0;box-shadow:0 2px 8px rgba(0,0,0,.1);background:#e2e8f0}
.tt-place-thumb img{width:100%;height:100%;object-fit:cover;display:block}
.tt-place-info{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}
.tt-place-name{font-size:.975rem;font-weight:700;color:#0a1628;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tt-place-meta{font-size:.78rem;color:#64748b;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.tt-place-meta span{display:inline-flex;align-items:center;gap:4px}
.tt-place-meta i{color:#2563eb;font-size:.68rem}
.tt-place-meta .fa-star{color:#f59e0b}
.tt-place-actions{display:flex;flex-direction:column;gap:6px;flex-shrink:0}
.tt-place-btn{width:36px;height:36px;border:none;border-radius:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:.85rem;transition:background .2s,color .2s,transform .2s}
.tt-place-btn-detail{background:#0a1628;color:#fff}
.tt-place-btn-detail:hover{background:#2563eb;transform:scale(1.08)}
.tt-place-btn-remove{background:#f1f5f9;color:#94a3b8}
.tt-place-btn-remove:hover{background:#fee2e2;color:#dc2626;transform:scale(1.08)}

/* ── Detail view ── */
.tt-detail-view{display:flex;flex-direction:column;gap:16px;animation:ttFadeUp .25s ease}
@keyframes ttFadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}

/* Back button */
.tt-back-btn{display:inline-flex;align-items:center;gap:7px;padding:9px 18px;background:#f1f5f9;border:1.5px solid #e2e8f0;border-radius:9999px;font-size:.82rem;font-weight:600;color:#0a1628;cursor:pointer;font-family:'DM Sans',system-ui,sans-serif;white-space:nowrap;flex-shrink:0;align-self:flex-start;transition:background .2s,border-color .2s,color .2s,transform .2s,box-shadow .2s;line-height:1}
.tt-back-btn:hover{background:#eff6ff;border-color:#2563eb;color:#2563eb;transform:translateX(-3px);box-shadow:0 2px 8px rgba(37,99,235,.13)}
.tt-back-btn i{font-size:.72rem;flex-shrink:0}

/* Hero */
.tt-hero-img{position:relative;width:100%;height:210px;border-radius:14px;overflow:hidden;background:#e2e8f0;box-shadow:0 4px 16px rgba(0,0,0,.1);flex-shrink:0}
.tt-hero-img img{width:100%;height:100%;object-fit:cover;display:block}
.tt-hero-overlay{position:absolute;bottom:10px;left:10px;right:10px;display:flex;align-items:center;justify-content:space-between;pointer-events:none}
.tt-hero-badge{padding:5px 12px;border-radius:9999px;font-size:.7rem;font-weight:700;color:#fff;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
.tt-hero-badge.budget{background:#10b981}
.tt-hero-badge.moderate{background:rgba(10,22,40,.75)}
.tt-hero-badge.luxury{background:#0a1628}
.tt-hero-rating{display:inline-flex;align-items:center;gap:5px;padding:5px 12px;border-radius:9999px;font-size:.78rem;font-weight:700;color:#fff;background:rgba(245,158,11,.92);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
.tt-hero-rating i{font-size:.65rem}

/* Title / location */
.tt-detail-head{display:flex;flex-direction:column;gap:4px}
.tt-detail-title{font-family:'DM Serif Display',Georgia,serif;font-size:1.45rem;color:#0a1628;margin:0;line-height:1.2;letter-spacing:-.3px}
.tt-detail-loc{display:flex;align-items:center;gap:5px;font-size:.82rem;color:#64748b;margin:0}
.tt-detail-loc i{color:#2563eb;font-size:.72rem;flex-shrink:0}

/* Tags */
.tt-tags{display:flex;flex-wrap:wrap;gap:6px}
.tt-tag{font-size:.7rem;font-weight:700;color:#2563eb;background:rgba(37,99,235,.08);padding:4px 11px;border-radius:9999px;border:1px solid rgba(37,99,235,.18);white-space:nowrap}

/* Desc */
.tt-detail-desc{font-size:.875rem;color:#475569;line-height:1.7;padding:12px 14px;background:#f8fafc;border-radius:12px;border-left:3px solid #2563eb;margin:0}

/* Section */
.tt-section{display:flex;flex-direction:column;gap:8px}
.tt-section-title{font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:#0a1628;display:flex;align-items:center;gap:6px;margin:0}
.tt-section-title i{color:#2563eb}

/* Costs */
.tt-costs{display:flex;flex-wrap:wrap;gap:8px}
.tt-cost-pill{display:flex;flex-direction:column;align-items:center;padding:10px 14px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;min-width:80px}
.tt-cost-lbl{font-size:.68rem;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.4px}
.tt-cost-val{font-family:'DM Serif Display',Georgia,serif;font-size:1rem;font-weight:700;color:#0a1628}

/* Two-col */
.tt-two-col{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.tt-col{display:flex;flex-direction:column;gap:6px}
.tt-list{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:6px}
.tt-list li{display:flex;align-items:flex-start;gap:8px;font-size:.82rem;color:#475569;line-height:1.5}
.tt-list li i{flex-shrink:0;margin-top:3px;font-size:.72rem}
.tt-list li .fa-check-circle{color:#10b981}
.tt-list li .fa-lightbulb{color:#f59e0b}
.tt-none{font-size:.8rem;color:#94a3b8;font-style:italic;margin:0}

/* Reviews */
.tt-reviews-box{background:linear-gradient(135deg,rgba(37,99,235,.06),rgba(147,197,253,.04));border:1px solid rgba(37,99,235,.14);border-radius:14px;padding:16px}
.tt-reviews-avg{display:flex;align-items:center;gap:12px;padding-bottom:14px;margin-bottom:14px;border-bottom:1px solid rgba(37,99,235,.12)}
.tt-reviews-score{font-family:'DM Serif Display',Georgia,serif;font-size:2.4rem;font-weight:700;color:#0a1628;min-width:54px;line-height:1}
.tt-reviews-score.empty{color:#cbd5e1}
.tt-reviews-meta{flex:1}
.tt-reviews-stars{font-size:1rem;color:#f59e0b;letter-spacing:1px;margin-bottom:3px}
.tt-reviews-stars.empty{color:#e2e8f0}
.tt-reviews-count{font-size:.78rem;color:#64748b}
.tt-reviews-empty-msg{font-size:.84rem;color:#94a3b8;font-style:italic;text-align:center;padding:8px 0 2px;margin:0}
.tt-reviews-list{display:flex;flex-direction:column;gap:10px}
.tt-review-item{background:#fff;border:1px solid #f1f5f9;border-radius:10px;padding:12px 14px;transition:box-shadow .2s}
.tt-review-item:hover{box-shadow:0 2px 8px rgba(0,0,0,.06)}
.tt-review-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px}
.tt-review-user{font-weight:700;color:#0a1628;font-size:.85rem}
.tt-review-stars{font-size:.78rem;color:#f59e0b}
.tt-review-text{font-size:.82rem;color:#475569;line-height:1.55;margin:0 0 5px}
.tt-review-date{font-size:.72rem;color:#94a3b8}

/* Action buttons */
.tt-actions{display:flex;gap:10px;flex-wrap:wrap;padding-top:2px}
.tt-action-btn{display:inline-flex;align-items:center;gap:7px;padding:11px 20px;border-radius:9999px;font-size:.875rem;font-weight:600;font-family:'DM Sans',system-ui,sans-serif;cursor:pointer;border:none;text-decoration:none;flex:1;justify-content:center;min-width:120px;white-space:nowrap;transition:background .22s,color .22s,transform .22s,box-shadow .22s}
.tt-action-primary{background:#0a1628;color:#fff}
.tt-action-primary:hover{background:#2563eb;transform:translateY(-2px);box-shadow:0 8px 20px rgba(10,22,40,.2)}
.tt-action-secondary{background:#f1f5f9;color:#0a1628;border:1px solid #e2e8f0}
.tt-action-secondary:hover{background:#eff6ff;border-color:#2563eb;color:#2563eb;transform:translateY(-2px)}

/* ── Calc list cards ── */
.tt-calc-card{display:flex;align-items:flex-start;gap:14px;padding:16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;cursor:pointer;transition:background .2s,border-color .2s,box-shadow .2s}
.tt-calc-card:hover{background:#fff;border-color:#2563eb;box-shadow:0 4px 16px rgba(37,99,235,.09)}
.tt-calc-card-icon{width:46px;height:46px;border-radius:12px;background:linear-gradient(135deg,#0a1628,#2563eb);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.tt-calc-card-icon i{color:#fff;font-size:1.05rem}
.tt-calc-card-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}
.tt-calc-card-name{font-family:'DM Serif Display',Georgia,serif;font-size:1rem;color:#0a1628;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tt-calc-card-meta{display:flex;gap:10px;font-size:.77rem;color:#64748b;flex-wrap:wrap;align-items:center}
.tt-calc-card-meta span{display:inline-flex;align-items:center;gap:4px}
.tt-calc-card-meta i{color:#2563eb;font-size:.68rem}
.tt-calc-card-date{font-size:.72rem;color:#94a3b8;display:flex;align-items:center;gap:4px}
.tt-calc-card-right{display:flex;flex-direction:column;align-items:flex-end;gap:8px;flex-shrink:0}
.tt-calc-card-total{font-family:'DM Serif Display',Georgia,serif;font-size:1.3rem;font-weight:700;color:#0a1628;white-space:nowrap}
.tt-calc-card-btns{display:flex;flex-direction:column;gap:6px}
.tt-calc-btn{padding:7px 13px;border-radius:8px;border:none;cursor:pointer;font-size:.73rem;font-weight:600;display:inline-flex;align-items:center;gap:5px;font-family:'DM Sans',system-ui,sans-serif;white-space:nowrap;transition:background .2s,color .2s,transform .15s}
.tt-calc-btn-load{background:#0a1628;color:#fff}
.tt-calc-btn-load:hover{background:#2563eb;transform:translateY(-1px)}
.tt-calc-btn-delete{background:#fee2e2;color:#ef4444}
.tt-calc-btn-delete:hover{background:#ef4444;color:#fff}

/* ── Calc detail ── */
.tt-calc-detail-header{display:flex;align-items:flex-start;gap:14px}
.tt-calc-detail-icon{width:50px;height:50px;border-radius:12px;background:linear-gradient(135deg,#0a1628,#2563eb);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.tt-calc-detail-icon i{color:#fff;font-size:1.3rem}
.tt-calc-detail-info{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}
.tt-calc-detail-date{font-size:.76rem;color:#64748b;display:flex;align-items:center;gap:5px}
.tt-total-card{background:linear-gradient(135deg,#0a1628,#1e3a5f);border-radius:18px;padding:22px 20px;text-align:center}
.tt-total-label{font-size:.78rem;color:rgba(255,255,255,.6);text-transform:uppercase;letter-spacing:.6px;margin-bottom:6px}
.tt-total-amount{font-family:'DM Serif Display',Georgia,serif;font-size:2.1rem;font-weight:700;color:#fff;line-height:1}
.tt-total-per{font-size:.82rem;color:rgba(255,255,255,.6);margin-top:7px;display:flex;align-items:center;justify-content:center;gap:5px}
.tt-meta-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.tt-meta-item{display:flex;align-items:center;gap:10px;padding:11px 12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px}
.tt-meta-icon{width:30px;height:30px;border-radius:8px;background:#eff6ff;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.tt-meta-icon i{color:#2563eb;font-size:.78rem}
.tt-meta-lbl{font-size:.68rem;color:#94a3b8;text-transform:uppercase;letter-spacing:.4px}
.tt-meta-val{font-size:.88rem;font-weight:700;color:#0a1628;margin-top:1px}
.tt-breakdown{background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:12px 14px;display:flex;flex-direction:column}
.tt-breakdown-row{display:flex;justify-content:space-between;align-items:center;font-size:.875rem;padding:8px 0;border-bottom:1px solid #f1f5f9}
.tt-breakdown-row:last-child{border-bottom:none}
.tt-breakdown-lbl{color:#475569}
.tt-breakdown-val{font-weight:700;color:#0a1628;font-family:'DM Serif Display',Georgia,serif}

/* Spin */
@keyframes ttSpin{to{transform:rotate(360deg)}}
.tt-spin{display:inline-block;animation:ttSpin .7s linear infinite}

/* Responsive */
@media(max-width:540px){
  .modal-overlay{padding:0;align-items:flex-end}
  .modal-container{max-height:92vh;border-radius:20px 20px 0 0}
  .modal-body{padding:16px 16px 28px}
  .tt-hero-img{height:165px;border-radius:12px}
  .tt-detail-title{font-size:1.25rem}
  .tt-two-col{grid-template-columns:1fr}
  .tt-actions{flex-direction:column}
  .tt-action-btn{flex:none;width:100%;min-width:unset}
  .tt-meta-grid{grid-template-columns:1fr 1fr}
  .tt-total-amount{font-size:1.75rem}
  .tt-calc-card-right{align-items:flex-start;width:100%;flex-direction:row;flex-wrap:wrap;gap:6px}
  .tt-calc-card{flex-wrap:wrap}
  .tt-calc-card-total{font-size:1.1rem;width:100%}
}
@media(max-width:400px){
  .tt-meta-grid{grid-template-columns:1fr}
  .tt-place-thumb{width:52px!important;height:52px!important}
  .tt-hero-img{height:145px}
}
  `;
  document.head.appendChild(s);
})();

/* ═══════════════════════════════════════════════════════════
   UTILITIES
═══════════════════════════════════════════════════════════ */
function esc(v) {
  if (!v && v !== 0) return '';
  return String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}
function fmt(val, sym) {
  sym = sym || '$';
  const n = Number(val);
  if ((!val && val !== 0) || isNaN(n)) return sym + '0';
  return sym + n.toLocaleString(undefined, {minimumFractionDigits:0, maximumFractionDigits:0});
}
function fmtDate(val) {
  if (!val) return '';
  let d;
  // Handle Firestore Timestamp
  if (val && typeof val === 'object' && typeof val.toDate === 'function') d = val.toDate();
  else if (val && typeof val === 'object' && val.seconds) d = new Date(val.seconds * 1000);
  else d = new Date(val);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, {year:'numeric', month:'short', day:'numeric'});
}
function starsHTML(rating, sz) {
  sz = sz || '0.85rem';
  const r = Math.max(0, Math.min(5, Number(rating) || 0));
  const full = Math.floor(r), half = (r - full) >= .5 ? 1 : 0, empty = 5 - full - half;
  const st = `style="font-size:${sz};"`;
  let h = '';
  for (let i=0;i<full; i++) h += `<i class="fas fa-star" ${st}></i>`;
  if (half)                   h += `<i class="fas fa-star-half-alt" ${st}></i>`;
  for (let i=0;i<empty;i++) h += `<i class="far fa-star" ${st}></i>`;
  return h;
}
function calcAvg(reviews) {
  if (!Array.isArray(reviews) || !reviews.length) return null;
  const v = reviews.filter(r => typeof r.rating === 'number' && r.rating >= 1);
  if (!v.length) return null;
  return Math.round((v.reduce((a,r) => a + r.rating, 0) / v.length) * 10) / 10;
}
function tierLabel(t) {
  t = (t||'').toLowerCase();
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : '';
}
const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='220'%3E%3Crect width='400' height='220' fill='%23e2e8f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='14' fill='%2394a3b8' font-family='sans-serif'%3ENo Image%3C/text%3E%3C/svg%3E";

/* ═══════════════════════════════════════════════════════════
   MODAL OPEN / CLOSE
═══════════════════════════════════════════════════════════ */
function openModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add('active');
  el.setAttribute('aria-hidden','false');
  document.body.style.overflow = 'hidden';
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('active');
  el.setAttribute('aria-hidden','true');
  document.body.style.overflow = '';
}
function scrollTop(overlayId) {
  const b = document.querySelector(`#${overlayId} .modal-body`);
  if (b) b.scrollTop = 0;
}

/* ═══════════════════════════════════════════════════════════
   SAVED PLACES MODAL
═══════════════════════════════════════════════════════════ */
const SP_OV  = 'savedPlacesModalOverlay';
const SP_LST = 'savedPlacesList';

function renderPlacesList(places) {
  const c = document.getElementById(SP_LST);
  if (!c) return;

  if (!Array.isArray(places) || !places.length) {
    c.innerHTML = `
      <div class="tt-empty-state">
        <div class="tt-empty-icon"><i class="fas fa-heart"></i></div>
        <h4>No saved places yet</h4>
        <p>Explore destinations and tap the heart icon to save your favourites.</p>
        <a href="destinations.html" class="tt-btn-primary"><i class="fas fa-compass"></i> Explore Destinations</a>
      </div>`;
    return;
  }

  const wrap = document.createElement('div');
  wrap.className = 'tt-modal-list';

  places.forEach(place => {
    const name      = place.name || 'Unknown Place';
    const country   = place.country || place.region || '';
    const continent = place.continent || '';
    const loc       = [country, continent].filter(Boolean).join(', ');
    const tier      = (place.budget || place.tier || '').toLowerCase();
    const img       = place.image || place.img || PLACEHOLDER;
    const hasRating = typeof place.rating === 'number' && place.rating > 0;
    const ratingStr = hasRating ? place.rating.toFixed(1) : null;

    const card = document.createElement('div');
    card.className = 'tt-place-card';
    card.setAttribute('tabindex','0');
    card.setAttribute('role','button');
    card.setAttribute('aria-label',`View details for ${name}`);
    card.innerHTML = `
      <div class="tt-place-thumb">
        <img src="${esc(img)}" alt="${esc(name)}" loading="lazy"
             onerror="this.src='${PLACEHOLDER}'">
      </div>
      <div class="tt-place-info">
        <div class="tt-place-name">${esc(name)}</div>
        <div class="tt-place-meta">
          ${loc        ? `<span><i class="fas fa-map-marker-alt"></i>${esc(loc)}</span>` : ''}
          ${ratingStr  ? `<span><i class="fas fa-star"></i>${esc(ratingStr)}</span>` : ''}
          ${tier       ? `<span><i class="fas fa-tag"></i>${esc(tierLabel(tier))}</span>` : ''}
        </div>
      </div>
      <div class="tt-place-actions">
        <button class="tt-place-btn tt-place-btn-detail" title="View Details">
          <i class="fas fa-chevron-right"></i>
        </button>
        <button class="tt-place-btn tt-place-btn-remove" title="Remove">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>`;

    card.addEventListener('click', e => {
      if (e.target.closest('.tt-place-btn-remove')) return;
      renderPlaceDetail(place, places);
    });
    card.addEventListener('keydown', e => {
      if ((e.key==='Enter'||e.key===' ') && !e.target.closest('.tt-place-btn-remove')) {
        e.preventDefault(); renderPlaceDetail(place, places);
      }
    });
    card.querySelector('.tt-place-btn-detail').addEventListener('click', e => {
      e.stopPropagation(); renderPlaceDetail(place, places);
    });
    card.querySelector('.tt-place-btn-remove').addEventListener('click', e => {
      e.stopPropagation(); doRemovePlace(place, places);
    });
    wrap.appendChild(card);
  });

  c.innerHTML = '';
  c.appendChild(wrap);
}

function doRemovePlace(place, allPlaces) {
  const docId = place.docId;
  if (!docId) {
    renderPlacesList(allPlaces.filter(p => p !== place));
    return;
  }
  const fn = window.TT?.removeDest || window.TT?.unsaveDestination;
  if (fn) {
    fn(docId).then(() => {
      const g = window.TT?.getSaved;
      if (g) g().then(renderPlacesList);
      else renderPlacesList(allPlaces.filter(p => p.docId !== docId));
    }).catch(() => renderPlacesList(allPlaces.filter(p => p.docId !== docId)));
  } else {
    renderPlacesList(allPlaces.filter(p => p.docId !== docId));
  }
}

function renderPlaceDetail(place, allPlaces) {
  const c = document.getElementById(SP_LST);
  if (!c) return;

  // Enrich from local DESTINATIONS data if highlights/tips are missing (legacy saved places)
  const localMatch = (typeof DESTINATIONS !== 'undefined' && Array.isArray(DESTINATIONS))
    ? DESTINATIONS.find(d => d.id === place.id)
    : null;
  const enriched = localMatch ? Object.assign({}, localMatch, place) : place;

  const name       = enriched.name || 'Unknown Place';
  const country    = enriched.country || enriched.region || '';
  const continent  = enriched.continent || '';
  const loc        = [country, continent].filter(Boolean).join(', ');
  const tier       = (enriched.budget || enriched.tier || '').toLowerCase();
  const img        = enriched.image || enriched.img || PLACEHOLDER;
  const desc       = enriched.description || enriched.desc || '';
  const highlights = Array.isArray(enriched.highlights) ? enriched.highlights.filter(Boolean) : [];
  const tips       = Array.isArray(enriched.tips) ? enriched.tips.filter(Boolean) : [];
  const tags       = Array.isArray(enriched.tags) ? enriched.tags.filter(Boolean) : [];
  const reviews    = Array.isArray(enriched.reviews) ? enriched.reviews : [];
  const costs      = enriched.costs || enriched.cost || {};
  const symbol     = enriched.currencySymbol || '$';
  const avgRating  = calcAvg(reviews);
  const hasReviews = reviews.length > 0;
  const ratingStr  = avgRating !== null ? avgRating.toFixed(1) : null;
  const destUrl    = enriched.url || `destinations.html${enriched.id ? '?open='+encodeURIComponent(enriched.id) : ''}`;

  // Tags
  const tagsHtml = tags.length
    ? `<div class="tt-tags">${tags.map(t=>`<span class="tt-tag">${esc(t)}</span>`).join('')}</div>` : '';

  // Costs
  const costEntries = Object.entries(costs).filter(([,v]) => v);
  const costsHtml = costEntries.length
    ? `<div class="tt-section">
         <div class="tt-section-title"><i class="fas fa-wallet"></i> Estimated Costs</div>
         <div class="tt-costs">
           ${costEntries.map(([l,v])=>`<div class="tt-cost-pill"><span class="tt-cost-lbl">${esc(l)}</span><span class="tt-cost-val">${fmt(v,symbol)}</span></div>`).join('')}
         </div>
       </div>` : '';

  // Highlights + Tips
  const hiHtml = highlights.length
    ? `<ul class="tt-list">${highlights.map(h=>`<li><i class="fas fa-check-circle"></i>${esc(h)}</li>`).join('')}</ul>`
    : `<p class="tt-none">No highlights listed.</p>`;
  const tipsHtml = tips.length
    ? `<ul class="tt-list">${tips.map(t=>`<li><i class="fas fa-lightbulb"></i>${esc(t)}</li>`).join('')}</ul>`
    : `<p class="tt-none">No tips listed.</p>`;

  // Reviews
  let reviewsHtml;
  if (!hasReviews) {
    reviewsHtml = `
      <div class="tt-reviews-box">
        <div class="tt-section-title" style="margin-bottom:12px;"><i class="fas fa-star"></i> Reviews &amp; Ratings</div>
        <div class="tt-reviews-avg" style="border-bottom:none;padding-bottom:0;margin-bottom:10px;">
          <div class="tt-reviews-score empty">—</div>
          <div class="tt-reviews-meta">
            <div class="tt-reviews-stars empty">${starsHTML(0)}</div>
            <div class="tt-reviews-count">No ratings yet</div>
          </div>
        </div>
        <p class="tt-reviews-empty-msg">No reviews yet. Be the first to review.</p>
      </div>`;
  } else {
    const reviewCount = reviews.length;
    const countLbl = reviewCount === 1 ? '1 review' : `${reviewCount} reviews`;
    const items = reviews.map(r => {
      const user  = esc(r.user || r.author || r.displayName || 'Anonymous');
      const text  = esc(r.text || r.comment || r.review || '');
      const date  = fmtDate(r.date || r.createdAt || r.timestamp || '');
      const stars = typeof r.rating === 'number' ? starsHTML(r.rating, '0.78rem') : '';
      return `<div class="tt-review-item">
        <div class="tt-review-header"><span class="tt-review-user">${user}</span><span class="tt-review-stars">${stars}</span></div>
        ${text ? `<p class="tt-review-text">${text}</p>` : ''}
        ${date ? `<div class="tt-review-date"><i class="fas fa-calendar-alt" style="margin-right:4px;font-size:.65rem;"></i>${date}</div>` : ''}
      </div>`;
    }).join('');
    reviewsHtml = `
      <div class="tt-reviews-box">
        <div class="tt-section-title" style="margin-bottom:12px;"><i class="fas fa-star"></i> Reviews &amp; Ratings</div>
        <div class="tt-reviews-avg">
          <div class="tt-reviews-score">${ratingStr ? esc(ratingStr) : '—'}</div>
          <div class="tt-reviews-meta">
            <div class="tt-reviews-stars">${ratingStr ? starsHTML(Number(ratingStr)) : starsHTML(0)}</div>
            <div class="tt-reviews-count">${esc(countLbl)}</div>
          </div>
        </div>
        <div class="tt-reviews-list">${items}</div>
      </div>`;
  }

  c.innerHTML = `
    <div class="tt-detail-view">
      <button class="tt-back-btn" id="spBackBtn"><i class="fas fa-arrow-left"></i> Back</button>
      <div class="tt-hero-img">
        <img src="${esc(img)}" alt="${esc(name)}" loading="lazy"
             onerror="this.src='${PLACEHOLDER}'">
        <div class="tt-hero-overlay">
          ${tier ? `<span class="tt-hero-badge ${esc(tier)}">${esc(tierLabel(tier))}</span>` : '<span></span>'}
          ${ratingStr ? `<span class="tt-hero-rating"><i class="fas fa-star"></i> ${esc(ratingStr)}</span>` : ''}
        </div>
      </div>
      <div class="tt-detail-head">
        <h2 class="tt-detail-title">${esc(name)}</h2>
        ${loc ? `<div class="tt-detail-loc"><i class="fas fa-map-marker-alt"></i><span>${esc(loc)}</span></div>` : ''}
      </div>
      ${tagsHtml}
      ${desc ? `<p class="tt-detail-desc">${esc(desc)}</p>` : ''}
      ${costsHtml}
      <div class="tt-two-col">
        <div class="tt-col">
          <div class="tt-section-title"><i class="fas fa-check-circle"></i> Highlights</div>
          ${hiHtml}
        </div>
        <div class="tt-col">
          <div class="tt-section-title"><i class="fas fa-lightbulb"></i> Travel Tips</div>
          ${tipsHtml}
        </div>
      </div>
      ${reviewsHtml}
      <div class="tt-actions">
        <a href="${esc(destUrl)}" class="tt-action-btn tt-action-primary">
          <i class="fas fa-compass"></i> Explore Destination
        </a>
        <button class="tt-action-btn tt-action-secondary" id="spRemoveDetailBtn">
          <i class="fas fa-heart-broken"></i> Remove
        </button>
      </div>
    </div>`;

  scrollTop(SP_OV);
  document.getElementById('spBackBtn').addEventListener('click', () => { renderPlacesList(allPlaces); scrollTop(SP_OV); });
  document.getElementById('spRemoveDetailBtn').addEventListener('click', () => doRemovePlace(place, allPlaces));
}

async function openSavedPlaces() {
  openModal(SP_OV);
  const c = document.getElementById(SP_LST);
  if (!c) return;
  c.innerHTML = `<div class="tt-loading-state"><i class="fas fa-circle-notch tt-spin" style="font-size:2rem;color:#2563eb;"></i><p>Loading your saved places…</p></div>`;
  try {
    let places = [];
    const TT = window.TT;
    if      (TT?.getSaved)       places = await TT.getSaved();
    else if (TT?.getSavedPlaces) places = await TT.getSavedPlaces();
    else if (TT?.listenSaved)    places = await new Promise(res => { const u = TT.listenSaved(d => { u?.(); res(d||[]); }); setTimeout(()=>res([]),5000); });
    renderPlacesList(Array.isArray(places) ? places : []);
  } catch (err) {
    console.error('[TTModals] openSavedPlaces:', err);
    c.innerHTML = `<div class="tt-empty-state"><div class="tt-empty-icon"><i class="fas fa-exclamation-triangle"></i></div><h4>Couldn't load saved places</h4><p>Please check your connection and try again.</p><button class="tt-btn-primary" onclick="window.TTModals&&TTModals.openSavedPlaces()"><i class="fas fa-redo"></i> Retry</button></div>`;
  }
}

/* ═══════════════════════════════════════════════════════════
   SAVED CALCULATIONS MODAL
═══════════════════════════════════════════════════════════ */
const SC_OV  = 'savedCalcsModalOverlay';
const SC_LST = 'savedCalcsList';

function renderCalcsList(calcs) {
  const c = document.getElementById(SC_LST);
  if (!c) return;

  if (!Array.isArray(calcs) || !calcs.length) {
    c.innerHTML = `
      <div class="tt-empty-state">
        <div class="tt-empty-icon"><i class="fas fa-calculator"></i></div>
        <h4>No saved budgets yet</h4>
        <p>Use the Budget Calculator to plan your trip, then save it here for easy reference.</p>
        <a href="calculator.html" class="tt-btn-primary"><i class="fas fa-calculator"></i> Open Calculator</a>
      </div>`;
    return;
  }

  const wrap = document.createElement('div');
  wrap.className = 'tt-modal-list';

  calcs.forEach((calc, idx) => {
    const dest      = calc.destination || calc.destName || calc.name || calc.title || '';
    const title    = dest || `Budget ${idx + 1}`;
    const travelers = calc.travelers || calc.people || 1;
    const nights    = calc.nights || calc.duration || calc.days || 0;
    const currency  = calc.currency || 'USD';
    const symbol    = calc.currencySymbol || calc.symbol || '$';
    const total     = calc.totalNum || calc.totalCost || calc.grandTotal || (typeof calc.total === 'number' ? calc.total : parseFloat(String(calc.total || '').replace(/[^0-9.]/g, '')) || 0);
    const savedAt   = fmtDate(calc.savedAt || calc.createdAt || calc.date || '');

    const card = document.createElement('div');
    card.className = 'tt-calc-card';
    card.innerHTML = `
      <div class="tt-calc-card-icon"><i class="fas fa-calculator"></i></div>
      <div class="tt-calc-card-body">
        <div class="tt-calc-card-name">${esc(title)}</div>
        <div class="tt-calc-card-meta">
          ${dest      ? `<span><i class="fas fa-map-marker-alt"></i>${esc(dest)}</span>` : ''}
          ${travelers ? `<span><i class="fas fa-users"></i>${esc(String(travelers))} traveler${travelers!==1?'s':''}</span>` : ''}
          ${nights    ? `<span><i class="fas fa-moon"></i>${esc(String(nights))} night${nights!==1?'s':''}</span>` : ''}
          ${currency  ? `<span><i class="fas fa-coins"></i>${esc(currency)}</span>` : ''}
        </div>
        ${savedAt ? `<div class="tt-calc-card-date"><i class="fas fa-calendar-alt"></i> Saved ${esc(savedAt)}</div>` : ''}
      </div>
      <div class="tt-calc-card-right">
        <div class="tt-calc-card-total">${fmt(total, symbol)}</div>
        <div class="tt-calc-card-btns">
          <button class="tt-calc-btn tt-calc-btn-load"><i class="fas fa-folder-open"></i> Load</button>
          <button class="tt-calc-btn tt-calc-btn-delete"><i class="fas fa-trash-alt"></i> Delete</button>
        </div>
      </div>`;

    card.addEventListener('click', e => {
      if (e.target.closest('.tt-calc-btn-load,.tt-calc-btn-delete')) return;
      renderCalcDetail(calc, calcs);
    });
    card.querySelector('.tt-calc-btn-load').addEventListener('click', e => { e.stopPropagation(); doLoadCalc(calc); });
    card.querySelector('.tt-calc-btn-delete').addEventListener('click', e => { e.stopPropagation(); doDeleteCalc(calc, calcs); });
    wrap.appendChild(card);
  });

  c.innerHTML = '';
  c.appendChild(wrap);
}

function doLoadCalc(calc) {
  closeModal(SC_OV);
  if (window.TTCalc?.load) { window.TTCalc.load(calc); return; }
  try { sessionStorage.setItem('tt_load_calc', JSON.stringify(calc)); } catch(_){}
  window.location.href = 'calculator.html';
}

function doDeleteCalc(calc, allCalcs) {
  const docId = calc.docId;
  if (!docId) {
    renderCalcsList(allCalcs.filter(c => c !== calc));
    return;
  }
  const fn = window.TT?.deleteCalc || window.TT?.removeSavedCalc;
  if (fn) {
    fn(docId).then(() => {
      const g = window.TT?.getCalcs || window.TT?.getSavedCalcs;
      if (g) g().then(renderCalcsList);
      else renderCalcsList(allCalcs.filter(c => c.docId !== docId));
    }).catch(() => renderCalcsList(allCalcs.filter(c => c.docId !== docId)));
  } else {
    renderCalcsList(allCalcs.filter(c => c.docId !== docId));
  }
}

function renderCalcDetail(calc, allCalcs) {
  const c = document.getElementById(SC_LST);
  if (!c) return;

  const dest      = calc.destination || calc.destName || calc.name || calc.title || '';
  const title    = dest || 'Saved Budget';
  const travelers = calc.travelers || calc.people || 1;
  const nights    = calc.nights || calc.duration || calc.days || 0;
  const currency  = calc.currency || 'USD';
  const symbol    = calc.currencySymbol || calc.symbol || '$';
  const total     = calc.totalNum || calc.totalCost || calc.grandTotal || (typeof calc.total === 'number' ? calc.total : parseFloat(String(calc.total || '').replace(/[^0-9.]/g, '')) || 0);
  const perPerson = travelers > 1 ? (total / travelers) : null;
  const savedAt   = fmtDate(calc.savedAt || calc.createdAt || calc.date || '');
  const breakdown = calc.breakdown || calc.items || calc.costs || {};
  const bEntries  = Object.entries(breakdown).filter(([,v]) => v || v === 0);

  const bHtml = bEntries.length
    ? bEntries.map(([l,v]) =>
        `<div class="tt-breakdown-row"><span class="tt-breakdown-lbl">${esc(l)}</span><span class="tt-breakdown-val">${fmt(v,symbol)}</span></div>`
      ).join('')
    : `<div class="tt-breakdown-row"><span class="tt-breakdown-lbl" style="color:#94a3b8;font-style:italic;">No breakdown available</span><span class="tt-breakdown-val">—</span></div>`;

  const metaItems = [
    travelers ? `<div class="tt-meta-item"><div class="tt-meta-icon"><i class="fas fa-users"></i></div><div><div class="tt-meta-lbl">Travelers</div><div class="tt-meta-val">${esc(String(travelers))}</div></div></div>` : '',
    nights    ? `<div class="tt-meta-item"><div class="tt-meta-icon"><i class="fas fa-moon"></i></div><div><div class="tt-meta-lbl">Nights</div><div class="tt-meta-val">${esc(String(nights))}</div></div></div>` : '',
    currency  ? `<div class="tt-meta-item"><div class="tt-meta-icon"><i class="fas fa-coins"></i></div><div><div class="tt-meta-lbl">Currency</div><div class="tt-meta-val">${esc(currency)}</div></div></div>` : '',
  ].filter(Boolean).join('');

  c.innerHTML = `
    <div class="tt-detail-view">
      <button class="tt-back-btn" id="scBackBtn"><i class="fas fa-arrow-left"></i> Back</button>
      <div class="tt-calc-detail-header">
        <div class="tt-calc-detail-icon"><i class="fas fa-calculator"></i></div>
        <div class="tt-calc-detail-info">
          <h2 class="tt-detail-title" style="font-size:1.3rem;">${esc(title)}</h2>
          ${dest    ? `<div class="tt-detail-loc"><i class="fas fa-map-marker-alt"></i><span>${esc(dest)}</span></div>` : ''}
          ${savedAt ? `<div class="tt-calc-detail-date"><i class="fas fa-calendar-alt"></i> Saved ${esc(savedAt)}</div>` : ''}
        </div>
      </div>
      <div class="tt-total-card">
        <div class="tt-total-label">Total Trip Cost</div>
        <div class="tt-total-amount">${fmt(total, symbol)}</div>
        ${perPerson !== null ? `<div class="tt-total-per"><i class="fas fa-user"></i>${fmt(perPerson, symbol)} per person</div>` : ''}
      </div>
      ${metaItems ? `<div class="tt-meta-grid">${metaItems}</div>` : ''}
      <div class="tt-section">
        <div class="tt-section-title"><i class="fas fa-list-ul"></i> Cost Breakdown</div>
        <div class="tt-breakdown">${bHtml}</div>
      </div>
      ${calc.notes ? `<div class="tt-section"><div class="tt-section-title"><i class="fas fa-sticky-note"></i> Notes</div><p class="tt-detail-desc">${esc(calc.notes)}</p></div>` : ''}
      <div class="tt-actions">
        <button class="tt-action-btn tt-action-primary" id="scLoadBtn"><i class="fas fa-folder-open"></i> Load in Calculator</button>
        <button class="tt-action-btn tt-action-secondary" id="scDeleteBtn"><i class="fas fa-trash-alt"></i> Delete</button>
      </div>
    </div>`;

  scrollTop(SC_OV);
  document.getElementById('scBackBtn').addEventListener('click', () => { renderCalcsList(allCalcs); scrollTop(SC_OV); });
  document.getElementById('scLoadBtn').addEventListener('click', () => doLoadCalc(calc));
  document.getElementById('scDeleteBtn').addEventListener('click', () => doDeleteCalc(calc, allCalcs));
}

async function openSavedCalcs() {
  openModal(SC_OV);
  const c = document.getElementById(SC_LST);
  if (!c) return;
  c.innerHTML = `<div class="tt-loading-state"><i class="fas fa-circle-notch tt-spin" style="font-size:2rem;color:#2563eb;"></i><p>Loading your saved budgets…</p></div>`;
  try {
    let calcs = [];
    const TT = window.TT;
    if      (TT?.getSavedCalcs)    calcs = await TT.getSavedCalcs();
    else if (TT?.getCalcHistory)   calcs = await TT.getCalcHistory();
    renderCalcsList(Array.isArray(calcs) ? calcs : []);
  } catch (err) {
    console.error('[TTModals] openSavedCalcs:', err);
    c.innerHTML = `<div class="tt-empty-state"><div class="tt-empty-icon"><i class="fas fa-exclamation-triangle"></i></div><h4>Couldn't load saved budgets</h4><p>Please check your connection and try again.</p><button class="tt-btn-primary" onclick="window.TTModals&&TTModals.openSavedCalcs()"><i class="fas fa-redo"></i> Retry</button></div>`;
  }
}

/* ═══════════════════════════════════════════════════════════
   CLOSE HANDLERS + INIT
═══════════════════════════════════════════════════════════ */
function initHandlers() {
  [
    { ov: SP_OV, btn: 'savedPlacesModalClose' },
    { ov: SC_OV, btn: 'savedCalcsModalClose'  },
  ].forEach(({ ov, btn }) => {
    document.getElementById(btn)?.addEventListener('click', () => closeModal(ov));
    const ovEl = document.getElementById(ov);
    if (ovEl) ovEl.addEventListener('click', e => { if (e.target === ovEl) closeModal(ov); });
  });

  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    [SP_OV, SC_OV].forEach(id => {
      if (document.getElementById(id)?.classList.contains('active')) closeModal(id);
    });
  });

  document.getElementById('savedPlacesBtn')?.addEventListener('click', e => {
    e.preventDefault();
    if (window.TT?.currentUser?.()) openSavedPlaces();
    else { document.getElementById('loginModalOverlay')?.classList.add('active'); document.body.style.overflow='hidden'; }
  });

  document.getElementById('savedCalcsBtn')?.addEventListener('click', e => {
    e.preventDefault();
    if (window.TT?.currentUser?.()) openSavedCalcs();
    else { document.getElementById('loginModalOverlay')?.classList.add('active'); document.body.style.overflow='hidden'; }
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initHandlers);
else initHandlers();

/* ═══════════════════════════════════════════════════════════
   PUBLIC API
═══════════════════════════════════════════════════════════ */
window.TTModals = { openSavedPlaces, openSavedCalcs, closeModal };
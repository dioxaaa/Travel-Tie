function setTxt(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val;
}

function renderAvatar(id, photoURL, initials) {
  const el = document.getElementById(id);
  if (!el) return;
  if (photoURL) {
    el.innerHTML = `<img src="${photoURL}" alt="Profile photo" onerror="this.parentElement.textContent='${initials}'">`;
  } else {
    el.textContent = initials;
  }
}

// Apply a photo URL to every avatar element on the page at once
function applyPhotoEverywhere(photoURL) {
  const imgTag = `<img src="${photoURL}" alt="avatar" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
  // Hero
  const heroEl = document.getElementById('profileInitials');
  if (heroEl) heroEl.innerHTML = imgTag;
  // Nav dropdown
  const ddAvatar   = document.getElementById('ddAvatarText');
  const userAvatar = document.getElementById('userAvatarBtn');
  if (ddAvatar)   ddAvatar.innerHTML   = imgTag;
  if (userAvatar) userAvatar.innerHTML = imgTag;
  // Settings thumb
  const settingsThumb = document.getElementById('settingsAvatarThumb');
  if (settingsThumb) settingsThumb.innerHTML = imgTag;
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── Cover Photo ───────────────────────────────────────────
async function handleCoverUpload() {
  const input = document.getElementById('coverFileInput');
  if (!input || !input.files[0]) return;
  
  const file = input.files[0];
  if (!file.type.startsWith('image/')) {
    showToast('Please select an image file', 'error');
    return;
  }
  if (file.size > 2 * 1024 * 1024) {
    showToast('Image must be under 2MB', 'error');
    return;
  }
  
  try {
    showToast('Uploading cover...', 'info');
    const base64 = await fileToBase64(file);
    
    const user = TT.currentUser();
    if (!user) return;
    
    const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    await setDoc(doc(TT.db, 'users', user.uid), { coverURL: base64 }, { merge: true });
    
    const coverEl = document.getElementById('profileCover');
    if (coverEl) coverEl.style.backgroundImage = `url(${base64})`;
    
    showToast('Cover photo updated! <i class="fas fa-check"></i>', 'success');
  } catch (err) {
    console.error('Cover upload error:', err);
    showToast('Failed to upload cover', 'error');
  }
}

function initCoverUpload() {
  const btn = document.getElementById('coverChangeBtn');
  const input = document.getElementById('coverFileInput');
  if (!btn || !input) return;
  
  btn.addEventListener('click', () => input.click());
  input.addEventListener('change', handleCoverUpload);
}

async function loadCoverPhoto() {
  const user = TT.currentUser();
  if (!user) return;
  
  try {
    const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    const snap = await getDoc(doc(TT.db, 'users', user.uid));
    if (snap.exists() && snap.data().coverURL) {
      const coverEl = document.getElementById('profileCover');
      if (coverEl) coverEl.style.backgroundImage = `url(${snap.data().coverURL})`;
    }
  } catch (e) {
    console.log('No cover photo found');
  }
}

function showPwAlert(msg, type) {
  const el = document.getElementById('pwAlert');
  if (!el) return;
  const color = type === 'error'
    ? { bg:'var(--error-pale)', border:'rgba(239,68,68,.2)', text:'#b91c1c', icon:'exclamation-circle' }
    : { bg:'var(--success-pale)', border:'rgba(16,185,129,.2)', text:'#065f46', icon:'check-circle' };
  el.style.cssText = `display:flex;background:${color.bg};border:1px solid ${color.border};color:${color.text};border-radius:10px;padding:10px 14px;font-size:.84rem;align-items:flex-start;gap:8px;margin-bottom:12px;`;
  el.innerHTML = `<i class="fas fa-${color.icon}" style="margin-top:1px;flex-shrink:0;"></i><span>${msg}</span>`;
}

function hidePwAlert() {
  const el = document.getElementById('pwAlert');
  if (el) el.style.display = 'none';
}

// ── Render saved destinations ───────────────────────────────
// Keep a reference to the current saved list so the modal can access it
let _currentSaved = [];

function renderSaved(saved) {
  const grid  = document.getElementById('savedGrid');
  const empty = document.getElementById('savedEmpty');
  if (!grid) return;

  _currentSaved = saved || [];

  if (!_currentSaved.length) {
    grid.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';

  grid.innerHTML = _currentSaved.map((d, i) => `
    <div class="saved-card" data-idx="${i}">
      <div class="saved-img">
        <img src="${d.image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&q=80'}"
             alt="${d.name} scenery" loading="lazy"
             onerror="this.src='https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&q=80'">
        <span class="sc-badge ${d.budget || ''}">
          ${d.budget === 'budget' ? 'Budget' : d.budget === 'luxury' ? 'Luxury' : 'Moderate'}
        </span>
      </div>
      <div class="saved-body">
        <h4>${d.name}</h4>
        <p class="sc-country"><i class="fas fa-map-marker-alt"></i>${d.country || ''}</p>
        <div class="saved-actions">
          <button class="btn-explore btn-explore-modal" data-idx="${i}"><i class="fas fa-compass"></i> Explore</button>
          <button class="btn-remove" onclick="removeSaved('${d.docId}','${d.name}')"><i class="fas fa-trash-alt"></i></button>
        </div>
      </div>
    </div>`).join('');

  // Wire Explore buttons to open detail modal
  grid.querySelectorAll('.btn-explore-modal').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const idx   = parseInt(btn.dataset.idx);
      const place = _currentSaved[idx];
      if (!place) return;
      // Enrich with local DESTINATIONS data for highlights/tips
      const localMatch = (typeof DESTINATIONS !== 'undefined' && Array.isArray(DESTINATIONS))
        ? DESTINATIONS.find(d => d.id === place.id) : null;
      const enriched = localMatch ? Object.assign({}, localMatch, place) : place;
      openSavedPlaceDetail(enriched, _currentSaved);
    });
  });
}

// ── Saved-place detail modal ────────────────────────────────
function openSavedPlaceDetail(place, allPlaces) {
  const SP_OV  = 'savedPlacesModalOverlay';
  const SP_LST = 'savedPlacesList';

  // Create the modal shell if TTModals hasn't injected it yet
  if (!document.getElementById(SP_OV)) {
    const overlay = document.createElement('div');
    overlay.id = SP_OV;
    overlay.className = 'modal-overlay';
    overlay.setAttribute('aria-modal','true');
    overlay.setAttribute('role','dialog');
    overlay.innerHTML = `
      <div class="modal-container">
        <div class="modal-header">
          <h3><i class="fas fa-heart"></i> Saved Places</h3>
          <button class="modal-close" id="savedPlacesModalClose" aria-label="Close"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body" id="${SP_LST}"></div>
      </div>`;
    document.body.appendChild(overlay);
    document.getElementById('savedPlacesModalClose')?.addEventListener('click', () => {
      overlay.classList.remove('active'); document.body.style.overflow = '';
    });
    overlay.addEventListener('click', e => {
      if (e.target === overlay) { overlay.classList.remove('active'); document.body.style.overflow = ''; }
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && overlay.classList.contains('active')) {
        overlay.classList.remove('active'); document.body.style.overflow = '';
      }
    });
  }

  document.getElementById(SP_OV).classList.add('active');
  document.body.style.overflow = 'hidden';

  // Render detail view
  const c = document.getElementById(SP_LST);
  if (!c) return;

  const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='220'%3E%3Crect width='400' height='220' fill='%23e2e8f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='14' fill='%2394a3b8' font-family='sans-serif'%3ENo Image%3C/text%3E%3C/svg%3E";
  function esc(v) { return String(v||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  const name       = place.name || 'Unknown Place';
  const country    = place.country || '';
  const continent  = place.continent || '';
  const loc        = [country, continent].filter(Boolean).join(', ');
  const tier       = (place.budget || '').toLowerCase();
  const tierLabel  = tier ? tier.charAt(0).toUpperCase() + tier.slice(1) : '';
  const img        = place.image || place.img || PLACEHOLDER;
  const desc       = place.description || '';
  const highlights = Array.isArray(place.highlights) ? place.highlights.filter(Boolean) : [];
  const tips       = Array.isArray(place.tips) ? place.tips.filter(Boolean) : [];
  const tags       = Array.isArray(place.tags) ? place.tags.filter(Boolean) : [];
  const rating     = place.rating ? Number(place.rating).toFixed(1) : null;
  const destUrl    = `destinations.html${place.id ? '?open='+encodeURIComponent(place.id) : ''}`;

  c.innerHTML = `
    <div class="tt-detail-view">
      <div class="tt-hero-img">
        <img src="${esc(img)}" alt="${esc(name)}" loading="lazy" onerror="this.src='${PLACEHOLDER}'">
        <div class="tt-hero-overlay">
          ${tier   ? `<span class="tt-hero-badge ${esc(tier)}">${esc(tierLabel)}</span>` : '<span></span>'}
          ${rating ? `<span class="tt-hero-rating"><i class="fas fa-star"></i> ${esc(rating)}</span>` : ''}
        </div>
      </div>
      <div class="tt-detail-head">
        <h2 class="tt-detail-title">${esc(name)}</h2>
        ${loc ? `<div class="tt-detail-loc"><i class="fas fa-map-marker-alt"></i><span>${esc(loc)}</span></div>` : ''}
      </div>
      ${tags.length ? `<div class="tt-tags">${tags.map(t=>`<span class="tt-tag">${esc(t)}</span>`).join('')}</div>` : ''}
      ${desc ? `<p class="tt-detail-desc">${esc(desc)}</p>` : ''}
      <div class="tt-two-col">
        <div class="tt-col">
          <div class="tt-section-title"><i class="fas fa-check-circle"></i> Highlights</div>
          ${highlights.length
            ? `<ul class="tt-list">${highlights.map(h=>`<li><i class="fas fa-check-circle"></i>${esc(h)}</li>`).join('')}</ul>`
            : `<p class="tt-none">No highlights listed.</p>`}
        </div>
        <div class="tt-col">
          <div class="tt-section-title"><i class="fas fa-lightbulb"></i> Travel Tips</div>
          ${tips.length
            ? `<ul class="tt-list">${tips.map(t=>`<li><i class="fas fa-lightbulb"></i>${esc(t)}</li>`).join('')}</ul>`
            : `<p class="tt-none">No tips listed.</p>`}
        </div>
      </div>
      <div class="tt-actions">
        <a href="${esc(destUrl)}" class="tt-action-btn tt-action-primary"><i class="fas fa-compass"></i> Explore Destination</a>
        ${place.docId ? `<button class="tt-action-btn tt-action-secondary" id="profileRemoveDetailBtn"><i class="fas fa-heart-broken"></i> Remove</button>` : ''}
      </div>
    </div>`;

  if (place.docId) {
    document.getElementById('profileRemoveDetailBtn')?.addEventListener('click', async () => {
      await TT.removeDest(place.docId);
      document.getElementById(SP_OV).classList.remove('active');
      document.body.style.overflow = '';
      showToast(`${name} removed.`, 'info');
    });
  }
}


// ── Budget detail modal ─────────────────────────────────────
function initBudgetModal() {
  if (document.getElementById('budgetDetailOverlay')) return;

  // Inject CSS once
  if (!document.getElementById('budget-modal-style')) {
    const s = document.createElement('style');
    s.id = 'budget-modal-style';
    s.textContent = `
      #budgetDetailOverlay{position:fixed;inset:0;background:rgba(10,22,40,.62);backdrop-filter:blur(8px);z-index:99990;display:flex;align-items:center;justify-content:center;padding:16px;opacity:0;visibility:hidden;transition:opacity .3s,visibility .3s}
      #budgetDetailOverlay.active{opacity:1;visibility:visible}
      #budgetDetailOverlay .bm-container{background:#fff;border-radius:24px;width:100%;max-width:500px;max-height:88vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 32px 80px rgba(10,22,40,.35);transform:scale(.95) translateY(20px);transition:transform .35s cubic-bezier(.34,1.56,.64,1)}
      #budgetDetailOverlay.active .bm-container{transform:scale(1) translateY(0)}
      .bm-header{display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border-bottom:1px solid #e2e8f0;background:linear-gradient(135deg,#0a1628,#1e3a5f);flex-shrink:0}
      .bm-header h3{font-family:'DM Serif Display',Georgia,serif;font-size:1.2rem;color:#fff;margin:0;display:flex;align-items:center;gap:10px}
      .bm-header h3 i{color:#f87171}
      .bm-close{width:36px;height:36px;border-radius:50%;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.1);color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:1rem;transition:background .22s,transform .22s;flex-shrink:0}
      .bm-close:hover{background:rgba(255,255,255,.22);transform:rotate(90deg)}
      .bm-body{flex:1;overflow-y:auto;padding:22px 22px 32px}
      .bm-dest-row{display:flex;align-items:center;gap:14px;margin-bottom:18px}
      .bm-dest-icon{width:50px;height:50px;border-radius:12px;background:linear-gradient(135deg,#0a1628,#2563eb);display:flex;align-items:center;justify-content:center;flex-shrink:0}
      .bm-dest-icon i{color:#fff;font-size:1.3rem}
      .bm-dest-info{flex:1;min-width:0}
      .bm-dest-name{font-family:'DM Serif Display',Georgia,serif;font-size:1.3rem;color:#0a1628;line-height:1.2}
      .bm-dest-loc{display:flex;align-items:center;gap:5px;font-size:.8rem;color:#64748b;margin-top:2px}
      .bm-dest-loc i{color:#2563eb;font-size:.7rem}
      .bm-dest-date{font-size:.75rem;color:#94a3b8;margin-top:2px;display:flex;align-items:center;gap:4px}
      .bm-total-card{background:linear-gradient(135deg,#0a1628,#1e3a5f);border-radius:16px;padding:20px;text-align:center;margin-bottom:16px}
      .bm-total-label{font-size:.75rem;color:rgba(255,255,255,.6);text-transform:uppercase;letter-spacing:.6px;margin-bottom:5px}
      .bm-total-amount{font-family:'DM Serif Display',Georgia,serif;font-size:2rem;font-weight:700;color:#fff;line-height:1}
      .bm-total-per{font-size:.8rem;color:rgba(255,255,255,.6);margin-top:6px;display:flex;align-items:center;justify-content:center;gap:5px}
      .bm-meta-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px}
      .bm-meta-item{display:flex;align-items:center;gap:9px;padding:10px 12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px}
      .bm-meta-icon{width:28px;height:28px;border-radius:8px;background:#eff6ff;display:flex;align-items:center;justify-content:center;flex-shrink:0}
      .bm-meta-icon i{color:#2563eb;font-size:.75rem}
      .bm-meta-lbl{font-size:.65rem;color:#94a3b8;text-transform:uppercase;letter-spacing:.4px}
      .bm-meta-val{font-size:.85rem;font-weight:700;color:#0a1628;margin-top:1px}
      .bm-section-title{font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:#0a1628;display:flex;align-items:center;gap:6px;margin-bottom:10px}
      .bm-section-title i{color:#2563eb}
      .bm-breakdown{background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-bottom:16px}
      .bm-breakdown-row{display:flex;justify-content:space-between;align-items:center;font-size:.875rem;padding:11px 14px;border-bottom:1px solid #f1f5f9}
      .bm-breakdown-row:last-child{border-bottom:none}
      .bm-breakdown-lbl{color:#475569}
      .bm-breakdown-val{font-weight:700;color:#0a1628;font-family:'DM Serif Display',Georgia,serif}
      .bm-actions{display:flex;gap:10px;margin-top:4px}
      .bm-btn{flex:1;display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:12px 18px;border-radius:9999px;font-size:.875rem;font-weight:600;font-family:'DM Sans',system-ui,sans-serif;cursor:pointer;border:none;text-decoration:none;transition:background .22s,transform .22s,box-shadow .22s;white-space:nowrap}
      .bm-btn-primary{background:#0a1628;color:#fff}
      .bm-btn-primary:hover{background:#2563eb;transform:translateY(-2px);box-shadow:0 8px 20px rgba(10,22,40,.2)}
      .bm-btn-secondary{background:#f1f5f9;color:#0a1628;border:1px solid #e2e8f0}
      .bm-btn-secondary:hover{background:#fee2e2;color:#dc2626;border-color:#fca5a5;transform:translateY(-2px)}
      @media(max-width:540px){
        #budgetDetailOverlay{padding:0;align-items:flex-end}
        #budgetDetailOverlay .bm-container{max-height:92vh;border-radius:20px 20px 0 0}
        .bm-meta-grid{grid-template-columns:1fr 1fr}
      }
    `;
    document.head.appendChild(s);
  }

  // Inject HTML
  const overlay = document.createElement('div');
  overlay.id = 'budgetDetailOverlay';
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('role', 'dialog');
  overlay.innerHTML = `
    <div class="bm-container">
      <div class="bm-header">
        <h3><i class="fas fa-calculator"></i> Budget Details</h3>
        <button class="bm-close" id="budgetModalClose" aria-label="Close"><i class="fas fa-times"></i></button>
      </div>
      <div class="bm-body" id="budgetModalBody"></div>
    </div>`;
  document.body.appendChild(overlay);

  // Close handlers
  document.getElementById('budgetModalClose').addEventListener('click', closeBudgetModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeBudgetModal(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) closeBudgetModal();
  });
}

function closeBudgetModal() {
  const ov = document.getElementById('budgetDetailOverlay');
  if (ov) { ov.classList.remove('active'); document.body.style.overflow = ''; }
}

function openBudgetDetail(calc, allCalcs) {
  initBudgetModal();
  const ov   = document.getElementById('budgetDetailOverlay');
  const body = document.getElementById('budgetModalBody');
  if (!ov || !body) return;

  const dest      = calc.destination || calc.destName || calc.name || 'Saved Budget';
  const travelers = calc.travelers || calc.people || 1;
  const nights    = calc.nights || calc.duration || calc.days || 0;
  const currency  = calc.currency || 'USD';
  const symbol    = calc.currencySymbol || calc.symbol || '$';
  const totalNum  = calc.totalNum || calc.totalCost || calc.grandTotal
    || (typeof calc.total === 'number' ? calc.total : parseFloat(String(calc.total || '').replace(/[^0-9.]/g, '')) || 0);
  const perPerson = travelers > 1 ? totalNum / travelers : null;
  const breakdown = calc.breakdown || calc.items || calc.costs || {};
  const bEntries  = Object.entries(breakdown).filter(([, v]) => v || v === 0);
  const docId     = calc.docId;

  function fmtNum(n) {
    const num = Number(n);
    if (isNaN(num)) return symbol + '0';
    return symbol + num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  function fmtSavedAt(val) {
    if (!val) return '';
    let d;
    if (val?.toDate) d = val.toDate();
    else if (val?.seconds) d = new Date(val.seconds * 1000);
    else d = new Date(val);
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  const savedDate = fmtSavedAt(calc.savedAt || calc.createdAt || calc.date || '');

  const bHtml = bEntries.length
    ? bEntries.map(([l, v]) => `
        <div class="bm-breakdown-row">
          <span class="bm-breakdown-lbl">${l}</span>
          <span class="bm-breakdown-val">${fmtNum(v)}</span>
        </div>`).join('')
    : `<div class="bm-breakdown-row"><span class="bm-breakdown-lbl" style="color:#94a3b8;font-style:italic">No breakdown available</span><span class="bm-breakdown-val">—</span></div>`;

  body.innerHTML = `
    <div class="bm-dest-row">
      <div class="bm-dest-icon"><i class="fas fa-calculator"></i></div>
      <div class="bm-dest-info">
        <div class="bm-dest-name">${dest}</div>
        <div class="bm-dest-loc"><i class="fas fa-map-marker-alt"></i><span>${dest}</span></div>
        ${savedDate ? `<div class="bm-dest-date"><i class="fas fa-calendar-alt"></i> Saved ${savedDate}</div>` : ''}
      </div>
    </div>
    <div class="bm-total-card">
      <div class="bm-total-label">Total Trip Cost</div>
      <div class="bm-total-amount">${fmtNum(totalNum)}</div>
      ${perPerson !== null ? `<div class="bm-total-per"><i class="fas fa-user"></i>${fmtNum(perPerson)} per person</div>` : ''}
    </div>
    <div class="bm-meta-grid">
      <div class="bm-meta-item"><div class="bm-meta-icon"><i class="fas fa-users"></i></div><div><div class="bm-meta-lbl">Travelers</div><div class="bm-meta-val">${travelers}</div></div></div>
      <div class="bm-meta-item"><div class="bm-meta-icon"><i class="fas fa-moon"></i></div><div><div class="bm-meta-lbl">Nights</div><div class="bm-meta-val">${nights || '—'}</div></div></div>
      <div class="bm-meta-item"><div class="bm-meta-icon"><i class="fas fa-coins"></i></div><div><div class="bm-meta-lbl">Currency</div><div class="bm-meta-val">${currency}</div></div></div>
    </div>
    <div class="bm-section-title"><i class="fas fa-list-ul"></i> Cost Breakdown</div>
    <div class="bm-breakdown">${bHtml}</div>
    <div class="bm-actions">
      <a href="calculator.html" class="bm-btn bm-btn-primary"><i class="fas fa-calculator"></i> Open Calculator</a>
      ${docId ? `<button class="bm-btn bm-btn-secondary" id="bmDeleteBtn"><i class="fas fa-trash-alt"></i> Delete</button>` : ''}
    </div>`;

  // Delete handler
  if (docId) {
    document.getElementById('bmDeleteBtn')?.addEventListener('click', async () => {
      const fn = window.TT?.deleteCalc || window.TT?.removeSavedCalc;
      if (fn) {
        await fn(docId).catch(() => {});
      }
      closeBudgetModal();
      showToast('Budget deleted.', 'info');
      await loadCalcHistory(); // refresh the list
    });
  }

  ov.classList.add('active');
  document.body.style.overflow = 'hidden';
}

// ── Load budget history ─────────────────────────────────────
async function loadCalcHistory() {
  const container = document.getElementById('calcHistory');
  if (!container) return;
  const calcs = await TT.getCalcs();
  if (!calcs.length) {
    container.innerHTML = `<div style="text-align:center;padding:40px;color:var(--gray-400)">
      <i class="fas fa-calculator" style="font-size:2rem;margin-bottom:12px;opacity:.4"></i>
      <p>No saved budgets yet. <a href="calculator.html" style="color:var(--blue);font-weight:600">Plan your first trip →</a></p></div>`;
    return;
  }
  container.innerHTML = calcs.map((c, i) => {
    const totalNum = c.totalNum || c.totalCost || c.grandTotal
      || (typeof c.total === 'number' ? c.total : parseFloat(String(c.total || '').replace(/[^0-9.]/g, '')) || 0);
    const symbol = c.currencySymbol || c.symbol || '$';
    const totalFmt = symbol + Math.round(totalNum).toLocaleString();
    const date = c.savedAt?.toDate
      ? c.savedAt.toDate().toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' })
      : 'Recently';
    return `<div class="calc-history-card" data-idx="${i}" style="background:var(--white);border:1px solid var(--gray-100);border-radius:var(--r-lg);padding:18px 22px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;box-shadow:var(--sh);cursor:pointer;transition:border-color .2s,box-shadow .2s,transform .2s">
      <div>
        <div style="font-family:var(--font-serif);font-size:1.05rem;color:var(--navy)"><i class="fas fa-map-marker-alt" style="color:var(--blue);margin-right:6px"></i>${c.destination || 'Trip'}</div>
        <div style="font-size:.8rem;color:var(--gray-500)">${c.days || '?'} days · ${c.travelers || 1} traveller${(c.travelers || 1) > 1 ? 's' : ''} · ${date}</div>
      </div>
      <div style="display:flex;align-items:center;gap:10px">
        <div style="font-family:var(--font-serif);font-size:1.4rem;font-weight:700">${totalFmt}</div>
        <i class="fas fa-chevron-right" style="color:var(--gray-400);font-size:.8rem"></i>
      </div>
    </div>`;
  }).join('');

  // Hover effect + click handler
  const style = document.createElement('style');
  style.textContent = `.calc-history-card:hover{border-color:#2563eb!important;box-shadow:0 4px 16px rgba(37,99,235,.12)!important;transform:translateY(-1px)}`;
  if (!document.getElementById('chc-style')) { style.id = 'chc-style'; document.head.appendChild(style); }

  container.querySelectorAll('.calc-history-card').forEach(card => {
    card.addEventListener('click', () => {
      const idx = parseInt(card.dataset.idx);
      openBudgetDetail(calcs[idx], calcs);
    });
  });
}

// ── Remove saved destination ────────────────────────────────
window.removeSaved = async function(docId, name) {
  const res = await TT.removeDest(docId);
  if (res.ok) showToast(`${name} removed.`, 'info');
  else showToast('Could not remove.', 'error');
};

// ── Single DOMContentLoaded ─────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  TT.initNav();
  initCoverUpload();

  // ── Require auth ───────────────────────────────────────────
  TT.onAuthChanged(async user => {
    if (!user) {
      const loginModal = document.getElementById('loginModalOverlay');
      if (loginModal) {
        loginModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        return;
      }
      window.location.href = 'login.html?next=profile.html';
      return;
    }

    // Use displayName, else email-prefix (e.g. hatdog@gmail.com → "Hatdog")
    const rawName  = user.displayName || '';
    const name     = rawName || (user.email ? user.email.split('@')[0] : 'Traveler');
    const displayName = name.charAt(0).toUpperCase() + name.slice(1);
    const email    = user.email || '';
    const initials = displayName.split(/[\s._-]+/).map(n => n[0]).join('').substring(0, 2).toUpperCase();

    const joined = user.metadata?.creationTime
      ? new Date(user.metadata.creationTime)
          .toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
      : 'Recently';

    // Load photoURL from Firestore (base64 avatar lives there, not in Firebase Auth)
    const profile0 = await TT.getProfile();
    const photoURL = profile0?.photoURL || user.photoURL || null;

    // Render hero avatar — photo or initials
    renderAvatar('profileInitials', photoURL, initials);

    // Sync settings avatar thumb
    const settingsThumb = document.getElementById('settingsAvatarThumb');
    if (settingsThumb) {
      if (photoURL) {
        settingsThumb.innerHTML = `<img src="${photoURL}" alt="avatar" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
      } else {
        settingsThumb.textContent = initials;
      }
    }

    setTxt('profileName', displayName);
    setTxt('profileEmail', email);
    setTxt('profileJoined', `Member since ${joined}`);

    setVal('nameInput', rawName || displayName);
    setVal('emailInput', email);

    // Load extra profile fields from Firestore (already fetched above as profile0)
    const profile = profile0 || {};
    if (profile) {
      setVal('bioInput',         profile.bio         || '');
      setVal('nationalityInput', profile.nationality || '');
      setVal('phoneInput',       profile.phone       || '');
      
      // Load cover photo
      loadCoverPhoto();
    }

    // Show/hide password change section for Google-only users
    const isPasswordUser = user.providerData?.some(p => p.providerId === 'password');
    const pwSection = document.getElementById('changePasswordForm')?.closest('div');
    if (pwSection) pwSection.style.display = isPasswordUser ? '' : 'none';

    await loadCalcHistory();
  });

  // ── Avatar upload (crop modal) ────────────────────────────
  (function initAvatarModal() {
    const overlay      = document.getElementById('avatarModalOverlay');
    const closeBtn     = document.getElementById('avatarModalClose');
    const cancelBtn    = document.getElementById('avatarBtnCancel');
    const saveBtn      = document.getElementById('avatarBtnSave');
    const pickerInput  = document.getElementById('avatarPickerInput');
    const dropzone     = document.getElementById('avatarDropzone');
    const previewRing  = document.getElementById('avatarPreviewRing');
    const placeholder  = document.getElementById('avatarPreviewPlaceholder');
    const zoomRow      = document.getElementById('avatarZoomRow');
    const zoomSlider   = document.getElementById('avatarZoomSlider');

    // All trigger points that open the modal
    const heroWrap      = document.getElementById('avatarWrap');
    const settingsRow   = document.getElementById('settingsAvatarRow');

    let _srcImage  = null; // HTMLImageElement of the chosen file
    let _zoom      = 1;
    let _previewEl = null; // the <canvas> or <img> used in the ring

    function openModal() {
      resetModal();
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closeModal() {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
      pickerInput.value = '';
    }
    function resetModal() {
      _srcImage  = null;
      _zoom      = 1;
      if (zoomSlider) zoomSlider.value = 1;
      if (zoomRow)    zoomRow.style.display = 'none';
      if (saveBtn)    saveBtn.disabled = true;
      // Restore placeholder in preview ring
      if (previewRing && placeholder) {
        // Remove any canvas/img injected earlier
        const old = previewRing.querySelector('canvas, img');
        if (old) old.remove();
        placeholder.style.display = '';
      }
    }

    // Open triggers
    heroWrap?.addEventListener('click',    e => { e.stopPropagation(); openModal(); });
    heroWrap?.addEventListener('keydown',  e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(); } });
    settingsRow?.addEventListener('click', e => { e.stopPropagation(); openModal(); });
    settingsRow?.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(); } });

    // Close triggers
    closeBtn?.addEventListener('click',  closeModal);
    cancelBtn?.addEventListener('click', closeModal);
    overlay?.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && overlay?.classList.contains('open')) closeModal(); });

    // Drag-and-drop on dropzone
    dropzone?.addEventListener('dragover',  e => { e.preventDefault(); dropzone.classList.add('drag-over'); });
    dropzone?.addEventListener('dragleave', () => dropzone.classList.remove('drag-over'));
    dropzone?.addEventListener('drop', e => {
      e.preventDefault();
      dropzone.classList.remove('drag-over');
      const file = e.dataTransfer?.files?.[0];
      if (file) handleFile(file);
    });

    // File input change
    pickerInput?.addEventListener('change', () => {
      const file = pickerInput.files?.[0];
      if (file) handleFile(file);
    });

    // Zoom slider
    zoomSlider?.addEventListener('input', () => {
      _zoom = parseFloat(zoomSlider.value);
      renderPreviewCanvas();
    });

    function handleFile(file) {
      if (!file.type.startsWith('image/')) {
        showToast('Please choose a JPG, PNG, or WebP image.', 'error');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image too large — max 5 MB.', 'error');
        return;
      }
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        _srcImage = img;
        _zoom     = 1;
        if (zoomSlider) zoomSlider.value = 1;
        if (zoomRow)    zoomRow.style.display = 'flex';
        if (saveBtn)    saveBtn.disabled = false;
        if (placeholder) placeholder.style.display = 'none';
        renderPreviewCanvas();
      };
      img.onerror = () => { URL.revokeObjectURL(url); showToast('Could not load image.', 'error'); };
      img.src = url;
    }

    function renderPreviewCanvas() {
      if (!_srcImage || !previewRing) return;
      // Remove old canvas
      previewRing.querySelector('canvas')?.remove();

      const SIZE   = 140; // ring size in px
      const canvas = document.createElement('canvas');
      canvas.width  = SIZE;
      canvas.height = SIZE;
      canvas.style.cssText = 'width:100%;height:100%;display:block;border-radius:50%;';
      const ctx  = canvas.getContext('2d');

      // Clip to circle
      ctx.beginPath();
      ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2, 0, Math.PI * 2);
      ctx.clip();

      // Scale image to cover the canvas, then apply zoom
      const scale   = Math.max(SIZE / _srcImage.width, SIZE / _srcImage.height) * _zoom;
      const drawW   = _srcImage.width  * scale;
      const drawH   = _srcImage.height * scale;
      const offsetX = (SIZE - drawW) / 2;
      const offsetY = (SIZE - drawH) / 2;
      ctx.drawImage(_srcImage, offsetX, offsetY, drawW, drawH);

      previewRing.insertBefore(canvas, placeholder);
    }

    // Save / upload
    saveBtn?.addEventListener('click', async () => {
      if (!_srcImage) return;

      saveBtn.disabled  = true;
      saveBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Uploading…';

      try {
        // Produce a 200×200 circular-cropped JPEG
        const OUT    = 200;
        const canvas = document.createElement('canvas');
        canvas.width  = OUT;
        canvas.height = OUT;
        const ctx    = canvas.getContext('2d');
        ctx.beginPath();
        ctx.arc(OUT / 2, OUT / 2, OUT / 2, 0, Math.PI * 2);
        ctx.clip();
        const scale   = Math.max(OUT / _srcImage.width, OUT / _srcImage.height) * _zoom;
        const drawW   = _srcImage.width  * scale;
        const drawH   = _srcImage.height * scale;
        const offsetX = (OUT - drawW) / 2;
        const offsetY = (OUT - drawH) / 2;
        ctx.drawImage(_srcImage, offsetX, offsetY, drawW, drawH);
        const dataURL = canvas.toDataURL('image/jpeg', 0.82);

        // Save to Firestore via TT
        const res = await TT.updateUserProfile({ photoURL: dataURL });
        if (!res.ok) { showToast(res.err || 'Upload failed.', 'error'); return; }

        // Update every avatar element on the page
        applyPhotoEverywhere(dataURL);
        closeModal();
        showToast('Profile photo updated! <i class="fas fa-check"></i>', 'success');
      } catch (err) {
        console.error(err);
        showToast('Could not upload photo. Try again.', 'error');
      } finally {
        saveBtn.disabled  = false;
        saveBtn.innerHTML = '<i class="fas fa-check"></i> Save Photo';
        pickerInput.value = '';
      }
    });
  })();

  // ── Change Password ────────────────────────────────────────
  document.getElementById('changePasswordForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const currentPw = document.getElementById('currentPwInput')?.value;
    const newPw     = document.getElementById('newPwInput')?.value;
    const confirmPw = document.getElementById('confirmPwInput')?.value;
    const btn       = document.getElementById('changePwBtn');

    hidePwAlert();

    if (!currentPw || !newPw || !confirmPw) {
      showPwAlert('Please fill in all password fields.', 'error'); return;
    }
    if (newPw.length < 6) {
      showPwAlert('New password must be at least 6 characters.', 'error'); return;
    }
    if (newPw !== confirmPw) {
      showPwAlert('New passwords do not match.', 'error'); return;
    }
    if (newPw === currentPw) {
      showPwAlert('New password must differ from current password.', 'error'); return;
    }

    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Updating…'; }

    try {
      const res = await TT.changePassword(currentPw, newPw);
      if (res.ok) {
        showPwAlert('Password updated successfully!', 'success');
        document.getElementById('currentPwInput').value = '';
        document.getElementById('newPwInput').value     = '';
        document.getElementById('confirmPwInput').value = '';
        const bar = document.getElementById('pwStrengthBar');
        const lbl = document.getElementById('pwStrengthLabel');
        if (bar) { bar.className = 'pw-strength-bar'; bar.style.width = '0'; }
        if (lbl) { lbl.textContent = ''; }
      } else {
        showPwAlert(res.err || 'Could not update password. Check your current password.', 'error');
      }
    } catch (err) {
      showPwAlert('An error occurred. Please try again.', 'error');
    }

    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-key"></i> Update Password'; }
  });

  // ── Saved destinations listener ────────────────────────────
  TT.listenSaved(saved => {
    renderSaved(saved || []);
    setTxt('savedCount',  saved?.length || 0);
    setTxt('savedCount2', saved?.length || 0);
  });

  // ── Tabs ───────────────────────────────────────────────────
  document.querySelectorAll('.p-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.p-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.p-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const panel = document.getElementById('pp-' + tab.dataset.panel);
      if (panel) panel.classList.add('active');
    });
  });

  // ── Profile form ───────────────────────────────────────────
  document.getElementById('profileForm')?.addEventListener('submit', async e => {
    e.preventDefault();

    const btn  = e.target.querySelector('.btn-save-profile');
    const name = document.getElementById('nameInput')?.value.trim();
    const bio  = document.getElementById('bioInput')?.value.trim();
    const nat  = document.getElementById('nationalityInput')?.value.trim();
    const ph   = document.getElementById('phoneInput')?.value.trim();

    if (!name) { showToast('Name cannot be empty.', 'error'); return; }

    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Saving…'; }

    try {
      const res = await TT.updateUserProfile({
        displayName: name,
        bio:         bio || '',
        nationality: nat || '',
        phone:       ph  || ''
      });

      if (res.ok) {
        showToast('Profile updated successfully!', 'success');
        const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        setTxt('profileName', name);

        // Only update initials display if no photo is set
        const avatarEl = document.getElementById('profileInitials');
        if (avatarEl && !avatarEl.querySelector('img')) {
          avatarEl.textContent = initials;
        }

        // Sync nav dropdown
        const ddNameEl    = document.getElementById('ddName');
        const userNameBtn = document.getElementById('userNameBtn');
        const ddAvatar    = document.getElementById('ddAvatarText');
        const userAvatar  = document.getElementById('userAvatarBtn');
        if (ddNameEl)    ddNameEl.textContent   = name;
        if (userNameBtn) userNameBtn.textContent = name.split(' ')[0];
        if (ddAvatar   && !ddAvatar.querySelector('img'))   ddAvatar.textContent   = initials;
        if (userAvatar && !userAvatar.querySelector('img')) userAvatar.textContent = initials;
      } else {
        showToast(res.err || 'Update failed.', 'error');
      }
    } catch (err) {
      showToast('An error occurred. Please try again.', 'error');
    }

    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-save"></i> Save Changes'; }
  });

  // ── Sign out ───────────────────────────────────────────────
  document.getElementById('dangerSignOut')?.addEventListener('click', () => {
    TT.logout();
  });

  // ── Newsletter ─────────────────────────────────────────────
  document.getElementById('nlBtn')?.addEventListener('click', () => {
    const email = document.getElementById('nlEmail')?.value.trim();
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('Subscribed! <i class="fas fa-check"></i>', 'success');
      document.getElementById('nlEmail').value = '';
    } else {
      showToast('Enter a valid email.', 'error');
    }
  });

  // ── Quick action buttons ───────────────────────────────────
  document.querySelector('[data-goto="saved"]')?.addEventListener('click', () => {
    const savedTab = document.querySelector('.p-tab[data-panel="saved"]');
    if (savedTab) savedTab.click();
  });

  document.querySelector('[data-goto="budgets"]')?.addEventListener('click', () => {
    const budgetsTab = document.querySelector('.p-tab[data-panel="budgets"]');
    if (budgetsTab) budgetsTab.click();
  });

  document.querySelector('[data-goto="settings"]')?.addEventListener('click', () => {
    const settingsTab = document.querySelector('.p-tab[data-panel="settings"]');
    if (settingsTab) settingsTab.click();
  });
});
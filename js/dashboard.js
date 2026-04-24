document.addEventListener('DOMContentLoaded', async () => {
  TT.initNav();
  
  if (new URLSearchParams(window.location.search).get('saved') === '1') {
    const url = new URL(window.location);
    url.searchParams.delete('saved');
    window.history.replaceState({}, '', url);
    // Show success toast
    setTimeout(() => {
      showToast('Destination saved! <i class="fas fa-heart"></i>', 'success');
    }, 500);
  }
  
  // Check for info=1 param (returned when item was already saved)
  if (new URLSearchParams(window.location.search).get('info') === '1') {
    const url = new URL(window.location);
    url.searchParams.delete('info');
    window.history.replaceState({}, '', url);
    setTimeout(() => {
      showToast('This destination was already saved <i class="fas fa-info-circle"></i>', 'info');
    }, 500);
  }

  // Newsletter
  document.getElementById('nlBtn')?.addEventListener('click', () => {
    const e = document.getElementById('nlEmail')?.value.trim();
    if (e && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
      showToast('Subscribed! <i class="fas fa-check"></i>','success');
      document.getElementById('nlEmail').value = '';
    } else showToast('Please enter a valid email.','error');
  });

  // Hero search
  const doSearch = () => {
    const q = document.getElementById('heroQ')?.value.trim();
    const r = document.getElementById('heroRegion')?.value;
    const b = document.getElementById('heroBudget')?.value;
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    if (r) p.set('continent', r);
    if (b) p.set('budget', b);
    const inPages = window.location.pathname.includes('/pages/');
    window.location.href = (inPages?'destinations.html':'pages/destinations.html') + (p.toString()?'?'+p.toString():'');
  };
  document.getElementById('heroSearchBtn')?.addEventListener('click', doSearch);
  document.getElementById('heroQ')?.addEventListener('keypress', e => { if(e.key==='Enter')doSearch(); });

  // Welcome message
  TT.onAuthChanged(user => {
    const el = document.getElementById('heroWelcome') || document.getElementById('dashWelcome');
    if (!el) return;
    if (user) { const n = user.displayName?.split(' ')[0]||'Traveler'; el.textContent = `Welcome back, ${n}!`; }
    else el.textContent = 'Your Journey Starts Here';
  });

  // Featured destinations grid
  const grid = document.getElementById('featuredGrid');
  if (grid) {
    showGridSkeleton('featuredGrid', 6);
    await loadDestinations();
    const inPages = window.location.pathname.includes('/pages/');
    const destBase = inPages ? 'destinations.html' : 'pages/destinations.html';
    const featured = DESTINATIONS.slice(0, 6);
    if (!featured.length) {
      grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:48px;color:var(--gray-400)"><i class="fas fa-globe" style="font-size:2rem;display:block;margin-bottom:12px"></i><p>Loading destinations…</p></div>`;
      return;
    }
grid.innerHTML = featured.map(d => `
      <div class="dest-preview-card"
           onclick="window.location.href='${destBase}?open=${encodeURIComponent(d.id)}'">
        <div class="dc-img">
          <img src="${d.image}" alt="${d.name}" loading="lazy"
               onerror="this.src='https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=700&q=85'">
          <span class="dc-badge ${d.budget}">${d.budget==='budget'?'Budget-Friendly':d.budget==='luxury'?'Luxury':'Moderate'}</span>
          <span class="dc-rating"><i class="fas fa-star"></i>${d.rating}</span>
        </div>
        <div class="dc-body">
          <h3>${d.name}</h3>
          <div class="dc-meta"><i class="fas fa-map-marker-alt"></i>${[d.country, d.continent].filter(Boolean).join(', ')}</div>
          <div class="dc-tags">${(d.tags || []).slice(0, 3).map(t => `<span class="dc-tag">${t}</span>`).join('')}</div>
          <p>${(d.description||'').substring(0,95)}…</p>
          <div class="dc-footer">
            <div class="dc-price">From <strong>$${d.costs?.daily || d.basePrice || 50}/day</strong></div>
            <button class="btn-view">View →</button>
          </div>
        </div>
      </div>`).join('');
  }

  // Map
  initMap();
});

function initMap() {
  const el = document.getElementById('destinationMap');
  if (!el) return;
  if (typeof L === 'undefined') {
    el.innerHTML = '<div class="map-loading"><i class="fas fa-exclamation-triangle"></i><p>Map unavailable.</p></div>';
    return;
  }
  el.innerHTML = '<div id="mapInner" style="width:100%;height:100%"></div>';
  const map = L.map('mapInner', { minZoom:2, worldCopyJump:true }).setView([20,10],2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    crossOrigin:'anonymous'
  }).addTo(map);

  const icon = L.divIcon({
    className:'',
    html:`<div style="width:22px;height:22px;background:var(--navy,#0a1628);border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 3px 8px rgba(0,0,0,.3)"></div>`,
    iconSize:[22,22], iconAnchor:[11,22], popupAnchor:[0,-26]
  });

  const addMarkers = () => {
    if (!DESTINATIONS.length) { setTimeout(addMarkers,500); return; }
    const inPages = window.location.pathname.includes('/pages/');
    const base = inPages ? 'destinations.html' : 'pages/destinations.html';
    DESTINATIONS.forEach(d => {
      if (d.lat==null||d.lng==null) return;
      L.marker([d.lat,d.lng],{icon}).addTo(map)
        .bindPopup(`<strong style="font-family:serif;font-size:.9rem">${d.name}</strong><br><span style="font-size:.75rem;color:#64748b">${d.country}</span><br><a href="${base}?open=${encodeURIComponent(d.id)}" style="color:#2563eb;font-size:.78rem;font-weight:600">Explore →</a>`,{maxWidth:170});
    });
  };
  addMarkers();
}
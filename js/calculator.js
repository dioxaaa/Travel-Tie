
const CURRENCIES = [
  {code:'USD',name:'US Dollar',sym:'$'},{code:'EUR',name:'Euro',sym:'€'},
  {code:'GBP',name:'British Pound',sym:'£'},{code:'JPY',name:'Japanese Yen',sym:'¥'},
  {code:'AUD',name:'Australian Dollar',sym:'A$'},{code:'CAD',name:'Canadian Dollar',sym:'C$'},
  {code:'CHF',name:'Swiss Franc',sym:'CHF'},{code:'CNY',name:'Chinese Yuan',sym:'¥'},
  {code:'HKD',name:'Hong Kong Dollar',sym:'HK$'},{code:'NZD',name:'New Zealand Dollar',sym:'NZ$'},
  {code:'SGD',name:'Singapore Dollar',sym:'S$'},{code:'KRW',name:'South Korean Won',sym:'₩'},
  {code:'MXN',name:'Mexican Peso',sym:'MX$'},{code:'BRL',name:'Brazilian Real',sym:'R$'},
  {code:'INR',name:'Indian Rupee',sym:'₹'},{code:'THB',name:'Thai Baht',sym:'฿'},
  {code:'IDR',name:'Indonesian Rupiah',sym:'Rp'},{code:'MYR',name:'Malaysian Ringgit',sym:'RM'},
  {code:'PHP',name:'Philippine Peso',sym:'₱'},{code:'VND',name:'Vietnamese Dong',sym:'₫'},
  {code:'TRY',name:'Turkish Lira',sym:'₺'},{code:'ZAR',name:'South African Rand',sym:'R'},
  {code:'AED',name:'UAE Dirham',sym:'AED'},{code:'SAR',name:'Saudi Riyal',sym:'SAR'},
  {code:'EGP',name:'Egyptian Pound',sym:'E£'},{code:'MAD',name:'Moroccan Dirham',sym:'MAD'},
  {code:'NOK',name:'Norwegian Krone',sym:'kr'},{code:'SEK',name:'Swedish Krona',sym:'kr'},
  {code:'DKK',name:'Danish Krone',sym:'kr'},{code:'PLN',name:'Polish Zloty',sym:'zł'},
  {code:'CZK',name:'Czech Koruna',sym:'Kč'},{code:'HUF',name:'Hungarian Forint',sym:'Ft'},
  {code:'RON',name:'Romanian Leu',sym:'lei'},{code:'RUB',name:'Russian Ruble',sym:'₽'},
  {code:'PKR',name:'Pakistani Rupee',sym:'₨'},{code:'BDT',name:'Bangladeshi Taka',sym:'৳'},
  {code:'LKR',name:'Sri Lankan Rupee',sym:'₨'},{code:'NPR',name:'Nepalese Rupee',sym:'₨'},
  {code:'PEN',name:'Peruvian Sol',sym:'S/.'},{code:'COP',name:'Colombian Peso',sym:'COP$'},
  {code:'CLP',name:'Chilean Peso',sym:'CLP$'},{code:'ARS',name:'Argentine Peso',sym:'ARS$'},
  {code:'CUP',name:'Cuban Peso',sym:'₱'},{code:'JOD',name:'Jordanian Dinar',sym:'JD'},
  {code:'ILS',name:'Israeli Shekel',sym:'₪'},{code:'OMR',name:'Omani Rial',sym:'OMR'},
  {code:'FJD',name:'Fijian Dollar',sym:'FJ$'},
];

const EXCHANGE_KEY = '542b7a2b988398942e7b81f5';

// ── Validation helpers ─────────────────────────────────────

function setFieldError(fieldEl, msg) {
  clearFieldError(fieldEl);
  fieldEl.classList.add('calc-input-error');
  const err = document.createElement('div');
  err.className = 'calc-field-error';
  err.setAttribute('role', 'alert');
  err.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${msg}`;
  // Insert after closest .input-group, .select-wrapper, or .input-with-icon parent
  const parent = fieldEl.closest('.input-group') || fieldEl.closest('.cost-input-card') || fieldEl.parentElement;
  parent.appendChild(err);
}

function clearFieldError(fieldEl) {
  fieldEl.classList.remove('calc-input-error');
  const parent = fieldEl.closest('.input-group') || fieldEl.closest('.cost-input-card') || fieldEl.parentElement;
  parent.querySelector('.calc-field-error')?.remove();
}

function setSelectError(selectEl, msg) {
  clearSelectError(selectEl);
  selectEl.classList.add('calc-select-error');
  const wrapper = selectEl.closest('.select-wrapper') || selectEl.parentElement;
  const parent  = wrapper.closest('.input-group') || wrapper.parentElement;
  const err = document.createElement('div');
  err.className = 'calc-field-error';
  err.setAttribute('role', 'alert');
  err.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${msg}`;
  parent.appendChild(err);
}

function clearSelectError(selectEl) {
  selectEl.classList.remove('calc-select-error');
  const wrapper = selectEl.closest('.select-wrapper') || selectEl.parentElement;
  const parent  = wrapper.closest('.input-group') || wrapper.parentElement;
  parent.querySelector('.calc-field-error')?.remove();
}

function showValidationSummary(msgs) {
  let summary = document.getElementById('calcValidationSummary');
  if (!summary) {
    summary = document.createElement('div');
    summary.id = 'calcValidationSummary';
    summary.className = 'calc-validation-summary';
    summary.setAttribute('role', 'alert');
    summary.setAttribute('aria-live', 'assertive');
    const calcBtn = document.getElementById('calcBtn');
    calcBtn?.parentElement.insertBefore(summary, calcBtn);
  }
  summary.innerHTML = `
    <div class="cvs-header"><i class="fas fa-exclamation-triangle"></i> Please fix the following before calculating:</div>
    <ul>${msgs.map(m => `<li>${m}</li>`).join('')}</ul>`;
  summary.classList.add('visible');
  summary.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function clearValidationSummary() {
  const summary = document.getElementById('calcValidationSummary');
  if (summary) { summary.classList.remove('visible'); summary.innerHTML = ''; }
}

/**
 * Validates all required calculator fields.
 * Returns { valid: boolean, errors: string[] }
 */
function validateCalculatorForm() {
  const errors = [];

  // 1. Destination
  const destEl = document.getElementById('destination');
  if (!destEl?.value?.trim()) {
    setSelectError(destEl, 'Please select a destination.');
    errors.push('Destination is required.');
  } else {
    clearSelectError(destEl);
  }

  // 2. Trip duration
  const daysEl = document.getElementById('tripDays');
  const days   = parseInt(daysEl?.value, 10);
  if (!daysEl?.value || isNaN(days) || days < 1) {
    setFieldError(daysEl, 'Enter a valid duration (minimum 1 night).');
    errors.push('Trip duration must be at least 1 night.');
  } else if (days > 365) {
    setFieldError(daysEl, 'Duration cannot exceed 365 nights.');
    errors.push('Trip duration cannot exceed 365 nights.');
  } else {
    clearFieldError(daysEl);
  }

  // 3. Flight cost — required, must be a non-negative number
  const flightEl = document.getElementById('flightCost');
  const flight   = parseFloat(flightEl?.value);
  if (flightEl?.value === '' || flightEl?.value === null || isNaN(flight)) {
    setFieldError(flightEl, 'Enter your estimated round-trip flight cost (0 if none).');
    errors.push('Flight cost is required (enter 0 if not applicable).');
  } else if (flight < 0) {
    setFieldError(flightEl, 'Flight cost cannot be negative.');
    errors.push('Flight cost cannot be negative.');
  } else {
    clearFieldError(flightEl);
  }

  // 4. Hotel cost — required, must be a non-negative number
  const hotelEl = document.getElementById('hotelCost');
  const hotel   = parseFloat(hotelEl?.value);
  if (hotelEl?.value === '' || hotelEl?.value === null || isNaN(hotel)) {
    setFieldError(hotelEl, 'Enter your estimated hotel cost per night (0 if none).');
    errors.push('Hotel cost is required (enter 0 if not applicable).');
  } else if (hotel < 0) {
    setFieldError(hotelEl, 'Hotel cost cannot be negative.');
    errors.push('Hotel cost cannot be negative.');
  } else {
    clearFieldError(hotelEl);
  }

  // 5. Miscellaneous buffer — a radio must be selected
  const miscChecked = document.querySelector('input[name="miscPct"]:checked');
  if (!miscChecked) {
    const miscCard = document.querySelector('.misc-card');
    if (miscCard && !miscCard.querySelector('.calc-field-error')) {
      const err = document.createElement('div');
      err.className = 'calc-field-error';
      err.setAttribute('role', 'alert');
      err.innerHTML = '<i class="fas fa-exclamation-circle"></i> Please select a miscellaneous buffer percentage.';
      miscCard.querySelector('.cic-body')?.appendChild(err);
    }
    errors.push('Please select a miscellaneous buffer percentage.');
  } else {
    document.querySelector('.misc-card .calc-field-error')?.remove();
  }

  return { valid: errors.length === 0, errors };
}

// ── Clear individual errors on user interaction ────────────

function attachLiveValidation() {
  document.getElementById('destination')
    ?.addEventListener('change', function () { clearSelectError(this); clearValidationSummary(); });

  ['tripDays', 'flightCost', 'hotelCost'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', function () {
      clearFieldError(this);
      clearValidationSummary();
    });
  });

  document.querySelectorAll('input[name="miscPct"]').forEach(r => {
    r.addEventListener('change', () => {
      document.querySelector('.misc-card .calc-field-error')?.remove();
      clearValidationSummary();
    });
  });
}

// ──────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  TT.initNav();

  // Check for saved=1 param
  if (new URLSearchParams(window.location.search).get('saved') === '1') {
    const url = new URL(window.location);
    url.searchParams.delete('saved');
    url.searchParams.delete('view');
    window.history.replaceState({}, '', url);
    setTimeout(() => showToast('Budget saved! <i class="fas fa-check"></i>', 'success'), 500);
  }

  // Check for info=1 param
  if (new URLSearchParams(window.location.search).get('info') === '1') {
    const url = new URL(window.location);
    url.searchParams.delete('info');
    url.searchParams.delete('view');
    url.searchParams.delete('saved');
    window.history.replaceState({}, '', url);
    setTimeout(() => showToast('This budget was already saved <i class="fas fa-info-circle"></i>', 'info'), 500);
  }

  // Populate currency dropdowns
  ['fromCurrency', 'cvFromCur', 'cvToCur'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    CURRENCIES.forEach(c => {
      const o = document.createElement('option');
      o.value = c.code;
      o.textContent = `${c.code} — ${c.name}`;
      el.appendChild(o);
    });
  });
  const cvFrom = document.getElementById('cvFromCur');
  const cvTo   = document.getElementById('cvToCur');
  if (cvFrom) cvFrom.value = 'USD';
  if (cvTo)   cvTo.value   = 'PHP';

  // Load destinations
  const destinationSelect = document.getElementById('destination');
  if (destinationSelect) {
    (async () => {
      try {
        let dests = [];
        const BAD_COUNTRY = /^(unknown|unidentified|undefined|n\/a|none|null|-)$/i;
        
        // Try loading from Firestore directly
        let firestoreDests = [];
        try {
          if (window.TT && window.TT.db) {
            const { getDocs, collection } = await import(
              'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js'
            );
            const snap = await getDocs(collection(window.TT.db, 'destinations'));
            if (!snap.empty) {
              firestoreDests = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
              console.log('[Calculator] Loaded', firestoreDests.length, 'from Firestore');
            }
          }
        } catch (e) {
          console.warn('[Calculator] Firestore fetch failed:', e.message);
        }
        
        // Get local data
        let localDests = [];
        try {
          const destModule = await import('./destinations.js');
          localDests = destModule.DEST_DATA || [];
        } catch (e) {
          console.warn('[Calculator] Could not load local dests');
        }
        
        // Merge: prefer Firestore, fill gaps from local
        const localMap = {};
        localDests.forEach(d => { localMap[d.id] = d; });
        
        dests = firestoreDests.map(fd => {
          const local = localMap[fd.id] || {};
          const basePrice = Number(fd.basePrice) || local.basePrice || 80;
          return {
            name: fd.place || local.name || fd.id,
            country: fd.country || local.country || '',
            region: fd.region || local.region || '',
            budget: fd.budget || local.budget || 'moderate',
            rating: Number(fd.rating) || local.rating || 4.5,
            costs: {
              daily: basePrice,
              hotel: Number(fd.hotelPrice) || Math.round(basePrice * 1.6),
              flight: Number(fd.flightPrice) || local.costs?.flight || 700,
            },
            basePrice,
            description: fd.description || local.description,
            tags: fd.tags || local.tags,
          };
        });
        
        // If no Firestore data, use local
        if (!dests.length) {
          dests = localDests.map(d => ({
            ...d,
            costs: {
              daily: d.basePrice,
              hotel: Math.round(d.basePrice * 1.6),
              flight: d.costs?.flight || 700,
            },
          }));
        }
        
        console.log('[Calculator] Total destinations:', dests.length);
        
        // Create option groups map
        const groupsCache = {};
        function getGroup(region) {
          if (!groupsCache[region]) {
            const group = document.createElement('optgroup');
            group.label = region;
            destinationSelect.appendChild(group);
            groupsCache[region] = group;
          }
          return groupsCache[region];
        }
        
        // Helper to create option with full details
        function createOption(dest, group, isSaved = false) {
          const countryClean = (dest.country || '').trim();
          const showCountry = countryClean && !BAD_COUNTRY.test(countryClean);
          const region = (dest.region || 'other').charAt(0).toUpperCase() + (dest.region || 'other').slice(1);
          const daily = dest.costs?.daily || dest.basePrice || 50;
          const budget = dest.budget || 'moderate';
          
          const option = document.createElement('option');
          option.value = dest.name;
          // Show: Name — Country
          option.textContent = showCountry ? `${dest.name} — ${countryClean}` : dest.name;
          
          option.dataset.name = dest.name;
          option.dataset.country = dest.country || '';
          option.dataset.region = region;
          option.dataset.budget = budget;
          option.dataset.daily = daily;
          option.dataset.saved = isSaved ? 'true' : 'false';
          
          group.appendChild(option);
          return option;
        }
        
        // Add saved places first from Firestore (if logged in)
        try {
          const saved = await TT.getSaved();
          if (saved?.length) {
            const savedGroup = document.createElement('optgroup');
            savedGroup.label = '★ Saved Places';
            destinationSelect.appendChild(savedGroup);
            
            saved.forEach(dest => createOption(dest, savedGroup, true));
          }
        } catch (e) {
          console.log('No saved places or not logged in');
        }
        
        // Add all destinations grouped by region
        if (dests?.length) {
          const sorted = dests
            .filter(dest => dest.name && dest.name.trim())
            .sort((a, b) => (a.continent || 'Other').localeCompare(b.continent || 'Other') || a.name.localeCompare(b.name));
          
          sorted.forEach(dest => {
            const region = dest.continent || 'Other';
            const group = getGroup(region);
            createOption(dest, group);
          });
        }
      } catch (e) {
        console.warn('Could not load destinations:', e);
      }
    })();
  }

  // URL params from destinations page
  const P = new URLSearchParams(window.location.search);
  if (P.get('dest')) {
    const el = document.getElementById('destination');
    if (el) el.value = P.get('dest');
  }
  if (P.get('daily')) {
    const el = document.getElementById('dailyBudget');
    if (el) { el.value = P.get('daily'); document.getElementById('dailyVal').textContent = '$' + P.get('daily'); }
  }
  if (P.get('view') === 'saved') {
    setTimeout(() => { if (typeof TTModals !== 'undefined') TTModals.openSavedCalcs(); }, 500);
  }

  // Traveler counter
  let travelers = 2;
  const updateCount = () => { document.getElementById('travelerCount').textContent = travelers; };
  
  // Track currently loaded calculation (for updates)
  let currentLoadedCalcId = null;

  // ── Load a saved calc from sessionStorage (cross-page redirect from modals) ──
  try {
    const pending = sessionStorage.getItem('tt_load_calc');
    if (pending) {
      sessionStorage.removeItem('tt_load_calc');
      const calc = JSON.parse(pending);
      // Defer until after destinations are loaded
      setTimeout(() => { window.TTCalc?.load(calc); }, 900);
    }
  } catch(_) {}
  document.querySelector('.counter-btn.minus')?.addEventListener('click', () => {
    if (travelers > 1) { travelers--; updateCount(); }
  });
  document.querySelector('.counter-btn.plus')?.addEventListener('click', () => {
    if (travelers < 20) { travelers++; updateCount(); }
  });

  // Misc radio highlight
  document.querySelectorAll('.misc-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.misc-opt').forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
    });
  });

  // Daily slider
  const slider = document.getElementById('dailyBudget');
  const valEl  = document.getElementById('dailyVal');
  slider?.addEventListener('input', () => { valEl.textContent = '$' + slider.value + '/day'; });

  // Destination selection - auto-fill daily budget
  const destSelect = document.getElementById('destination');
  destSelect?.addEventListener('change', function() {
    const selected = this.options[this.selectedIndex];
    if (selected && selected.dataset.daily) {
      const daily = selected.dataset.daily;
      slider.value = daily;
      if (valEl) valEl.textContent = '$' + daily + '/day';
    }
  });

  // Attach live validation clearing
  attachLiveValidation();

  // Calculate button
  document.getElementById('calcBtn')?.addEventListener('click', calculate);

  // ── Helper: collect current calc data ─────────────────────
  function collectCalcData() {
    const dest         = document.getElementById('destination')?.value?.trim() || 'My Trip';
    const days         = Math.max(1, parseInt(document.getElementById('tripDays')?.value) || 7);
    const travelersNum = parseInt(document.getElementById('travelerCount')?.textContent) || 2;
    const currency     = document.getElementById('fromCurrency')?.value || 'USD';
    const sym          = CURRENCIES.find(c => c.code === currency)?.sym || '$';
    const daily        = parseInt(document.getElementById('dailyBudget')?.value) || 80;
    const flight       = parseFloat(document.getElementById('flightCost')?.value) || 0;
    const hotel        = parseFloat(document.getElementById('hotelCost')?.value) || 0;
    const miscPct      = parseInt(document.querySelector('input[name="miscPct"]:checked')?.value || 10);
    const flightTotal  = flight * travelersNum;
    const hotelTotal   = hotel * days;
    const dailyTotal   = daily * days * travelersNum;
    const subtotal     = flightTotal + hotelTotal + dailyTotal;
    const misc         = subtotal * (miscPct / 100);
    const totalNum     = subtotal + misc;
    const totalFmt     = document.getElementById('totalAmount')?.textContent || (sym + Math.round(totalNum).toLocaleString());
    return {
      destination: dest,
      days,
      nights: days,
      travelers: travelersNum,
      currency,
      currencySymbol: sym,
      total: totalFmt,
      totalNum,
      dailyBudget: daily,
      flightCostPerPerson: flight,
      hotelCostPerNight: hotel,
      miscPct,
      breakdown: {
        'Flights':       Math.round(flightTotal),
        'Accommodation': Math.round(hotelTotal),
        'Daily Expenses':Math.round(dailyTotal),
        'Misc / Buffer': Math.round(misc),
      },
    };
  }

  // ── TTCalc public API (used by modals.js doLoadCalc) ──────
  window.TTCalc = {
    load(calc) {
      try {
        // Store the docId of this calculation for later updates
        currentLoadedCalcId = calc.docId || null;
        
        // Restore destination
        const destEl = document.getElementById('destination');
        if (destEl && calc.destination) {
          // Try exact match first, then partial, then just use first option if available
          const opts = Array.from(destEl.options);
          let match = opts.find(o => o.value === calc.destination) ||
                      opts.find(o => o.value.toLowerCase().includes((calc.destination||'').toLowerCase()));
          
          // If no match found, set to first option (after blank option)
          if (!match && opts.length > 1) {
            match = opts[1]; // Skip blank option at index 0
          }
          
          if (match) destEl.value = match.value;
        }
        
        // Restore days
        const daysEl = document.getElementById('tripDays');
        if (daysEl && (calc.days || calc.nights)) {
          daysEl.value = calc.days || calc.nights;
        }
        
        // Restore travelers
        travelers = parseInt(calc.travelers) || 2;
        updateCount();
        
        // Restore daily budget
        const sliderEl = document.getElementById('dailyBudget');
        const valEl    = document.getElementById('dailyVal');
        if (sliderEl && calc.dailyBudget != null) {
          sliderEl.value = calc.dailyBudget;
          if (valEl) valEl.textContent = '$' + calc.dailyBudget + '/day';
        }
        
        // Restore flight
        const flightEl = document.getElementById('flightCost');
        if (flightEl && calc.flightCostPerPerson != null) {
          flightEl.value = calc.flightCostPerPerson;
        }
        
        // Restore hotel
        const hotelEl = document.getElementById('hotelCost');
        if (hotelEl && calc.hotelCostPerNight != null) {
          hotelEl.value = calc.hotelCostPerNight;
        }
        
        // Restore misc pct - ensure it's set correctly
        if (calc.miscPct != null) {
          const radio = document.querySelector(`input[name="miscPct"][value="${calc.miscPct}"]`);
          if (radio) {
            radio.checked = true;
            // Update .misc-opt active state
            document.querySelectorAll('.misc-opt').forEach(o => o.classList.remove('active'));
            radio.closest('.misc-opt')?.classList.add('active');
          } else {
            // If exact value not found, select first radio as fallback
            const firstRadio = document.querySelector('input[name="miscPct"]');
            if (firstRadio && !firstRadio.checked) {
              firstRadio.checked = true;
              document.querySelectorAll('.misc-opt').forEach(o => o.classList.remove('active'));
              firstRadio.closest('.misc-opt')?.classList.add('active');
            }
          }
        }
        
        // Restore currency
        const curEl = document.getElementById('fromCurrency');
        if (curEl && calc.currency) curEl.value = calc.currency;
        
        // Clear any previous errors
        clearValidationSummary();
        document.querySelectorAll('.calc-input-error, .calc-select-error').forEach(el => {
          el.classList.remove('calc-input-error', 'calc-select-error');
        });
        document.querySelectorAll('.calc-field-error').forEach(el => el.remove());
        
        // Close any open modals
        const modalOverlay = document.getElementById('savedCalcsModalOverlay');
        if (modalOverlay) {
          modalOverlay.classList.remove('active');
          document.body.style.overflow = '';
        }
        
        // Re-run calculate to show results
        setTimeout(() => {
          const calcBtn = document.getElementById('calcBtn');
          if (calcBtn) calcBtn.click();
          
          // Scroll to results after a small delay
          setTimeout(() => {
            const resultsPanel = document.getElementById('resultsPanel');
            if (resultsPanel && resultsPanel.style.display === 'block') {
              resultsPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            const destName = calc.destination || 'Budget';
            showToast(`${destName} loaded! <i class="fas fa-check"></i> (Editable)`, 'success');
          }, 300);
        }, 200);
      } catch(e) {
        console.error('[TTCalc.load]', e);
        showToast('Could not restore all fields.', 'error');
      }
    },
    
    // Clear the loaded calculation ID (called on new calculation)
    clearLoaded() {
      currentLoadedCalcId = null;
    }
  };

  // Save calculation
  document.getElementById('saveBtn')?.addEventListener('click', async () => {
    // Check if results are visible — require calculate first
    const panel = document.getElementById('resultsPanel');
    if (!panel || panel.style.display === 'none' || panel.style.display === '') {
      showToast('Please calculate your budget first <i class="fas fa-calculator"></i>', 'info');
      document.getElementById('calcBtn')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const calcData = collectCalcData();

    // Check if user is logged in first
    const user = TT.currentUser();
    if (!user) {
      localStorage.setItem('tt_pending_action', JSON.stringify({
        type: 'saveCalc',
        data: calcData,
        calcId: currentLoadedCalcId,
        timestamp: Date.now()
      }));
      showToast('Please sign in to save your budget <i class="fas fa-user"></i>', 'info');
      const loginModal = document.getElementById('loginModalOverlay');
      if (loginModal) {
        loginModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
      return;
    }

    // If a calculation is currently loaded, update it; otherwise create new
    let res;
    if (currentLoadedCalcId) {
      res = await TT.updateCalc(currentLoadedCalcId, calcData);
    } else {
      res = await TT.saveCalc(calcData);
    }

    if (res.ok) {
      const action = currentLoadedCalcId ? 'updated' : 'saved';
      showToast(`${calcData.destination} ${action}! <i class="fas fa-check"></i>`, 'success');
      // Clear the loaded calc ID since it's now saved
      currentLoadedCalcId = null;
    } else if (res.err?.includes('already saved')) {
      showToast(`<i class="fas fa-info-circle"></i> ${res.err}`, 'info');
    } else {
      showToast(res.err || 'Could not save budget.', 'error');
    }
  });

  // Print button
  document.getElementById('printBtn')?.addEventListener('click', () => window.print());

  // Newsletter
  document.getElementById('nlBtn')?.addEventListener('click', () => {
    const e = document.getElementById('nlEmail')?.value.trim();
    if (e && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
      showToast('Subscribed! <i class="fas fa-check"></i>', 'success');
      document.getElementById('nlEmail').value = '';
    } else {
      showToast('Enter a valid email address.', 'error');
    }
  });

  // Currency swap
  document.getElementById('swapBtn')?.addEventListener('click', () => {
    const f = document.getElementById('cvFromCur');
    const t = document.getElementById('cvToCur');
    if (f && t) [f.value, t.value] = [t.value, f.value];
  });

  // Convert button
  document.getElementById('convertBtn')?.addEventListener('click', doConvert);

  // ── Core calculate function ──────────────────────────────

  function calculate() {
    // Run validation first
    const { valid, errors } = validateCalculatorForm();
    if (!valid) {
      showValidationSummary(errors);
      // Scroll to first error
      const firstError = document.querySelector('.calc-input-error, .calc-select-error');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    clearValidationSummary();

    const dest     = document.getElementById('destination')?.value || 'Your Trip';
    const days     = Math.max(1, parseInt(document.getElementById('tripDays')?.value) || 7);
    const daily    = parseInt(document.getElementById('dailyBudget')?.value) || 80;
    const flight   = parseFloat(document.getElementById('flightCost')?.value) || 0;
    const hotel    = parseFloat(document.getElementById('hotelCost')?.value) || 0;
    const miscPct  = parseInt(document.querySelector('input[name="miscPct"]:checked')?.value || 10);
    const currency = document.getElementById('fromCurrency')?.value || 'USD';

    const flightTotal = flight * travelers;
    const hotelTotal  = hotel  * days;
    const dailyTotal  = daily  * days * travelers;
    const subtotal    = flightTotal + hotelTotal + dailyTotal;
    const misc        = subtotal * (miscPct / 100);
    const total       = subtotal + misc;
    const perPerson   = total / travelers;

    const sym = CURRENCIES.find(c => c.code === currency)?.sym || '$';
    const fmt = n => sym + Math.round(n).toLocaleString();

    document.getElementById('totalAmount').textContent     = fmt(total);
    document.getElementById('perPersonAmount').textContent = `${fmt(perPerson)} per person`;
    document.getElementById('destSummary').textContent     = dest;
    document.getElementById('bFlight').textContent = fmt(flightTotal);
    document.getElementById('bHotel').textContent  = fmt(hotelTotal);
    document.getElementById('bDaily').textContent  = fmt(dailyTotal);
    document.getElementById('bMisc').textContent   = fmt(misc);

    [
      { id: 'barFlight', pct: flightTotal / total * 100, col: '#2563eb' },
      { id: 'barHotel',  pct: hotelTotal  / total * 100, col: '#10b981' },
      { id: 'barDaily',  pct: dailyTotal  / total * 100, col: '#f59e0b' },
      { id: 'barMisc',   pct: misc        / total * 100, col: '#94a3b8' },
    ].forEach(({ id, pct, col }) => {
      const bar = document.getElementById(id);
      const p   = document.getElementById(id + 'Pct');
      if (bar) { bar.style.width = pct.toFixed(1) + '%'; bar.style.background = col; }
      if (p)   p.textContent = pct.toFixed(0) + '%';
    });

    buildTips(total / days);

    const panel = document.getElementById('resultsPanel');
    if (panel) {
      panel.style.display = 'block';
      panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    showToast('Budget calculated! <i class="fas fa-check"></i>', 'success');
  }

  function buildTips(dailyAvg) {
    const el = document.getElementById('budgetTips');
    if (!el) return;
    const tips = [
      dailyAvg > 200
        ? 'Consider travelling in shoulder season for 20–35% savings.'
        : 'Great budget! You\'re within the typical range for this type of trip.',
      'Book flights 6–8 weeks ahead for the best prices.',
      'Use a travel credit card to earn points on every purchase.',
      'Set aside 10–15% of your budget as an emergency fund.',
      'Compare travel insurance policies — it can save thousands.',
    ];
    el.innerHTML = tips.map(t => `<div class="tip-item">${t}</div>`).join('');
  }

  // ── Currency converter ────────────────────────────────────

  async function doConvert() {
    const amount = parseFloat(document.getElementById('cvAmount')?.value);
    const from   = document.getElementById('cvFromCur')?.value;
    const to     = document.getElementById('cvToCur')?.value;
    if (!amount || isNaN(amount) || amount <= 0) {
      showToast('Enter a valid amount.', 'error');
      return;
    }

    const loading = document.getElementById('cvLoading');
    const result  = document.getElementById('cvResult');
    const err     = document.getElementById('cvError');
    loading?.classList.add('visible');
    result?.classList.remove('visible');
    err?.classList.remove('visible');

    if (from === to) {
      loading?.classList.remove('visible');
      showResult(amount, from, to, 1, amount);
      return;
    }

    try {
      const res  = await fetch(`https://v6.exchangerate-api.com/v6/${EXCHANGE_KEY}/pair/${from}/${to}/${amount}`);
      const data = await res.json();
      loading?.classList.remove('visible');
      if (data.result === 'success') {
        showResult(data.conversion_result, from, to, data.conversion_rate, amount);
      } else {
        throw new Error(data['error-type'] || 'API error');
      }
    } catch (e) {
      loading?.classList.remove('visible');
      if (err) { err.textContent = `Could not fetch rates. ${e.message}`; err.classList.add('visible'); }
    }
  }

  function showResult(converted, from, to, rate, amount) {
    const toSym   = CURRENCIES.find(c => c.code === to)?.sym   || to;
    const fromSym = CURRENCIES.find(c => c.code === from)?.sym || from;
    document.getElementById('resultFrom').textContent  = `${fromSym}${amount.toLocaleString()} ${from} =`;
    document.getElementById('resultValue').textContent = `${toSym}${converted.toLocaleString(undefined, {
      minimumFractionDigits: 2, maximumFractionDigits: 2,
    })} ${to}`;
    document.getElementById('resultRate').textContent  = `1 ${from} = ${rate.toFixed(4)} ${to}`;

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const tsEl = document.getElementById('resultTimestamp');
    if (tsEl) tsEl.innerHTML = `<i class="fas fa-clock"></i> ${timeStr} • ${dateStr}`;

    document.getElementById('cvResult')?.classList.add('visible');
  }
});
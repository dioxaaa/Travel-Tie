
document.addEventListener('DOMContentLoaded', async () => {
  const inPages = window.location.pathname.includes('/pages/');
  const pagesPrefix = inPages ? '../' : '';
  const destUrl = pagesPrefix + (inPages ? 'pages/destinations.html' : 'destinations.html');
  const calcUrl = pagesPrefix + (inPages ? 'pages/calculator.html' : 'pages/calculator.html');

  TT.onAuthChanged(async user => {
    if (user) {
      const pendingStr = localStorage.getItem('tt_pending_action');
      if (pendingStr) {
        try {
          const pending = JSON.parse(pendingStr);
          localStorage.removeItem('tt_pending_action');
          
          const next = new URLSearchParams(window.location.search).get('next');
          const redirectUrl = next || destUrl;
          
          if (pending.type === 'saveCalc') {
            const res = await TT.processPendingAction();
            if (res?.ok) {
              window.location.href = calcUrl + '?view=saved&saved=1';
            } else if (res?.err?.includes('already saved')) {
              window.location.href = calcUrl + '?view=saved&info=1';
            } else {
              window.location.href = redirectUrl;
            }
          } else if (pending.type === 'saveDest') {
            const res = await TT.processPendingAction();
            if (res?.ok) {
              window.location.href = redirectUrl + (redirectUrl.includes('?') ? '&' : '?') + 'saved=1';
            } else if (res?.err?.includes('already saved')) {
              window.location.href = redirectUrl + (redirectUrl.includes('?') ? '&' : '?') + 'info=1';
            } else {
              window.location.href = redirectUrl;
            }
          } else {
            window.location.href = redirectUrl;
          }
        } catch (e) {
          console.error('Error processing pending action:', e);
          const next = new URLSearchParams(window.location.search).get('next');
          window.location.href = next || destUrl;
        }
        return;
      }
      
      const next = new URLSearchParams(window.location.search).get('next');
      window.location.href = next || destUrl;
    }
  });

  // ── Alert helpers ──────────────────────────────────────────
  function showAlert(id, msg, type = 'error') {
    const el = document.getElementById(id);
    if (!el) return;
    const icon = type === 'error' ? 'exclamation-circle'
               : type === 'success' ? 'check-circle'
               : 'info-circle';
    el.innerHTML = `<i class="fas fa-${icon}"></i><span>${msg}</span>`;
    el.className = `auth-alert alert-${type} visible`;
  }

  function clearAlerts() {
    document.querySelectorAll('.auth-alert').forEach(a => { a.className = 'auth-alert'; a.innerHTML = ''; });
    document.getElementById('domainFixBanner')?.classList.remove('visible');
  }

  function setLoading(btn, loading, defaultHTML) {
    btn.disabled  = loading;
    btn.innerHTML = loading ? '<i class="fas fa-circle-notch spin-anim"></i> Please wait…' : defaultHTML;
  }

  function handleGoogleError(err, alertId) {
    if (err && err.includes('authorised') || err && err.includes('domain')) {
      // Unauthorized domain — show the fix banner
      document.getElementById('domainFixBanner')?.classList.add('visible');
      showAlert(alertId,
        'Your domain is not authorised yet. See the yellow box above for setup instructions.',
        'error'
      );
    } else {
      showAlert(alertId, err, 'error');
    }
  }

  // ── Sign In ────────────────────────────────────────────────
  document.getElementById('signInForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    clearAlerts();
    const email = document.getElementById('siEmail')?.value.trim();
    const pw    = document.getElementById('siPassword')?.value;
    if (!email || !pw) { showAlert('siAlert', 'Please fill in all fields.'); return; }
    const btn = e.target.querySelector('.btn-submit');
    setLoading(btn, true, '');
    const res = await TT.signIn(email, pw);
    if (res.ok) {
      // Check for pending actions
      const pendingStr = localStorage.getItem('tt_pending_action');
      showAlert('siAlert', 'Welcome back! Saving your data…', 'success');
      setTimeout(async () => {
        if (pendingStr) {
          const pending = JSON.parse(pendingStr);
          localStorage.removeItem('tt_pending_action');
          
          if (pending.type === 'saveCalc') {
            const saveRes = await TT.processPendingAction();
            if (saveRes?.ok) {
              window.location.href = calcUrl + '?view=saved&saved=1';
            } else if (saveRes?.err?.includes('already saved')) {
              window.location.href = calcUrl + '?view=saved&info=1';
            } else {
              window.location.href = destUrl;
            }
            return;
          } else if (pending.type === 'saveDest') {
            const saveRes = await TT.processPendingAction();
            const next = new URLSearchParams(window.location.search).get('next');
            if (saveRes?.err?.includes('already saved')) {
              window.location.href = (next || destUrl) + (next?.includes('?') ? '&' : '?') + 'info=1';
            } else {
              window.location.href = next || destUrl;
            }
            return;
          }
        }
        const next = new URLSearchParams(window.location.search).get('next');
        window.location.href = next || destUrl;
      }, 900);
    } else {
      showAlert('siAlert', res.err);
      setLoading(btn, false, '<i class="fas fa-arrow-right"></i> Sign In');
    }
  });

  // ── Sign Up ────────────────────────────────────────────────
  document.getElementById('signUpForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    clearAlerts();
    const name    = document.getElementById('suName')?.value.trim();
    const email   = document.getElementById('suEmail')?.value.trim();
    const pw      = document.getElementById('suPassword')?.value;
    const confirm = document.getElementById('suConfirm')?.value;
    const agree   = document.getElementById('suAgree')?.checked;
    const btn     = e.target.querySelector('.btn-submit');

    if (!name || !email || !pw || !confirm) { showAlert('suAlert', 'Please fill in all fields.'); return; }
    if (pw !== confirm) { showAlert('suAlert', 'Passwords do not match.'); return; }
    if (pw.length < 6)  { showAlert('suAlert', 'Password must be at least 6 characters.'); return; }
    if (!agree)         { showAlert('suAlert', 'Please accept the Terms of Service.'); return; }

    setLoading(btn, true, '');
    const res = await TT.signUp(email, pw, name);
    if (res.ok) {
      const pendingStr = localStorage.getItem('tt_pending_action');
      showAlert('suAlert', 'Account created! Saving your data…', 'success');
      setTimeout(async () => {
        if (pendingStr) {
          const pending = JSON.parse(pendingStr);
          localStorage.removeItem('tt_pending_action');
          
          if (pending.type === 'saveCalc') {
            const saveRes = await TT.processPendingAction();
            if (saveRes?.ok) {
              window.location.href = calcUrl + '?view=saved&saved=1';
            } else if (saveRes?.err?.includes('already saved')) {
              window.location.href = calcUrl + '?view=saved&info=1';
            } else {
              window.location.href = destUrl;
            }
            return;
          } else if (pending.type === 'saveDest') {
            const saveRes = await TT.processPendingAction();
            const next = new URLSearchParams(window.location.search).get('next');
            if (saveRes?.err?.includes('already saved')) {
              window.location.href = (next || destUrl) + (next?.includes('?') ? '&' : '?') + 'info=1';
            } else {
              window.location.href = next || destUrl;
            }
            return;
          }
        }
        window.location.href = destUrl;
      }, 1000);
    } else {
      showAlert('suAlert', res.err);
      setLoading(btn, false, '<i class="fas fa-user-plus"></i> Create Account');
    }
  });

  // ── Google Sign-In (both panels) ──────────────────────────
  async function doGoogleSignIn(alertId, btn) {
    clearAlerts();
    const origHTML = btn.innerHTML;
    btn.disabled   = true;
    btn.innerHTML  = '<i class="fas fa-circle-notch spin-anim"></i> Connecting…';

    const res = await TT.googleSignIn();
    if (res.ok) {
      const pendingStr = localStorage.getItem('tt_pending_action');
      
      if (pendingStr) {
        const pending = JSON.parse(pendingStr);
        localStorage.removeItem('tt_pending_action');
        
        if (pending.type === 'saveCalc') {
          const saveRes = await TT.processPendingAction();
          if (saveRes?.ok) {
            window.location.href = calcUrl + '?view=saved&saved=1';
          } else if (saveRes?.err?.includes('already saved')) {
            window.location.href = calcUrl + '?view=saved&info=1';
          } else {
            window.location.href = destUrl;
          }
          return;
        } else if (pending.type === 'saveDest') {
          const saveRes = await TT.processPendingAction();
          const next = new URLSearchParams(window.location.search).get('next');
          if (saveRes?.err?.includes('already saved')) {
            window.location.href = (next || destUrl) + (next?.includes('?') ? '&' : '?') + 'info=1';
          } else {
            window.location.href = next || destUrl;
          }
          return;
        }
      }
      
      const next = new URLSearchParams(window.location.search).get('next');
      window.location.href = next || destUrl;
    } else {
      handleGoogleError(res.err, alertId);
      btn.disabled  = false;
      btn.innerHTML = origHTML;
    }
  }

  document.getElementById('googleBtnSI')?.addEventListener('click', function() {
    doGoogleSignIn('siAlert', this);
  });
  document.getElementById('googleBtnSU')?.addEventListener('click', function() {
    doGoogleSignIn('suAlert', this);
  });

  // ── Forgot password ────────────────────────────────────────
  document.getElementById('forgotBtn')?.addEventListener('click', async () => {
    clearAlerts();
    const email = document.getElementById('siEmail')?.value.trim();
    if (!email) { showAlert('siAlert', 'Enter your email address above first.'); return; }
    const res = await TT.resetPw(email);
    if (res.ok) showAlert('siAlert', 'Reset email sent! Check your inbox.', 'success');
    else showAlert('siAlert', res.err);
  });
});
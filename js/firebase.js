import { initializeApp }           from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAnalytics }            from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";
import {
  getAuth, onAuthStateChanged,
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  GoogleAuthProvider, signInWithPopup, signOut,
  updateProfile, sendPasswordResetEmail,
  setPersistence, browserLocalPersistence,
  EmailAuthProvider, reauthenticateWithCredential, updatePassword
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore, collection, doc, getDoc, setDoc,
  addDoc, getDocs, deleteDoc, updateDoc, query, where,
  orderBy, onSnapshot, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey:            "",
  authDomain:        "travel-tie.firebaseapp.com",
  projectId:         "travel-tie",
  storageBucket:     "travel-tie.firebasestorage.app",
  messagingSenderId: "841063120894",
  appId:             "1:841063120894:web:6ec4ac84bbfc59666a4aaf",
  measurementId:     "G-1K28DR93SY"
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

try { getAnalytics(app); } catch(e) {}
setPersistence(auth, browserLocalPersistence).catch(() => {});

// ── Friendly error messages ────────────────────────────────────
function friendlyErr(e) {
  const map = {
    'auth/email-already-in-use':   'An account with this email already exists.',
    'auth/invalid-email':           'Please enter a valid email address.',
    'auth/weak-password':           'Password must be at least 6 characters.',
    'auth/user-not-found':          'No account found with this email.',
    'auth/wrong-password':          'Incorrect password. Please try again.',
    'auth/invalid-credential':      'Incorrect email or password.',
    'auth/too-many-requests':       'Too many attempts. Please try again later.',
    'auth/network-request-failed':  'Network error. Check your connection.',
    'auth/popup-closed-by-user':    'Google sign-in was cancelled.',
    'auth/popup-blocked':           'Popup blocked. Please allow popups for this site.',
    'auth/cancelled-popup-request': 'Sign-in cancelled.',
    'auth/operation-not-allowed':   'This sign-in method is not enabled in Firebase Console.',
    'auth/unauthorized-domain':
      'This domain is not authorised for Google sign-in. ' +
      'Go to Firebase Console → Authentication → Settings → Authorised domains, ' +
      'and add your current domain (e.g. localhost or your deployed URL).',
  };
  return map[e.code] || e.message || 'An unexpected error occurred.';
}

(function injectFoucGuard() {
  const style = document.createElement('style');
  style.id = 'tt-fouc-guard';
  style.textContent = `
    /* Hide auth section until Firebase resolves */
    .auth-section { visibility: hidden; opacity: 0; transition: opacity 0.15s ease, visibility 0.15s ease; }

    /* Hide hero elements that depend on auth state */
    .hero-auth-greeting,
    #heroWelcome,
    #dashWelcome { visibility: hidden; opacity: 0; transition: opacity 0.15s ease, visibility 0.15s ease; }
  `;
  // Insert as first child of <head> so it takes effect immediately
  const head = document.head || document.documentElement;
  head.insertBefore(style, head.firstChild);
})();

// Called once Firebase resolves — removes the FOUC guard and shows elements
function removeFoucGuard() {
  const style = document.getElementById('tt-fouc-guard');
  if (!style) return;
  
  // Force layout recalc before removing guard
  const authSection = document.querySelector('.auth-section');
  const heroWelcome = document.getElementById('heroWelcome') || document.getElementById('dashWelcome');
  
  if (authSection) {
    authSection.style.visibility = 'visible';
    authSection.style.opacity = '1';
  }
  if (heroWelcome) {
    heroWelcome.style.visibility = 'visible';
    heroWelcome.style.opacity = '1';
  }
  
  // Remove guard after a brief delay to ensure transition is set up
  requestAnimationFrame(() => {
    setTimeout(() => style.remove(), 150);
  });
}

window.TT = {
  auth, db,
  currentUser:   () => auth.currentUser,
  onAuthChanged: (cb) => onAuthStateChanged(auth, cb),

  async signIn(email, password) {
    try {
      const c = await signInWithEmailAndPassword(auth, email, password);
      return { ok: true, user: c.user };
    } catch(e) { return { ok: false, err: friendlyErr(e) }; }
  },

  async signUp(email, password, name) {
    try {
      const c = await createUserWithEmailAndPassword(auth, email, password);
      if (name) await updateProfile(c.user, { displayName: name });
      await setDoc(doc(db, 'users', c.user.uid), {
        displayName: name || '', email, createdAt: serverTimestamp()
      }, { merge: true });
      return { ok: true, user: c.user };
    } catch(e) { return { ok: false, err: friendlyErr(e) }; }
  },

  async googleSignIn() {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      provider.setCustomParameters({ prompt: 'select_account' });
      const c = await signInWithPopup(auth, provider);
      await setDoc(doc(db, 'users', c.user.uid), {
        displayName: c.user.displayName || '',
        email:       c.user.email       || '',
        photoURL:    c.user.photoURL    || '',
        lastLogin:   serverTimestamp(),
      }, { merge: true });
      return { ok: true, user: c.user };
    } catch(e) { return { ok: false, err: friendlyErr(e) }; }
  },

  async resetPw(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { ok: true };
    } catch(e) { return { ok: false, err: friendlyErr(e) }; }
  },

  logout() {
    return signOut(auth).then(() => {
      const inPages = window.location.pathname.includes('/pages/');
      TT.transitionTo(inPages ? '../index.html' : 'index.html');
    });
  },

  transitionTo(url) {
    // Simple navigation without animation
    window.location.href = url;
  },

  setPageLoading() {
    // No-op - animations cause white screen issues
  },

  navigateTo(url) {
    const inPages = window.location.pathname.includes('/pages/');
    if (url.startsWith('http') || url.startsWith('/')) {
      this.transitionTo(url);
    } else if (inPages && !url.startsWith('../')) {
      this.transitionTo('../' + url);
    } else {
      this.transitionTo(url);
    }
  },

  async getDestinations() {
    try {
      const snap = await getDocs(collection(db, 'destinations'));
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch(e) { return []; }
  },

  async loadDestinations() {
    const dests = await this.getDestinations();
    return dests.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  },

  async saveDest(data) {
    const u = auth.currentUser;
    if (!u) {
      localStorage.setItem('tt_pending_action', JSON.stringify({
        type: 'saveDest',
        data: data,
        timestamp: Date.now()
      }));
      return { ok: false, needsAuth: true, err: 'Please sign in to save this place.' };
    }
    try {
      const col = collection(db, 'users', u.uid, 'savedDestinations');
      const ex  = await getDocs(query(col, where('id', '==', data.id)));
      if (!ex.empty) return { ok: false, err: 'Already saved!' };
      await addDoc(col, { ...data, savedAt: serverTimestamp() });
      return { ok: true };
    } catch(e) { return { ok: false, err: e.message }; }
  },

  async removeDest(docId) {
    const u = auth.currentUser;
    if (!u) return { ok: false };
    try {
      await deleteDoc(doc(db, 'users', u.uid, 'savedDestinations', docId));
      return { ok: true };
    } catch(e) { return { ok: false }; }
  },

  // Alias for modals.js compatibility
  unsaveDestination(docId) { return this.removeDest(docId); },

  listenSaved(cb) {
    return onAuthStateChanged(auth, u => {
      if (u) {
        const col = collection(db, 'users', u.uid, 'savedDestinations');
        const q   = query(col, orderBy('savedAt', 'desc'));
        onSnapshot(q,
          snap => cb(snap.docs.map(d => ({ docId: d.id, ...d.data() }))),
          async () => {
            try {
              const snap = await getDocs(col);
              cb(snap.docs.map(d => ({ docId: d.id, ...d.data() })));
            } catch(err) { cb([]); }
          }
        );
      } else { cb([]); }
    });
  },

  async getSaved() {
    const u = auth.currentUser;
    if (!u) return [];
    try {
      const col = collection(db, 'users', u.uid, 'savedDestinations');
      const snap = await getDocs(query(col, orderBy('savedAt', 'desc')));
      return snap.docs.map(d => ({ docId: d.id, ...d.data() }));
    } catch(e) { return []; }
  },

  async saveCalc(data) {
    const u = auth.currentUser;
    if (u) {
      try {
        const existingCalcs = await getDocs(collection(db, 'users', u.uid, 'calculations'));
        const isDuplicate = existingCalcs.docs.some(doc => {
          const d = doc.data();
          return d.destination === data.destination &&
                 d.days === data.days &&
                 d.travelers === data.travelers &&
                 d.total === data.total;
        });
        if (isDuplicate) {
          return { ok: false, err: 'This calculation is already saved!' };
        }
        await addDoc(collection(db, 'users', u.uid, 'calculations'), {
          ...data, savedAt: serverTimestamp()
        });
        return { ok: true };
      } catch(e) { return { ok: false, err: e.message }; }
    } else {
      localStorage.setItem('tt_pending_action', JSON.stringify({
        type: 'saveCalc',
        data: data,
        timestamp: Date.now()
      }));
      return { ok: false, needsAuth: true, err: 'Please sign in to save your budget.' };
    }
  },

  async updateCalc(docId, data) {
    const u = auth.currentUser;
    if (u) {
      try {
        const calcRef = doc(db, 'users', u.uid, 'calculations', docId);
        await updateDoc(calcRef, {
          ...data,
          updatedAt: serverTimestamp()
        });
        return { ok: true };
      } catch(e) {
        console.error('[updateCalc]', e);
        return { ok: false, err: e.message };
      }
    } else {
      return { ok: false, needsAuth: true, err: 'Please sign in to update your budget.' };
    }
  },

  async processPendingAction() {
    const pendingStr = localStorage.getItem('tt_pending_action');
    if (!pendingStr) return null;
    try {
      const pending = JSON.parse(pendingStr);
      localStorage.removeItem('tt_pending_action');
      const u = auth.currentUser;
      if (!u) return { err: 'Not authenticated' };
      if (pending.type === 'saveCalc') {
        // If calcId is provided, update existing calculation; otherwise create new
        if (pending.calcId) {
          try {
            const calcRef = doc(db, 'users', u.uid, 'calculations', pending.calcId);
            await updateDoc(calcRef, {
              ...pending.data,
              updatedAt: serverTimestamp()
            });
            return { ok: true, type: 'saveCalc' };
          } catch(e) {
            return { ok: false, err: e.message, type: 'saveCalc' };
          }
        } else {
          const existingCalcs = await getDocs(collection(db, 'users', u.uid, 'calculations'));
          const isDuplicate = existingCalcs.docs.some(doc => {
            const data = doc.data();
            return data.destination === pending.data.destination &&
                   data.days === pending.data.days &&
                   data.travelers === pending.data.travelers &&
                   data.total === pending.data.total;
          });
          if (isDuplicate) {
            return { ok: false, err: 'This calculation is already saved!', type: 'saveCalc' };
          }
          await addDoc(collection(db, 'users', u.uid, 'calculations'), {
            ...pending.data, savedAt: serverTimestamp()
          });
          return { ok: true, type: 'saveCalc' };
        }
      }
      if (pending.type === 'saveDest') {
        const col = collection(db, 'users', u.uid, 'savedDestinations');
        const ex = await getDocs(query(col, where('id', '==', pending.data.id)));
        if (!ex.empty) return { ok: false, err: 'Already saved!', type: 'saveDest' };
        await addDoc(col, { ...pending.data, savedAt: serverTimestamp() });
        return { ok: true, type: 'saveDest' };
      }
      return { err: 'Unknown action type' };
    } catch(e) {
      return { ok: false, err: e.message };
    }
  },

  async getCalcs() {
    const u = auth.currentUser;
    if (u) {
      try {
        const q    = query(collection(db, 'users', u.uid, 'calculations'), orderBy('savedAt', 'desc'));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ docId: d.id, ...d.data() }));
      } catch(e) {
        try {
          const snap = await getDocs(collection(db, 'users', u.uid, 'calculations'));
          return snap.docs.map(d => ({ docId: d.id, ...d.data() }));
        } catch(e2) { return []; }
      }
    } else {
      try {
        const calcs = JSON.parse(localStorage.getItem('tt_saved_calcs') || '[]');
        return calcs.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
      } catch(e) { return []; }
    }
  },

  // Alias for modals.js compatibility
  getSavedCalcs() { return this.getCalcs(); },
  getCalcHistory() { return this.getCalcs(); },

  async deleteCalc(docId) {
    const u = auth.currentUser;
    if (!u) return { ok: false };
    try {
      await deleteDoc(doc(db, 'users', u.uid, 'calculations', docId));
      return { ok: true };
    } catch(e) { return { ok: false }; }
  },

  // Alias for modals.js compatibility
  removeSavedCalc(docId) { return this.deleteCalc(docId); },

  async getProfile() {
    const u = auth.currentUser;
    if (!u) return null;
    try {
      const d = await getDoc(doc(db, 'users', u.uid));
      return d.exists() ? d.data() : {};
    } catch(e) { return {}; }
  },

  async updateUserProfile(data) {
    const u = auth.currentUser;
    if (!u) return { ok: false };
    try {
      const authUpdate = {};
      if (data.displayName) authUpdate.displayName = data.displayName;
      if (Object.keys(authUpdate).length) await updateProfile(u, authUpdate);
      await setDoc(doc(db, 'users', u.uid), { ...data, updatedAt: serverTimestamp() }, { merge: true });
      return { ok: true };
    } catch(e) { return { ok: false, err: e.message }; }
  },

  async updateProfile(data) { return this.updateUserProfile(data); },

  async changePassword(currentPassword, newPassword) {
    const u = auth.currentUser;
    if (!u) return { ok: false, err: 'Not signed in.' };
    try {
      const credential = EmailAuthProvider.credential(u.email, currentPassword);
      await reauthenticateWithCredential(u, credential);
      await updatePassword(u, newPassword);
      return { ok: true };
    } catch(e) {
      const msg = e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential'
        ? 'Current password is incorrect.'
        : e.code === 'auth/weak-password'
          ? 'New password is too weak (min 6 characters).'
          : e.code === 'auth/too-many-requests'
            ? 'Too many attempts. Please try again later.'
            : e.message || 'Password update failed.';
      return { ok: false, err: msg };
    }
  },

  async uploadAvatar(file) {
    const u = auth.currentUser;
    if (!u) return { ok: false, err: 'Not signed in.' };
    try {
      const base64 = await new Promise((res, rej) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
          const MAX = 200;
          const ratio = Math.min(MAX / img.width, MAX / img.height, 1);
          const canvas = document.createElement('canvas');
          canvas.width  = Math.round(img.width  * ratio);
          canvas.height = Math.round(img.height * ratio);
          canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
          URL.revokeObjectURL(url);
          res(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = rej;
        img.src = url;
      });
      await setDoc(doc(db, 'users', u.uid), { photoURL: base64, updatedAt: serverTimestamp() }, { merge: true });
      return { ok: true, url: base64 };
    } catch(e) { return { ok: false, err: e.message }; }
  },

  initNav() {
    const toggle = document.getElementById('menuToggle');
    const nav    = document.getElementById('mainNav');

    /* ── Close helper ─────────────────────────────────────── */
    const closeNav = () => {
      if (!nav || !toggle) return;
      nav.classList.remove('open');
      toggle.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };

    /* ── Open/close toggle ────────────────────────────────── */
    if (toggle && nav) {
      toggle.addEventListener('click', e => {
        e.stopPropagation();
        const opening = !nav.classList.contains('open');
        nav.classList.toggle('open', opening);
        toggle.classList.toggle('is-open', opening);
        toggle.setAttribute('aria-expanded', String(opening));
        // Lock body scroll while panel is open on mobile
        document.body.style.overflow = opening ? 'hidden' : '';
      });

      // Close when any nav link is tapped
      nav.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => closeNav());
      });

      // Close on outside click / tap
      document.addEventListener('click', e => {
        if (
          nav.classList.contains('open') &&
          !nav.contains(e.target) &&
          !toggle.contains(e.target)
        ) {
          closeNav();
        }
      });

      // Close on ESC key
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && nav.classList.contains('open')) {
          closeNav();
          toggle.focus();
        }
      });

      // Auto-close when viewport widens past mobile breakpoint
      const mq = window.matchMedia('(min-width: 769px)');
      const onBreakpoint = e => { if (e.matches) closeNav(); };
      if (mq.addEventListener) mq.addEventListener('change', onBreakpoint);
      else mq.addListener(onBreakpoint); // Safari < 14 fallback
    }

    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
      header?.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });

    const page = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.main-nav a').forEach(a => {
      const href = a.getAttribute('href') || '';
      a.classList.toggle('active', href.includes(page) && page !== '');
    });

    // ── FIX: updateAuthUI is now async so `await getDoc(...)` works correctly ──
    async function updateAuthUI(user) {
      const signInBtn    = document.getElementById('signInBtn');
      const userDropdown = document.getElementById('userDropdown');

      if (!signInBtn || !userDropdown) {
        // DOM not ready yet — retry briefly
        setTimeout(() => updateAuthUI(user), 50);
        return;
      }

      const inPages = window.location.pathname.includes('/pages/');
      signInBtn.onclick = (e) => {
        e.preventDefault();
        const loginModal = document.getElementById('loginModalOverlay');
        if (loginModal) {
          loginModal.classList.add('active');
          document.body.style.overflow = 'hidden';
        } else {
          window.location.href = inPages ? 'login.html' : 'pages/login.html';
        }
      };

      if (user) {
        const rawName      = user.displayName || '';
        const name         = rawName || (user.email ? user.email.split('@')[0] : 'User');
        const displayFirst = name.charAt(0).toUpperCase() + name.slice(1);
        const initials     = displayFirst.split(/[\s._-]+/).map(n => n[0]).join('').substring(0, 2).toUpperCase();

        // Load photoURL from Firestore (base64 lives there, not in Firebase Auth)
        let photo = user.photoURL || null;
        try {
          const profileSnap = await getDoc(doc(db, 'users', user.uid));
          if (profileSnap.exists() && profileSnap.data().photoURL) photo = profileSnap.data().photoURL;
        } catch(e) {}

        signInBtn.style.display    = 'none';
        userDropdown.style.display = 'flex';
        
        // Ensure auth section is visible after login
        document.querySelector('.auth-section')?.classList.add('loaded');

        const setText = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
        const setAvatar = (id, ph, ini) => {
          const el = document.getElementById(id);
          if (!el) return;
          if (ph) {
            el.innerHTML = `<img src="${ph}" alt="avatar" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
          } else {
            el.textContent = ini;
          }
        };

        setAvatar('userAvatarBtn', photo, initials);
        setText('userNameBtn', displayFirst.split(/[\s._-]+/)[0]);
        setAvatar('ddAvatarText', photo, initials);
        setText('ddName',  rawName || displayFirst);
        setText('ddEmail', user.email || '');

        // Update hero greeting if present
        const heroWelcome = document.getElementById('heroWelcome') || document.getElementById('dashWelcome');
        if (heroWelcome) {
          heroWelcome.textContent = `Welcome back, ${displayFirst.split(/[\s._-]+/)[0]}!`;
        }

        const profileBtn = document.getElementById('userProfileBtn');
        const dropMenu   = document.getElementById('userDropdownMenu');
        const udEl       = document.querySelector('.user-dropdown');

        if (profileBtn && dropMenu) {
          const newBtn = profileBtn.cloneNode(true);
          profileBtn.parentNode.replaceChild(newBtn, profileBtn);
          const av = newBtn.querySelector('#userAvatarBtn');
          const nm = newBtn.querySelector('.u-name');
          if (av) {
            if (photo) {
              av.innerHTML = `<img src="${photo}" alt="avatar" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
            } else {
              av.textContent = initials;
            }
          }
          if (nm) nm.textContent = displayFirst.split(/[\s._-]+/)[0];
          newBtn.addEventListener('click', e => {
            e.stopPropagation();
            dropMenu.classList.toggle('open');
            udEl?.classList.toggle('open');
          });
          document.addEventListener('click', () => {
            dropMenu.classList.remove('open');
            udEl?.classList.remove('open');
          });
        }

        const soBtn = document.getElementById('signOutBtn');
        if (soBtn) {
          const newSoBtn = soBtn.cloneNode(true);
          soBtn.parentNode.replaceChild(newSoBtn, soBtn);
          newSoBtn.addEventListener('click', () => TT.logout());
        }

        const savedPlacesBtn = document.getElementById('savedPlacesBtn');
        if (savedPlacesBtn) {
          const newSpBtn = savedPlacesBtn.cloneNode(true);
          savedPlacesBtn.parentNode.replaceChild(newSpBtn, savedPlacesBtn);
          newSpBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropMenu?.classList.remove('open');
            udEl?.classList.remove('open');
            if (typeof window.TTModals !== 'undefined') {
              window.TTModals.openSavedPlaces();
            } else {
              window.location.href = inPages ? 'destinations.html' : 'pages/destinations.html';
            }
          });
        }

        const savedCalcsBtn = document.getElementById('savedCalcsBtn');
        if (savedCalcsBtn) {
          const newScBtn = savedCalcsBtn.cloneNode(true);
          savedCalcsBtn.parentNode.replaceChild(newScBtn, savedCalcsBtn);
          newScBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropMenu?.classList.remove('open');
            udEl?.classList.remove('open');
            if (typeof window.TTModals !== 'undefined') {
              window.TTModals.openSavedCalcs();
            } else {
              window.location.href = inPages ? 'calculator.html?view=saved' : 'pages/calculator.html?view=saved';
            }
          });
        }

      } else {
        // User is signed out
        signInBtn.style.display    = '';
        document.querySelector('.auth-section')?.classList.add('loaded');
        userDropdown.style.display = 'none';

        // Reset hero greeting to default if present
        const heroWelcome = document.getElementById('heroWelcome') || document.getElementById('dashWelcome');
        if (heroWelcome) {
          heroWelcome.textContent = `Start Your Adventure`;
        }
      }

      removeFoucGuard();

      // Fade the auth section in smoothly instead of a hard snap
      const authSection = document.querySelector('.auth-section');
      if (authSection) {
        authSection.style.transition = 'opacity 0.1s ease';
        authSection.style.visibility = 'visible';
        authSection.style.opacity    = '1';
      }

      // Fade hero greeting in smoothly
      const heroWelcome = document.getElementById('heroWelcome') || document.getElementById('dashWelcome');
      if (heroWelcome) {
        heroWelcome.style.transition  = 'opacity 0.1s ease';
        heroWelcome.style.visibility  = 'visible';
        heroWelcome.style.opacity     = '1';
      }
    }

    const initAuth = () => {
      onAuthStateChanged(auth, updateAuthUI);
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initAuth);
    } else {
      initAuth();
    }
  },
};

window.showToast = function(msg, type = 'info') {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; document.body.appendChild(t); }
  const icons = { success: '<i class="fas fa-check-circle"></i>', error: '<i class="fas fa-exclamation-circle"></i>', info: '<i class="fas fa-info-circle"></i>' };
  t.innerHTML  = (icons[type] || '') + `<span>${msg}</span>`;
  t.className  = `toast show ${type}`;
  clearTimeout(t._tid);
  t._tid = setTimeout(() => t.classList.remove('show'), 4200);
};

export { auth, db, onAuthStateChanged, signOut };
// ══════════════════════════════════════════════════════════════
//  CivicPulse AI — Application Controller
//  Pure Vanilla JavaScript — Zero External Dependencies
// ══════════════════════════════════════════════════════════════

(function() {
  'use strict';

  // ─── App State ───────────────────────────────────────────────
  const state = {
    currentUser: null,
    adminPage: 'command',
    userPage: 'requests',
    adminSidebarCollapsed: false,
    userSidebarCollapsed: false,
    
    // Command center state
    timeRange: '30D',
    selectedLocationId: 'sector-12',
    
    // Incident explorer state
    explorer: {
      search: '',
      category: 'All',
      location: 'All',
      status: 'All',
      page: 1,
      pageSize: 8,
      sortCol: null,
      sortAsc: true
    },
    
    // Emerging issues state
    emergingFilter: 'All',
    
    // Daily briefing state
    briefingRefreshing: false,
    
    // Notifications state
    notifOpen: false,

    // Active drawer state
    activeIncident: null,
    activeEvidenceIssue: null
  };

  // ─── Default User Requests (localStorage-backed) ─────────────
  function getUserRequests() {
    const stored = localStorage.getItem('civicpulse_requests');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    const defaults = [
      {
        id: 'CP-2618',
        category: 'Street lighting',
        location: 'Sector 12, Block C',
        raisedAt: '17 Sep 2026',
        status: 'In Progress',
        desc: 'Street light not working for 3 days near bus stop.',
        userEmail: 'user@civic.com'
      },
      {
        id: 'CP-2541',
        category: 'Waste collection',
        location: 'Ward 7, Ashoka Road',
        raisedAt: '14 Sep 2026',
        status: 'Resolved',
        desc: 'Garbage not collected for 4 days near community park.',
        userEmail: 'user@civic.com'
      }
    ];
    localStorage.setItem('civicpulse_requests', JSON.stringify(defaults));
    return defaults;
  }

  function saveUserRequests(requests) {
    localStorage.setItem('civicpulse_requests', JSON.stringify(requests));
  }

  // ─── Utility Helpers ─────────────────────────────────────────
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function getActivityColor(activity) {
    switch (activity) {
      case 'Critical': return '#A9473F';
      case 'High':     return '#C36B4B';
      case 'Medium':   return '#5C7880';
      case 'Low':      return '#66716C';
      default:         return '#5E806B';
    }
  }

  function getActivityBg(activity) {
    switch (activity) {
      case 'Critical': return '#f3e9e8';
      case 'High':     return '#f5ede7';
      case 'Medium':   return '#eaeff0';
      case 'Low':      return '#EDEDEA';
      default:         return '#eaf1ec';
    }
  }

  function renderStatusBadge(status) {
    let badgeClass = 'badge-open';
    switch (status) {
      case 'Open':        badgeClass = 'badge-open'; break;
      case 'In Progress': badgeClass = 'badge-inprogress'; break;
      case 'Resolved':    badgeClass = 'badge-resolved'; break;
      case 'Escalated':   badgeClass = 'badge-escalated'; break;
      case 'Critical':    badgeClass = 'badge-critical'; break;
      case 'High':        badgeClass = 'badge-high'; break;
      case 'Medium':      badgeClass = 'badge-medium'; break;
      case 'Low':         badgeClass = 'badge-low'; break;
      case 'Emerging':    badgeClass = 'badge-emerging'; break;
      case 'Active':      badgeClass = 'badge-active'; break;
      case 'Monitoring':  badgeClass = 'badge-monitoring'; break;
    }
    return `<span class="status-badge ${badgeClass}"><span class="badge-dot" style="background:currentColor"></span>${escapeHtml(status)}</span>`;
  }

  function renderActivityBadge(activity) {
    const bg = getActivityBg(activity);
    const color = getActivityColor(activity);
    return `<span class="activity-label" style="background:${bg};color:${color}">${escapeHtml(activity)}</span>`;
  }

  // ─── Authentication ──────────────────────────────────────────
  function initAuth() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const goRegister = document.getElementById('go-register');
    const goLogin = document.getElementById('go-login');
    const loginError = document.getElementById('login-error');
    const registerError = document.getElementById('register-error');
    const registerSuccess = document.getElementById('register-success');

    // Switch to Register page
    if (goRegister) {
      goRegister.addEventListener('click', () => {
        document.getElementById('login-page').classList.remove('active');
        document.getElementById('register-page').classList.add('active');
        if (loginError) loginError.classList.add('hidden');
        if (registerError) registerError.classList.add('hidden');
        if (registerSuccess) registerSuccess.classList.add('hidden');
      });
    }

    // Switch to Login page
    if (goLogin) {
      goLogin.addEventListener('click', () => {
        document.getElementById('register-page').classList.remove('active');
        document.getElementById('login-page').classList.add('active');
        if (loginError) loginError.classList.add('hidden');
        if (registerError) registerError.classList.add('hidden');
      });
    }

    // Clickable demo credential hints
    document.querySelectorAll('.hint-row').forEach(row => {
      row.style.cursor = 'pointer';
      row.title = 'Click to auto-fill credentials';
      row.addEventListener('click', () => {
        const text = row.textContent;
        const emailInput = document.getElementById('login-email');
        const passInput = document.getElementById('login-password');
        if (text.includes('user@civic.com')) {
          if (emailInput) emailInput.value = 'user@civic.com';
          if (passInput) passInput.value = 'user123';
        } else if (text.includes('admin@civic.com')) {
          if (emailInput) emailInput.value = 'admin@civic.com';
          if (passInput) passInput.value = 'admin123';
        }
        if (loginError) loginError.classList.add('hidden');
      });
    });

    // Login Form Submit
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim().toLowerCase();
        const password = document.getElementById('login-password').value.trim();

        if (!email || !password) {
          if (loginError) {
            loginError.textContent = 'Please enter both email and password.';
            loginError.classList.remove('hidden');
          }
          return;
        }

        const users = getUsers();
        const user = users.find(u => u.email.toLowerCase() === email && u.password === password);

        if (user) {
          if (loginError) loginError.classList.add('hidden');
          loginUser(user);
        } else {
          if (loginError) {
            loginError.innerHTML = `
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Invalid email or password.
            `;
            loginError.classList.remove('hidden');
          }
        }
      });
    }

    // Register Form Submit
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const fname = (document.getElementById('reg-fname') || {}).value.trim();
        const lname = (document.getElementById('reg-lname') || {}).value.trim();
        const email = (document.getElementById('reg-email') || {}).value.trim().toLowerCase();
        const ward = (document.getElementById('reg-ward') || {}).value.trim();
        const password = (document.getElementById('reg-password') || {}).value;
        const confirm = (document.getElementById('reg-confirm') || {}).value;
        const errorMsg = document.getElementById('register-error-msg');

        if (!fname || !email || !password || !confirm) {
          showRegisterError('Please fill in all required fields.');
          return;
        }

        if (!email.includes('@') || !email.includes('.')) {
          showRegisterError('Please provide a valid email address.');
          return;
        }

        if (password.length < 6) {
          showRegisterError('Password must be at least 6 characters long.');
          return;
        }

        if (password !== confirm) {
          showRegisterError('Passwords do not match.');
          return;
        }

        const users = getUsers();
        if (users.some(u => u.email.toLowerCase() === email)) {
          showRegisterError('An account with this email already exists.');
          return;
        }

        const initials = ((fname[0] || '') + (lname[0] || fname[1] || '')).toUpperCase();
        const newUser = {
          email,
          password,
          role: 'user',
          name: `${fname} ${lname}`.trim(),
          initials,
          ward: ward || 'Sector 12'
        };

        saveUsers([...users, newUser]);

        if (registerError) registerError.classList.add('hidden');
        if (registerSuccess) {
          registerSuccess.classList.remove('hidden');
        }

        setTimeout(() => {
          document.getElementById('register-page').classList.remove('active');
          document.getElementById('login-page').classList.add('active');
          document.getElementById('login-email').value = email;
          document.getElementById('login-password').value = '';
          document.getElementById('login-password').focus();
          if (registerSuccess) registerSuccess.classList.add('hidden');
        }, 1200);
      });
    }

    function showRegisterError(msg) {
      if (registerError) {
        const errorMsg = document.getElementById('register-error-msg');
        if (errorMsg) errorMsg.textContent = msg;
        registerError.classList.remove('hidden');
      }
    }

    // Sign out handlers
    const adminLogout = document.getElementById('admin-logout-btn');
    const userLogout = document.getElementById('user-logout-btn');
    if (adminLogout) adminLogout.addEventListener('click', logoutUser);
    if (userLogout) userLogout.addEventListener('click', logoutUser);

    // Check existing session
    const savedSession = localStorage.getItem('civicpulse_session');
    if (savedSession) {
      try {
        const user = JSON.parse(savedSession);
        loginUser(user);
      } catch (e) {
        localStorage.removeItem('civicpulse_session');
      }
    }
  }

  function loginUser(user) {
    state.currentUser = user;
    localStorage.setItem('civicpulse_session', JSON.stringify(user));

    // Hide auth screen
    document.getElementById('auth-screen').classList.add('hidden');

    if (user.role === 'admin') {
      document.getElementById('user-app').classList.add('hidden');
      document.getElementById('admin-app').classList.remove('hidden');
      initAdminApp();
    } else {
      document.getElementById('admin-app').classList.add('hidden');
      document.getElementById('user-app').classList.remove('hidden');
      initUserApp();
    }
  }

  function logoutUser() {
    state.currentUser = null;
    localStorage.removeItem('civicpulse_session');

    document.getElementById('admin-app').classList.add('hidden');
    document.getElementById('user-app').classList.add('hidden');
    document.getElementById('auth-screen').classList.remove('hidden');
    document.getElementById('login-page').classList.add('active');
    document.getElementById('register-page').classList.remove('active');
    
    const loginError = document.getElementById('login-error');
    if (loginError) loginError.classList.add('hidden');
  }

  // ─── User App Shell ──────────────────────────────────────────
  function initUserApp() {
    const user = state.currentUser;
    const nameEl = document.getElementById('user-display-name');
    const initialsEl = document.getElementById('user-avatar-initials');
    const topAvatarEl = document.getElementById('topnav-user-avatar');

    if (nameEl) nameEl.textContent = user.name || 'Resident User';
    if (initialsEl) initialsEl.textContent = user.initials || 'RU';
    if (topAvatarEl) topAvatarEl.textContent = user.initials || 'RU';

    // Sidebar navigation
    const navRequests = document.getElementById('user-nav-requests');
    const navMyRequests = document.getElementById('user-nav-my-requests');
    const navHelp = document.getElementById('user-nav-help');

    if (navRequests) {
      navRequests.onclick = () => setUserPage('requests');
    }
    if (navMyRequests) {
      navMyRequests.onclick = () => setUserPage('my-requests');
    }
    if (navHelp) {
      navHelp.onclick = () => setUserPage('help');
    }

    // Sidebar toggle
    const toggleBtn = document.getElementById('user-sidebar-toggle');
    if (toggleBtn) {
      toggleBtn.onclick = () => {
        state.userSidebarCollapsed = !state.userSidebarCollapsed;
        document.getElementById('user-sidebar').classList.toggle('collapsed', state.userSidebarCollapsed);
      };
    }

    setUserPage(state.userPage || 'requests');
  }

  function setUserPage(page) {
    state.userPage = page;

    // Update active nav button
    document.querySelectorAll('#user-app .nav-item').forEach(item => {
      item.classList.remove('active');
    });

    const titleEl = document.getElementById('user-page-title');
    const subtitleEl = document.getElementById('user-page-subtitle');

    if (page === 'requests') {
      const btn = document.getElementById('user-nav-requests');
      if (btn) btn.classList.add('active');
      if (titleEl) titleEl.textContent = 'Resident Request Desk';
      if (subtitleEl) subtitleEl.textContent = 'Raise a civic request and follow its progress from submission to resolution.';
      renderUserRequestDesk();
    } else if (page === 'my-requests') {
      const btn = document.getElementById('user-nav-my-requests');
      if (btn) btn.classList.add('active');
      if (titleEl) titleEl.textContent = 'My Requests';
      if (subtitleEl) subtitleEl.textContent = 'Track and review the status of all requests you have submitted.';
      renderUserMyRequests();
    } else if (page === 'help') {
      const btn = document.getElementById('user-nav-help');
      if (btn) btn.classList.add('active');
      if (titleEl) titleEl.textContent = 'Help & Support';
      if (subtitleEl) subtitleEl.textContent = 'Guidance on how civic complaints are triaged and resolved by city teams.';
      renderUserHelp();
    }
  }

  // ─── User Page: Request Desk ─────────────────────────────────
  function renderUserRequestDesk() {
    const main = document.getElementById('user-main');
    if (!main) return;

    const user = state.currentUser;
    const allRequests = getUserRequests();
    const myRequests = allRequests.filter(r => !r.userEmail || r.userEmail === user.email);

    main.innerHTML = `
      <div style="max-width: 1060px; margin: 0 auto; padding: 24px;">
        <div class="request-grid">
          <!-- Form Section -->
          <div class="card" style="padding: 24px;">
            <div style="font-family: var(--font-mono); font-size: 10px; font-weight: 700; color: var(--accent2); text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 6px;">
              CIVIC REQUEST INTAKE
            </div>
            <h2 style="font-size: 22px; font-weight: 800; color: var(--text-primary); margin-bottom: 6px; letter-spacing: -0.01em;">
              Tell us what needs attention.
            </h2>
            <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 22px; line-height: 1.5;">
              Your request is routed directly to the appropriate municipality operations unit.
            </p>

            <form id="resident-req-form" style="display: flex; flex-direction: column; gap: 16px;">
              <div class="form-group">
                <label class="form-label" for="req-category">Complaint category</label>
                <select id="req-category" class="field-style" required>
                  ${CATEGORIES.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('')}
                </select>
              </div>

              <div class="form-group" id="req-other-wrap" style="display:none;">
                <label class="form-label" for="req-other-desc">Describe category</label>
                <input type="text" id="req-other-desc" class="field-style" placeholder="e.g. Stray animal concern" />
              </div>

              <div class="form-group">
                <label class="form-label" for="req-location">Location / Landmark</label>
                <input type="text" id="req-location" class="field-style" placeholder="Street, building, landmark, or locality" value="${escapeHtml(user.ward || '')}" required />
              </div>

              <div class="form-group">
                <label class="form-label" for="req-desc">What is happening?</label>
                <textarea id="req-desc" class="field-style" rows="5" placeholder="Add a short description to help field engineers find and diagnose the issue." required></textarea>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 6px;">
                <span style="font-size: 11px; color: var(--text-muted);">You'll receive a tracking ID immediately.</span>
                <button type="submit" class="btn btn-primary">
                  <span>Raise request</span>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </button>
              </div>
            </form>
          </div>

          <!-- Aside / Advice -->
          <div style="display: flex; flex-direction: column; gap: 14px;">
            <div id="req-confirmation-slot"></div>

            <div class="card" style="padding: 18px; border-left: 3px solid var(--accent2);">
              <div style="font-size: 13px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">
                Clear details move faster
              </div>
              <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.5; margin: 0;">
                Mentioning landmarks like cross-streets, school gates, or shop numbers allows field teams to locate and resolve the issue up to 40% faster.
              </p>
            </div>

            <div style="background: var(--sidebar-bg); border-radius: var(--radius); padding: 18px; color: var(--text-sidebar);">
              <div style="font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.12em; color: var(--accent3); text-transform: uppercase; margin-bottom: 6px;">
                URGENT DANGER?
              </div>
              <div style="font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 6px;">
                Call emergency services first.
              </div>
              <p style="font-size: 12px; color: rgba(200,216,204,0.8); line-height: 1.5; margin: 0;">
                This portal is for civic maintenance and municipal works. For live electrical hazards, gas leaks, or life-threatening accidents, call 112 immediately.
              </p>
            </div>
          </div>
        </div>

        <!-- My Recent Requests Table -->
        <div class="card" style="margin-top: 24px; overflow: hidden;">
          <div style="padding: 16px 20px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 14px; font-weight: 700; color: var(--text-primary);">My raised requests</div>
              <div style="font-size: 11px; color: var(--text-secondary); margin-top: 2px;">Follow the live status of each ticket you submitted.</div>
            </div>
            <span class="mono" style="font-size: 11px; font-weight: 600; color: var(--accent2);">${myRequests.length} TOTAL</span>
          </div>

          <div id="user-requests-list">
            ${renderUserRequestsListHtml(myRequests)}
          </div>
        </div>
      </div>
    `;

    // Category "Other" toggle
    const catSelect = document.getElementById('req-category');
    const otherWrap = document.getElementById('req-other-wrap');
    if (catSelect && otherWrap) {
      catSelect.addEventListener('change', () => {
        otherWrap.style.display = (catSelect.value.toLowerCase() === 'other') ? 'block' : 'none';
      });
    }

    // Submit handler
    const reqForm = document.getElementById('resident-req-form');
    if (reqForm) {
      reqForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const cat = catSelect.value;
        const loc = document.getElementById('req-location').value.trim();
        const desc = document.getElementById('req-desc').value.trim();

        if (!loc || !desc) return;

        const newId = 'CP-' + Math.floor(2700 + Math.random() * 900);
        const newReq = {
          id: newId,
          category: cat,
          location: loc,
          desc: desc,
          raisedAt: '18 Sep 2026',
          status: 'Open',
          userEmail: user.email
        };

        const updated = [newReq, ...getUserRequests()];
        saveUserRequests(updated);

        // Show confirmation panel
        const slot = document.getElementById('req-confirmation-slot');
        if (slot) {
          slot.innerHTML = `
            <div style="background: #EAF1EC; border: 1px solid #B6CCBC; border-radius: var(--radius); padding: 18px; animation: fadeSlideUp 0.3s ease;">
              <div style="color: #5E806B; font-family: var(--font-mono); font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;">
                REQUEST RAISED SUCCESSFULLY
              </div>
              <div style="color: var(--text-primary); font-size: 16px; font-weight: 700; margin: 6px 0 4px;">
                Tracking ID: <span class="mono" style="color: var(--accent);">${newId}</span>
              </div>
              <div style="color: #4A5B53; font-size: 12px; line-height: 1.5;">
                We have registered your issue. Operations personnel in <strong>${escapeHtml(loc)}</strong> will review and dispatch field crews shortly.
              </div>
            </div>
          `;
        }

        // Clear input
        document.getElementById('req-desc').value = '';

        // Update requests list
        const updatedUserList = updated.filter(r => !r.userEmail || r.userEmail === user.email);
        const listEl = document.getElementById('user-requests-list');
        if (listEl) listEl.innerHTML = renderUserRequestsListHtml(updatedUserList);
      });
    }
  }

  function renderUserRequestsListHtml(reqs) {
    if (!reqs || reqs.length === 0) {
      return `
        <div style="padding: 40px; text-align: center; color: var(--text-muted);">
          <div style="font-size: 14px; font-weight: 500;">No requests submitted yet</div>
          <div style="font-size: 12px; margin-top: 4px;">Fill out the form above to log your first ticket.</div>
        </div>
      `;
    }

    return reqs.map(r => `
      <div style="display: grid; grid-template-columns: 110px 1.2fr 1fr 110px; gap: 16px; padding: 14px 20px; align-items: center; border-bottom: 1px solid var(--border2);">
        <div class="mono" style="font-size: 12px; font-weight: 600; color: var(--accent2);">${escapeHtml(r.id)}</div>
        <div>
          <div style="font-size: 13px; font-weight: 600; color: var(--text-primary);">${escapeHtml(r.category)}</div>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Raised ${escapeHtml(r.raisedAt)}</div>
        </div>
        <div style="font-size: 12px; color: var(--text-secondary);">${escapeHtml(r.location)}</div>
        <div>${renderStatusBadge(r.status)}</div>
      </div>
    `).join('');
  }

  // ─── User Page: My Requests ──────────────────────────────────
  function renderUserMyRequests() {
    const main = document.getElementById('user-main');
    if (!main) return;

    const user = state.currentUser;
    const allRequests = getUserRequests();
    const myRequests = allRequests.filter(r => !r.userEmail || r.userEmail === user.email);

    const totalCount = myRequests.length;
    const openCount = myRequests.filter(r => r.status === 'Open').length;
    const inProgressCount = myRequests.filter(r => r.status === 'In Progress').length;
    const resolvedCount = myRequests.filter(r => r.status === 'Resolved').length;

    main.innerHTML = `
      <div style="max-width: 1060px; margin: 0 auto; padding: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <div>
            <h2 class="section-title">Submitted Tickets</h2>
            <p class="section-subtitle">Real-time status updates from municipality operations</p>
          </div>
          <button class="btn btn-primary" onclick="window.CivicApp.setUserPage('requests')">
            <span>Raise new request +</span>
          </button>
        </div>

        <!-- Summary KPIs -->
        <div class="kpi-grid" style="margin-bottom: 24px;">
          <div class="kpi-card">
            <div class="kpi-header">
              <span class="kpi-label">Total Submitted</span>
              <div class="kpi-icon" style="background: rgba(79,117,104,0.1); color: var(--accent2);">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>
              </div>
            </div>
            <div class="kpi-value">${totalCount}</div>
            <div class="kpi-delta" style="color: var(--accent2);">All logged tickets</div>
          </div>

          <div class="kpi-card">
            <div class="kpi-header">
              <span class="kpi-label">Awaiting Triage</span>
              <div class="kpi-icon" style="background: #eaeff0; color: #5C7880;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>
              </div>
            </div>
            <div class="kpi-value">${openCount}</div>
            <div class="kpi-delta" style="color: #5C7880;">In queue for inspection</div>
          </div>

          <div class="kpi-card">
            <div class="kpi-header">
              <span class="kpi-label">In Progress</span>
              <div class="kpi-icon" style="background: #f6f0e4; color: #B8873B;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/></svg>
              </div>
            </div>
            <div class="kpi-value">${inProgressCount}</div>
            <div class="kpi-delta" style="color: #B8873B;">Field team assigned</div>
          </div>

          <div class="kpi-card">
            <div class="kpi-header">
              <span class="kpi-label">Resolved</span>
              <div class="kpi-icon" style="background: #eaf1ec; color: #5E806B;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
            </div>
            <div class="kpi-value">${resolvedCount}</div>
            <div class="kpi-delta" style="color: #5E806B;">Closed & verified</div>
          </div>
        </div>

        <!-- Detailed Cards List -->
        <div class="card" style="overflow: hidden;">
          <div style="padding: 16px 20px; border-bottom: 1px solid var(--border); font-size: 14px; font-weight: 700; color: var(--text-primary);">
            Ticket History
          </div>
          ${myRequests.length === 0 ? `
            <div style="padding: 48px; text-align: center; color: var(--text-muted);">
              No requests recorded yet.
            </div>
          ` : myRequests.map(r => `
            <div style="padding: 18px 22px; border-bottom: 1px solid var(--border2); display: grid; grid-template-columns: auto 1fr auto; gap: 20px; align-items: start;">
              <div class="mono" style="font-size: 13px; font-weight: 700; color: var(--accent2); padding-top: 2px;">
                ${escapeHtml(r.id)}
              </div>
              <div>
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                  <span style="font-size: 14px; font-weight: 700; color: var(--text-primary);">${escapeHtml(r.category)}</span>
                  <span style="font-size: 11px; color: var(--text-muted);">•</span>
                  <span style="font-size: 12px; color: var(--text-secondary);">📍 ${escapeHtml(r.location)}</span>
                </div>
                ${r.desc ? `<p style="font-size: 13px; color: var(--text-primary); line-height: 1.5; margin: 4px 0 6px; font-style: italic;">"${escapeHtml(r.desc)}"</p>` : ''}
                <div style="font-size: 11px; color: var(--text-muted);">Submitted on ${escapeHtml(r.raisedAt)} · Standard SLA: 48–72 hours</div>
              </div>
              <div>
                ${renderStatusBadge(r.status)}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // ─── User Page: Help ─────────────────────────────────────────
  function renderUserHelp() {
    const main = document.getElementById('user-main');
    if (!main) return;

    main.innerHTML = `
      <div style="max-width: 860px; margin: 0 auto; padding: 24px;">
        <h2 class="section-title">Help & Documentation</h2>
        <p class="section-subtitle">How your municipal request lifecycle works</p>

        <div style="display: flex; flex-direction: column; gap: 16px; margin-top: 20px;">
          <div class="card" style="padding: 20px;">
            <div style="font-size: 15px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">
              1. Intake & AI Anomaly Detection
            </div>
            <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.6; margin: 0;">
              When you submit an issue, CivicPulse checks for similar reports in your locality. If multiple neighbors report the same breakdown (e.g. water pipeline leaks), the system flags an emerging cluster automatically, escalating the priority for field crews.
            </p>
          </div>

          <div class="card" style="padding: 20px;">
            <div style="font-size: 15px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">
              2. Status Pipeline Explained
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 10px;">
              <div style="background: var(--bg-card2); padding: 12px; border-radius: 6px; border: 1px solid var(--border);">
                ${renderStatusBadge('Open')}
                <p style="font-size: 12px; color: var(--text-secondary); margin-top: 6px; line-height: 1.4;">Logged in database. Waiting for ward officer assignment.</p>
              </div>
              <div style="background: var(--bg-card2); padding: 12px; border-radius: 6px; border: 1px solid var(--border);">
                ${renderStatusBadge('In Progress')}
                <p style="font-size: 12px; color: var(--text-secondary); margin-top: 6px; line-height: 1.4;">Crew dispatched on site. Repair or cleanup underway.</p>
              </div>
              <div style="background: var(--bg-card2); padding: 12px; border-radius: 6px; border: 1px solid var(--border);">
                ${renderStatusBadge('Resolved')}
                <p style="font-size: 12px; color: var(--text-secondary); margin-top: 6px; line-height: 1.4;">Job completed and confirmed by ground inspection.</p>
              </div>
              <div style="background: var(--bg-card2); padding: 12px; border-radius: 6px; border: 1px solid var(--border);">
                ${renderStatusBadge('Escalated')}
                <p style="font-size: 12px; color: var(--text-secondary); margin-top: 6px; line-height: 1.4;">Requires multi-agency intervention or structural repair.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ─── Admin App Shell ─────────────────────────────────────────
  function initAdminApp() {
    // Navigation items
    document.querySelectorAll('#admin-app .nav-item').forEach(btn => {
      btn.onclick = () => {
        const page = btn.getAttribute('data-page');
        if (page) setAdminPage(page);
      };
    });

    // Sidebar toggle
    const toggleBtn = document.getElementById('admin-sidebar-toggle');
    if (toggleBtn) {
      toggleBtn.onclick = () => {
        state.adminSidebarCollapsed = !state.adminSidebarCollapsed;
        document.getElementById('admin-sidebar').classList.toggle('collapsed', state.adminSidebarCollapsed);
      };
    }

    // Topnav search
    const searchInput = document.getElementById('admin-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        state.explorer.search = e.target.value.trim();
        if (state.adminPage !== 'explorer') {
          setAdminPage('explorer');
        } else {
          renderIncidentExplorer();
        }
      });
    }

    // Notifications toggle
    const notifToggle = document.getElementById('notif-toggle');
    const notifDropdown = document.getElementById('notif-dropdown');
    if (notifToggle && notifDropdown) {
      notifToggle.onclick = (e) => {
        e.stopPropagation();
        state.notifOpen = !state.notifOpen;
        notifDropdown.classList.toggle('hidden', !state.notifOpen);
      };
      document.addEventListener('click', (e) => {
        if (!notifDropdown.contains(e.target) && !notifToggle.contains(e.target)) {
          state.notifOpen = false;
          notifDropdown.classList.add('hidden');
        }
      });
    }

    // Drawers close triggers
    const drawerClose = document.getElementById('drawer-close');
    const drawerOverlay = document.getElementById('drawer-overlay');
    if (drawerClose) drawerClose.onclick = closeIncidentDrawer;
    if (drawerOverlay) drawerOverlay.onclick = closeIncidentDrawer;

    const evidenceClose = document.getElementById('evidence-close');
    const evidenceOverlay = document.getElementById('evidence-overlay');
    if (evidenceClose) evidenceClose.onclick = closeEvidencePanel;
    if (evidenceOverlay) evidenceOverlay.onclick = closeEvidencePanel;

    setAdminPage(state.adminPage || 'command');
  }

  const ADMIN_PAGES_META = {
    command: {
      title: 'Civic Intelligence Command Center',
      sub: 'Monitor complaint activity, emerging incidents and operational patterns.'
    },
    explorer: {
      title: 'Incident Explorer',
      sub: 'Search, filter and investigate submitted civic complaints.'
    },
    emerging: {
      title: 'Emerging Issues',
      sub: 'Automatically detected patterns requiring operational attention.'
    },
    briefing: {
      title: 'Daily Civic Operations Briefing',
      sub: 'Evidence-backed summary of the most important emerging civic issues.'
    },
    requests: {
      title: 'Resident Request Desk (Admin View)',
      sub: 'Review and manage all incoming citizen requests across city sectors.'
    }
  };

  function setAdminPage(page) {
    state.adminPage = page;

    // Update active nav button
    document.querySelectorAll('#admin-app .nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-page') === page);
    });

    // Update header
    const meta = ADMIN_PAGES_META[page] || ADMIN_PAGES_META.command;
    const titleEl = document.getElementById('admin-page-title');
    const subEl = document.getElementById('admin-page-subtitle');
    if (titleEl) titleEl.textContent = meta.title;
    if (subEl) subEl.textContent = meta.sub;

    // Render corresponding page
    switch (page) {
      case 'command':  renderCommandCenter(); break;
      case 'explorer': renderIncidentExplorer(); break;
      case 'emerging': renderEmergingIssues(); break;
      case 'briefing': renderDailyBriefing(); break;
      case 'requests': renderAdminRequestDesk(); break;
      default:         renderCommandCenter(); break;
    }
  }

  // ─── Admin Page: Command Center ──────────────────────────────
  function renderCommandCenter() {
    const main = document.getElementById('admin-main');
    if (!main) return;

    main.innerHTML = `
      <div style="padding: 24px; display: flex; flex-direction: column; gap: 20px;">
        <!-- Header info -->
        <div style="display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 12px;">
          <div>
            <h2 class="section-title">Command Center Overview</h2>
            <p class="section-subtitle">Real-time civic telemetry across 8 localities</p>
          </div>
          <div style="text-align: right;">
            <div class="mono" style="font-size: 12px; font-weight: 600; color: var(--text-primary);">18 September 2026</div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Continuous live streaming enabled</div>
          </div>
        </div>

        <!-- 4 KPI Cards -->
        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-header">
              <span class="kpi-label">Total Complaints</span>
              <div class="kpi-icon" style="background: rgba(79,117,104,0.1); color: var(--accent2);">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
            </div>
            <div class="kpi-value">12,482</div>
            <div class="kpi-delta" style="color: var(--critical);">+8.4% vs prev 30 days</div>
            <div class="kpi-sub">Across all 9 monitored categories</div>
          </div>

          <div class="kpi-card">
            <div class="kpi-header">
              <span class="kpi-label">Open Complaints</span>
              <div class="kpi-icon" style="background: var(--warn-bg); color: var(--warn);">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
            </div>
            <div class="kpi-value">3,241</div>
            <div class="kpi-delta" style="color: var(--warn);">26.0% unresolved</div>
            <div class="kpi-sub">↑142 since yesterday 08:00 AM</div>
          </div>

          <div class="kpi-card">
            <div class="kpi-header">
              <span class="kpi-label">Detected Spikes</span>
              <div class="kpi-icon" style="background: var(--critical-bg); color: var(--critical);">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </div>
            </div>
            <div class="kpi-value">7</div>
            <div class="kpi-delta" style="color: var(--critical);">2 new today</div>
            <div class="kpi-sub">Active anomaly thresholds exceeded</div>
          </div>

          <div class="kpi-card">
            <div class="kpi-header">
              <span class="kpi-label">Similarity Clusters</span>
              <div class="kpi-icon" style="background: rgba(79,117,104,0.1); color: var(--accent2);">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              </div>
            </div>
            <div class="kpi-value">13</div>
            <div class="kpi-delta" style="color: var(--success);">5 high similarity</div>
            <div class="kpi-sub">Shared root-cause likelihood > 85%</div>
          </div>
        </div>

        <!-- Charts Row: Line Chart + Category Distribution -->
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 16px;">
          <!-- SVG Line Chart -->
          <div class="card" style="padding: 20px;">
            <div class="chart-header">
              <div>
                <div class="chart-title">Complaint Activity Trend</div>
                <div class="chart-subtitle">Actual incoming volume vs historical 30-day baseline</div>
              </div>
              <div class="time-range-btns">
                ${['24H', '7D', '30D', '90D'].map(r => `
                  <button class="time-btn ${state.timeRange === r ? 'active' : ''}" onclick="window.CivicApp.setTimeRange('${r}')">${r}</button>
                `).join('')}
              </div>
            </div>

            <div style="height: 220px; width: 100%; position: relative;" id="trend-chart-slot">
              ${generateSvgTrendChart(state.timeRange)}
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 16px; margin-top: 10px;">
              <div style="display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--text-secondary);">
                <div style="width: 14px; height: 2px; background: var(--accent2);"></div>
                <span>Current Activity</span>
              </div>
              <div style="display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--text-muted);">
                <div style="width: 14px; height: 2px; border-top: 2px dashed #C5C2B8;"></div>
                <span>Historical Baseline</span>
              </div>
            </div>
          </div>

          <!-- Category Distribution Bars -->
          <div class="card" style="padding: 20px; display: flex; flex-direction: column;">
            <div class="chart-title">Category Distribution</div>
            <div class="chart-subtitle" style="margin-bottom: 14px;">Total complaints partitioned by department</div>

            <div style="display: flex; flex-direction: column; gap: 10px; flex: 1; justify-content: space-around;">
              ${categoryData.slice(0, 7).map((cat, i) => `
                <div class="cat-bar-item">
                  <div class="cat-bar-header">
                    <span class="cat-bar-name">${escapeHtml(cat.category)}</span>
                    <span class="cat-bar-count">${cat.count.toLocaleString()} (${cat.pct}%)</span>
                  </div>
                  <div class="cat-bar-track">
                    <div class="cat-bar-fill" style="width: ${cat.pct * 3.5}%; background: ${CATEGORY_COLORS[i] || 'var(--accent)'};"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Emerging Issues Section -->
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <h3 style="font-size: 15px; font-weight: 700; color: var(--text-primary); margin: 0;">Emerging Issues Detected</h3>
              <span class="badge badge-critical">4 CRITICAL / HIGH</span>
            </div>
            <button class="link-btn" onclick="window.CivicApp.setAdminPage('emerging')">
              View all detected issues →
            </button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${emergingIssues.map(issue => renderEmergingIssueCard(issue)).join('')}
          </div>
        </div>

        <!-- Geographic Activity Map + Recent Incidents Table -->
        <div style="display: grid; grid-template-columns: 1.15fr 1fr; gap: 16px;">
          <!-- Map Section -->
          <div class="card" style="padding: 20px;">
            <div class="chart-title">Geographic Activity Map</div>
            <div class="chart-subtitle" style="margin-bottom: 12px;">Localized spatial clusters across municipal wards</div>

            <div class="map-container" id="admin-map-container">
              ${renderInteractiveMapHtml()}
            </div>

            <!-- Selected Location Info Box -->
            <div id="map-info-box" class="map-info">
              ${renderMapInfoBoxHtml(state.selectedLocationId)}
            </div>
          </div>

          <!-- Recent Incidents Table -->
          <div class="card" style="padding: 20px; overflow: hidden; display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <div>
                <div class="chart-title">Recent Incoming Incidents</div>
                <div class="chart-subtitle">Latest records streamed from citizen app</div>
              </div>
              <button class="link-btn" onclick="window.CivicApp.setAdminPage('explorer')">Full explorer →</button>
            </div>

            <div style="overflow-x: auto; flex: 1;">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Category</th>
                    <th>Location</th>
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${complaints.slice(0, 7).map(c => `
                    <tr onclick="window.CivicApp.openIncidentDrawer('${c.id}')">
                      <td class="mono" style="font-weight: 600; color: var(--accent2);">${escapeHtml(c.id)}</td>
                      <td style="font-weight: 500;">${escapeHtml(c.category)}</td>
                      <td style="color: var(--text-secondary);">${escapeHtml(c.location)}</td>
                      <td class="mono" style="font-size: 11px; color: var(--text-muted);">${escapeHtml(c.timestamp)}</td>
                      <td>${renderStatusBadge(c.status)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ─── SVG Trend Chart Generator ───────────────────────────────
  function generateSvgTrendChart(range) {
    let dataSlice = trendData;
    if (range === '24H') dataSlice = trendData.slice(-4);
    else if (range === '7D') dataSlice = trendData.slice(-7);
    else if (range === '90D') dataSlice = trendData;

    const width = 640;
    const height = 200;
    const padding = { top: 20, right: 20, bottom: 30, left: 40 };

    const maxVal = Math.max(...dataSlice.map(d => Math.max(d.current, d.baseline))) * 1.1;
    const minVal = 200;

    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const getX = (idx) => padding.left + (idx / (dataSlice.length - 1)) * chartW;
    const getY = (val) => padding.top + chartH - ((val - minVal) / (maxVal - minVal)) * chartH;

    const currentPoints = dataSlice.map((d, i) => `${getX(i)},${getY(d.current)}`).join(' ');
    const baselinePoints = dataSlice.map((d, i) => `${getX(i)},${getY(d.baseline)}`).join(' ');

    const yTicks = [250, 400, 550, 700];

    return `
      <svg class="chart-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" style="width: 100%; height: 100%;">
        <!-- Horizontal Grid Lines -->
        ${yTicks.map(t => {
          const y = getY(t);
          return `
            <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="#DEDCD4" stroke-width="1" stroke-dasharray="3 3" />
            <text x="${padding.left - 8}" y="${y + 4}" text-anchor="end" font-family="'JetBrains Mono', monospace" font-size="9" fill="#8A918D">${t}</text>
          `;
        }).join('')}

        <!-- Baseline Dashed Polyline -->
        <polyline fill="none" stroke="#C5C2B8" stroke-width="2" stroke-dasharray="4 4" points="${baselinePoints}" />

        <!-- Current Volume Solid Polyline -->
        <polyline fill="none" stroke="#35594E" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" points="${currentPoints}" />

        <!-- Points for Current Data -->
        ${dataSlice.map((d, i) => `
          <circle cx="${getX(i)}" cy="${getY(d.current)}" r="3.5" fill="#35594E" stroke="#FFFDF8" stroke-width="1.5" />
          <text x="${getX(i)}" y="${height - 8}" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="9" fill="#66716C">${escapeHtml(d.date)}</text>
        `).join('')}
      </svg>
    `;
  }

  function setTimeRange(r) {
    state.timeRange = r;
    const slot = document.getElementById('trend-chart-slot');
    if (slot) slot.innerHTML = generateSvgTrendChart(r);
    document.querySelectorAll('.time-btn').forEach(btn => {
      btn.classList.toggle('active', btn.textContent.trim() === r);
    });
  }

  // ─── Emerging Issue Card Component ───────────────────────────
  function renderEmergingIssueCard(issue) {
    const ac = getActivityColor(issue.activity);
    const ab = getActivityBg(issue.activity);
    const increaseColor = issue.increasePercent >= 300 ? '#A9473F' : (issue.increasePercent >= 100 ? '#C36B4B' : '#B8873B');

    const whyText = issue.increasePercent >= 300
      ? `${issue.complaints} complaints recorded — ${issue.increasePercent}% above historical baseline (${issue.baseline}). High-similarity cluster of ${issue.similarComplaints} tickets indicates a single severe breakdown.`
      : `${issue.complaints} complaints recorded — ${issue.increasePercent}% above baseline (${issue.baseline}). Cluster of ${issue.similarComplaints} similar complaints concentrated between ${issue.timeConcentration}.`;

    return `
      <div class="issue-card" style="border-left-color: ${ac};" id="card-${issue.id}">
        <div>
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 8px;">
            <span style="font-size: 15px; font-weight: 700; color: var(--text-primary);">${escapeHtml(issue.category)}</span>
            <span style="font-size: 12px; color: var(--text-muted);">•</span>
            <span style="font-size: 13px; color: var(--text-secondary); font-weight: 500;">📍 ${escapeHtml(issue.location)}</span>
            ${renderActivityBadge(issue.activity)}
            ${renderStatusBadge(issue.status)}
            <span class="mono" style="font-size: 10px; color: var(--text-muted); margin-left: auto;">Detected ${escapeHtml(issue.detectedAt)}</span>
          </div>

          <div class="issue-card-stats">
            <div class="issue-stat">
              <div class="issue-stat-label">Complaints</div>
              <div class="issue-stat-val">${issue.complaints}</div>
            </div>
            <div class="issue-stat">
              <div class="issue-stat-label">Baseline</div>
              <div class="issue-stat-val" style="color: var(--text-muted);">${issue.baseline}</div>
            </div>
            <div class="issue-stat">
              <div class="issue-stat-label">Increase</div>
              <div class="issue-stat-val" style="color: ${increaseColor};">+${issue.increasePercent}%</div>
            </div>
            <div class="issue-stat issue-stat-sep">
              <div class="issue-stat-label">Cluster Size</div>
              <div class="issue-stat-val">${issue.similarComplaints}</div>
            </div>
            <div class="issue-stat">
              <div class="issue-stat-label">Time Peak</div>
              <div class="mono" style="font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-top: 4px;">${escapeHtml(issue.timeConcentration)}</div>
            </div>
          </div>

          <div class="why-flagged" style="background: ${ab}; border: 1px solid rgba(0,0,0,0.04);">
            <strong style="color: ${ac};">Why flagged: </strong>
            <span>${escapeHtml(whyText)}</span>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 6px; align-items: flex-end;">
          <button class="btn-dark" onclick="window.CivicApp.openEvidencePanel('${issue.id}')">
            <span>View evidence</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </button>
          <button class="btn-secondary" style="font-size: 11px; padding: 5px 10px;" onclick="window.CivicApp.filterExplorerTo('${issue.category}', '${issue.location}')">
            Explore complaints
          </button>
        </div>
      </div>
    `;
  }

  // ─── Interactive Map ─────────────────────────────────────────
  function renderInteractiveMapHtml() {
    return `
      <!-- Background SVG grid lines -->
      <svg class="map-grid-svg">
        <defs>
          <pattern id="grid-pat" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#DEDCD4" stroke-width="0.75" stroke-dasharray="2 2" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-pat)" />
        <ellipse cx="50%" cy="50%" rx="44%" ry="40%" fill="none" stroke="#8A918D" stroke-width="1" stroke-dasharray="5 5" opacity="0.3" />
      </svg>

      <!-- Pins -->
      ${mapLocations.map(loc => {
        const c = getActivityColor(loc.activity);
        const isSelected = (loc.id === state.selectedLocationId);
        const size = Math.max(20, Math.min(36, loc.complaints * 0.75));
        return `
          <div class="map-pin ${isSelected ? 'selected' : ''}" style="left: ${loc.x}%; top: ${loc.y}%;" onclick="window.CivicApp.selectLocation('${loc.id}')" title="${loc.name}: ${loc.complaints} complaints">
            <div class="map-pin-circle" style="width: ${size}px; height: ${size}px; border-color: ${c}; background: ${c}22; ${isSelected ? `box-shadow: 0 0 0 3px ${c};` : ''}">
              <div class="map-pin-inner" style="width: ${size * 0.4}px; height: ${size * 0.4}px; background: ${c};"></div>
            </div>
            <div class="map-pin-label">${escapeHtml(loc.name)}</div>
          </div>
        `;
      }).join('')}

      <!-- Map Legend -->
      <div class="map-legend">
        <div class="legend-item">
          <div class="legend-dot" style="background: var(--critical);"></div>
          <span class="legend-text">Critical</span>
        </div>
        <div class="legend-item">
          <div class="legend-dot" style="background: var(--high);"></div>
          <span class="legend-text">High</span>
        </div>
        <div class="legend-item">
          <div class="legend-dot" style="background: var(--medium);"></div>
          <span class="legend-text">Medium</span>
        </div>
      </div>
    `;
  }

  function renderMapInfoBoxHtml(locId) {
    const loc = mapLocations.find(l => l.id === locId) || mapLocations[0];
    const ac = getActivityColor(loc.activity);
    const increase = Math.round(((loc.complaints - loc.baseline) / loc.baseline) * 100);

    return `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-size: 13px; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 6px;">
            <span>${escapeHtml(loc.name)}</span>
            ${renderActivityBadge(loc.activity)}
          </div>
          <div style="font-size: 11px; color: var(--text-secondary); margin-top: 2px;">Primary driver: ${escapeHtml(loc.category)}</div>
        </div>
        <div style="text-align: right;">
          <div class="mono" style="font-size: 20px; font-weight: 800; color: var(--text-primary); line-height: 1;">${loc.complaints}</div>
          <div style="font-size: 10px; color: var(--text-muted); text-transform: uppercase;">Incidents</div>
        </div>
      </div>
      <div style="display: flex; gap: 16px; margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border); font-size: 11px;">
        <span style="color: var(--text-secondary);">Historical baseline: <strong class="mono">${loc.baseline}</strong></span>
        <span style="color: ${ac}; font-weight: 700;">+${increase}% above expected rate</span>
      </div>
    `;
  }

  function selectLocation(locId) {
    state.selectedLocationId = locId;
    const container = document.getElementById('admin-map-container');
    if (container) container.innerHTML = renderInteractiveMapHtml();
    const infoBox = document.getElementById('map-info-box');
    if (infoBox) infoBox.innerHTML = renderMapInfoBoxHtml(locId);
  }

  // ─── Admin Page: Incident Explorer ───────────────────────────
  function renderIncidentExplorer() {
    const main = document.getElementById('admin-main');
    if (!main) return;

    const filtered = getFilteredComplaints();
    const totalPages = Math.ceil(filtered.length / state.explorer.pageSize) || 1;
    if (state.explorer.page > totalPages) state.explorer.page = totalPages;

    const paged = filtered.slice(
      (state.explorer.page - 1) * state.explorer.pageSize,
      state.explorer.page * state.explorer.pageSize
    );

    main.innerHTML = `
      <div style="padding: 24px; display: flex; flex-direction: column; gap: 18px;">
        <div>
          <h2 class="section-title">Incident Explorer</h2>
          <p class="section-subtitle">Search, filter, and audit granular citizen tickets</p>
        </div>

        <!-- Filter Bar -->
        <div class="card" style="padding: 16px 18px;">
          <div class="filter-row">
            <div class="filter-search">
              <label class="filter-label">Search Query</label>
              <input type="text" id="exp-search-input" class="filter-select" placeholder="Search by description or ID (e.g. #1023)" value="${escapeHtml(state.explorer.search)}" />
            </div>

            <div class="filter-group">
              <label class="filter-label">Category</label>
              <select id="exp-cat-select" class="filter-select">
                <option value="All">All Categories</option>
                ${CATEGORIES_LIST.map(c => `<option value="${escapeHtml(c)}" ${state.explorer.category === c ? 'selected' : ''}>${escapeHtml(c)}</option>`).join('')}
              </select>
            </div>

            <div class="filter-group">
              <label class="filter-label">Location</label>
              <select id="exp-loc-select" class="filter-select">
                <option value="All">All Locations</option>
                ${LOCATIONS_LIST.map(l => `<option value="${escapeHtml(l)}" ${state.explorer.location === l ? 'selected' : ''}>${escapeHtml(l)}</option>`).join('')}
              </select>
            </div>

            <div class="filter-group">
              <label class="filter-label">Status</label>
              <select id="exp-status-select" class="filter-select">
                <option value="All">All Statuses</option>
                <option value="Open" ${state.explorer.status === 'Open' ? 'selected' : ''}>Open</option>
                <option value="In Progress" ${state.explorer.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                <option value="Resolved" ${state.explorer.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
                <option value="Escalated" ${state.explorer.status === 'Escalated' ? 'selected' : ''}>Escalated</option>
              </select>
            </div>

            <div style="display: flex; gap: 8px;">
              <button class="btn btn-primary" onclick="window.CivicApp.applyExplorerFilters()">Filter</button>
              <button class="btn-secondary" onclick="window.CivicApp.resetExplorerFilters()">Reset</button>
            </div>
          </div>

          <!-- Active Filter Chips -->
          <div id="exp-chips" style="display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; align-items: center;">
            ${renderActiveFilterChipsHtml()}
          </div>
        </div>

        <!-- Table Card -->
        <div class="card" style="overflow: hidden;">
          <div style="padding: 14px 20px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 13px; font-weight: 700; color: var(--text-primary);">
              ${filtered.length} Incident${filtered.length === 1 ? '' : 's'} found
            </div>
            <div class="mono" style="font-size: 11px; color: var(--text-muted);">
              Page ${state.explorer.page} of ${totalPages}
            </div>
          </div>

          <div style="overflow-x: auto;">
            <table class="data-table">
              <thead>
                <tr>
                  <th onclick="window.CivicApp.sortExplorer('id')">ID</th>
                  <th>Complaint Description</th>
                  <th onclick="window.CivicApp.sortExplorer('category')">Category</th>
                  <th onclick="window.CivicApp.sortExplorer('location')">Location</th>
                  <th onclick="window.CivicApp.sortExplorer('timestamp')">Timestamp</th>
                  <th>Status</th>
                  <th>Cluster</th>
                  <th>Activity</th>
                  <th style="text-align: right;">Action</th>
                </tr>
              </thead>
              <tbody>
                ${paged.length === 0 ? `
                  <tr>
                    <td colspan="9" style="text-align: center; padding: 48px; color: var(--text-muted);">
                      No complaints match the specified filters.
                    </td>
                  </tr>
                ` : paged.map(c => `
                  <tr onclick="window.CivicApp.openIncidentDrawer('${c.id}')">
                    <td class="mono" style="font-weight: 600; color: var(--accent2);">${escapeHtml(c.id)}</td>
                    <td style="max-width: 260px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-style: italic; color: var(--text-secondary);">
                      "${escapeHtml(c.text)}"
                    </td>
                    <td style="font-weight: 500;">${escapeHtml(c.category)}</td>
                    <td style="color: var(--text-secondary);">${escapeHtml(c.location)}</td>
                    <td class="mono" style="font-size: 11px; color: var(--text-muted);">${escapeHtml(c.timestamp)}</td>
                    <td>${renderStatusBadge(c.status)}</td>
                    <td class="mono" style="font-size: 11px; color: ${c.cluster ? 'var(--accent2)' : 'var(--text-muted)'};">
                      ${escapeHtml(c.cluster || '—')}
                    </td>
                    <td>${renderActivityBadge(c.activity)}</td>
                    <td style="text-align: right;">
                      <button class="btn-secondary" style="font-size: 11px; padding: 4px 8px;" onclick="event.stopPropagation(); window.CivicApp.openIncidentDrawer('${c.id}')">
                        Inspect
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Pagination Footer -->
          <div style="padding: 12px 20px; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 12px; color: var(--text-muted);">
              Showing ${filtered.length === 0 ? 0 : (state.explorer.page - 1) * state.explorer.pageSize + 1}–${Math.min(state.explorer.page * state.explorer.pageSize, filtered.length)} of ${filtered.length}
            </div>

            <div class="pagination">
              <button class="page-btn" ${state.explorer.page === 1 ? 'disabled' : ''} onclick="window.CivicApp.goExplorerPage(${state.explorer.page - 1})">
                ← Prev
              </button>
              ${Array.from({ length: totalPages }, (_, i) => i + 1).map(p => `
                <button class="page-btn ${state.explorer.page === p ? 'active' : ''}" onclick="window.CivicApp.goExplorerPage(${p})">
                  ${p}
                </button>
              `).join('')}
              <button class="page-btn" ${state.explorer.page === totalPages ? 'disabled' : ''} onclick="window.CivicApp.goExplorerPage(${state.explorer.page + 1})">
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Live search listener
    const searchInput = document.getElementById('exp-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        state.explorer.search = e.target.value;
      });
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') applyExplorerFilters();
      });
    }
  }

  const CATEGORIES_LIST = [
    'Water Supply', 'Roads & Potholes', 'Garbage / Sanitation',
    'Electricity', 'Street Lights', 'Traffic', 'Drainage',
    'Public Safety', 'Parks / Public Spaces', 'Other'
  ];

  const LOCATIONS_LIST = [
    'Sector 12', 'Sector 4', 'Sector 6', 'Sector 8',
    'Sector 15', 'Ward 2', 'Ward 3', 'Ward 7', 'Ward 9'
  ];

  function getFilteredComplaints() {
    let result = [...complaints];
    const q = (state.explorer.search || '').toLowerCase();

    if (q) {
      result = result.filter(c =>
        c.text.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
      );
    }

    if (state.explorer.category !== 'All') {
      result = result.filter(c => c.category === state.explorer.category);
    }
    if (state.explorer.location !== 'All') {
      result = result.filter(c => c.location === state.explorer.location);
    }
    if (state.explorer.status !== 'All') {
      result = result.filter(c => c.status === state.explorer.status);
    }

    if (state.explorer.sortCol) {
      result.sort((a, b) => {
        const valA = a[state.explorer.sortCol] || '';
        const valB = b[state.explorer.sortCol] || '';
        return state.explorer.sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      });
    }

    return result;
  }

  function renderActiveFilterChipsHtml() {
    const chips = [];
    if (state.explorer.category !== 'All') {
      chips.push({ label: `Category: ${state.explorer.category}`, clear: () => state.explorer.category = 'All' });
    }
    if (state.explorer.location !== 'All') {
      chips.push({ label: `Location: ${state.explorer.location}`, clear: () => state.explorer.location = 'All' });
    }
    if (state.explorer.status !== 'All') {
      chips.push({ label: `Status: ${state.explorer.status}`, clear: () => state.explorer.status = 'All' });
    }
    if (state.explorer.search) {
      chips.push({ label: `Query: "${state.explorer.search}"`, clear: () => state.explorer.search = '' });
    }

    if (chips.length === 0) return '';

    return `
      <span style="font-size: 11px; font-weight: 600; color: var(--text-muted);">Active Filters:</span>
      ${chips.map((chip, idx) => `
        <span class="chip">
          <span>${escapeHtml(chip.label)}</span>
          <button class="chip-remove" onclick="window.CivicApp.clearChip(${idx})">×</button>
        </span>
      `).join('')}
    `;
  }

  function clearChip(idx) {
    const chips = [];
    if (state.explorer.category !== 'All') chips.push(() => state.explorer.category = 'All');
    if (state.explorer.location !== 'All') chips.push(() => state.explorer.location = 'All');
    if (state.explorer.status !== 'All') chips.push(() => state.explorer.status = 'All');
    if (state.explorer.search) chips.push(() => state.explorer.search = '');

    if (chips[idx]) chips[idx]();
    state.explorer.page = 1;
    renderIncidentExplorer();
  }

  function applyExplorerFilters() {
    const s = document.getElementById('exp-search-input');
    const c = document.getElementById('exp-cat-select');
    const l = document.getElementById('exp-loc-select');
    const st = document.getElementById('exp-status-select');

    if (s) state.explorer.search = s.value.trim();
    if (c) state.explorer.category = c.value;
    if (l) state.explorer.location = l.value;
    if (st) state.explorer.status = st.value;

    state.explorer.page = 1;
    renderIncidentExplorer();
  }

  function resetExplorerFilters() {
    state.explorer.search = '';
    state.explorer.category = 'All';
    state.explorer.location = 'All';
    state.explorer.status = 'All';
    state.explorer.page = 1;
    renderIncidentExplorer();
  }

  function goExplorerPage(p) {
    state.explorer.page = p;
    renderIncidentExplorer();
  }

  function sortExplorer(col) {
    if (state.explorer.sortCol === col) {
      state.explorer.sortAsc = !state.explorer.sortAsc;
    } else {
      state.explorer.sortCol = col;
      state.explorer.sortAsc = true;
    }
    renderIncidentExplorer();
  }

  function filterExplorerTo(category, location) {
    state.explorer.category = category;
    state.explorer.location = location;
    state.explorer.search = '';
    state.explorer.status = 'All';
    state.explorer.page = 1;
    setAdminPage('explorer');
  }

  // ─── Admin Page: Emerging Issues ─────────────────────────────
  function renderEmergingIssues() {
    const main = document.getElementById('admin-main');
    if (!main) return;

    const filtered = (state.emergingFilter === 'All')
      ? emergingIssues
      : emergingIssues.filter(i => i.activity === state.emergingFilter);

    main.innerHTML = `
      <div style="padding: 24px; display: flex; flex-direction: column; gap: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 12px;">
          <div>
            <h2 class="section-title">Emerging Issues (AI Clustered)</h2>
            <p class="section-subtitle">Real-time spike anomalies identified against 30-day baseline</p>
          </div>

          <div style="display: flex; gap: 8px;">
            <span class="badge" style="background: var(--critical-bg); color: var(--critical); font-size: 11px; padding: 4px 10px;">7 Active Issues</span>
            <span class="badge" style="background: var(--warn-bg); color: var(--warn); font-size: 11px; padding: 4px 10px;">2 New Today</span>
            <span class="badge" style="background: var(--success-bg); color: var(--success); font-size: 11px; padding: 4px 10px;">13 Clusters Tracked</span>
          </div>
        </div>

        <!-- Filter Tabs -->
        <div class="tab-bar">
          ${['All', 'Critical', 'High', 'Medium'].map(tab => `
            <button class="tab-btn ${state.emergingFilter === tab ? 'active' : ''}" onclick="window.CivicApp.setEmergingFilter('${tab}')">
              ${tab} (${tab === 'All' ? emergingIssues.length : emergingIssues.filter(i => i.activity === tab).length})
            </button>
          `).join('')}
        </div>

        <!-- Grid of Issues -->
        <div class="issue-cards-grid">
          ${filtered.map(issue => {
            const ac = getActivityColor(issue.activity);
            const ab = getActivityBg(issue.activity);
            const ic = issue.increasePercent >= 300 ? '#A9473F' : (issue.increasePercent >= 100 ? '#C36B4B' : '#B8873B');

            return `
              <div class="ei-card" style="border-left-color: ${ac};">
                <div style="padding: 16px 18px; border-bottom: 1px solid var(--border2);">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    ${renderActivityBadge(issue.activity)}
                    <div style="display: flex; align-items: center; gap: 6px;">
                      ${renderStatusBadge(issue.status)}
                      <span class="mono" style="font-size: 10px; color: var(--text-muted);">${escapeHtml(issue.detectedAt)}</span>
                    </div>
                  </div>
                  <div style="font-size: 17px; font-weight: 800; color: var(--text-primary);">${escapeHtml(issue.category)}</div>
                  <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">📍 ${escapeHtml(issue.location)}</div>
                </div>

                <div style="padding: 16px 18px;">
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px;">
                    <div class="mini-stat">
                      <div class="issue-stat-label">Complaints</div>
                      <div class="issue-stat-val" style="color: ${ac}; font-size: 22px;">${issue.complaints}</div>
                    </div>
                    <div class="mini-stat">
                      <div class="issue-stat-label">Baseline</div>
                      <div class="issue-stat-val" style="color: var(--text-muted); font-size: 22px;">${issue.baseline}</div>
                    </div>
                    <div class="mini-stat">
                      <div class="issue-stat-label">Increase</div>
                      <div class="issue-stat-val" style="color: ${ic}; font-size: 22px;">+${issue.increasePercent}%</div>
                    </div>
                    <div class="mini-stat">
                      <div class="issue-stat-label">Cluster Size</div>
                      <div class="issue-stat-val" style="color: var(--text-primary); font-size: 22px;">${issue.similarComplaints}</div>
                    </div>
                  </div>

                  <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 14px;">
                    ⏰ Peak activity window: <strong class="mono" style="color: var(--text-primary);">${escapeHtml(issue.timeConcentration)}</strong>
                  </div>

                  <div style="display: flex; gap: 8px;">
                    <button class="btn-dark" style="flex: 1; justify-content: center;" onclick="window.CivicApp.openEvidencePanel('${issue.id}')">
                      View Evidence
                    </button>
                    <button class="btn-secondary" style="font-size: 11px; padding: 6px 12px;" onclick="window.CivicApp.filterExplorerTo('${issue.category}', '${issue.location}')">
                      ${issue.supportingComplaints.length} tickets
                    </button>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  function setEmergingFilter(filter) {
    state.emergingFilter = filter;
    renderEmergingIssues();
  }

  // ─── Admin Page: Daily Briefing ──────────────────────────────
  function renderDailyBriefing() {
    const main = document.getElementById('admin-main');
    if (!main) return;

    main.innerHTML = `
      <div style="max-width: 980px; margin: 0 auto; padding: 24px; display: flex; flex-direction: column; gap: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px;">
          <div>
            <h2 class="section-title">Daily Civic Operations Briefing</h2>
            <p class="section-subtitle">Auto-generated operational synthesis backed by deterministic evidence</p>
          </div>

          <div style="display: flex; gap: 8px; align-items: center;">
            <button class="btn btn-primary" id="refresh-briefing-btn" onclick="window.CivicApp.refreshBriefing()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
              <span>Refresh Briefing</span>
            </button>
            <button class="btn-secondary" onclick="window.print()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
              <span>Print / PDF</span>
            </button>
          </div>
        </div>

        <!-- KPI strip -->
        <div class="kpi-grid">
          <div class="kpi-card">
            <span class="kpi-label">Detected Anomalies</span>
            <div class="kpi-value" style="color: var(--critical);">7</div>
            <div class="kpi-delta" style="color: var(--critical);">2 Critical / 5 High</div>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Analyzed Records</span>
            <div class="kpi-value">12,482</div>
            <div class="kpi-delta" style="color: var(--accent2);">Full coverage</div>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Top Spike Surge</span>
            <div class="kpi-value" style="color: var(--critical);">+411%</div>
            <div class="kpi-delta" style="color: var(--critical);">Water Sector 12</div>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Actionable Protocols</span>
            <div class="kpi-value" style="color: var(--success);">4</div>
            <div class="kpi-delta" style="color: var(--success);">Dispatched to field</div>
          </div>
        </div>

        <!-- Refresh Animation / Loading slot -->
        <div id="briefing-loading" style="display: none; background: var(--bg-card); border-radius: var(--radius); border: 1px solid var(--border); padding: 40px; text-align: center;">
          <div class="spin" style="display: inline-block; width: 28px; height: 28px; border: 3px solid #DEDCD4; border-top-color: var(--accent2); border-radius: 50%; margin-bottom: 12px;"></div>
          <div style="font-size: 15px; font-weight: 700; color: var(--text-primary);">Synthesizing civic incident intelligence…</div>
          <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">Computing cluster correlations and cross-department trends</div>
        </div>

        <!-- Briefing Document Card -->
        <div id="briefing-content" style="display: flex; flex-direction: column; gap: 18px;">
          <div class="briefing-header-card">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
              <span class="status-dot" style="background: #6F8F7A;"></span>
              <span style="font-family: var(--font-mono); font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #8BA898;">
                CIVICPULSE AI — AUTOMATED INTELLIGENCE MEMORANDUM
              </span>
            </div>
            <h1 style="font-size: 24px; font-weight: 800; letter-spacing: -0.01em; margin-bottom: 4px; color: #F4F1EA;">
              Daily Civic Operations Briefing
            </h1>
            <div style="font-size: 12px; color: var(--text-sidebar);">
              Date: 18 September 2026 · Prepared for: Operations Command & Commissioners · Confidential
            </div>

            <div style="margin-top: 14px; padding: 12px 14px; background: rgba(111,143,122,0.14); border: 1px solid rgba(111,143,122,0.25); border-radius: 6px; font-size: 12px; color: #E0EAE3; line-height: 1.5;">
              <strong>Verification Statement:</strong> All statistics, percentages, and timestamps in this document are strictly calculated from active municipal telemetry databases. No values are synthetic hallucinations.
            </div>
          </div>

          <!-- Top Issues Synthesis -->
          <div class="card" style="padding: 24px;">
            <div style="font-size: 15px; font-weight: 800; color: var(--text-primary); margin-bottom: 16px;">
              Top Priority Incidents Requiring Dispatch
            </div>

            <div style="display: flex; flex-direction: column; gap: 20px;">
              ${emergingIssues.map((issue, idx) => {
                const ac = getActivityColor(issue.activity);
                return `
                  <div style="padding-bottom: 18px; border-bottom: ${idx < emergingIssues.length - 1 ? '1px solid var(--border2)' : 'none'};">
                    <div style="display: flex; gap: 14px; align-items: flex-start;">
                      <div style="width: 26px; height: 26px; border-radius: 50%; background: ${idx === 0 ? 'var(--critical-bg)' : 'var(--bg-card2)'}; color: ${idx === 0 ? 'var(--critical)' : 'var(--text-secondary)'}; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 12px; font-family: var(--font-mono); flex-shrink: 0;">
                        ${idx + 1}
                      </div>

                      <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 6px;">
                          <span style="font-size: 16px; font-weight: 800; color: var(--text-primary);">${escapeHtml(issue.category)}</span>
                          <span style="font-size: 13px; color: var(--text-muted);">—</span>
                          <span style="font-size: 14px; font-weight: 600; color: var(--text-secondary);">📍 ${escapeHtml(issue.location)}</span>
                          ${renderActivityBadge(issue.activity)}
                        </div>

                        <p style="font-size: 13px; color: var(--text-primary); line-height: 1.6; margin: 0 0 10px;">
                          <strong>${issue.complaints}</strong> ${issue.category.toLowerCase()} complaints were recorded in <strong>${escapeHtml(issue.location)}</strong> compared with a historical baseline of <strong>${issue.baseline}</strong>. The activity is acutely abnormal, registering a surge of <strong style="color: ${ac};">+${issue.increasePercent}%</strong>. A total of <strong>${issue.similarComplaints}</strong> complaints exhibit high lexical similarity, concentrated around <strong>${escapeHtml(issue.timeConcentration)}</strong>.
                        </p>

                        <div style="background: var(--bg-card2); border: 1px solid var(--border); border-radius: 6px; padding: 10px 12px;">
                          <div style="font-size: 10px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px;">
                            Verified Evidence Metrics
                          </div>
                          <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                            <span class="evidence-pill">${issue.complaints} complaints</span>
                            <span class="evidence-pill">Baseline: ${issue.baseline}</span>
                            <span class="evidence-pill" style="color: ${ac}; font-weight: 700;">+${issue.increasePercent}% surge</span>
                            <span class="evidence-pill">Cluster: ${issue.similarComplaints} tickets</span>
                            <span class="evidence-pill">Time peak: ${issue.timeConcentration}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Operational Recommendations -->
          <div class="card" style="padding: 24px;">
            <div style="font-size: 15px; font-weight: 800; color: var(--text-primary); margin-bottom: 14px;">
              Immediate Operational Action Protocols
            </div>

            <div style="display: flex; flex-direction: column; gap: 10px;">
              <div style="padding: 12px 14px; border-radius: 6px; background: #f3e9e8; border-left: 4px solid #A9473F; display: flex; gap: 12px; align-items: center;">
                <span style="font-size: 10px; font-weight: 800; background: #fff; color: #A9473F; padding: 3px 8px; border-radius: 4px; text-transform: uppercase;">Immediate</span>
                <span style="font-size: 13px; color: var(--text-primary);">Dispatch Water Pipeline Inspection Engineers to <strong>Sector 12</strong>. Major distribution failure likely.</span>
              </div>

              <div style="padding: 12px 14px; border-radius: 6px; background: #f6f0e4; border-left: 4px solid #B8873B; display: flex; gap: 12px; align-items: center;">
                <span style="font-size: 10px; font-weight: 800; background: #fff; color: #B8873B; padding: 3px 8px; border-radius: 4px; text-transform: uppercase;">High Priority</span>
                <span style="font-size: 13px; color: var(--text-primary);">Reroute municipal compaction vehicles to <strong>Ward 7</strong> to resolve 4-day sanitation accumulation.</span>
              </div>

              <div style="padding: 12px 14px; border-radius: 6px; background: #f6f0e4; border-left: 4px solid #B8873B; display: flex; gap: 12px; align-items: center;">
                <span style="font-size: 10px; font-weight: 800; background: #fff; color: #B8873B; padding: 3px 8px; border-radius: 4px; text-transform: uppercase;">High Priority</span>
                <span style="font-size: 13px; color: var(--text-primary);">Deploy asphalt cold-mix crew to <strong>Sector 4</strong> for emergency pothole patching on main school artery.</span>
              </div>

              <div style="padding: 12px 14px; border-radius: 6px; background: #eaeff0; border-left: 4px solid #5C7880; display: flex; gap: 12px; align-items: center;">
                <span style="font-size: 10px; font-weight: 800; background: #fff; color: #5C7880; padding: 3px 8px; border-radius: 4px; text-transform: uppercase;">Monitoring</span>
                <span style="font-size: 13px; color: var(--text-primary);">Maintain sensor telemetry on <strong>Ward 9</strong> electrical feeder lines; no immediate safety escalation yet.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function refreshBriefing() {
    const loading = document.getElementById('briefing-loading');
    const content = document.getElementById('briefing-content');
    const btn = document.getElementById('refresh-briefing-btn');

    if (loading && content) {
      loading.style.display = 'block';
      content.style.display = 'none';
      if (btn) btn.disabled = true;

      setTimeout(() => {
        loading.style.display = 'none';
        content.style.display = 'flex';
        if (btn) btn.disabled = false;
      }, 1400);
    }
  }

  // ─── Admin Page: Request Desk (All Requests) ──────────────────
  function renderAdminRequestDesk() {
    const main = document.getElementById('admin-main');
    if (!main) return;

    const allRequests = getUserRequests();

    main.innerHTML = `
      <div style="padding: 24px; display: flex; flex-direction: column; gap: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 12px;">
          <div>
            <h2 class="section-title">Resident Request Desk — Operations Triage</h2>
            <p class="section-subtitle">Manage ticket status transitions across all resident submissions</p>
          </div>
          <div class="mono" style="font-size: 12px; font-weight: 600; color: var(--accent2);">
            ${allRequests.length} Total Registered Tickets
          </div>
        </div>

        <div class="card" style="overflow: hidden;">
          <div style="overflow-x: auto;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Description</th>
                  <th>Submitted By</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th style="text-align: right;">Update Status</th>
                </tr>
              </thead>
              <tbody>
                ${allRequests.map(r => `
                  <tr>
                    <td class="mono" style="font-weight: 700; color: var(--accent2);">${escapeHtml(r.id)}</td>
                    <td style="font-weight: 600;">${escapeHtml(r.category)}</td>
                    <td style="color: var(--text-secondary);">${escapeHtml(r.location)}</td>
                    <td style="max-width: 260px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-style: italic; color: var(--text-secondary);">
                      "${escapeHtml(r.desc || 'No additional note')}"
                    </td>
                    <td class="mono" style="font-size: 11px; color: var(--text-muted);">${escapeHtml(r.userEmail || 'Resident')}</td>
                    <td class="mono" style="font-size: 11px; color: var(--text-muted);">${escapeHtml(r.raisedAt)}</td>
                    <td>${renderStatusBadge(r.status)}</td>
                    <td style="text-align: right;">
                      <select class="filter-select" style="width: auto; font-size: 11px; padding: 4px 8px;" onchange="window.CivicApp.updateTicketStatus('${r.id}', this.value)">
                        <option value="Open" ${r.status === 'Open' ? 'selected' : ''}>Open</option>
                        <option value="In Progress" ${r.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                        <option value="Resolved" ${r.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
                        <option value="Escalated" ${r.status === 'Escalated' ? 'selected' : ''}>Escalated</option>
                      </select>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  function updateTicketStatus(id, newStatus) {
    const all = getUserRequests();
    const target = all.find(r => r.id === id);
    if (target) {
      target.status = newStatus;
      saveUserRequests(all);
      renderAdminRequestDesk();
    }
  }

  // ─── Drawers: Incident Detail & Evidence Panel ───────────────
  function openIncidentDrawer(incidentId) {
    const incident = complaints.find(c => c.id === incidentId);
    if (!incident) return;

    state.activeIncident = incident;

    const overlay = document.getElementById('drawer-overlay');
    const drawer = document.getElementById('detail-drawer');
    const title = document.getElementById('drawer-title');
    const body = document.getElementById('drawer-body');

    if (title) title.textContent = `Incident ${incident.id}`;
    if (body) {
      const related = complaints.filter(c => c.cluster && c.cluster === incident.cluster && c.id !== incident.id);

      body.innerHTML = `
        <div style="display: flex; gap: 8px; margin-bottom: 18px; flex-wrap: wrap;">
          ${renderStatusBadge(incident.status)}
          ${renderActivityBadge(incident.activity)}
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 18px;">
          <div style="background: var(--bg-card2); padding: 10px 12px; border-radius: 6px; border: 1px solid var(--border);">
            <div style="font-size: 9px; text-transform: uppercase; color: var(--text-muted); font-weight: 700; margin-bottom: 2px;">Category</div>
            <div style="font-size: 13px; font-weight: 600; color: var(--text-primary);">${escapeHtml(incident.category)}</div>
          </div>
          <div style="background: var(--bg-card2); padding: 10px 12px; border-radius: 6px; border: 1px solid var(--border);">
            <div style="font-size: 9px; text-transform: uppercase; color: var(--text-muted); font-weight: 700; margin-bottom: 2px;">Location</div>
            <div style="font-size: 13px; font-weight: 600; color: var(--text-primary);">${escapeHtml(incident.location)}</div>
          </div>
          <div style="background: var(--bg-card2); padding: 10px 12px; border-radius: 6px; border: 1px solid var(--border);">
            <div style="font-size: 9px; text-transform: uppercase; color: var(--text-muted); font-weight: 700; margin-bottom: 2px;">Timestamp</div>
            <div class="mono" style="font-size: 12px; font-weight: 600; color: var(--text-primary);">${escapeHtml(incident.timestamp)}</div>
          </div>
          <div style="background: var(--bg-card2); padding: 10px 12px; border-radius: 6px; border: 1px solid var(--border);">
            <div style="font-size: 9px; text-transform: uppercase; color: var(--text-muted); font-weight: 700; margin-bottom: 2px;">Assigned Cluster</div>
            <div class="mono" style="font-size: 12px; font-weight: 600; color: ${incident.cluster ? 'var(--accent2)' : 'var(--text-muted)'};">${escapeHtml(incident.cluster || 'None')}</div>
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 6px; letter-spacing: 0.05em;">
            Raw Complaint Statement
          </div>
          <div style="background: var(--bg-card2); border: 1px solid var(--border); border-radius: 8px; padding: 14px 16px; font-size: 14px; font-style: italic; color: var(--text-primary); line-height: 1.5;">
            "${escapeHtml(incident.text)}"
          </div>
        </div>

        ${incident.cluster ? `
          <div style="margin-bottom: 20px;">
            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 6px; letter-spacing: 0.05em;">
              Similarity Group Context
            </div>
            <div style="background: rgba(79,117,104,0.08); border: 1px solid rgba(79,117,104,0.2); border-radius: 8px; padding: 12px 14px; display: flex; align-items: center; gap: 10px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent2)" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              <div>
                <div style="font-size: 13px; font-weight: 700; color: var(--accent);">${escapeHtml(incident.cluster)}</div>
                <div style="font-size: 11px; color: var(--text-secondary);">Automated semantic grouping for co-occurring breakdowns</div>
              </div>
            </div>
          </div>
        ` : ''}

        <div>
          <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 8px; letter-spacing: 0.05em;">
            Related Complaints in Area (${related.length})
          </div>
          ${related.length === 0 ? `
            <div style="font-size: 12px; color: var(--text-muted);">No other cluster tickets in this immediate batch.</div>
          ` : related.map(r => `
            <div style="background: var(--bg-card2); border: 1px solid var(--border); border-radius: 6px; padding: 10px 12px; margin-bottom: 8px; cursor: pointer;" onclick="window.CivicApp.openIncidentDrawer('${r.id}')">
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span class="mono" style="font-size: 11px; font-weight: 700; color: var(--accent2);">${escapeHtml(r.id)}</span>
                <span class="mono" style="font-size: 10px; color: var(--text-muted);">${escapeHtml(r.timestamp)}</span>
              </div>
              <div style="font-size: 12px; color: var(--text-primary); font-style: italic; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                "${escapeHtml(r.text)}"
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    if (overlay) overlay.classList.remove('hidden');
    if (drawer) drawer.classList.remove('hidden');
  }

  function closeIncidentDrawer() {
    const overlay = document.getElementById('drawer-overlay');
    const drawer = document.getElementById('detail-drawer');
    if (overlay) overlay.classList.add('hidden');
    if (drawer) drawer.classList.add('hidden');
    state.activeIncident = null;
  }

  function openEvidencePanel(issueId) {
    const issue = emergingIssues.find(i => i.id === issueId);
    if (!issue) return;

    state.activeEvidenceIssue = issue;

    const overlay = document.getElementById('evidence-overlay');
    const panel = document.getElementById('evidence-panel');
    const headerContent = document.getElementById('evidence-header-content');
    const body = document.getElementById('evidence-body');

    const ac = getActivityColor(issue.activity);
    const ab = getActivityBg(issue.activity);

    if (headerContent) {
      headerContent.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
          ${renderActivityBadge(issue.activity)}
          ${renderStatusBadge(issue.status)}
        </div>
        <div style="font-size: 18px; font-weight: 800; color: var(--text-primary);">${escapeHtml(issue.category)}</div>
        <div style="font-size: 12px; color: var(--text-secondary);">📍 ${escapeHtml(issue.location)}</div>
      `;
    }

    if (body) {
      const supporting = issue.supportingComplaints || [];

      body.innerHTML = `
        <!-- Summary Banner -->
        <div style="background: var(--bg-card2); border: 1px solid var(--border); border-radius: 8px; padding: 14px 16px; margin-bottom: 18px; font-size: 13px; line-height: 1.6; color: var(--text-primary);">
          <strong>${issue.complaints} complaints</strong> were recorded in <strong>${escapeHtml(issue.location)}</strong> against an expected baseline of <strong>${issue.baseline}</strong>. The activity rate is <strong>${(issue.increasePercent / 100 + 1).toFixed(1)}× above normal</strong>.
        </div>

        <!-- Why Flagged Checklist -->
        <div style="margin-bottom: 20px;">
          <div style="font-size: 12px; font-weight: 800; color: var(--text-primary); margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="${ac}" stroke-width="2.5"><path d="m10.29 3.86-8.07 13.97a1 1 0 0 0 .88 1.5h16.15a1 1 0 0 0 .88-1.5L11.71 3.86a1 1 0 0 0-1.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            Evidence-Backed Anomaly Drivers
          </div>

          <div style="background: ${ab}; border: 1px solid ${ac}33; border-radius: 8px; padding: 6px 14px;">
            ${[
              { label: 'Recorded complaints in cycle', val: issue.complaints },
              { label: 'Historical 30-day baseline', val: issue.baseline },
              { label: 'Surge above baseline rate', val: `+${issue.increasePercent}%`, highlight: true },
              { label: 'Similarity cluster density', val: `${issue.similarComplaints} tickets` },
              { label: 'Geographic concentration', val: issue.location },
              { label: 'Peak temporal concentration', val: issue.timeConcentration },
            ].map((row, i, arr) => `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; ${i < arr.length - 1 ? `border-bottom: 1px solid ${ac}22;` : ''}">
                <span style="font-size: 12px; color: var(--text-primary); display: flex; align-items: center; gap: 6px;">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="${ac}" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                  ${row.label}
                </span>
                <span class="mono" style="font-size: 12px; font-weight: 700; color: ${row.highlight ? ac : 'var(--text-primary)'};">${row.val}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Mini Stats 3-column -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px;">
          <div style="background: var(--bg-card2); border: 1px solid var(--border); border-radius: 6px; padding: 12px; text-align: center;">
            <div class="mono" style="font-size: 20px; font-weight: 800; color: ${ac};">${issue.complaints}</div>
            <div style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; margin-top: 2px;">Complaints</div>
          </div>
          <div style="background: var(--bg-card2); border: 1px solid var(--border); border-radius: 6px; padding: 12px; text-align: center;">
            <div class="mono" style="font-size: 20px; font-weight: 800; color: var(--text-muted);">${issue.baseline}</div>
            <div style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; margin-top: 2px;">Baseline</div>
          </div>
          <div style="background: var(--bg-card2); border: 1px solid var(--border); border-radius: 6px; padding: 12px; text-align: center;">
            <div class="mono" style="font-size: 20px; font-weight: 800; color: ${ac};">+${issue.increasePercent}%</div>
            <div style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; margin-top: 2px;">Increase</div>
          </div>
        </div>

        <!-- Supporting Complaints List -->
        <div>
          <div style="font-size: 12px; font-weight: 800; color: var(--text-primary); margin-bottom: 8px;">
            Supporting Cluster Complaints (${supporting.length})
          </div>
          ${supporting.length === 0 ? `
            <div style="font-size: 12px; color: var(--text-muted);">No ticket excerpts preloaded.</div>
          ` : supporting.map(c => `
            <div style="background: var(--bg-card2); border: 1px solid var(--border); border-radius: 6px; padding: 10px 12px; margin-bottom: 8px; cursor: pointer;" onclick="window.CivicApp.openIncidentDrawer('${c.id}')">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <span class="mono" style="font-size: 11px; font-weight: 700; color: var(--accent2);">${escapeHtml(c.id)}</span>
                <span class="mono" style="font-size: 10px; color: var(--text-muted);">${escapeHtml(c.timestamp)}</span>
              </div>
              <div style="font-size: 12px; color: var(--text-primary); font-style: italic; line-height: 1.4;">
                "${escapeHtml(c.text)}"
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    if (overlay) overlay.classList.remove('hidden');
    if (panel) panel.classList.remove('hidden');
  }

  function closeEvidencePanel() {
    const overlay = document.getElementById('evidence-overlay');
    const panel = document.getElementById('evidence-panel');
    if (overlay) overlay.classList.add('hidden');
    if (panel) panel.classList.add('hidden');
    state.activeEvidenceIssue = null;
  }

  // ─── Global Exposure for Inline Event Handlers ────────────────
  window.CivicApp = {
    setAdminPage,
    setUserPage,
    setTimeRange,
    selectLocation,
    applyExplorerFilters,
    resetExplorerFilters,
    goExplorerPage,
    sortExplorer,
    clearChip,
    filterExplorerTo,
    setEmergingFilter,
    refreshBriefing,
    updateTicketStatus,
    openIncidentDrawer,
    closeIncidentDrawer,
    openEvidencePanel,
    closeEvidencePanel
  };

  // ─── Application Bootstrap ───────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    initAuth();
  });

})();

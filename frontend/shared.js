// ══════════════════════════════════════════════════════════════
//  CivicPulse — Shared Helper & Session Script
// ══════════════════════════════════════════════════════════════

// ─── Session Management ───────────────────────────────────────
function getCurrentUser(expectedRole) {
  const sessionStr = localStorage.getItem('civicpulse_session');
  let user = null;
  if (sessionStr) {
    try { user = JSON.parse(sessionStr); } catch (e) {}
  }

  // If no user is logged in, provide a sensible default for direct browser testing
  if (!user) {
    if (expectedRole === 'admin') {
      user = { email: 'admin@civic.com', role: 'admin', name: 'Amit Singh', initials: 'AS', ward: '' };
    } else {
      user = { email: 'user@civic.com', role: 'user', name: 'Resident User', initials: 'RU', ward: 'Sector 12' };
    }
  }

  return user;
}

function doSignOut() {
  localStorage.removeItem('civicpulse_session');
  window.location.href = 'index.html';
}

function initShell(expectedRole) {
  const user = getCurrentUser(expectedRole);

  // Sync profile displays
  document.querySelectorAll('#user-display-name, .user-name').forEach(el => {
    el.textContent = user.name || (user.role === 'admin' ? 'Amit Singh' : 'Resident User');
  });
  document.querySelectorAll('#user-avatar-initials, .user-avatar, .user-avatar-sm, #topnav-avatar').forEach(el => {
    el.textContent = user.initials || (user.role === 'admin' ? 'AS' : 'RU');
  });

  // Sidebar toggle
  const toggleBtn = document.querySelector('.sidebar-toggle');
  const sidebar = document.querySelector('.sidebar');
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
    });
  }

  // Logout buttons
  document.querySelectorAll('.logout-btn, #logout-btn, [data-action="logout"]').forEach(btn => {
    btn.addEventListener('click', doSignOut);
  });

  // Notifications dropdown
  const notifToggle = document.getElementById('notif-toggle');
  const notifDropdown = document.getElementById('notif-dropdown');
  if (notifToggle && notifDropdown) {
    notifToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      notifDropdown.classList.toggle('hidden');
    });
    document.addEventListener('click', (e) => {
      if (!notifDropdown.contains(e.target) && !notifToggle.contains(e.target)) {
        notifDropdown.classList.add('hidden');
      }
    });
  }

  return user;
}

// ─── Requests Storage (localStorage) ──────────────────────────
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

// ─── Badges & Formatting ──────────────────────────────────────
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

// ─── Shared Drawer Handlers ───────────────────────────────────
function openIncidentDrawer(incidentId) {
  const incident = complaints.find(c => c.id === incidentId);
  if (!incident) return;

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
          <div style="background: var(--bg-card2); border: 1px solid var(--border); border-radius: 6px; padding: 10px 12px; margin-bottom: 8px; cursor: pointer;" onclick="openIncidentDrawer('${r.id}')">
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
}

function openEvidencePanel(issueId) {
  const issue = emergingIssues.find(i => i.id === issueId);
  if (!issue) return;

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
      <div style="background: var(--bg-card2); border: 1px solid var(--border); border-radius: 8px; padding: 14px 16px; margin-bottom: 18px; font-size: 13px; line-height: 1.6; color: var(--text-primary);">
        <strong>${issue.complaints} complaints</strong> recorded in <strong>${escapeHtml(issue.location)}</strong> against historical baseline of <strong>${issue.baseline}</strong> (${(issue.increasePercent / 100 + 1).toFixed(1)}× above expected rate).
      </div>

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

      <div>
        <div style="font-size: 12px; font-weight: 800; color: var(--text-primary); margin-bottom: 8px;">
          Supporting Cluster Complaints (${supporting.length})
        </div>
        ${supporting.length === 0 ? `
          <div style="font-size: 12px; color: var(--text-muted);">No ticket excerpts preloaded.</div>
        ` : supporting.map(c => `
          <div style="background: var(--bg-card2); border: 1px solid var(--border); border-radius: 6px; padding: 10px 12px; margin-bottom: 8px; cursor: pointer;" onclick="openIncidentDrawer('${c.id}')">
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
}

// Attach drawer close events on load if elements are present
document.addEventListener('DOMContentLoaded', () => {
  const drawerClose = document.getElementById('drawer-close');
  const drawerOverlay = document.getElementById('drawer-overlay');
  if (drawerClose) drawerClose.onclick = closeIncidentDrawer;
  if (drawerOverlay) drawerOverlay.onclick = closeIncidentDrawer;

  const evidenceClose = document.getElementById('evidence-close');
  const evidenceOverlay = document.getElementById('evidence-overlay');
  if (evidenceClose) evidenceClose.onclick = closeEvidencePanel;
  if (evidenceOverlay) evidenceOverlay.onclick = closeEvidencePanel;
});

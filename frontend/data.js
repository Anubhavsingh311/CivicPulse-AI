// ══════════════════════════════════════════════════════════════
//  CivicPulse — Data (converted from mockData.ts)
// ══════════════════════════════════════════════════════════════

const trendData = [
  { date: 'Sep 1',  total: 312, baseline: 290, current: 312 },
  { date: 'Sep 2',  total: 298, baseline: 290, current: 298 },
  { date: 'Sep 3',  total: 341, baseline: 292, current: 341 },
  { date: 'Sep 4',  total: 289, baseline: 288, current: 289 },
  { date: 'Sep 5',  total: 302, baseline: 291, current: 302 },
  { date: 'Sep 6',  total: 318, baseline: 290, current: 318 },
  { date: 'Sep 7',  total: 334, baseline: 293, current: 334 },
  { date: 'Sep 8',  total: 279, baseline: 289, current: 279 },
  { date: 'Sep 9',  total: 356, baseline: 292, current: 356 },
  { date: 'Sep 10', total: 328, baseline: 291, current: 328 },
  { date: 'Sep 11', total: 367, baseline: 293, current: 367 },
  { date: 'Sep 12', total: 445, baseline: 291, current: 445 },
  { date: 'Sep 13', total: 389, baseline: 292, current: 389 },
  { date: 'Sep 14', total: 412, baseline: 293, current: 412 },
  { date: 'Sep 15', total: 521, baseline: 291, current: 521 },
  { date: 'Sep 16', total: 487, baseline: 292, current: 487 },
  { date: 'Sep 17', total: 634, baseline: 290, current: 634 },
  { date: 'Sep 18', total: 712, baseline: 292, current: 712 },
];

const categoryData = [
  { category: 'Water Supply',         count: 2847, pct: 22.8 },
  { category: 'Roads & Potholes',     count: 2134, pct: 17.1 },
  { category: 'Garbage / Sanitation', count: 1923, pct: 15.4 },
  { category: 'Electricity',          count: 1456, pct: 11.7 },
  { category: 'Street Lights',        count: 987,  pct: 7.9  },
  { category: 'Traffic',              count: 834,  pct: 6.7  },
  { category: 'Drainage',             count: 756,  pct: 6.1  },
  { category: 'Public Safety',        count: 634,  pct: 5.1  },
  { category: 'Parks / Public Spaces',count: 489,  pct: 3.9  },
  { category: 'Other',                count: 422,  pct: 3.4  },
];

const complaints = [
  // Today — 18 Sep 2026
  { id: '#1023', text: 'No water supply since morning in our building', category: 'Water Supply', location: 'Sector 12', date: 'Sep 18', fullDate: '18 Sep 2026', timestamp: '09:32 AM', status: 'Open', cluster: 'Cluster #31', activity: 'Critical' },
  { id: '#1024', text: 'Large pothole on main road near Government School', category: 'Roads & Potholes', location: 'Sector 4', date: 'Sep 18', fullDate: '18 Sep 2026', timestamp: '10:15 AM', status: 'Open', cluster: 'Cluster #18', activity: 'Medium' },
  { id: '#1025', text: 'Garbage has not been collected for four days', category: 'Garbage / Sanitation', location: 'Ward 7', date: 'Sep 18', fullDate: '18 Sep 2026', timestamp: '11:10 AM', status: 'Resolved', cluster: 'Cluster #22', activity: 'High' },
  { id: '#1026', text: 'Street light not working near park entrance', category: 'Street Lights', location: 'Sector 8', date: 'Sep 18', fullDate: '18 Sep 2026', timestamp: '11:45 AM', status: 'In Progress', cluster: null, activity: 'Low' },
  { id: '#1027', text: 'Water supply stopped in my house since yesterday', category: 'Water Supply', location: 'Sector 12', date: 'Sep 18', fullDate: '18 Sep 2026', timestamp: '12:03 PM', status: 'Open', cluster: 'Cluster #31', activity: 'Critical' },
  { id: '#1028', text: 'Heavy traffic congestion near metro station', category: 'Traffic', location: 'Ward 3', date: 'Sep 18', fullDate: '18 Sep 2026', timestamp: '12:34 PM', status: 'Open', cluster: null, activity: 'Medium' },
  { id: '#1029', text: 'There is no water coming from the pipeline', category: 'Water Supply', location: 'Sector 12', date: 'Sep 18', fullDate: '18 Sep 2026', timestamp: '01:02 PM', status: 'Open', cluster: 'Cluster #31', activity: 'Critical' },
  { id: '#1030', text: 'Our colony has had no water since morning', category: 'Water Supply', location: 'Sector 12', date: 'Sep 18', fullDate: '18 Sep 2026', timestamp: '01:18 PM', status: 'Open', cluster: 'Cluster #31', activity: 'Critical' },
  { id: '#1031', text: 'Electricity outage in block C since last night', category: 'Electricity', location: 'Ward 9', date: 'Sep 18', fullDate: '18 Sep 2026', timestamp: '01:45 PM', status: 'Escalated', cluster: 'Cluster #14', activity: 'High' },
  { id: '#1032', text: 'Open drain near school causing health hazard', category: 'Drainage', location: 'Sector 6', date: 'Sep 18', fullDate: '18 Sep 2026', timestamp: '02:10 PM', status: 'Open', cluster: null, activity: 'Medium' },
  { id: '#1033', text: 'Garbage dumped near residential area again', category: 'Garbage / Sanitation', location: 'Ward 7', date: 'Sep 18', fullDate: '18 Sep 2026', timestamp: '02:41 PM', status: 'Open', cluster: 'Cluster #22', activity: 'High' },
  { id: '#1034', text: 'Road damage after heavy rains not repaired', category: 'Roads & Potholes', location: 'Sector 4', date: 'Sep 18', fullDate: '18 Sep 2026', timestamp: '03:05 PM', status: 'In Progress', cluster: 'Cluster #18', activity: 'Medium' },
  { id: '#1035', text: 'Water tap has no pressure at all', category: 'Water Supply', location: 'Sector 12', date: 'Sep 18', fullDate: '18 Sep 2026', timestamp: '03:22 PM', status: 'Open', cluster: 'Cluster #31', activity: 'Critical' },
  { id: '#1036', text: 'Park benches broken and not replaced', category: 'Parks / Public Spaces', location: 'Sector 15', date: 'Sep 18', fullDate: '18 Sep 2026', timestamp: '03:58 PM', status: 'Open', cluster: null, activity: 'Low' },
  { id: '#1037', text: 'Suspicious activity near community hall at night', category: 'Public Safety', location: 'Ward 2', date: 'Sep 18', fullDate: '18 Sep 2026', timestamp: '04:12 PM', status: 'Escalated', cluster: null, activity: 'High' },

  // Sep 17 Incidents
  { id: '#1015', text: 'Main pipeline burst near Sector 12 community park', category: 'Water Supply', location: 'Sector 12', date: 'Sep 17', fullDate: '17 Sep 2026', timestamp: '08:14 AM', status: 'Open', cluster: 'Cluster #31', activity: 'Critical' },
  { id: '#1016', text: 'Accumulated waste bins overflowing onto footpath', category: 'Garbage / Sanitation', location: 'Ward 7', date: 'Sep 17', fullDate: '17 Sep 2026', timestamp: '10:40 AM', status: 'In Progress', cluster: 'Cluster #22', activity: 'High' },
  { id: '#1017', text: 'Deep crater on main sector road after rain', category: 'Roads & Potholes', location: 'Sector 4', date: 'Sep 17', fullDate: '17 Sep 2026', timestamp: '01:25 PM', status: 'Open', cluster: 'Cluster #18', activity: 'High' },
  { id: '#1018', text: 'Transformer sparking intermittently on pole 14', category: 'Electricity', location: 'Ward 9', date: 'Sep 17', fullDate: '17 Sep 2026', timestamp: '03:50 PM', status: 'Resolved', cluster: 'Cluster #14', activity: 'High' },
  { id: '#1019', text: 'Flooding in residential basement due to clogged storm drain', category: 'Drainage', location: 'Sector 6', date: 'Sep 17', fullDate: '17 Sep 2026', timestamp: '06:12 PM', status: 'Escalated', cluster: null, activity: 'Critical' },

  // Sep 16 Incidents
  { id: '#1008', text: 'Brown and muddy tap water supply in Sector 12 block B', category: 'Water Supply', location: 'Sector 12', date: 'Sep 16', fullDate: '16 Sep 2026', timestamp: '09:05 AM', status: 'Resolved', cluster: 'Cluster #31', activity: 'High' },
  { id: '#1009', text: 'Garbage truck did not arrive for scheduled Tuesday route', category: 'Garbage / Sanitation', location: 'Ward 7', date: 'Sep 16', fullDate: '16 Sep 2026', timestamp: '11:30 AM', status: 'Resolved', cluster: 'Cluster #22', activity: 'Medium' },
  { id: '#1010', text: 'Multiple street lights dead along ring road curve', category: 'Street Lights', location: 'Sector 8', date: 'Sep 16', fullDate: '16 Sep 2026', timestamp: '07:22 PM', status: 'Resolved', cluster: null, activity: 'Low' },
  { id: '#1011', text: 'Severe pothole damaged vehicle axle near school junction', category: 'Roads & Potholes', location: 'Sector 4', date: 'Sep 16', fullDate: '16 Sep 2026', timestamp: '08:45 PM', status: 'In Progress', cluster: 'Cluster #18', activity: 'High' },

  // Sep 15 Incidents
  { id: '#0995', text: 'Low pressure water across all 4th floor apartments', category: 'Water Supply', location: 'Sector 12', date: 'Sep 15', fullDate: '15 Sep 2026', timestamp: '07:15 AM', status: 'Resolved', cluster: 'Cluster #31', activity: 'High' },
  { id: '#0996', text: 'Sanitation workers dumping mixed waste near vacant plot', category: 'Garbage / Sanitation', location: 'Ward 7', date: 'Sep 15', fullDate: '15 Sep 2026', timestamp: '09:40 AM', status: 'Resolved', cluster: 'Cluster #22', activity: 'Medium' },
  { id: '#0997', text: 'Power fluctuation damaging household appliances', category: 'Electricity', location: 'Ward 9', date: 'Sep 15', fullDate: '15 Sep 2026', timestamp: '02:18 PM', status: 'Resolved', cluster: 'Cluster #14', activity: 'High' },

  // Sep 14 Incidents
  { id: '#0982', text: 'Water pipeline whistling and vibrating severely', category: 'Water Supply', location: 'Sector 12', date: 'Sep 14', fullDate: '14 Sep 2026', timestamp: '10:10 AM', status: 'Resolved', cluster: 'Cluster #31', activity: 'Medium' },
  { id: '#0983', text: 'Road asphalt peeling away following thunderstorm', category: 'Roads & Potholes', location: 'Sector 4', date: 'Sep 14', fullDate: '14 Sep 2026', timestamp: '04:30 PM', status: 'Resolved', cluster: 'Cluster #18', activity: 'Medium' },

  // Sep 13 Incidents
  { id: '#0971', text: 'Street light pole leaning dangerously over footpath', category: 'Street Lights', location: 'Sector 8', date: 'Sep 13', fullDate: '13 Sep 2026', timestamp: '08:20 AM', status: 'Resolved', cluster: null, activity: 'Medium' },
  { id: '#0972', text: 'Water tanker supply delayed by over 4 hours in block B', category: 'Water Supply', location: 'Sector 12', date: 'Sep 13', fullDate: '13 Sep 2026', timestamp: '11:45 AM', status: 'Resolved', cluster: 'Cluster #31', activity: 'Medium' },
  { id: '#0973', text: 'Open stormwater drain clogged with tree branches', category: 'Drainage', location: 'Sector 6', date: 'Sep 13', fullDate: '13 Sep 2026', timestamp: '03:15 PM', status: 'Resolved', cluster: null, activity: 'High' },

  // Sep 12 Incidents
  { id: '#0960', text: 'Significant pipeline joint leak flooding service lane', category: 'Water Supply', location: 'Sector 12', date: 'Sep 12', fullDate: '12 Sep 2026', timestamp: '09:10 AM', status: 'Resolved', cluster: 'Cluster #31', activity: 'High' },
  { id: '#0961', text: 'Multiple power surges blew apartment building elevator fuse', category: 'Electricity', location: 'Ward 9', date: 'Sep 12', fullDate: '12 Sep 2026', timestamp: '01:30 PM', status: 'Resolved', cluster: 'Cluster #14', activity: 'Critical' },
  { id: '#0962', text: 'Road cave-in near storm drain construction site', category: 'Roads & Potholes', location: 'Sector 4', date: 'Sep 12', fullDate: '12 Sep 2026', timestamp: '05:00 PM', status: 'Resolved', cluster: 'Cluster #18', activity: 'High' },

  // Sep 11 Incidents
  { id: '#0948', text: 'Garbage dump uncleaned for 3 days attracting stray animals', category: 'Garbage / Sanitation', location: 'Ward 7', date: 'Sep 11', fullDate: '11 Sep 2026', timestamp: '08:50 AM', status: 'Resolved', cluster: 'Cluster #22', activity: 'Medium' },
  { id: '#0949', text: 'Traffic signals dysfunctional during peak school hours', category: 'Traffic', location: 'Ward 3', date: 'Sep 11', fullDate: '11 Sep 2026', timestamp: '12:15 PM', status: 'Resolved', cluster: null, activity: 'High' },
  { id: '#0950', text: 'Sewage overflow on main market pedestrian walkway', category: 'Drainage', location: 'Sector 6', date: 'Sep 11', fullDate: '11 Sep 2026', timestamp: '04:40 PM', status: 'Resolved', cluster: null, activity: 'High' },

  // Sep 10 Incidents
  { id: '#0935', text: 'Persistent low voltage causing water motor failure', category: 'Electricity', location: 'Ward 9', date: 'Sep 10', fullDate: '10 Sep 2026', timestamp: '07:30 AM', status: 'Resolved', cluster: 'Cluster #14', activity: 'Medium' },
  { id: '#0936', text: 'Broken pavement tiles causing pedestrian tripping accidents', category: 'Roads & Potholes', location: 'Sector 4', date: 'Sep 10', fullDate: '10 Sep 2026', timestamp: '11:10 AM', status: 'Resolved', cluster: 'Cluster #18', activity: 'Low' },
  { id: '#0937', text: 'Park pathway overgrown with thorny weeds', category: 'Parks / Public Spaces', location: 'Sector 15', date: 'Sep 10', fullDate: '10 Sep 2026', timestamp: '03:20 PM', status: 'Resolved', cluster: null, activity: 'Low' },

  // Sep 9 Incidents
  { id: '#0922', text: 'Main drain desilting required before monsoon revival', category: 'Drainage', location: 'Sector 6', date: 'Sep 9', fullDate: '09 Sep 2026', timestamp: '09:00 AM', status: 'Resolved', cluster: null, activity: 'Medium' },
  { id: '#0923', text: 'Water pipeline valve producing loud knocking sound', category: 'Water Supply', location: 'Sector 12', date: 'Sep 9', fullDate: '09 Sep 2026', timestamp: '01:50 PM', status: 'Resolved', cluster: 'Cluster #31', activity: 'Medium' },

  // Sep 8 Incidents
  { id: '#0910', text: 'Four street lights dark along Sector 8 primary corridor', category: 'Street Lights', location: 'Sector 8', date: 'Sep 8', fullDate: '08 Sep 2026', timestamp: '08:15 PM', status: 'Resolved', cluster: null, activity: 'Low' },
  { id: '#0911', text: 'Sanitation vehicle missed secondary residential alleyways', category: 'Garbage / Sanitation', location: 'Ward 7', date: 'Sep 8', fullDate: '08 Sep 2026', timestamp: '10:30 AM', status: 'Resolved', cluster: 'Cluster #22', activity: 'Medium' },

  // Sep 7 Incidents
  { id: '#0898', text: 'Water supply contaminated with yellowish sediment', category: 'Water Supply', location: 'Sector 12', date: 'Sep 7', fullDate: '07 Sep 2026', timestamp: '07:45 AM', status: 'Resolved', cluster: 'Cluster #31', activity: 'High' },
  { id: '#0899', text: 'Speed breaker unpainted and invisible at night', category: 'Traffic', location: 'Ward 3', date: 'Sep 7', fullDate: '07 Sep 2026', timestamp: '06:30 PM', status: 'Resolved', cluster: null, activity: 'Medium' },

  // Sep 6 Incidents
  { id: '#0885', text: 'Underground feeder cable tripped entire sector sub-station', category: 'Electricity', location: 'Ward 9', date: 'Sep 6', fullDate: '06 Sep 2026', timestamp: '02:15 AM', status: 'Resolved', cluster: 'Cluster #14', activity: 'High' },
  { id: '#0886', text: 'Pothole cluster widening outside community health center', category: 'Roads & Potholes', location: 'Sector 4', date: 'Sep 6', fullDate: '06 Sep 2026', timestamp: '11:00 AM', status: 'Resolved', cluster: 'Cluster #18', activity: 'Medium' },

  // Sep 5 Incidents
  { id: '#0872', text: 'Water pressure drop across higher floors in block A', category: 'Water Supply', location: 'Sector 12', date: 'Sep 5', fullDate: '05 Sep 2026', timestamp: '08:30 AM', status: 'Resolved', cluster: 'Cluster #31', activity: 'Medium' },
  { id: '#0873', text: 'Overflowing garbage bin spilling into rainwater gutter', category: 'Garbage / Sanitation', location: 'Ward 7', date: 'Sep 5', fullDate: '05 Sep 2026', timestamp: '01:10 PM', status: 'Resolved', cluster: 'Cluster #22', activity: 'Medium' },

  // Sep 4 Incidents
  { id: '#0860', text: 'Street light flashing continuously like strobe', category: 'Street Lights', location: 'Sector 8', date: 'Sep 4', fullDate: '04 Sep 2026', timestamp: '07:50 PM', status: 'Resolved', cluster: null, activity: 'Low' },
  { id: '#0861', text: 'Uncovered sewer inspection hole on sidewalk', category: 'Drainage', location: 'Sector 6', date: 'Sep 4', fullDate: '04 Sep 2026', timestamp: '10:15 AM', status: 'Resolved', cluster: null, activity: 'Critical' },

  // Sep 3 Incidents
  { id: '#0848', text: 'Slight odor in municipal drinking water line', category: 'Water Supply', location: 'Sector 12', date: 'Sep 3', fullDate: '03 Sep 2026', timestamp: '09:05 AM', status: 'Resolved', cluster: 'Cluster #31', activity: 'Medium' },
  { id: '#0849', text: 'Asphalt erosion after heavy monsoon drizzle', category: 'Roads & Potholes', location: 'Sector 4', date: 'Sep 3', fullDate: '03 Sep 2026', timestamp: '02:40 PM', status: 'Resolved', cluster: 'Cluster #18', activity: 'Low' },

  // Sep 2 Incidents
  { id: '#0835', text: 'Transformer oil leakage reported near distribution box', category: 'Electricity', location: 'Ward 9', date: 'Sep 2', fullDate: '02 Sep 2026', timestamp: '11:20 AM', status: 'Resolved', cluster: 'Cluster #14', activity: 'High' },
  { id: '#0836', text: 'Park fence damaged allowing stray cattle ingress', category: 'Parks / Public Spaces', location: 'Sector 15', date: 'Sep 2', fullDate: '02 Sep 2026', timestamp: '04:15 PM', status: 'Resolved', cluster: null, activity: 'Low' },

  // Sep 1 Incidents
  { id: '#0820', text: 'Water line pressure test showed sub-normal reading', category: 'Water Supply', location: 'Sector 12', date: 'Sep 1', fullDate: '01 Sep 2026', timestamp: '08:40 AM', status: 'Resolved', cluster: 'Cluster #31', activity: 'Medium' },
  { id: '#0821', text: 'Commercial waste dumped along ring road divider', category: 'Garbage / Sanitation', location: 'Ward 7', date: 'Sep 1', fullDate: '01 Sep 2026', timestamp: '01:00 PM', status: 'Resolved', cluster: 'Cluster #22', activity: 'Medium' },
];

const emergingIssues = [
  {
    id: 'EI-001', category: 'Water Supply', location: 'Sector 12',
    complaints: 46, baseline: 9, increasePercent: 411,
    similarComplaints: 31, timeConcentration: '08:30–14:00',
    detectedAt: '09:47 AM', activity: 'Critical', status: 'Emerging',
    supportingComplaints: complaints.filter(c => c.cluster === 'Cluster #31'),
  },
  {
    id: 'EI-002', category: 'Garbage / Sanitation', location: 'Ward 7',
    complaints: 27, baseline: 11, increasePercent: 145,
    similarComplaints: 18, timeConcentration: '07:00–13:00',
    detectedAt: '10:15 AM', activity: 'High', status: 'Active',
    supportingComplaints: complaints.filter(c => c.cluster === 'Cluster #22'),
  },
  {
    id: 'EI-003', category: 'Roads & Potholes', location: 'Sector 4',
    complaints: 19, baseline: 8, increasePercent: 138,
    similarComplaints: 14, timeConcentration: '06:00–12:00',
    detectedAt: '11:02 AM', activity: 'High', status: 'Monitoring',
    supportingComplaints: complaints.filter(c => c.cluster === 'Cluster #18'),
  },
  {
    id: 'EI-004', category: 'Electricity', location: 'Ward 9',
    complaints: 14, baseline: 5, increasePercent: 180,
    similarComplaints: 11, timeConcentration: '00:00–06:00',
    detectedAt: '02:33 AM', activity: 'High', status: 'Active',
    supportingComplaints: complaints.filter(c => c.cluster === 'Cluster #14'),
  },
];

const mapLocations = [
  { id: 'sector-12', name: 'Sector 12', x: 62, y: 38, complaints: 46, category: 'Water Supply',         activity: 'Critical', baseline: 9  },
  { id: 'ward-7',    name: 'Ward 7',    x: 34, y: 58, complaints: 27, category: 'Garbage / Sanitation', activity: 'High',     baseline: 11 },
  { id: 'sector-4',  name: 'Sector 4',  x: 48, y: 72, complaints: 19, category: 'Roads & Potholes',     activity: 'High',     baseline: 8  },
  { id: 'ward-9',    name: 'Ward 9',    x: 78, y: 55, complaints: 14, category: 'Electricity',          activity: 'High',     baseline: 5  },
  { id: 'sector-8',  name: 'Sector 8',  x: 25, y: 35, complaints: 7,  category: 'Street Lights',        activity: 'Medium',   baseline: 6  },
  { id: 'ward-3',    name: 'Ward 3',    x: 55, y: 20, complaints: 5,  category: 'Traffic',              activity: 'Low',      baseline: 7  },
  { id: 'sector-15', name: 'Sector 15', x: 82, y: 22, complaints: 3,  category: 'Parks / Public Spaces',activity: 'Low',      baseline: 4  },
  { id: 'sector-6',  name: 'Sector 6',  x: 18, y: 72, complaints: 8,  category: 'Drainage',            activity: 'Medium',   baseline: 5  },
];

const CATEGORIES = [
  'Roads & footpaths','Water supply','Waste collection','Street lighting',
  'Public safety','Parks & public spaces','Drainage & flooding','Noise or nuisance','Other'
];

const CATEGORY_COLORS = [
  '#35594E','#3D6658','#4F7568','#5F866D','#6F8F7A',
  '#8BA898','#A4BCAD','#BCCEBD','#D0DED2','#8A918D'
];

// ── Users (stored in memory; use localStorage for persistence) ──
function getUsers() {
  const stored = localStorage.getItem('civicpulse_users');
  if (stored) return JSON.parse(stored);
  const defaults = [
    { email: 'user@civic.com',  password: 'user123',  role: 'user',  name: 'Resident User',  initials: 'RU', ward: 'Sector 12' },
    { email: 'admin@civic.com', password: 'admin123', role: 'admin', name: 'Amit Singh',     initials: 'AS', ward: '' },
  ];
  localStorage.setItem('civicpulse_users', JSON.stringify(defaults));
  return defaults;
}
function saveUsers(users) {
  localStorage.setItem('civicpulse_users', JSON.stringify(users));
}

// ── APP.JS ── THE LEDGER INTERACTIVE CONTROLLER

// 1. App State
let db = [];
let currentDivision = 'all';
let selectedDossierId = null;
let searchQuery = "";
let network = null; // Vis.js network instance
let map = null;     // Leaflet map instance
let mapMarkers = {}; // Cache of plotted markers
let currentCenterView = 'web'; // 'web' or 'map'
let currentMode = 'folders'; // 'folders', 'timeline', or 'papers'
let openFolders = {}; // Collapsed/expanded sub-subjects or years

// Progression State
let userXP = 0;
let userRank = "Field Informant";
let cardStates = {}; // Maps dossier ID to 'secured', 'compromised', or 'unvetted'

// Drill State
let drillQueue = [];
let currentDrillIndex = 0;
let selectedOption = null;

// 2. Initialize App
window.onload = function() {
  // Load database from db.js
  db = typeof ledgerDatabase !== 'undefined' ? ledgerDatabase : [];
  
  // Load progression from localStorage
  loadProgression();
  
  // Render Left List & Info Briefing
  renderDossierList();
  updateProgressUI();
  
  // Render Network Graph
  renderNetworkGraph();
  
  // Auto-select first card as default view
  if (db.length > 0) {
    selectDossier(db[0].id);
  }
};

// 3. Load & Save Progression
function loadProgression() {
  userXP = parseInt(localStorage.getItem('ledger_xp')) || 0;
  
  try {
    const savedStates = localStorage.getItem('ledger_card_states');
    cardStates = savedStates ? JSON.parse(savedStates) : {};
  } catch (e) {
    cardStates = {};
  }
  
  // Initialize missing card states to 'unvetted'
  db.forEach(card => {
    if (!cardStates[card.id]) {
      cardStates[card.id] = 'unvetted';
    }
  });
  
  calculateRank();
}

function saveProgression() {
  localStorage.setItem('ledger_xp', userXP);
  localStorage.setItem('ledger_card_states', JSON.stringify(cardStates));
  updateProgressUI();
}

function calculateRank() {
  if (userXP >= 10000) userRank = "The Director";
  else if (userXP >= 5000) userRank = "Assistant Director";
  else if (userXP >= 1500) userRank = "Station Chief";
  else if (userXP >= 500) userRank = "Special Agent";
  else userRank = "Field Informant";
}

function updateProgressUI() {
  document.getElementById('user-xp').innerText = String(userXP).padStart(4, '0');
  document.getElementById('user-rank').innerText = userRank;
  
  // Calculate integrity
  const total = db.length;
  if (total === 0) return;
  
  const securedCount = Object.values(cardStates).filter(s => s === 'secured').length;
  const integrityPercent = Math.round((securedCount / total) * 100);
  
  document.getElementById('integrity-bar').style.width = `${integrityPercent}%`;
  document.getElementById('integrity-val').innerText = `${integrityPercent}%`;
}

// Helper to extract year from dossier details
function extractYear(dossier) {
  const idParts = dossier.id.split('-');
  const lastPart = idParts[idParts.length - 1];
  if (lastPart.match(/^\d+$/) && lastPart.length === 4) {
    return lastPart;
  }
  const ahYear = dossier.connections.find(c => c.includes('A.H.'));
  if (ahYear) return ahYear;
  
  const yearMatch = dossier.question.match(/\b\d{4}\b/);
  if (yearMatch) return yearMatch[0];
  
  return "General";
}

// Helper to sort years chronologically (Islamic A.H. years first, then Gregorian)
function sortYears(a, b) {
  if (a === "General") return 1;
  if (b === "General") return -1;
  
  const isAH_a = a.includes("A.H.");
  const isAH_b = b.includes("A.H.");
  
  if (isAH_a && !isAH_b) return -1;
  if (!isAH_a && isAH_b) return 1;
  
  const numA = parseInt(a);
  const numB = parseInt(b);
  return numA - numB;
}

// 4. Render Dossier List (Left Panel with Folders and Timeline Modes)
function renderDossierList() {
  const container = document.getElementById('dossier-list');
  container.innerHTML = "";
  
  const filtered = filterDatabase();
  
  if (filtered.length === 0) {
    container.innerHTML = `<div class="empty-state-small" style="text-align:center; padding: 20px; color: var(--text-muted); font-size: 12px;">No dossiers found matching query.</div>`;
    return;
  }
  
  if (currentMode === 'folders') {
    // Group by sub_subject (thematic folders)
    const groups = {};
    filtered.forEach(dossier => {
      const folder = dossier.sub_subject || "General";
      if (!groups[folder]) groups[folder] = [];
      groups[folder].push(dossier);
    });
    
    Object.keys(groups).sort().forEach(folderId => {
      const items = groups[folderId];
      const isOpen = !!openFolders[folderId];
      
      const folderWrap = document.createElement('div');
      folderWrap.className = `folder-wrap ${isOpen ? 'open' : ''}`;
      
      const folderHeader = document.createElement('div');
      folderHeader.className = 'folder-header';
      folderHeader.onclick = (e) => {
        openFolders[folderId] = !openFolders[folderId];
        renderDossierList();
        selectSector(folderId);
      };
      
      folderHeader.innerHTML = `
        <div class="folder-header-title">
          <span class="folder-arrow">${isOpen ? '▼' : '▶'}</span>
          <span>📁 ${folderId.toUpperCase()}</span>
        </div>
        <span class="tag-badge" style="font-size: 9px; background-color: var(--border);">${items.length} FILES</span>
      `;
      
      const folderContent = document.createElement('div');
      folderContent.className = 'folder-content';
      
      // Sort items inside folder chronologically if history, otherwise alphabetically
      items.sort((a, b) => {
        const yrA = extractYear(a);
        const yrB = extractYear(b);
        if (yrA !== "General" && yrB !== "General") {
          return sortYears(yrA, yrB);
        }
        return a.dossier_name.localeCompare(b.dossier_name);
      });
      
      items.forEach(dossier => {
        folderContent.appendChild(createDossierCardHTML(dossier));
      });
      
      folderWrap.appendChild(folderHeader);
      folderWrap.appendChild(folderContent);
      container.appendChild(folderWrap);
    });
    
  } else if (currentMode === 'timeline') {
    // Group by year (Timeline Mode)
    const groups = {};
    filtered.forEach(dossier => {
      const yr = extractYear(dossier);
      if (!groups[yr]) groups[yr] = [];
      groups[yr].push(dossier);
    });
    
    const sortedTimelineYears = Object.keys(groups).sort(sortYears);
    
    const timelineTrack = document.createElement('div');
    timelineTrack.className = 'timeline-track-wrap';
    
    sortedTimelineYears.forEach(yearId => {
      const items = groups[yearId];
      const isOpen = !!openFolders[yearId];
      
      const yearGroup = document.createElement('div');
      yearGroup.className = `timeline-year-group ${isOpen ? 'open' : ''}`;
      
      const marker = document.createElement('div');
      marker.className = 'timeline-node-marker';
      
      const yearHeader = document.createElement('div');
      yearHeader.className = 'timeline-year-header';
      yearHeader.onclick = () => {
        openFolders[yearId] = !openFolders[yearId];
        renderDossierList();
        selectTimeCapsule(yearId);
      };
      yearHeader.innerText = yearId;
      
      const cardsContainer = document.createElement('div');
      cardsContainer.className = 'timeline-cards';
      
      items.forEach(dossier => {
        cardsContainer.appendChild(createDossierCardHTML(dossier));
      });
      
      yearGroup.appendChild(marker);
      yearGroup.appendChild(yearHeader);
      yearGroup.appendChild(cardsContainer);
      timelineTrack.appendChild(yearGroup);
    });
    
    container.appendChild(timelineTrack);
  } else if (currentMode === 'papers') {
    // Group by past_paper (collapsible past papers)
    const groups = {};
    filtered.forEach(dossier => {
      const paper = dossier.past_paper || "General Knowledge Prep";
      if (!groups[paper]) groups[paper] = [];
      groups[paper].push(dossier);
    });
    
    // Sort papers alphabetically (latest years first)
    Object.keys(groups).sort((a, b) => b.localeCompare(a)).forEach(paperId => {
      const items = groups[paperId];
      const isOpen = !!openFolders[paperId];
      
      const folderWrap = document.createElement('div');
      folderWrap.className = `folder-wrap ${isOpen ? 'open' : ''}`;
      
      const folderHeader = document.createElement('div');
      folderHeader.className = 'folder-header';
      folderHeader.style.borderColor = 'var(--color-accent)';
      folderHeader.onclick = (e) => {
        openFolders[paperId] = !openFolders[paperId];
        renderDossierList();
        selectPastPaper(paperId);
      };
      
      folderHeader.innerHTML = `
        <div class="folder-header-title">
          <span class="folder-arrow">${isOpen ? '▼' : '▶'}</span>
          <span style="color: var(--color-accent);">📄 ${paperId.toUpperCase()}</span>
        </div>
        <span class="tag-badge" style="font-size: 9px; background-color: var(--border);">${items.length} MCQs</span>
      `;
      
      const folderContent = document.createElement('div');
      folderContent.className = 'folder-content';
      
      items.forEach(dossier => {
        folderContent.appendChild(createDossierCardHTML(dossier));
      });
      
      folderWrap.appendChild(folderHeader);
      folderWrap.appendChild(folderContent);
      container.appendChild(folderWrap);
    });
  }
  
  // Update Tactical Map markers dynamically if initialized
  if (map) {
    plotMapMarkers();
  }
}

// Helper to generate a single dossier card element
function createDossierCardHTML(dossier) {
  const state = cardStates[dossier.id] || 'unvetted';
  
  let shieldIcon = '🛡️';
  if (state === 'secured') shieldIcon = '🟢';
  else if (state === 'compromised') shieldIcon = '🔴';
  else shieldIcon = '⚪';
  
  const isActive = dossier.id === selectedDossierId ? 'active' : '';
  
  const card = document.createElement('div');
  card.className = `dossier-card ${isActive}`;
  card.onclick = (e) => {
    e.stopPropagation();
    selectDossier(dossier.id);
  };
  
  const yr = extractYear(dossier);
  const yearTag = yr !== "General" ? `<span class="tag-badge" style="color: var(--color-success); border-color: var(--color-success); margin-left: 6px; font-size: 9px;">${yr}</span>` : '';
  
  card.innerHTML = `
    <div class="card-meta">
      <div style="display: flex; align-items: center;">
        <span class="card-code">${dossier.id}</span>
        ${yearTag}
      </div>
      <span class="card-name">${dossier.dossier_name}</span>
      <span class="card-subject">${dossier.subject} &mdash; ${dossier.sub_subject}</span>
    </div>
    <div class="security-indicator ${state}" title="Security status: ${state}">
      ${shieldIcon}
    </div>
  `;
  return card;
}

function filterDatabase() {
  return db.filter(dossier => {
    // Division filter
    const matchesDiv = currentDivision === 'all' || dossier.division === currentDivision;
    
    // Keyword search
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesDiv;
    
    const matchesKeyword = 
      dossier.dossier_name.toLowerCase().includes(query) ||
      dossier.id.toLowerCase().includes(query) ||
      dossier.question.toLowerCase().includes(query) ||
      dossier.verified_answer.toLowerCase().includes(query) ||
      dossier.subject.toLowerCase().includes(query) ||
      dossier.connections.some(c => c.toLowerCase().includes(query));
      
    return matchesDiv && matchesKeyword;
  });
}

// 5. Sourcing Filters & Search triggers
function switchDivision(divisionName) {
  currentDivision = divisionName;
  
  // Toggle tab buttons active class
  const buttons = document.querySelectorAll('.division-tabs .tab-btn');
  buttons.forEach(btn => {
    const text = btn.innerText.toUpperCase();
    if (divisionName === 'all' && text === 'ALL') btn.classList.add('active');
    else if (divisionName === 'The Archive' && text === 'ARCHIVE') btn.classList.add('active');
    else if (divisionName === 'Cartography' && text === 'MAPS') btn.classList.add('active');
    else if (divisionName === 'Surveillance' && text === 'SURVEILLANCE') btn.classList.add('active');
    else if (divisionName === 'The Laboratory' && text === 'LAB') btn.classList.add('active');
    else if (divisionName === 'The Codebook' && text === 'CODEBOOK') btn.classList.add('active');
    else if (divisionName === 'The Charter' && text === 'CHARTER') btn.classList.add('active');
    else btn.classList.remove('active');
  });
  
  renderDossierList();
  renderNetworkGraph();
}

function handleSearch() {
  searchQuery = document.getElementById('console-search').value;
  renderDossierList();
  // Do not redraw network map during typing to prevent performance lag, just render list.
}

// 6. Select Dossier (Briefing Rendering)
function selectDossier(id) {
  selectedDossierId = id;
  
  // Mobile responsive auto-focus on details
  if (window.innerWidth <= 900) {
    switchMobilePanel('right');
  }
  
  // Update active class on left cards
  const cards = document.querySelectorAll('.dossier-card');
  cards.forEach(c => c.classList.remove('active'));
  
  // Highlight node in Vis.js graph
  if (network) {
    network.selectNodes([id]);
  }
  
  const dossier = db.find(d => d.id === id);
  if (!dossier) return;
  
  // Auto-pan / fly map to dossier coordinates
  if (map && dossier.coordinates && mapMarkers[id]) {
    map.flyTo(dossier.coordinates, 6, {
      animate: true,
      duration: 1.2
    });
    mapMarkers[id].openTooltip();
  }
  
  // Render details panel
  const panel = document.getElementById('dossier-briefing');
  const state = cardStates[dossier.id] || 'unvetted';
  
  let securityTag = '<span class="tag-badge" style="color: var(--text-muted);">UNVETTED</span>';
  if (state === 'secured') {
    securityTag = '<span class="tag-badge" style="color: var(--color-success); border-color: var(--color-success);">SECURED</span>';
  } else if (state === 'compromised') {
    securityTag = '<span class="tag-badge" style="color: var(--color-danger); border-color: var(--color-danger); animation: blink-soft 2s infinite;">COMPROMISED</span>';
  }

  // Draw connections badges
  const connBadges = dossier.connections.map(c => `<span class="tag-badge" onclick="searchConnection('${c}')" style="cursor:pointer; margin-right: 4px; margin-bottom: 4px;">#${c}</span>`).join('');
  
  panel.innerHTML = `
    <div class="dossier-sheet reveal">
      <div class="dossier-sec-header">
        <div>
          <span class="sec-code-stamp">${dossier.id} // ${dossier.division.toUpperCase()}</span>
          <h3 class="sec-dossier-name">${dossier.dossier_name}</h3>
        </div>
        ${securityTag}
      </div>
      
      <div class="detail-block">
        <span class="detail-label">Syllabus Mapping</span>
        <p class="detail-text" style="font-weight: 600; color: var(--color-accent);">${dossier.subject} &mdash; ${dossier.sub_subject}</p>
      </div>
      
      <div class="detail-block">
        <span class="detail-label">Dossier Overview</span>
        <p class="detail-text" style="font-style: italic; color: var(--text-secondary); line-height: 1.5;">${dossier.overview || 'No overview provided.'}</p>
      </div>
      
      <div class="detail-block">
        <span class="detail-label">Verified PPSC Question</span>
        <p class="detail-text" style="font-size: 15px; font-weight: 500; line-height: 1.5;">${dossier.question}</p>
      </div>
      
      <div class="detail-block">
        <span class="detail-label">Verified Answer</span>
        <p class="detail-text" style="font-family: var(--font-mono); font-size: 16px; color: var(--color-success); font-weight: bold; background-color: var(--bg-input); padding: 8px 12px; border-radius: 4px; border: 1px solid var(--border);">${dossier.verified_answer}</p>
      </div>
      
      <div class="detail-block">
        <span class="detail-label">Academic Context</span>
        <p class="detail-text">${dossier.context}</p>
      </div>
      
      <div class="reddington-block">
        <span class="detail-label">Raymond's Intel Briefing</span>
        <p class="reddington-story-text">${dossier.reddington_story}</p>
      </div>
      
      <div class="detail-block" style="margin-top: 24px;">
        <span class="detail-label">Connected Nodes</span>
        <div style="margin-top: 8px; display: flex; flex-wrap: wrap;">
          ${connBadges}
        </div>
      </div>
    </div>
  `;
  
  // Re-sync UI active state
  renderDossierList();
}

function searchConnection(keyword) {
  document.getElementById('console-search').value = keyword;
  searchQuery = keyword;
  renderDossierList();
}

// Mode view switcher
function setMode(mode) {
  currentMode = mode;
  
  // Update toggle buttons active class
  document.getElementById('btn-mode-folders').classList.toggle('active', mode === 'folders');
  document.getElementById('btn-mode-timeline').classList.toggle('active', mode === 'timeline');
  document.getElementById('btn-mode-papers').classList.toggle('active', mode === 'papers');
  
  renderDossierList();
}

// Display high-level Sector Briefing on the right panel
function selectSector(sectorName) {
  const briefing = typeof sectorBriefings !== 'undefined' ? sectorBriefings[sectorName] : null;
  if (!briefing) return;
  
  // Mobile responsive auto-focus on details
  if (window.innerWidth <= 900) {
    switchMobilePanel('right');
  }
  
  selectedDossierId = null;
  
  // Unhighlight active left list cards
  const cards = document.querySelectorAll('.dossier-card');
  cards.forEach(c => c.classList.remove('active'));
  
  if (network) network.selectNodes([]);
  
  const panel = document.getElementById('dossier-briefing');
  const milestonesHTML = briefing.milestones.map(m => `<li>${m}</li>`).join('');
  
  panel.innerHTML = `
    <div class="dossier-sheet reveal">
      <div class="dossier-sec-header">
        <div>
          <span class="sec-code-stamp">THEMATIC SECTOR // BRIEFING</span>
          <h3 class="sec-dossier-name">${briefing.title}</h3>
        </div>
        <span class="tag-badge" style="color: var(--color-accent); border-color: var(--color-accent);">SECTOR BRIEFING</span>
      </div>
      
      <div class="detail-block">
        <span class="detail-label">Sector Overview</span>
        <p class="detail-text" style="font-size: 14px; line-height: 1.6; color: var(--text-secondary);">${briefing.overview}</p>
      </div>
      
      <div class="briefing-meta-grid">
        <div class="briefing-meta-box">
          <span class="detail-label">Primary Operative</span>
          <p class="detail-text" style="font-weight: 600; color: var(--color-success);">${briefing.operative}</p>
        </div>
        <div class="briefing-meta-box">
          <span class="detail-label">Division</span>
          <p class="detail-text" style="font-weight: 600; color: var(--color-accent);">${currentDivision.toUpperCase()}</p>
        </div>
      </div>
      
      <div class="detail-block" style="margin-top: 24px;">
        <span class="detail-label">Key Milestones & Timeline</span>
        <ul style="margin-top: 10px; padding-left: 20px; line-height: 1.8; color: var(--text-primary); font-size: 13.5px;">
          ${milestonesHTML}
        </ul>
      </div>
      
      <div class="reddington-block">
        <span class="detail-label">Raymond's Field Notes</span>
        <p class="reddington-story-text">Ah, this sector is a delicate web, my friend. Sir Syed in the late 19th century laid the bricks, but the house was built by young firebrands in the 20s. In our business, you must study the foundation of an operation before you look at the field agents. Know the sector, and the dossiers will read like child's play.</p>
      </div>
    </div>
  `;
}

// Display high-level Time Capsule Briefing on the right panel
function selectTimeCapsule(yearName) {
  const briefing = typeof timeCapsuleBriefings !== 'undefined' ? timeCapsuleBriefings[yearName] : null;
  if (!briefing) return;
  
  // Mobile responsive auto-focus on details
  if (window.innerWidth <= 900) {
    switchMobilePanel('right');
  }
  
  selectedDossierId = null;
  
  const cards = document.querySelectorAll('.dossier-card');
  cards.forEach(c => c.classList.remove('active'));
  
  if (network) network.selectNodes([]);
  
  const panel = document.getElementById('dossier-briefing');
  
  panel.innerHTML = `
    <div class="dossier-sheet reveal">
      <div class="dossier-sec-header">
        <div>
          <span class="sec-code-stamp">CHRONOLOGICAL NODE // TIMELINE</span>
          <h3 class="sec-dossier-name">Year Capsule: ${yearName}</h3>
        </div>
        <span class="tag-badge" style="color: var(--color-success); border-color: var(--color-success);">TIME CAPSULE</span>
      </div>
      
      <div class="detail-block">
        <span class="detail-label">Key Event</span>
        <p class="detail-text" style="font-size: 16px; font-weight: 600; color: var(--color-warning);">${briefing.event}</p>
      </div>
      
      <div class="briefing-meta-grid">
        <div class="briefing-meta-box">
          <span class="detail-label">Primary Locations</span>
          <p class="detail-text" style="font-weight: 600;">${briefing.location}</p>
        </div>
        <div class="briefing-meta-box">
          <span class="detail-label">Primary Operatives</span>
          <p class="detail-text" style="font-weight: 600; color: var(--color-accent);">${briefing.operatives}</p>
        </div>
      </div>
      
      <div class="detail-block" style="margin-top: 20px;">
        <span class="detail-label">Historical Briefing Summary</span>
        <p class="detail-text" style="font-size: 13.5px; line-height: 1.6; color: var(--text-secondary);">${briefing.summary}</p>
      </div>
      
      <div class="reddington-block">
        <span class="detail-label">Raymond's Time Notes</span>
        <p class="reddington-story-text">Ah, ${yearName}. What a year. I remember reading the reports of this event from an old tea merchant who was trading in the local markets. The heat was unbearable, but the tension was worse. When history shifts, it shifts in months, not decades. You click the year, you see the board, you understand the timeline.</p>
      </div>
    </div>
  `;
}

// Display high-level Past Paper Briefing on the right panel
function selectPastPaper(paperName) {
  const briefing = typeof pastPaperBriefings !== 'undefined' ? pastPaperBriefings[paperName] : null;
  if (!briefing) return;
  
  // Mobile responsive auto-focus on details
  if (window.innerWidth <= 900) {
    switchMobilePanel('right');
  }
  
  selectedDossierId = null;
  
  const cards = document.querySelectorAll('.dossier-card');
  cards.forEach(c => c.classList.remove('active'));
  
  if (network) network.selectNodes([]);
  
  const panel = document.getElementById('dossier-briefing');
  
  panel.innerHTML = `
    <div class="dossier-sheet reveal">
      <div class="dossier-sec-header">
        <div>
          <span class="sec-code-stamp">PPSC PAST PAPER // BRIEFING</span>
          <h3 class="sec-dossier-name">${briefing.title}</h3>
        </div>
        <span class="tag-badge" style="color: var(--color-accent); border-color: var(--color-accent);">EXAM DOSSIER</span>
      </div>
      
      <div class="detail-block">
        <span class="detail-label">Testing Department</span>
        <p class="detail-text" style="font-size: 14px; font-weight: 600; color: var(--text-primary);">${briefing.department}</p>
      </div>

      <div class="detail-block">
        <span class="detail-label">Syllabus Guidelines</span>
        <p class="detail-text" style="font-size: 13.5px; line-height: 1.5; color: var(--text-secondary);">${briefing.syllabus}</p>
      </div>

      <div class="briefing-meta-grid">
        <div class="briefing-meta-box">
          <span class="detail-label">Key Focus Areas</span>
          <p class="detail-text" style="font-size: 12.5px; line-height: 1.4; color: var(--color-warning);">${briefing.focus}</p>
        </div>
      </div>
      
      <div class="reddington-block">
        <span class="detail-label">Raymond's Field Notes</span>
        <p class="reddington-story-text">${briefing.reddington_story}</p>
      </div>

      <div style="margin-top: 24px; text-align: center;">
        <button class="btn-terminal" style="width: 100%; padding: 12px; background-color: var(--color-success); border-color: var(--color-success); font-size: 14px; display: flex; justify-content: center; align-items: center; gap: 8px;" onclick="launchPaperQuiz('${paperName.replace(/'/g, "\\'")}')">
          ✍️ QUIZ ME ON THIS PAPER
        </button>
      </div>
    </div>
  `;
}

function launchPaperQuiz(paperName) {
  // Filter database for questions matching this past paper
  const paperQuestions = db.filter(dossier => dossier.past_paper === paperName);
  
  if (paperQuestions.length === 0) {
    alert("No questions found for this past paper.");
    return;
  }
  
  // Sort: Compromised -> Unvetted -> Secured
  const priorityList = [...paperQuestions].sort((a, b) => {
    const stateA = cardStates[a.id] || 'unvetted';
    const stateB = cardStates[b.id] || 'unvetted';
    
    const val = { 'compromised': 0, 'unvetted': 1, 'secured': 2 };
    return val[stateA] - val[stateB];
  });
  
  // Take up to 10 questions for this paper quiz session
  drillQueue = priorityList.slice(0, 10);
  currentDrillIndex = 0;
  
  // Show overlay
  document.getElementById('drill-overlay').style.display = 'flex';
  
  // Customize the overlay titles for Quiz Mode
  const overlayTitle = document.querySelector('.drill-heading');
  if (overlayTitle) {
    overlayTitle.innerText = "ACTIVE EXAM QUIZ: " + paperName.toUpperCase();
  }
  
  loadDrillQuestion();
}

// 7. Vis.js Network Graph Engine
function renderNetworkGraph() {
  const container = document.getElementById('network-graph');
  
  const filtered = filterDatabase();
  
  // Set up nodes
  const nodes = [];
  const edges = [];
  const connectionMap = {}; // Maps keyword to array of node IDs
  
  // Group colors by division matching CSS variables
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  
  const colors = {
    'The Archive': { background: isLight ? '#E3F2FD' : '#0D1B2A', border: '#1E88E5', text: isLight ? '#0D47A1' : '#FFFFFF' },
    'Cartography': { background: isLight ? '#E0F2F1' : '#002B2B', border: '#00897B', text: isLight ? '#004D40' : '#FFFFFF' },
    'Surveillance': { background: isLight ? '#ECEFF1' : '#102027', border: '#546E7A', text: isLight ? '#263238' : '#FFFFFF' },
    'The Laboratory': { background: isLight ? '#E8F5E9' : '#0A2F1D', border: '#43A047', text: isLight ? '#1B5E20' : '#FFFFFF' },
    'The Codebook': { background: isLight ? '#F3E5F5' : '#2A0835', border: '#8E24AA', text: isLight ? '#4A148C' : '#FFFFFF' },
    'The Charter': { background: isLight ? '#FFF3E0' : '#2E1A05', border: '#FB8C00', text: isLight ? '#E65100' : '#FFFFFF' }
  };
  
  filtered.forEach(dossier => {
    // Determine color schema
    const divColor = colors[dossier.division] || { background: '#12111A', border: '#222032', text: '#FFFFFF' };
    
    // Adjust outline if secured or compromised
    const state = cardStates[dossier.id] || 'unvetted';
    let borderWidth = 1;
    let borderCol = divColor.border;
    
    if (state === 'secured') {
      borderWidth = 3;
      borderCol = isLight ? '#1B5E20' : '#00FF88';
    } else if (state === 'compromised') {
      borderWidth = 3;
      borderCol = isLight ? '#B71C1C' : '#FF3D00';
    }
    
    nodes.push({
      id: dossier.id,
      label: dossier.dossier_name,
      shape: 'dot',
      size: 18,
      font: {
        face: 'Share Tech Mono',
        size: 14,
        color: isLight ? '#1A1A1A' : '#FFFFFF',
        vadjust: -34
      },
      color: {
        background: divColor.background,
        border: borderCol,
        highlight: {
          background: divColor.border,
          border: '#7C5CF5'
        }
      },
      borderWidth: borderWidth
    });
    
    // Map connections for edge building
    dossier.connections.forEach(conn => {
      const cleanConn = conn.toLowerCase().trim();
      if (!connectionMap[cleanConn]) {
        connectionMap[cleanConn] = [];
      }
      connectionMap[cleanConn].push(dossier.id);
    });
  });
  
  // Build edges based on shared connections
  const connectedPairs = new Set();
  
  Object.keys(connectionMap).forEach(conn => {
    const nodeIds = connectionMap[conn];
    if (nodeIds.length > 1) {
      for (let i = 0; i < nodeIds.length; i++) {
        for (let j = i + 1; j < nodeIds.length; j++) {
          const pairKey = nodeIds[i] < nodeIds[j] ? `${nodeIds[i]}-${nodeIds[j]}` : `${nodeIds[j]}-${nodeIds[i]}`;
          if (!connectedPairs.has(pairKey)) {
            connectedPairs.add(pairKey);
            edges.push({
              from: nodeIds[i],
              to: nodeIds[j],
              color: isLight ? '#D5D2C1' : '#222032',
              width: 1
            });
          }
        }
      }
    }
  });
  
  const data = {
    nodes: new vis.DataSet(nodes),
    edges: new vis.DataSet(edges)
  };
  
  const options = {
    physics: {
      solver: 'forceAtlas2Based',
      forceAtlas2Based: {
        gravitationalConstant: -70,
        centralGravity: 0.015,
        springLength: 120,
        springConstant: 0.08,
        damping: 0.4,
        avoidOverlap: 1
      },
      stabilization: {
        enabled: true,
        iterations: 150
      }
    },
    interaction: {
      hover: true,
      tooltipDelay: 200
    }
  };
  
  network = new vis.Network(container, data, options);
  
  // Disable physics after initial layout stabilization to prevent CPU lag
  network.on("stabilizationFinished", function() {
    network.setOptions({ physics: false });
  });
  
  // Connect select node event
  network.on("selectNode", function(params) {
    if (params.nodes.length > 0) {
      selectDossier(params.nodes[0]);
    }
  });
}

// 8. Interactive Review Drill (The Quiz)
function launchDrillMode() {
  // Pull cards in current division that are unvetted or compromised first
  const currentList = filterDatabase();
  
  if (currentList.length === 0) {
    alert("No dossiers available in this division to drill.");
    return;
  }
  
  // Sort: Compromised -> Unvetted -> Secured
  const priorityList = [...currentList].sort((a, b) => {
    const stateA = cardStates[a.id] || 'unvetted';
    const stateB = cardStates[b.id] || 'unvetted';
    
    const val = { 'compromised': 0, 'unvetted': 1, 'secured': 2 };
    return val[stateA] - val[stateB];
  });
  
  // Take top 5 cards for the quiz session
  drillQueue = priorityList.slice(0, 5);
  currentDrillIndex = 0;
  
  // Show overlay
  document.getElementById('drill-overlay').style.display = 'flex';
  
  loadDrillQuestion();
}

function loadDrillQuestion() {
  selectedOption = null;
  const dossier = drillQueue[currentDrillIndex];
  const container = document.getElementById('drill-content');
  
  // Generate options (1 correct + 3 distractor answers from same subject or database)
  const distractors = db
    .filter(d => d.id !== dossier.id && d.subject === dossier.subject)
    .map(d => d.verified_answer);
    
  // Shuffle distractors and pick 3
  const pickedDistractors = distractors.sort(() => 0.5 - Math.random()).slice(0, 3);
  
  // If we don't have enough distractors, fill from general db
  while (pickedDistractors.length < 3) {
    const filler = db
      .filter(d => d.id !== dossier.id && !pickedDistractors.includes(d.verified_answer))
      .map(d => d.verified_answer)
      .sort(() => 0.5 - Math.random())[0];
    if (filler) pickedDistractors.push(filler);
    else break;
  }
  
  const allOptions = [dossier.verified_answer, ...pickedDistractors].sort(() => 0.5 - Math.random());
  
  container.innerHTML = `
    <div class="drill-q-num">QUESTION ${currentDrillIndex + 1} OF ${drillQueue.length}</div>
    <div class="drill-q-text">${dossier.question}</div>
    
    <div class="drill-options-grid" id="drill-options">
      ${allOptions.map((opt, idx) => `
        <button class="btn-option" onclick="selectDrillOption(this, '${opt.replace(/'/g, "\\'")}')">
          ${opt}
        </button>
      `).join('')}
    </div>
    
    <div id="drill-result-panel"></div>
    
    <div class="drill-actions">
      <button class="btn-terminal" style="background-color: var(--border); color: var(--text-primary); box-shadow: none;" onclick="exitDrillMode()">QUIT</button>
      <button class="btn-terminal" id="btn-submit-drill" onclick="submitDrillAnswer()" disabled>SUBMIT ANSWER</button>
    </div>
  `;
}

function selectDrillOption(button, option) {
  selectedOption = option;
  
  // Reset active classes
  const buttons = document.querySelectorAll('#drill-options .btn-option');
  buttons.forEach(btn => btn.classList.remove('selected'));
  
  button.classList.add('selected');
  document.getElementById('btn-submit-drill').removeAttribute('disabled');
}

function submitDrillAnswer() {
  const dossier = drillQueue[currentDrillIndex];
  const isCorrect = selectedOption === dossier.verified_answer;
  
  const resultPanel = document.getElementById('drill-result-panel');
  const submitBtn = document.getElementById('btn-submit-drill');
  
  // Disable option buttons
  const buttons = document.querySelectorAll('#drill-options .btn-option');
  buttons.forEach(btn => {
    btn.setAttribute('disabled', 'true');
    // Highlight correct & incorrect
    if (btn.innerText.trim() === dossier.verified_answer) {
      btn.classList.add('correct');
    } else if (btn.classList.contains('selected') && !isCorrect) {
      btn.classList.add('incorrect');
    }
    btn.classList.remove('selected');
  });
  
  if (isCorrect) {
    cardStates[dossier.id] = 'secured';
    userXP += 15; // Earn XP
    
    resultPanel.innerHTML = `
      <div class="drill-result-alert success">
        🟢 CORRECT! (+15 XP)
      </div>
      <div class="reveal-briefing-box">
        <div class="reddington-block">
          <span class="detail-label">Briefing Recap</span>
          <p class="reddington-story-text">${dossier.reddington_story}</p>
        </div>
      </div>
    `;
  } else {
    cardStates[dossier.id] = 'compromised';
    
    resultPanel.innerHTML = `
      <div class="drill-result-alert danger">
        🔴 INCORRECT. RECORD COMPROMISED
      </div>
      <div class="reveal-briefing-box">
        <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 8px;">
          <strong>Correct Answer:</strong> ${dossier.verified_answer}
        </div>
        <div class="reddington-block">
          <span class="detail-label">Memorize the Connection (Briefing)</span>
          <p class="reddington-story-text">${dossier.reddington_story}</p>
        </div>
      </div>
    `;
  }
  
  saveProgression();
  calculateRank();
  updateProgressUI();
  
  // Replace submit button with next
  if (currentDrillIndex < drillQueue.length - 1) {
    submitBtn.outerHTML = `<button class="btn-terminal" onclick="nextDrillQuestion()">NEXT QUESTION</button>`;
  } else {
    submitBtn.outerHTML = `<button class="btn-terminal" style="background-color: var(--color-success);" onclick="finishDrillSession()">FINISH QUIZ</button>`;
  }
}

function nextDrillQuestion() {
  currentDrillIndex++;
  loadDrillQuestion();
}

function finishDrillSession() {
  exitDrillMode();
  // Select the last reviewed card and redraw lists
  if (drillQueue.length > 0) {
    selectDossier(drillQueue[drillQueue.length - 1].id);
  }
}

function exitDrillMode() {
  document.getElementById('drill-overlay').style.display = 'none';
  renderDossierList();
  renderNetworkGraph();
}

// 9. Load Intel JSON Packs (Expansion importer)
function importIntelPack(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (Array.isArray(imported)) {
        // Validate keys in imported objects
        const valid = imported.every(item => item.id && item.division && item.question && item.verified_answer);
        if (valid) {
          // Add to database preventing duplicate IDs
          let addedCount = 0;
          imported.forEach(item => {
            const exists = db.some(d => d.id === item.id);
            if (!exists) {
              db.push(item);
              cardStates[item.id] = 'unvetted';
              addedCount++;
            }
          });
          
          alert(`Success: Loaded ${addedCount} new dossiers into The Ledger database!`);
          saveProgression();
          renderDossierList();
          renderNetworkGraph();
        } else {
          alert("Error: Invalid JSON format. Make sure the list items contain required keys.");
        }
      } else {
        alert("Error: File must contain an array of dossiers.");
      }
    } catch (err) {
      alert("Error parsing JSON file: " + err.message);
    }
  };
  reader.readAsText(file);
}

// 10. Theme Toggling
function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  
  html.setAttribute('data-theme', next);
  
  const themeIcon = document.querySelector('.btn-theme-toggle .theme-icon');
  themeIcon.innerText = next === 'dark' ? '🌙' : '☀️';
  
  // Redraw network graph to swap colors
  renderNetworkGraph();
  
  // Reload Leaflet basemap tiles if initialized
  if (map) {
    map.remove();
    map = null;
    initMap();
  }
}

// Mobile View Navigation Switcher
function switchMobilePanel(panelName) {
  // Toggle active class on tab buttons
  const leftTab = document.getElementById('mobile-tab-left');
  const centerTab = document.getElementById('mobile-tab-center');
  const rightTab = document.getElementById('mobile-tab-right');
  
  if (leftTab) leftTab.classList.toggle('active', panelName === 'left');
  if (centerTab) centerTab.classList.toggle('active', panelName === 'center');
  if (rightTab) rightTab.classList.toggle('active', panelName === 'right');
  
  // Toggle active class on panel containers
  const leftPanel = document.querySelector('.panel-left');
  const centerPanel = document.querySelector('.panel-center');
  const rightPanel = document.querySelector('.panel-right');
  
  if (leftPanel) leftPanel.classList.toggle('mobile-active', panelName === 'left');
  if (centerPanel) centerPanel.classList.toggle('mobile-active', panelName === 'center');
  if (rightPanel) rightPanel.classList.toggle('mobile-active', panelName === 'right');
  
  // Re-fit graph container if switching to center graph panel
  if (panelName === 'center' && network) {
    setTimeout(() => {
      network.fit();
    }, 100);
  }
}

// 11. Tactical Map (Leaflet) Controller
function switchCenterView(view) {
  currentCenterView = view;
  
  const webBtn = document.getElementById('btn-view-web');
  const mapBtn = document.getElementById('btn-view-map');
  const webCanvas = document.getElementById('network-graph');
  const mapCanvas = document.getElementById('tactical-map');
  const subText = document.getElementById('center-panel-sub');
  const panelTitle = document.getElementById('center-panel-title');
  
  if (webBtn) webBtn.classList.toggle('active', view === 'web');
  if (mapBtn) mapBtn.classList.toggle('active', view === 'map');
  
  if (view === 'web') {
    if (webCanvas) webCanvas.style.display = 'block';
    if (mapCanvas) mapCanvas.style.display = 'none';
    if (panelTitle) panelTitle.innerText = "CONNECTION WEB";
    if (subText) subText.innerText = "Drag and zoom nodes to reveal links";
    if (network) network.fit();
  } else {
    if (webCanvas) webCanvas.style.display = 'none';
    if (mapCanvas) mapCanvas.style.display = 'block';
    if (panelTitle) panelTitle.innerText = "TACTICAL MAP";
    if (subText) subText.innerText = "Select geographic tactical markers";
    
    // Initialize map if not already done
    setTimeout(() => {
      initMap();
      if (map) {
        map.invalidateSize();
        plotMapMarkers();
      }
    }, 100);
  }
}

function initMap() {
  if (map) return; // Already initialized
  
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  
  map = L.map('tactical-map', {
    zoomControl: false,
    attributionControl: true
  }).setView([30.0, 70.0], 5); // Default view centered on Pakistan region
  
  const tileUrl = isLight 
    ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    
  L.tileLayer(tileUrl, {
    maxZoom: 18,
    attribution: '&copy; OpenStreetMap &copy; CARTO'
  }).addTo(map);
  
  L.control.zoom({
    position: 'bottomright'
  }).addTo(map);
  
  plotMapMarkers();
}

function plotMapMarkers() {
  if (!map) return;
  
  // Clear existing markers
  for (let id in mapMarkers) {
    map.removeLayer(mapMarkers[id]);
  }
  mapMarkers = {};
  
  const filtered = filterDatabase();
  
  filtered.forEach(dossier => {
    if (dossier.coordinates && Array.isArray(dossier.coordinates)) {
      const state = cardStates[dossier.id] || 'unvetted';
      let color = '#7C5CF5'; // Default accent purple
      if (state === 'secured') color = '#00FF88'; // Glowing green
      else if (state === 'compromised') color = '#FF3D00'; // Glowing red
      
      // Build custom glowing HTML marker element
      const markerHtml = `
        <div class="tactical-marker ${state}" style="background-color: ${color}; border-color: ${color}; box-shadow: 0 0 8px ${color}; width: 12px; height: 12px; border-radius: 50%; position: relative;">
          <div class="marker-pulse" style="position: absolute; top: -4px; left: -4px; width: 18px; height: 18px; border-radius: 50%; border: 1px solid ${color}; opacity: 0.8; animation: pulse-ring 1.5s infinite; pointer-events: none;"></div>
        </div>
      `;
      
      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-leaflet-marker',
        iconSize: [12, 12],
        iconAnchor: [6, 6]
      });
      
      const marker = L.marker(dossier.coordinates, { icon: customIcon })
        .addTo(map)
        .on('click', () => {
          selectDossier(dossier.id);
        });
        
      marker.bindTooltip(`<strong>${dossier.dossier_name}</strong><br><span style="font-size: 10px; color: #a09eae;">${dossier.id}</span>`, {
        direction: 'top',
        offset: [0, -6],
        className: 'tactical-tooltip'
      });
      
      mapMarkers[dossier.id] = marker;
    }
  });
}

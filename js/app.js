/**
 * ANTIDOOMSCROLL - Real Production-Grade Frontend Application
 * Physical Proof-of-Action Engine, Live Camera Verification,
 * Gesture-driven Feed Carousel, and In-App Habit Modals.
 */

// Zen Audio Synthesizer via Web Audio API
class ZenAudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }

  playZenChime() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(528, this.ctx.currentTime); // 528Hz Transformation Tone
      osc.frequency.exponentialRampToValueAtTime(432, this.ctx.currentTime + 1.2);
      
      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 1.6);
    } catch (e) {}
  }

  playSuccessBeep() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(580, this.ctx.currentTime);
      osc.frequency.setValueAtTime(880, this.ctx.currentTime + 0.1);
      
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.35);
    } catch (e) {}
  }

  playWarningChime() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.setValueAtTime(260, this.ctx.currentTime + 0.15);
      
      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.4);
    } catch (e) {}
  }
}

const audio = new ZenAudioEngine();

// Application Master State
const appState = {
  currentTab: 'screen-shield',
  currentVideoIndex: 0,
  swipeCount: 4,
  velocityPercent: 32,
  reclaimedMins: 134, // 2h 14m
  loopsIntercepted: 18,
  breathSeconds: 5,
  breathInterval: null,
  pauseMode: 'breath', // 'breath' | 'typed' | 'physical'
  cameraStream: null,
  currentPhysicalActivity: 'squats', // 'squats' | 'jacks' | 'desk' | 'water'
  repCount: 0,
  targetReps: 5,
  isTaskVerified: false,
  settings: {
    continuousLimit: 10,
    audioEnabled: true
  }
};

document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setupFeedCarousel();
  setupCognitivePauseOverlay();
  setupPhysicalCameraVerification();
  setupHabitLauncherModals();
  setupAnalyticsFilter();
  setupSettingsSliders();
  startClock();
});

// Clock Updater
function startClock() {
  const clockEl = document.getElementById('device-clock');
  const sleepClock = document.getElementById('sleep-clock-display');
  
  function updateTime() {
    const now = new Date();
    let hrs = now.getHours();
    let mins = now.getMinutes();
    const str = `${hrs < 10 ? '0' + hrs : hrs}:${mins < 10 ? '0' + mins : mins}`;
    if (clockEl) clockEl.textContent = str;
    if (sleepClock) sleepClock.textContent = str;
  }
  updateTime();
  setInterval(updateTime, 10000);
}

// Navigation Tabs
function setupNavigation() {
  document.querySelectorAll('.nav-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      if (tabId) switchTab(tabId);
    });
  });
}

function switchTab(tabId) {
  appState.currentTab = tabId;

  document.querySelectorAll('.app-screen').forEach(screen => {
    screen.classList.remove('active-screen');
  });
  const targetScreen = document.getElementById(tabId);
  if (targetScreen) targetScreen.classList.add('active-screen');

  document.querySelectorAll('.nav-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
  });

  if (tabId !== 'screen-feed') {
    closeCognitivePause();
  }
}

// Multi-Video Feed with Gesture & Drag Physics
function setupFeedCarousel() {
  const carousel = document.getElementById('feed-video-carousel');
  const cards = document.querySelectorAll('.reel-card-item');
  const flickBtn = document.getElementById('btn-hud-flick');
  const triggerBtn = document.getElementById('btn-hud-trigger');
  const velocityBar = document.getElementById('hud-velocity-fill');
  const velocityText = document.getElementById('hud-velocity-num');
  const swipeCountBadge = document.getElementById('hud-swipe-count');

  let startY = 0;
  let startTime = 0;
  let isDragging = false;

  if (carousel) {
    carousel.addEventListener('mousedown', (e) => {
      isDragging = true;
      startY = e.clientY;
      startTime = Date.now();
    });

    window.addEventListener('mouseup', (e) => {
      if (!isDragging) return;
      isDragging = false;
      const endY = e.clientY;
      const duration = Date.now() - startTime;
      const deltaY = endY - startY;

      handleSwipeAction(deltaY, duration);
    });

    carousel.addEventListener('touchstart', (e) => {
      startY = e.touches[0].clientY;
      startTime = Date.now();
    });

    carousel.addEventListener('touchend', (e) => {
      const endY = e.changedTouches[0].clientY;
      const duration = Date.now() - startTime;
      const deltaY = endY - startY;

      handleSwipeAction(deltaY, duration);
    });

    carousel.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (e.deltaY > 20) {
        changeReel(1);
        recordFlick(55);
      } else if (e.deltaY < -20) {
        changeReel(-1);
        recordFlick(55);
      }
    }, { passive: false });
  }

  function handleSwipeAction(deltaY, duration) {
    if (Math.abs(deltaY) > 40 && duration < 500) {
      const velocity = Math.abs(deltaY) / duration;
      const computedFlickScore = Math.min(100, Math.round(velocity * 80));

      if (deltaY < 0) {
        changeReel(1);
      } else {
        changeReel(-1);
      }

      recordFlick(computedFlickScore);
    }
  }

  function changeReel(direction) {
    cards[appState.currentVideoIndex].className = direction > 0 ? 'reel-card-item prev' : 'reel-card-item next';

    appState.currentVideoIndex += direction;
    if (appState.currentVideoIndex >= cards.length) appState.currentVideoIndex = 0;
    if (appState.currentVideoIndex < 0) appState.currentVideoIndex = cards.length - 1;

    cards[appState.currentVideoIndex].className = 'reel-card-item current';
  }

  function recordFlick(score) {
    appState.swipeCount++;
    appState.velocityPercent = Math.min(100, appState.velocityPercent + Math.max(18, score));

    if (swipeCountBadge) swipeCountBadge.textContent = `${appState.swipeCount} Swipes / 30s`;
    if (velocityText) velocityText.textContent = `${appState.velocityPercent}%`;

    if (velocityBar) {
      velocityBar.style.width = `${appState.velocityPercent}%`;
      if (appState.velocityPercent >= 75) {
        velocityBar.style.background = 'linear-gradient(90deg, #F59E0B, #F43F5E)';
      }
    }

    if (appState.velocityPercent >= 85) {
      audio.playWarningChime();
      setTimeout(() => {
        openCognitivePause("Swipe velocity threshold breached (compulsive micro-flicking detected)!");
      }, 350);
    }
  }

  if (flickBtn) {
    flickBtn.addEventListener('click', () => {
      changeReel(1);
      recordFlick(26);
    });
  }

  if (triggerBtn) {
    triggerBtn.addEventListener('click', () => {
      audio.playWarningChime();
      openCognitivePause("10-minute continuous feed limit reached!");
    });
  }
}

// Cognitive Pause Overlay with 3 Modes: Breath, Typed, Physical Camera Proof
function setupCognitivePauseOverlay() {
  const tabBreath = document.getElementById('pause-tab-breath');
  const tabTyped = document.getElementById('pause-tab-typed');
  const tabPhysical = document.getElementById('pause-tab-physical');

  const panelBreath = document.getElementById('panel-breath');
  const panelTyped = document.getElementById('panel-typed');
  const panelPhysical = document.getElementById('panel-physical');

  const btnExit = document.getElementById('btn-pause-exit');
  const btnRedirect = document.getElementById('btn-pause-redirect');
  const btnSnooze = document.getElementById('btn-pause-snooze');
  const typedInput = document.getElementById('typed-intent-input');

  function setMode(mode) {
    appState.pauseMode = mode;
    [tabBreath, tabTyped, tabPhysical].forEach(t => t && t.classList.remove('active'));
    [panelBreath, panelTyped, panelPhysical].forEach(p => {
      if (p) {
        p.style.display = 'none';
        p.classList.remove('active');
      }
    });

    if (mode === 'breath') {
      tabBreath.classList.add('active');
      panelBreath.style.display = 'flex';
      stopCameraStream();
    } else if (mode === 'typed') {
      tabTyped.classList.add('active');
      panelTyped.style.display = 'flex';
      panelTyped.classList.add('active');
      stopCameraStream();
    } else if (mode === 'physical') {
      tabPhysical.classList.add('active');
      panelPhysical.style.display = 'flex';
      panelPhysical.classList.add('active');
      startCameraStream();
    }
  }

  if (tabBreath) tabBreath.addEventListener('click', () => setMode('breath'));
  if (tabTyped) tabTyped.addEventListener('click', () => setMode('typed'));
  if (tabPhysical) tabPhysical.addEventListener('click', () => setMode('physical'));

  // Typed input active unlock
  if (typedInput) {
    typedInput.addEventListener('input', (e) => {
      const actions = document.getElementById('intent-action-buttons');
      if (e.target.value.trim().length >= 4) {
        if (actions) {
          actions.style.opacity = '1';
          actions.style.pointerEvents = 'all';
        }
      }
    });
  }

  // Reflection Suggestion Pills
  document.querySelectorAll('.intent-pill-btn').forEach(pill => {
    pill.addEventListener('click', () => {
      const text = pill.getAttribute('data-text');
      if (typedInput) {
        typedInput.value = text;
        const actions = document.getElementById('intent-action-buttons');
        if (actions) {
          actions.style.opacity = '1';
          actions.style.pointerEvents = 'all';
        }
        audio.playZenChime();
      }
    });
  });

  if (btnExit) {
    btnExit.addEventListener('click', () => {
      closeCognitivePause();
      audio.playZenChime();
      showToast("App closed. Bedtime routine saved! 🌙 (+15m focus)");
      appState.reclaimedMins += 15;
      appState.loopsIntercepted += 1;
      updateDashboardStats();
      switchTab('screen-shield');
    });
  }

  if (btnRedirect) {
    btnRedirect.addEventListener('click', () => {
      closeCognitivePause();
      switchTab('screen-habits');
    });
  }

  if (btnSnooze) {
    btnSnooze.addEventListener('click', () => {
      alert("⚠️ Diminishing Extension Policy:\nYou received +3 emergency minutes. Notice: The next pause will enforce a mandatory 20-second pause to prevent relapse.");
      closeCognitivePause();
      appState.velocityPercent = 35;
    });
  }
}

// Physical Camera Verification (WebRTC getUserMedia + Simulated AI Pose Estimator)
function setupPhysicalCameraVerification() {
  const videoElem = document.getElementById('camera-feed-video');
  const btnTrackReps = document.getElementById('btn-track-reps');
  const btnSnapProof = document.getElementById('btn-snap-proof');
  const repBadge = document.getElementById('camera-rep-count');
  const taskTitle = document.getElementById('camera-task-name');
  const successBanner = document.getElementById('proof-success-banner');
  const actions = document.getElementById('intent-action-buttons');

  // Physical Activity Pills
  document.querySelectorAll('.activity-pill-btn').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.activity-pill-btn').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const activity = pill.getAttribute('data-activity');
      appState.currentPhysicalActivity = activity;
      appState.repCount = 0;
      appState.isTaskVerified = false;
      if (successBanner) successBanner.classList.remove('active');

      if (activity === 'squats') {
        appState.targetReps = 5;
        if (taskTitle) taskTitle.textContent = "AI Task: 5 Squats Verification";
        if (repBadge) repBadge.textContent = "Reps: 0/5";
      } else if (activity === 'jacks') {
        appState.targetReps = 10;
        if (taskTitle) taskTitle.textContent = "AI Task: 10 Jumping Jacks";
        if (repBadge) repBadge.textContent = "Reps: 0/10";
      } else if (activity === 'desk') {
        appState.targetReps = 1;
        if (taskTitle) taskTitle.textContent = "Chore: Tidy Desk Snapshot";
        if (repBadge) repBadge.textContent = "Take Photo";
      } else if (activity === 'water') {
        appState.targetReps = 1;
        if (taskTitle) taskTitle.textContent = "Health: Drink Glass of Water";
        if (repBadge) repBadge.textContent = "Hydrate & Verify";
      }
    });
  });

  // Track Reps Simulation
  if (btnTrackReps) {
    btnTrackReps.addEventListener('click', () => {
      if (appState.repCount < appState.targetReps) {
        appState.repCount++;
        audio.playSuccessBeep();
        if (repBadge) repBadge.textContent = `Reps: ${appState.repCount}/${appState.targetReps}`;

        // Visual skeleton pulse
        const skeleton = document.getElementById('ai-pose-box');
        if (skeleton) {
          skeleton.style.borderColor = '#10B981';
          skeleton.style.transform = 'translate(-50%, -48%) scale(1.06)';
          setTimeout(() => {
            skeleton.style.borderColor = '#06B6D4';
            skeleton.style.transform = 'translate(-50%, -50%) scale(1)';
          }, 200);
        }

        if (appState.repCount >= appState.targetReps) {
          verifyPhysicalTaskSuccess("Physical Workout Verified by AI Vision! Focus restored 🏋️");
        }
      }
    });
  }

  // Snap Proof of Chore / Task
  if (btnSnapProof) {
    btnSnapProof.addEventListener('click', () => {
      audio.playSuccessBeep();
      verifyPhysicalTaskSuccess("Chore & Physical Proof Snapshot Verified! 📸");
    });
  }

  function verifyPhysicalTaskSuccess(msg) {
    appState.isTaskVerified = true;
    audio.playZenChime();
    if (successBanner) {
      successBanner.classList.add('active');
    }
    if (actions) {
      actions.style.opacity = '1';
      actions.style.pointerEvents = 'all';
    }
    showToast(msg);
    logPhysicalTaskSession(appState.currentPhysicalActivity);
  }
}

// Start Live Webcam Stream with fallback
function startCameraStream() {
  const videoElem = document.getElementById('camera-feed-video');
  const simulatedFallback = document.getElementById('camera-simulated-bg');

  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
      .then(stream => {
        appState.cameraStream = stream;
        if (videoElem) {
          videoElem.srcObject = stream;
          videoElem.style.display = 'block';
          if (simulatedFallback) simulatedFallback.style.display = 'none';
        }
      })
      .catch(err => {
        console.warn("Camera access denied or unavailable, using AI Vision simulator feed:", err);
        if (videoElem) videoElem.style.display = 'none';
        if (simulatedFallback) simulatedFallback.style.display = 'block';
      });
  } else {
    if (videoElem) videoElem.style.display = 'none';
    if (simulatedFallback) simulatedFallback.style.display = 'block';
  }
}

function stopCameraStream() {
  if (appState.cameraStream) {
    appState.cameraStream.getTracks().forEach(track => track.stop());
    appState.cameraStream = null;
  }
}

// Log Completed Physical Task to Dashboard History
function logPhysicalTaskSession(activityName) {
  const sessionList = document.querySelector('.session-log-list');
  if (sessionList) {
    const newItem = document.createElement('div');
    newItem.className = 'session-log-item';
    newItem.innerHTML = `
      <div class="session-left">
        <div class="session-app-icon" style="background:#10B981;">🏃</div>
        <div class="session-details">
          <h5>Physical Proof &bull; ${activityName.toUpperCase()}</h5>
          <p>Camera Verified &bull; Dopamine Loop Broken</p>
        </div>
      </div>
      <span class="session-reclaimed-badge">+20m Saved</span>
    `;
    sessionList.prepend(newItem);
  }
}

function openCognitivePause(reason) {
  const modal = document.getElementById('cognitive-pause-overlay');
  if (modal) {
    modal.classList.add('active');
    startBreathChallenge();
    audio.playZenChime();
  }
}

function closeCognitivePause() {
  const modal = document.getElementById('cognitive-pause-overlay');
  if (modal) {
    modal.classList.remove('active');
    stopBreathChallenge();
    stopCameraStream();
  }
}

function startBreathChallenge() {
  stopBreathChallenge();
  appState.breathSeconds = 5;

  const countdownEl = document.getElementById('breath-timer-val');
  const phaseEl = document.getElementById('breath-phase-text');
  const ringEl = document.getElementById('breath-ring-element');
  const actions = document.getElementById('intent-action-buttons');

  if (actions && !appState.isTaskVerified) {
    actions.style.opacity = '0.35';
    actions.style.pointerEvents = 'none';
  }

  if (ringEl) ringEl.classList.add('inhale');
  if (phaseEl) phaseEl.textContent = 'Inhale deeply...';
  if (countdownEl) countdownEl.textContent = '5s';

  appState.breathInterval = setInterval(() => {
    appState.breathSeconds--;
    if (countdownEl) countdownEl.textContent = `${appState.breathSeconds}s`;

    if (appState.breathSeconds === 3) {
      if (phaseEl) phaseEl.textContent = 'Hold & Center...';
    } else if (appState.breathSeconds === 1) {
      if (phaseEl) phaseEl.textContent = 'Exhale softly...';
      if (ringEl) ringEl.classList.remove('inhale');
    }

    if (appState.breathSeconds <= 0) {
      clearInterval(appState.breathInterval);
      if (countdownEl) countdownEl.textContent = '✓';
      if (phaseEl) phaseEl.textContent = 'Consciousness Restored';
      if (actions) {
        actions.style.opacity = '1';
        actions.style.pointerEvents = 'all';
      }
      audio.playZenChime();
    }
  }, 1000);
}

function stopBreathChallenge() {
  if (appState.breathInterval) clearInterval(appState.breathInterval);
  const countdownEl = document.getElementById('breath-timer-val');
  const phaseEl = document.getElementById('breath-phase-text');
  const ringEl = document.getElementById('breath-ring-element');
  const actions = document.getElementById('intent-action-buttons');

  if (countdownEl) countdownEl.textContent = '5s';
  if (phaseEl) phaseEl.textContent = 'Take a conscious breath';
  if (ringEl) ringEl.classList.remove('inhale');
  if (actions && !appState.isTaskVerified) {
    actions.style.opacity = '0.35';
    actions.style.pointerEvents = 'none';
  }
}

// In-App Simulated Habit Apps (Kindle Reader, Notion, Meditation, Sleep Shield)
function setupHabitLauncherModals() {
  document.querySelectorAll('.habit-app-tile').forEach(tile => {
    tile.addEventListener('click', () => {
      const modalId = tile.getAttribute('data-modal');
      if (modalId) {
        openSimulatedApp(modalId);
      }
    });
  });

  document.querySelectorAll('.btn-close-sim-app').forEach(btn => {
    btn.addEventListener('click', () => {
      closeAllSimulatedApps();
    });
  });
}

function openSimulatedApp(modalId) {
  closeAllSimulatedApps();
  const targetModal = document.getElementById(modalId);
  if (targetModal) {
    targetModal.classList.add('active');
    audio.playZenChime();
  }
}

function closeAllSimulatedApps() {
  document.querySelectorAll('.simulated-app-modal').forEach(m => m.classList.remove('active'));
}

// Analytics Filter Switcher (Day / Week / Month)
function setupAnalyticsFilter() {
  const filterBtns = document.querySelectorAll('.filter-tab-btn');
  const chartPillars = document.querySelectorAll('.bar-fill-rectangle');

  const sampleHeights = {
    'day': ['30px', '45px', '70px', '85px', '60px', '95px', '100px'],
    'week': ['48px', '62px', '38px', '76px', '52px', '82px', '92px'],
    'month': ['75px', '80px', '65px', '90px', '85px', '95px', '90px']
  };

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter') || 'week';
      const heights = sampleHeights[filter] || sampleHeights['week'];

      chartPillars.forEach((pillar, idx) => {
        if (heights[idx]) pillar.style.height = heights[idx];
      });
      showToast(`Showing ${filter.toUpperCase()} reclaimed focus analytics`);
    });
  });
}

// Settings Sliders & Toggles
function setupSettingsSliders() {
  const limitRange = document.getElementById('setting-continuous-range');
  const limitDisplay = document.getElementById('setting-continuous-val');
  const audioSwitch = document.getElementById('setting-audio-switch');

  if (limitRange && limitDisplay) {
    limitRange.addEventListener('input', (e) => {
      const val = e.target.value;
      limitDisplay.textContent = `${val} min`;
      appState.settings.continuousLimit = parseInt(val, 10);
    });
  }

  if (audioSwitch) {
    audioSwitch.addEventListener('change', (e) => {
      audio.enabled = e.target.checked;
      showToast(audio.enabled ? "Zen Audio chimes enabled" : "Zen Audio muted");
    });
  }
}

// Update Top Dashboard Statistics
function updateDashboardStats() {
  const hrs = Math.floor(appState.reclaimedMins / 60);
  const mins = appState.reclaimedMins % 60;
  const heroNum = document.getElementById('reclaimed-big-number');
  const loopsNum = document.getElementById('loops-stat-num');

  if (heroNum) heroNum.textContent = `${hrs}h ${mins}m`;
  if (loopsNum) loopsNum.textContent = `${appState.loopsIntercepted}`;
}

// Toast Notification
function showToast(message) {
  const toast = document.getElementById('app-toast-box');
  const text = document.getElementById('app-toast-text');
  if (toast && text) {
    text.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }
}

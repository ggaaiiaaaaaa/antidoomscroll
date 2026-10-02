/**
 * ANTIDOOMSCROLL - Clean Web Prototype
 * Logic for screen navigation, scroll detection, pause challenges, and habit shortcuts.
 */

// Simple Audio Synthesizer (Web Audio API)
class SoundEffects {
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

  playChime() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(390, this.ctx.currentTime + 0.8);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.8);
    } catch (e) {}
  }

  playSuccess() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, this.ctx.currentTime);
      osc.frequency.setValueAtTime(780, this.ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.3);
    } catch (e) {}
  }

  playAlert() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(340, this.ctx.currentTime);
      osc.frequency.setValueAtTime(280, this.ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.16, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.35);
    } catch (e) {}
  }
}

const audio = new SoundEffects();

// App State
const state = {
  activeScreen: 'screen-dashboard',
  currentReelIndex: 0,
  swipeCount: 4,
  scrollSpeedPercent: 32,
  savedMins: 134, // 2h 14m
  sessionsInterrupted: 18,
  breathTimerVal: 5,
  breathInterval: null,
  pauseMode: 'breath',
  currentExercise: 'squats',
  repCount: 0,
  targetReps: 5,
  cameraStream: null,
  autoCountTimer: null
};

document.addEventListener('DOMContentLoaded', () => {
  setupTopDemoNav();
  setupPhoneNav();
  setupReelFeed();
  setupPauseModal();
  setupWorkoutCamera();
  setupSimulatedAppModals();
  setupSettings();
  setupClock();
  setupAboutModal();
});

// =========================================================
// TOP DEMO BAR (QUICK WALKTHROUGH BUTTONS)
// =========================================================
function setupTopDemoNav() {
  const demoButtons = document.querySelectorAll('.demo-btn');
  demoButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      demoButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const action = btn.getAttribute('data-action');
      handleDemoAction(action);
    });
  });

  const audioToggle = document.getElementById('btn-audio-toggle');
  const audioText = document.getElementById('audio-btn-text');
  if (audioToggle) {
    audioToggle.addEventListener('click', () => {
      audio.enabled = !audio.enabled;
      if (audioText) audioText.textContent = audio.enabled ? "Sound ON" : "Sound OFF";
      const settingToggle = document.getElementById('setting-sound-toggle');
      if (settingToggle) settingToggle.checked = audio.enabled;
      showToast(audio.enabled ? "Sound effects enabled" : "Sound effects muted");
    });
  }
}

function handleDemoAction(action) {
  switch (action) {
    case 'dashboard':
      closePauseModal();
      closeSimModals();
      showScreen('screen-dashboard');
      break;

    case 'feed':
      closePauseModal();
      closeSimModals();
      showScreen('screen-feed');
      break;

    case 'trigger-pause':
      showScreen('screen-feed');
      audio.playAlert();
      openPauseModal("Continuous scroll limit reached!");
      break;

    case 'breathing':
      showScreen('screen-feed');
      openPauseModal("Breathing pause");
      setPauseTab('breath');
      break;

    case 'intent':
      showScreen('screen-feed');
      openPauseModal("State your intention");
      setPauseTab('intent');
      const input = document.getElementById('intent-input');
      if (input) {
        input.value = "I just came to reply to a message";
        const actions = document.getElementById('pause-action-buttons');
        if (actions) {
          actions.style.opacity = '1';
          actions.style.pointerEvents = 'all';
        }
      }
      break;

    case 'workout':
      showScreen('screen-feed');
      openPauseModal("Physical workout check");
      setPauseTab('workout');
      autoCountReps();
      break;

    case 'habits':
      closePauseModal();
      showScreen('screen-habits');
      openSimModal('modal-kindle');
      break;

    case 'stats':
      closePauseModal();
      closeSimModals();
      showScreen('screen-stats');
      break;
  }
}

// =========================================================
// PHONE SCREEN NAVIGATION
// =========================================================
function setupPhoneNav() {
  document.querySelectorAll('.nav-item-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const screenId = btn.getAttribute('data-screen');
      if (screenId) {
        showScreen(screenId);
        updateTopNavActive(screenId);
      }
    });
  });
}

function showScreen(screenId) {
  state.activeScreen = screenId;

  document.querySelectorAll('.app-screen').forEach(screen => {
    screen.classList.remove('active');
  });
  const target = document.getElementById(screenId);
  if (target) target.classList.add('active');

  document.querySelectorAll('.nav-item-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-screen') === screenId);
  });

  if (screenId !== 'screen-feed') {
    closePauseModal();
  }
}

function updateTopNavActive(screenId) {
  document.querySelectorAll('.demo-btn').forEach(btn => {
    const action = btn.getAttribute('data-action');
    if (screenId === 'screen-dashboard' && action === 'dashboard') btn.classList.add('active');
    else if (screenId === 'screen-feed' && action === 'feed') btn.classList.add('active');
    else if (screenId === 'screen-habits' && action === 'habits') btn.classList.add('active');
    else if (screenId === 'screen-stats' && action === 'stats') btn.classList.add('active');
    else btn.classList.remove('active');
  });
}

// =========================================================
// SHORT REEL FEED SIMULATOR
// =========================================================
function setupReelFeed() {
  const carousel = document.getElementById('feed-carousel');
  const cards = document.querySelectorAll('.reel-card');
  const flickBtn = document.getElementById('btn-flick-reel');
  const triggerBtn = document.getElementById('btn-trigger-pause-test');
  const speedFill = document.getElementById('hud-speed-fill');
  const speedText = document.getElementById('hud-swipe-text');

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

      if (Math.abs(deltaY) > 35 && duration < 600) {
        if (deltaY < 0) nextReel(1);
        else nextReel(-1);
        registerSwipe();
      }
    });

    carousel.addEventListener('touchstart', (e) => {
      startY = e.touches[0].clientY;
      startTime = Date.now();
    }, { passive: true });

    carousel.addEventListener('touchend', (e) => {
      const endY = e.changedTouches[0].clientY;
      const duration = Date.now() - startTime;
      const deltaY = endY - startY;

      if (Math.abs(deltaY) > 35 && duration < 600) {
        if (deltaY < 0) nextReel(1);
        else nextReel(-1);
        registerSwipe();
      }
    }, { passive: true });

    carousel.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (e.deltaY > 20) {
        nextReel(1);
        registerSwipe();
      } else if (e.deltaY < -20) {
        nextReel(-1);
        registerSwipe();
      }
    }, { passive: false });
  }

  function nextReel(direction) {
    if (!cards.length) return;
    cards[state.currentReelIndex].className = direction > 0 ? 'reel-card prev' : 'reel-card next';
    state.currentReelIndex += direction;
    if (state.currentReelIndex >= cards.length) state.currentReelIndex = 0;
    if (state.currentReelIndex < 0) state.currentReelIndex = cards.length - 1;
    cards[state.currentReelIndex].className = 'reel-card current';
  }

  function registerSwipe() {
    state.swipeCount++;
    state.scrollSpeedPercent = Math.min(100, state.scrollSpeedPercent + 18);

    if (speedText) speedText.textContent = `${state.swipeCount} Swipes / 30s`;
    if (speedFill) {
      speedFill.style.width = `${state.scrollSpeedPercent}%`;
      if (state.scrollSpeedPercent >= 75) {
        speedFill.style.backgroundColor = '#EF4444';
      }
    }

    if (state.scrollSpeedPercent >= 85) {
      audio.playAlert();
      setTimeout(() => {
        openPauseModal("Fast scrolling detected!");
      }, 300);
    }
  }

  if (flickBtn) {
    flickBtn.addEventListener('click', () => {
      nextReel(1);
      registerSwipe();
    });
  }

  if (triggerBtn) {
    triggerBtn.addEventListener('click', () => {
      audio.playAlert();
      openPauseModal("10-minute continuous scroll limit reached!");
    });
  }
}

// =========================================================
// PAUSE MODAL (BREATH, INTENT, WORKOUT)
// =========================================================
function setupPauseModal() {
  const btnBreath = document.getElementById('tab-btn-breath');
  const btnIntent = document.getElementById('tab-btn-intent');
  const btnWorkout = document.getElementById('tab-btn-workout');

  if (btnBreath) btnBreath.addEventListener('click', () => setPauseTab('breath'));
  if (btnIntent) btnIntent.addEventListener('click', () => setPauseTab('intent'));
  if (btnWorkout) btnWorkout.addEventListener('click', () => setPauseTab('workout'));

  const intentInput = document.getElementById('intent-input');
  const actions = document.getElementById('pause-action-buttons');

  if (intentInput) {
    intentInput.addEventListener('input', (e) => {
      if (e.target.value.trim().length >= 3 && actions) {
        actions.style.opacity = '1';
        actions.style.pointerEvents = 'all';
      }
    });
  }

  document.querySelectorAll('.intent-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.getAttribute('data-text');
      if (intentInput) {
        intentInput.value = text;
        if (actions) {
          actions.style.opacity = '1';
          actions.style.pointerEvents = 'all';
        }
        audio.playChime();
      }
    });
  });

  const btnCloseApp = document.getElementById('btn-pause-close-app');
  const btnGoHabits = document.getElementById('btn-pause-go-habits');
  const btnSnooze = document.getElementById('btn-pause-snooze-3m');

  if (btnCloseApp) {
    btnCloseApp.addEventListener('click', () => {
      closePauseModal();
      audio.playChime();
      showToast("App closed. Sleep time protected! (+15m)");
      state.savedMins += 15;
      state.sessionsInterrupted += 1;
      updateStats();
      showScreen('screen-dashboard');
    });
  }

  if (btnGoHabits) {
    btnGoHabits.addEventListener('click', () => {
      closePauseModal();
      showScreen('screen-habits');
    });
  }

  if (btnSnooze) {
    btnSnooze.addEventListener('click', () => {
      alert("Notice: You received 3 extra minutes. The next pause will require a 20-second break.");
      closePauseModal();
      state.scrollSpeedPercent = 35;
      const speedFill = document.getElementById('hud-speed-fill');
      if (speedFill) {
        speedFill.style.width = '35%';
        speedFill.style.backgroundColor = '#10B981';
      }
    });
  }
}

function setPauseTab(tab) {
  state.pauseMode = tab;

  const btnBreath = document.getElementById('tab-btn-breath');
  const btnIntent = document.getElementById('tab-btn-intent');
  const btnWorkout = document.getElementById('tab-btn-workout');

  const panelBreath = document.getElementById('panel-breath');
  const panelIntent = document.getElementById('panel-intent');
  const panelWorkout = document.getElementById('panel-workout');

  [btnBreath, btnIntent, btnWorkout].forEach(b => b && b.classList.remove('active'));
  [panelBreath, panelIntent, panelWorkout].forEach(p => {
    if (p) {
      p.style.display = 'none';
      p.classList.remove('active');
    }
  });

  if (tab === 'breath') {
    if (btnBreath) btnBreath.classList.add('active');
    if (panelBreath) panelBreath.style.display = 'flex';
    stopCamera();
    startBreathCycle();
  } else if (tab === 'intent') {
    if (btnIntent) btnIntent.classList.add('active');
    if (panelIntent) {
      panelIntent.style.display = 'flex';
      panelIntent.classList.add('active');
    }
    stopCamera();
  } else if (tab === 'workout') {
    if (btnWorkout) btnWorkout.classList.add('active');
    if (panelWorkout) {
      panelWorkout.style.display = 'flex';
      panelWorkout.classList.add('active');
    }
    startCamera();
  }
}

function openPauseModal(msg) {
  const modal = document.getElementById('pause-modal');
  const subtitle = document.getElementById('pause-subtitle');
  if (subtitle && msg) subtitle.textContent = msg;
  if (modal) {
    modal.classList.add('active');
    setPauseTab(state.pauseMode || 'breath');
    audio.playChime();
  }
}

function closePauseModal() {
  const modal = document.getElementById('pause-modal');
  if (modal) {
    modal.classList.remove('active');
    stopBreathCycle();
    stopCamera();
    if (state.autoCountTimer) clearInterval(state.autoCountTimer);
  }
}

function startBreathCycle() {
  stopBreathCycle();
  state.breathTimerVal = 5;

  const countEl = document.getElementById('breath-count');
  const phaseEl = document.getElementById('breath-phase');
  const circleEl = document.getElementById('breath-circle');
  const actions = document.getElementById('pause-action-buttons');

  if (actions) {
    actions.style.opacity = '0.4';
    actions.style.pointerEvents = 'none';
  }

  if (circleEl) circleEl.classList.add('inhale');
  if (phaseEl) phaseEl.textContent = 'Breathe in slowly...';
  if (countEl) countEl.textContent = '5s';

  state.breathInterval = setInterval(() => {
    state.breathTimerVal--;
    if (countEl) countEl.textContent = `${state.breathTimerVal}s`;

    if (state.breathTimerVal === 3) {
      if (phaseEl) phaseEl.textContent = 'Hold...';
    } else if (state.breathTimerVal === 1) {
      if (phaseEl) phaseEl.textContent = 'Breathe out...';
      if (circleEl) circleEl.classList.remove('inhale');
    }

    if (state.breathTimerVal <= 0) {
      clearInterval(state.breathInterval);
      if (countEl) countEl.textContent = 'OK';
      if (phaseEl) phaseEl.textContent = 'Focus restored';
      if (actions) {
        actions.style.opacity = '1';
        actions.style.pointerEvents = 'all';
      }
      audio.playChime();
    }
  }, 1000);
}

function stopBreathCycle() {
  if (state.breathInterval) clearInterval(state.breathInterval);
  const countEl = document.getElementById('breath-count');
  const phaseEl = document.getElementById('breath-phase');
  const circleEl = document.getElementById('breath-circle');

  if (countEl) countEl.textContent = '5s';
  if (phaseEl) phaseEl.textContent = 'Take a breath';
  if (circleEl) circleEl.classList.remove('inhale');
}

// =========================================================
// PHYSICAL WORKOUT & CAMERA CHECKPOINT
// =========================================================
function setupWorkoutCamera() {
  const btnRep = document.getElementById('btn-count-rep');
  const btnAuto = document.getElementById('btn-auto-reps');
  const btnPhoto = document.getElementById('btn-snap-photo');
  const repBadge = document.getElementById('workout-rep-count');
  const taskTitle = document.getElementById('workout-task-title');
  const frameIconWrap = document.getElementById('posture-icon-wrap');

  const exerciseIcons = {
    'squats': '<svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="4" r="2"/><path d="M15 8h-6l-2 5 3 2v6h2v-5l2-2 3 1v-3z"/></svg>',
    'jacks': '<svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6.5 6.5l11 11M6 20v-4M4 18h4M18 4v4M16 6h4M3 8l3-3M18 21l3-3M8 3l-3 3M21 16l-3 3"/></svg>',
    'desk': '<svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 3l3 3-10 10-3-3z"/><path d="M11 13l-4 4-2-2 4-4"/><path d="M3 21h4l2-2-4-4z"/></svg>',
    'water': '<svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>'
  };

  document.querySelectorAll('.exercise-btn[data-ex]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.exercise-btn[data-ex]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const ex = btn.getAttribute('data-ex');
      state.currentExercise = ex;
      state.repCount = 0;

      const banner = document.getElementById('verification-banner');
      if (banner) banner.classList.remove('active');

      if (frameIconWrap && exerciseIcons[ex]) {
        frameIconWrap.innerHTML = exerciseIcons[ex];
      }

      if (ex === 'squats') {
        state.targetReps = 5;
        if (taskTitle) taskTitle.textContent = "Task: 5 Squats";
        if (repBadge) repBadge.textContent = "0 / 5";
      } else if (ex === 'jacks') {
        state.targetReps = 10;
        if (taskTitle) taskTitle.textContent = "Task: 10 Jumping Jacks";
        if (repBadge) repBadge.textContent = "0 / 10";
      } else if (ex === 'desk') {
        state.targetReps = 1;
        if (taskTitle) taskTitle.textContent = "Task: Tidy Desk Photo";
        if (repBadge) repBadge.textContent = "Take Photo";
      } else if (ex === 'water') {
        state.targetReps = 1;
        if (taskTitle) taskTitle.textContent = "Task: Drink Water";
        if (repBadge) repBadge.textContent = "Hydrate & Verify";
      }
    });
  });

  if (btnRep) {
    btnRep.addEventListener('click', () => {
      recordSingleRep();
    });
  }

  if (btnAuto) {
    btnAuto.addEventListener('click', () => {
      autoCountReps();
    });
  }

  if (btnPhoto) {
    btnPhoto.addEventListener('click', () => {
      audio.playSuccess();
      completeWorkoutSuccess("Photo registered and verified!");
    });
  }
}

function recordSingleRep() {
  const repBadge = document.getElementById('workout-rep-count');
  const frame = document.getElementById('posture-frame');

  if (state.repCount < state.targetReps) {
    state.repCount++;
    audio.playSuccess();
    if (repBadge) repBadge.textContent = `${state.repCount} / ${state.targetReps}`;

    if (frame) {
      frame.classList.add('pulse');
      setTimeout(() => frame.classList.remove('pulse'), 250);
    }

    if (state.repCount >= state.targetReps) {
      completeWorkoutSuccess("Workout completed!");
    }
  }
}

function autoCountReps() {
  if (state.autoCountTimer) clearInterval(state.autoCountTimer);
  state.repCount = 0;
  const repBadge = document.getElementById('workout-rep-count');
  if (repBadge) repBadge.textContent = `0 / ${state.targetReps}`;

  state.autoCountTimer = setInterval(() => {
    recordSingleRep();
    if (state.repCount >= state.targetReps) {
      clearInterval(state.autoCountTimer);
    }
  }, 700);
}

function completeWorkoutSuccess(msg) {
  audio.playChime();
  const banner = document.getElementById('verification-banner');
  const actions = document.getElementById('pause-action-buttons');

  if (banner) banner.classList.add('active');
  if (actions) {
    actions.style.opacity = '1';
    actions.style.pointerEvents = 'all';
  }
  showToast(msg);
  logActivity(state.currentExercise);
}

function startCamera() {
  const video = document.getElementById('camera-video');
  const simBg = document.getElementById('camera-sim-bg');
  const status = document.getElementById('cam-status');

  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
      .then(stream => {
        state.cameraStream = stream;
        if (video) {
          video.srcObject = stream;
          video.style.display = 'block';
        }
        if (simBg) simBg.style.display = 'none';
        if (status) status.textContent = "Camera: Active";
      })
      .catch(() => {
        if (video) video.style.display = 'none';
        if (simBg) simBg.style.display = 'block';
        if (status) status.textContent = "Motion Mode: Ready";
      });
  } else {
    if (video) video.style.display = 'none';
    if (simBg) simBg.style.display = 'block';
    if (status) status.textContent = "Motion Mode: Ready";
  }
}

function stopCamera() {
  if (state.cameraStream) {
    state.cameraStream.getTracks().forEach(track => track.stop());
    state.cameraStream = null;
  }
}

function logActivity(name) {
  const list = document.getElementById('activity-log-list');
  if (list) {
    const item = document.createElement('div');
    item.className = 'activity-item';
    item.innerHTML = `
      <div class="activity-left">
        <div class="activity-icon-box" style="background:#10B981; color:#022c22;">
          <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="12" cy="4" r="2"/><path d="M15 8h-6l-2 5 3 2v6h2v-5l2-2 3 1v-3z"/></svg>
        </div>
        <div class="activity-text">
          <h5>${name.toUpperCase()} Completed</h5>
          <p>Verified with motion sensor &bull; Pause cleared</p>
        </div>
      </div>
      <span class="time-saved-badge">+20m saved</span>
    `;
    list.prepend(item);
  }
}

// =========================================================
// IN-APP SIMULATED MODALS (KINDLE, NOTION, BREATHWORK, SLEEP)
// =========================================================
function setupSimulatedAppModals() {
  document.querySelectorAll('.habit-card[data-sim]').forEach(card => {
    card.addEventListener('click', () => {
      const modalId = card.getAttribute('data-sim');
      if (modalId) openSimModal(modalId);
    });
  });

  document.querySelectorAll('.btn-close-sim').forEach(btn => {
    btn.addEventListener('click', () => {
      closeSimModals();
    });
  });
}

function openSimModal(id) {
  closeSimModals();
  const target = document.getElementById(id);
  if (target) {
    target.classList.add('active');
    audio.playChime();
  }
}

function closeSimModals() {
  document.querySelectorAll('.sim-modal').forEach(m => m.classList.remove('active'));
}

// =========================================================
// SETTINGS
// =========================================================
function setupSettings() {
  const slider = document.getElementById('setting-scroll-slider');
  const label = document.getElementById('slider-val-label');
  const soundToggle = document.getElementById('setting-sound-toggle');

  if (slider && label) {
    slider.addEventListener('input', (e) => {
      label.textContent = `${e.target.value} min`;
    });
  }

  if (soundToggle) {
    soundToggle.addEventListener('change', (e) => {
      audio.enabled = e.target.checked;
      const audioText = document.getElementById('audio-btn-text');
      if (audioText) audioText.textContent = audio.enabled ? "Sound ON" : "Sound OFF";
    });
  }

  const uninstallRow = document.getElementById('setting-uninstall-row');
  const adminModal = document.getElementById('admin-protection-modal');
  const btnCloseAdmin = document.getElementById('btn-close-admin');

  if (uninstallRow && adminModal) {
    uninstallRow.addEventListener('click', () => {
      adminModal.classList.add('open');
      audio.playChime();
    });
  }

  if (btnCloseAdmin && adminModal) {
    btnCloseAdmin.addEventListener('click', () => {
      adminModal.classList.remove('open');
    });
  }

  if (adminModal) {
    adminModal.addEventListener('click', (e) => {
      if (e.target === adminModal) adminModal.classList.remove('open');
    });
  }

  const strictRow = document.getElementById('setting-strict-row');
  if (strictRow) {
    strictRow.addEventListener('click', () => {
      audio.playChime();
      showToast("Strict Task Lockout is permanently active (zero bypass)");
    });
  }
}

// =========================================================
// CLOCK & STATS
// =========================================================
function setupClock() {
  const phoneClock = document.getElementById('phone-clock');
  const sleepClock = document.getElementById('sleep-clock-digits');

  function update() {
    const d = new Date();
    let h = d.getHours();
    let m = d.getMinutes();
    const str = `${h < 10 ? '0' + h : h}:${m < 10 ? '0' + m : m}`;
    if (phoneClock) phoneClock.textContent = str;
    if (sleepClock) sleepClock.textContent = str;
  }
  update();
  setInterval(update, 10000);
}

function updateStats() {
  const h = Math.floor(state.savedMins / 60);
  const m = state.savedMins % 60;
  const timeSavedEl = document.getElementById('stats-time-saved');
  const loopsEl = document.getElementById('stat-loops-interrupted');

  if (timeSavedEl) timeSavedEl.innerHTML = `${h}h ${m}m <small>Saved</small>`;
  if (loopsEl) loopsEl.textContent = `${state.sessionsInterrupted}`;
}

function showToast(msg) {
  const toast = document.getElementById('app-toast');
  const text = document.getElementById('toast-text');
  if (toast && text) {
    text.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }
}

// =========================================================
// ABOUT PROJECT MODAL
// =========================================================
function setupAboutModal() {
  const openBtn = document.getElementById('btn-open-about');
  const closeBtn = document.getElementById('btn-close-about');
  const modal = document.getElementById('about-project-modal');

  if (openBtn && modal) {
    openBtn.addEventListener('click', () => {
      modal.classList.add('open');
    });
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('open');
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('open');
    });
  }
}

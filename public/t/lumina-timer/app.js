// LuminaTimer - Core Application Logic

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements - Global
  const body = document.body;
  const tabs = document.querySelectorAll('.tab-btn');
  const panelStopwatch = document.getElementById('panel-stopwatch');
  const panelTimer = document.getElementById('panel-timer');
  const panelPomodoro = document.getElementById('panel-pomodoro');
  
  const timerSubText = document.getElementById('timer-sub-text');
  const timerDigits = document.getElementById('timer-digits');
  const pomoDotsContainer = document.getElementById('pomo-dots');
  const circleFill = document.querySelector('.progress-ring-fill');
  
  const primaryBtn = document.getElementById('primary-btn');
  const resetBtn = document.getElementById('reset-btn');
  const lapBtn = document.getElementById('lap-btn');
  
  const soundToggleBtn = document.getElementById('sound-toggle-btn');
  const soundOnIcon = document.getElementById('sound-on-icon');
  const soundOffIcon = document.getElementById('sound-off-icon');
  const fullscreenToggleBtn = document.getElementById('fullscreen-toggle-btn');
  const fullscreenEnter = document.getElementById('fullscreen-enter');
  const fullscreenExit = document.getElementById('fullscreen-exit');

  // DOM Elements - Stopwatch Panel
  const clearLapsBtn = document.getElementById('clear-laps-btn');
  const lapEmptyState = document.getElementById('lap-empty');
  const lapTable = document.getElementById('lap-table');
  const lapList = document.getElementById('lap-list');

  // DOM Elements - Timer Panel
  const inputHours = document.getElementById('input-hours');
  const inputMinutes = document.getElementById('input-minutes');
  const inputSeconds = document.getElementById('input-seconds');
  const soundSelect = document.getElementById('timer-sound');
  const presetChips = document.querySelectorAll('.chip');

  // DOM Elements - Pomodoro Panel
  const pomoModeBtns = document.querySelectorAll('.pomo-mode-btn');
  const addTaskForm = document.getElementById('add-task-form');
  const newTaskInput = document.getElementById('new-task-input');
  const tasksEmptyState = document.getElementById('tasks-empty');
  const tasksList = document.getElementById('tasks-list');
  const pomoTaskCount = document.getElementById('pomo-task-count');

  // Core App State
  let currentMode = 'stopwatch'; // 'stopwatch', 'timer', 'pomodoro'
  let isRunning = false;
  let isMuted = false;
  
  // Timing Variables
  let startTime = 0;
  let elapsedBeforePause = 0;
  let timerInterval = null;
  let countdownTotalSeconds = 0;
  let countdownRemainingSeconds = 0;

  // Stopwatch States
  let laps = []; // Array of lap durations
  
  // Pomodoro States
  let pomoSession = 'work'; // 'work', 'short-break', 'long-break'
  let pomoCycleCount = 0; // Completed work sessions
  const pomoDurations = {
    'work': 25 * 60,
    'short-break': 5 * 60,
    'long-break': 15 * 60
  };
  let pomoTasks = [];

  // SVG Circumference Calculation
  const circleRadius = 150;
  const circumference = 2 * Math.PI * circleRadius;
  circleFill.style.strokeDasharray = `${circumference} ${circumference}`;
  circleFill.style.strokeDashoffset = circumference;

  // Initialize
  updateDisplay();
  loadTasks();

  // --- TAB ROUTING ---
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const mode = tab.dataset.mode;
      if (mode === currentMode) return;
      
      // Stop running timers
      stopAllTimers();
      
      // Update Tab Selection UI
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Hide all panels, show active
      panelStopwatch.classList.add('hidden');
      panelTimer.classList.add('hidden');
      panelPomodoro.classList.add('hidden');
      
      if (mode === 'stopwatch') {
        panelStopwatch.classList.remove('hidden');
        lapBtn.classList.remove('hidden');
        pomoDotsContainer.classList.add('hidden');
        body.className = 'mode-stopwatch';
      } else if (mode === 'timer') {
        panelTimer.classList.remove('hidden');
        lapBtn.classList.add('hidden');
        pomoDotsContainer.classList.add('hidden');
        body.className = 'mode-timer';
      } else if (mode === 'pomodoro') {
        panelPomodoro.classList.remove('hidden');
        lapBtn.classList.add('hidden');
        pomoDotsContainer.classList.remove('hidden');
        updatePomoTheme();
      }
      
      currentMode = mode;
      resetTimerState();
    });
  });

  // --- GLOBAL BUTTON EVENT LISTENERS ---
  primaryBtn.addEventListener('click', () => {
    if (isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  });

  resetBtn.addEventListener('click', () => {
    resetTimerState();
  });

  lapBtn.addEventListener('click', () => {
    recordLap();
  });

  soundToggleBtn.addEventListener('click', () => {
    isMuted = !isMuted;
    soundOnIcon.classList.toggle('hidden', isMuted);
    soundOffIcon.classList.toggle('hidden', !isMuted);
  });

  fullscreenToggleBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  });

  document.addEventListener('fullscreenchange', () => {
    const isFullscreen = !!document.fullscreenElement;
    body.classList.toggle('fullscreen', isFullscreen);
    fullscreenEnter.classList.toggle('hidden', isFullscreen);
    fullscreenExit.classList.toggle('hidden', !isFullscreen);
  });

  // --- AUDIO SYNTHESIZER (WEB AUDIO API) ---
  function playAlarmSound() {
    if (isMuted) return;
    
    // Create audio context
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    const soundType = currentMode === 'pomodoro' ? 'chime' : soundSelect.value;
    
    if (soundType === 'digital') {
      // Digital Beeps
      const playBeep = (delay, freq = 880, duration = 0.1) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.15, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + duration);
      };
      playBeep(0);
      playBeep(0.2);
      playBeep(0.4);
    } 
    else if (soundType === 'chime') {
      // Modern Chime
      const now = ctx.currentTime;
      const playTone = (freq, delay, vol = 0.15) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(vol, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 1.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 1.3);
      };
      // G Major chord cascade
      playTone(392.00, 0);       // G4
      playTone(493.88, 0.15);    // B4
      playTone(587.33, 0.3);     // D5
      playTone(783.99, 0.45, 0.1); // G5
    } 
    else if (soundType === 'bells') {
      // Gentle Bells
      const now = ctx.currentTime;
      const playBell = (freq, duration) => {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc1.type = 'sine';
        osc1.frequency.value = freq;
        
        // Ring modulator/bell harmony
        osc2.type = 'triangle';
        osc2.frequency.value = freq * 1.5;
        
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.linearRampToValueAtTime(0.06, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + duration);
        osc2.stop(now + duration);
      };
      playBell(523.25, 2.5); // C5 bell
      setTimeout(() => {
        if (!isMuted && ctx.state !== 'closed') playBell(659.25, 2.0); // E5 bell
      }, 300);
    } 
    else if (soundType === 'tibet') {
      // Tibetan Singing Bowl
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const oscMod = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = 160; // Deep tone
      
      oscMod.type = 'sine';
      oscMod.frequency.value = 161.5; // Slight detune for bowl vibration warmth
      
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 3.5);
      
      osc.connect(gain);
      oscMod.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now);
      oscMod.start(now);
      osc.stop(now + 4);
      oscMod.stop(now + 4);
    }
  }

  // --- TIMING ENGINE & CORE METHODS ---

  function startTimer() {
    if (isRunning) return;
    
    isRunning = true;
    primaryBtn.textContent = 'Pause';
    primaryBtn.className = 'btn btn-gradient btn-pause';
    resetBtn.disabled = false;
    
    startTime = performance.now() - elapsedBeforePause;
    
    // Set circle offset defaults
    if (currentMode === 'timer' && elapsedBeforePause === 0) {
      const h = parseInt(inputHours.value) || 0;
      const m = parseInt(inputMinutes.value) || 0;
      const s = parseInt(inputSeconds.value) || 0;
      countdownTotalSeconds = (h * 3600) + (m * 60) + s;
      if (countdownTotalSeconds <= 0) {
        countdownTotalSeconds = 300; // Fallback 5 mins
      }
      countdownRemainingSeconds = countdownTotalSeconds;
    } else if (currentMode === 'pomodoro' && elapsedBeforePause === 0) {
      countdownTotalSeconds = pomoDurations[pomoSession];
      countdownRemainingSeconds = countdownTotalSeconds;
    }
    
    timerInterval = requestAnimationFrame(tick);
  }

  function pauseTimer() {
    if (!isRunning) return;
    
    isRunning = false;
    primaryBtn.textContent = 'Resume';
    primaryBtn.className = 'btn btn-gradient btn-play';
    cancelAnimationFrame(timerInterval);
  }

  function tick(timestamp) {
    const elapsed = timestamp - startTime;
    
    if (currentMode === 'stopwatch') {
      updateStopwatchDisplay(elapsed);
      timerInterval = requestAnimationFrame(tick);
    } 
    else if (currentMode === 'timer' || currentMode === 'pomodoro') {
      const elapsedSeconds = elapsed / 1000;
      const remaining = Math.max(0, countdownTotalSeconds - elapsedSeconds);
      countdownRemainingSeconds = remaining;
      
      updateCountdownDisplay(remaining);
      
      if (remaining <= 0) {
        // Complete!
        pauseTimer();
        playAlarmSound();
        handleTimerCompletion();
      } else {
        timerInterval = requestAnimationFrame(tick);
      }
    }
  }

  function resetTimerState() {
    stopAllTimers();
    isRunning = false;
    elapsedBeforePause = 0;
    
    primaryBtn.textContent = 'Start';
    primaryBtn.className = 'btn btn-gradient btn-play';
    resetBtn.disabled = true;
    
    if (currentMode === 'stopwatch') {
      laps = [];
      renderLaps();
    }
    
    updateDisplay();
  }

  function stopAllTimers() {
    isRunning = false;
    cancelAnimationFrame(timerInterval);
    if (timerInterval) {
      elapsedBeforePause = performance.now() - startTime;
    }
  }

  function handleTimerCompletion() {
    elapsedBeforePause = 0;
    primaryBtn.textContent = 'Start';
    primaryBtn.className = 'btn btn-gradient btn-play';
    resetBtn.disabled = true;
    
    if (currentMode === 'timer') {
      timerSubText.textContent = 'TIMES UP';
      timerDigits.innerHTML = '00:00<span class="millis">.00</span>';
      circleFill.style.strokeDashoffset = circumference;
    } 
    else if (currentMode === 'pomodoro') {
      if (pomoSession === 'work') {
        pomoCycleCount++;
        alert('Focus session complete! Time for a break.');
        // Go to break
        if (pomoCycleCount % 4 === 0) {
          setPomoSession('long-break');
        } else {
          setPomoSession('short-break');
        }
      } else {
        alert('Break session complete! Back to focus.');
        setPomoSession('work');
      }
    }
  }

  // --- DISPLAY UPDATING ---

  function updateDisplay() {
    if (currentMode === 'stopwatch') {
      timerSubText.textContent = 'STOPWATCH';
      timerDigits.innerHTML = '00:00<span class="millis">.00</span>';
      circleFill.style.strokeDashoffset = circumference; // static circle
    } 
    else if (currentMode === 'timer') {
      timerSubText.textContent = 'COUNTDOWN';
      const h = parseInt(inputHours.value) || 0;
      const m = parseInt(inputMinutes.value) || 0;
      const s = parseInt(inputSeconds.value) || 0;
      const formatted = formatTimeDigits((h * 3600) + (m * 60) + s, false);
      timerDigits.innerHTML = `${formatted.digits}<span class="millis">${formatted.millis}</span>`;
      circleFill.style.strokeDashoffset = 0; // full circle
    } 
    else if (currentMode === 'pomodoro') {
      setPomoSession(pomoSession, false); // Reload duration
    }
  }

  function updateStopwatchDisplay(elapsedMs) {
    const totalSeconds = elapsedMs / 1000;
    const formatted = formatTimeDigits(totalSeconds, true);
    timerDigits.innerHTML = `${formatted.digits}<span class="millis">${formatted.millis}</span>`;
  }

  function updateCountdownDisplay(remainingSeconds) {
    const formatted = formatTimeDigits(remainingSeconds, false);
    timerDigits.innerHTML = `${formatted.digits}<span class="millis">${formatted.millis}</span>`;
    
    // Update SVG progress offset
    const progressRatio = remainingSeconds / countdownTotalSeconds;
    const offset = circumference * (1 - progressRatio);
    circleFill.style.strokeDashoffset = offset;
  }

  function formatTimeDigits(totalSeconds, includeMillis = false) {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = Math.floor(totalSeconds % 60);
    
    let digits = '';
    if (hrs > 0) {
      digits += `${String(hrs).padStart(2, '0')}:`;
    }
    digits += `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    
    let millis = '';
    if (includeMillis) {
      const ms = Math.floor((totalSeconds % 1) * 100);
      millis = `.${String(ms).padStart(2, '0')}`;
    }
    
    return { digits, millis };
  }

  // --- STOPWATCH LAP HISTORY MANAGEMENT ---

  function recordLap() {
    if (!isRunning && elapsedBeforePause === 0) return;
    
    const totalElapsed = isRunning ? (performance.now() - startTime) : elapsedBeforePause;
    
    let lapTime = totalElapsed;
    if (laps.length > 0) {
      const previousTotal = laps.reduce((sum, val) => sum + val, 0);
      lapTime = totalElapsed - previousTotal;
    }
    
    laps.push(lapTime);
    renderLaps();
  }

  function renderLaps() {
    lapList.innerHTML = '';
    
    if (laps.length === 0) {
      lapEmptyState.classList.remove('hidden');
      lapTable.classList.add('hidden');
      clearLapsBtn.classList.add('hidden');
      return;
    }
    
    lapEmptyState.classList.add('hidden');
    lapTable.classList.remove('hidden');
    clearLapsBtn.classList.remove('hidden');
    
    // Determine fastest/slowest lap indexes (only when we have at least 2 laps)
    let fastestIdx = -1;
    let slowestIdx = -1;
    if (laps.length > 1) {
      let minVal = Infinity;
      let maxVal = -Infinity;
      laps.forEach((val, idx) => {
        if (val < minVal) {
          minVal = val;
          fastestIdx = idx;
        }
        if (val > maxVal) {
          maxVal = val;
          slowestIdx = idx;
        }
      });
    }
    
    let runningSum = 0;
    
    // Loop in reverse to show newest laps on top
    for (let i = laps.length - 1; i >= 0; i--) {
      const lapVal = laps[i];
      
      // Calculate total elapsed up to this lap
      let totalElapsedUpToThis = 0;
      for (let j = 0; j <= i; j++) {
        totalElapsedUpToThis += laps[j];
      }
      
      const row = document.createElement('tr');
      row.className = 'lap-row';
      if (i === fastestIdx) row.classList.add('fastest');
      if (i === slowestIdx) row.classList.add('slowest');
      
      const formattedLap = formatTimeDigits(lapVal / 1000, true);
      const formattedTotal = formatTimeDigits(totalElapsedUpToThis / 1000, true);
      
      row.innerHTML = `
        <td>Lap ${i + 1}${i === fastestIdx ? ' ⚡' : ''}${i === slowestIdx ? ' 🐢' : ''}</td>
        <td>${formattedLap.digits}${formattedLap.millis}</td>
        <td>${formattedTotal.digits}${formattedTotal.millis}</td>
      `;
      
      lapList.appendChild(row);
    }
  }

  clearLapsBtn.addEventListener('click', () => {
    laps = [];
    renderLaps();
  });

  // --- COUNTDOWN PRESETS & INPUTS ---

  // Update preset time chips
  presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      stopAllTimers();
      const seconds = parseInt(chip.dataset.time);
      countdownTotalSeconds = seconds;
      countdownRemainingSeconds = seconds;
      
      // Fill values back into inputs
      const hrs = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      
      inputHours.value = hrs;
      inputMinutes.value = mins;
      inputSeconds.value = secs;
      
      resetTimerState();
    });
  });

  // Sync manual input values on change
  [inputHours, inputMinutes, inputSeconds].forEach(input => {
    input.addEventListener('change', () => {
      // Clamp inputs within thresholds
      if (input === inputHours) input.value = Math.max(0, Math.min(99, parseInt(input.value) || 0));
      if (input === inputMinutes) input.value = Math.max(0, Math.min(59, parseInt(input.value) || 0));
      if (input === inputSeconds) input.value = Math.max(0, Math.min(59, parseInt(input.value) || 0));
      
      if (!isRunning && elapsedBeforePause === 0) {
        updateDisplay();
      }
    });
  });

  // --- POMODORO SESSION MANAGEMENT ---

  pomoModeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.pomoMode;
      setPomoSession(mode);
    });
  });

  function setPomoSession(session, reset = true) {
    pomoSession = session;
    
    // Update Active Buttons
    pomoModeBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.pomoMode === session);
    });
    
    // Shift display text
    if (session === 'work') {
      timerSubText.textContent = 'FOCUS SESSION';
    } else if (session === 'short-break') {
      timerSubText.textContent = 'SHORT BREAK';
    } else if (session === 'long-break') {
      timerSubText.textContent = 'LONG BREAK';
    }
    
    updatePomoTheme();
    
    countdownTotalSeconds = pomoDurations[session];
    countdownRemainingSeconds = countdownTotalSeconds;
    
    if (reset) {
      resetTimerState();
    } else {
      const formatted = formatTimeDigits(countdownTotalSeconds, false);
      timerDigits.innerHTML = `${formatted.digits}<span class="millis">${formatted.millis}</span>`;
      circleFill.style.strokeDashoffset = 0;
    }
    
    renderPomoCycles();
  }

  function updatePomoTheme() {
    if (pomoSession === 'work') {
      body.className = 'mode-pomo-work';
    } else if (pomoSession === 'short-break') {
      body.className = 'mode-pomo-short';
    } else if (pomoSession === 'long-break') {
      body.className = 'mode-pomo-long';
    }
  }

  function renderPomoCycles() {
    pomoDotsContainer.innerHTML = '';
    // Show 4 dots to represent cycle sets
    for (let i = 0; i < 4; i++) {
      const dot = document.createElement('span');
      dot.className = 'pomo-dot';
      // Fill dots based on cycle sets modulo 4
      const activeDotsCount = pomoCycleCount % 4;
      if (i < activeDotsCount || (pomoCycleCount > 0 && activeDotsCount === 0)) {
        dot.classList.add('active');
      }
      pomoDotsContainer.appendChild(dot);
    }
  }

  // --- POMODORO TASKS MANAGEMENT ---

  addTaskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = newTaskInput.value.trim();
    if (!text) return;
    
    const task = {
      id: Date.now().toString(),
      text: text,
      completed: false
    };
    
    pomoTasks.push(task);
    saveTasks();
    renderTasks();
    newTaskInput.value = '';
    newTaskInput.focus();
  });

  function renderTasks() {
    tasksList.innerHTML = '';
    
    if (pomoTasks.length === 0) {
      tasksEmptyState.classList.remove('hidden');
      return;
    }
    
    tasksEmptyState.classList.add('hidden');
    
    let completedCount = 0;
    
    pomoTasks.forEach(task => {
      if (task.completed) completedCount++;
      
      const li = document.createElement('li');
      li.className = 'task-item';
      
      li.innerHTML = `
        <div class="task-item-left">
          <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} aria-label="Mark task complete">
          <span class="task-text">${task.text}</span>
        </div>
        <button class="task-btn-delete" aria-label="Delete Task">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      `;
      
      // Checkbox event
      const checkbox = li.querySelector('.task-checkbox');
      checkbox.addEventListener('change', () => {
        task.completed = checkbox.checked;
        saveTasks();
        renderTasks();
      });
      
      // Delete button event
      const deleteBtn = li.querySelector('.task-btn-delete');
      deleteBtn.addEventListener('click', () => {
        pomoTasks = pomoTasks.filter(t => t.id !== task.id);
        saveTasks();
        renderTasks();
      });
      
      tasksList.appendChild(li);
    });
    
    pomoTaskCount.textContent = `${completedCount} completed`;
  }

  function saveTasks() {
    localStorage.setItem('lumina_timer_tasks', JSON.stringify(pomoTasks));
  }

  function loadTasks() {
    const raw = localStorage.getItem('lumina_timer_tasks');
    if (raw) {
      try {
        pomoTasks = JSON.parse(raw);
        renderTasks();
      } catch (err) {
        pomoTasks = [];
      }
    }
  }

  // Shutdown App Button
  const shutdownBtn = document.getElementById('shutdown-btn');
  if (shutdownBtn) {
    shutdownBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to exit LuminaTimer?')) {
        stopAllTimers();
        document.body.innerHTML = `
          <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; font-family:'Outfit',sans-serif; text-align:center; color:hsl(256, 15%, 70%); background:hsl(256, 45%, 5%); padding: 2rem;">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="64" height="64" style="color:hsl(0, 85%, 60%); margin-bottom:1.5rem;">
              <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
              <line x1="12" y1="2" x2="12" y2="12"></line>
            </svg>
            <h1 style="color:#fff; font-size:2.5rem; margin-bottom:0.5rem; font-weight:700;">LuminaTimer Closed</h1>
            <p style="font-size:1.1rem;">Your focus session has ended. You can safely close this window.</p>
          </div>
        `;
        window.close();
      }
    });
  }
});

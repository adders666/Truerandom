// ============================================================================
// MAIN APPLICATION CONTROLLER
// Manages UI Screens, Matrix Background, Canvas Oscilloscopes,
// Hollywood Telemetry Logs, Odometer Animations, and Tournament Flow.
// ============================================================================

(function() {
    // --- State Variables ---
    let activeScreen = "screen-setup";
    let speedMode = "cinematic"; // "cinematic" or "warp"
    let ruleMode = "SURVIVOR_WINS"; // "SURVIVOR_WINS" or "SACRIFICE_FIRST"
    let autoPlay = false;
    let autoPlayTimer = null;
    let isRolling = false;
    let currentSpeedLevel = 2; // 1: Cinematic, 2: Standard, 3: Rapid, 4: Turbo, 5: Ludicrous

    const SPEED_CONFIGS = {
        1: {
            label: "1x Cinematic",
            animDuration: 900,
            autoDelay: 500,
            elimDelay: 2000,
            fastCeremony: false
        },
        2: {
            label: "2x Standard",
            animDuration: 350,
            autoDelay: 200,
            elimDelay: 1200,
            fastCeremony: false
        },
        3: {
            label: "5x Rapid",
            animDuration: 120,
            autoDelay: 60,
            elimDelay: 700,
            fastCeremony: true
        },
        4: {
            label: "10x Turbo",
            animDuration: 45,
            autoDelay: 25,
            elimDelay: 400,
            fastCeremony: true
        },
        5: {
            label: "25x Ludicrous",
            animDuration: 15,
            autoDelay: 12,
            elimDelay: 250,
            fastCeremony: true
        }
    };

    let tournament = null;
    let currentCeremony = null;
    let totalRollsCount = 0;

    // Default Targets Setup
    let targets = [
        { name: "Pizza", avatar: "🍕", color: window.getPlayerColor(0) },
        { name: "Chinese", avatar: "🥡", color: window.getPlayerColor(1) },
        { name: "Burgers", avatar: "🍔", color: window.getPlayerColor(2) },
        { name: "Indian Curry", avatar: "🍛", color: window.getPlayerColor(3) }
    ];

    // Presets Database
    const PRESETS = {
        takeaway: {
            title: "Friday Takeaway Protocol",
            rule: "SURVIVOR_WINS",
            items: [
                { name: "Pizza", avatar: "🍕" },
                { name: "Chinese", avatar: "🥡" },
                { name: "Burgers", avatar: "🍔" },
                { name: "Indian Curry", avatar: "🍛" },
                { name: "Thai", avatar: "🍜" },
                { name: "Sushi", avatar: "🍣" },
                { name: "Kebabs", avatar: "🥙" }
            ]
        },
        coffee: {
            title: "Morning Coffee Allocation",
            rule: "SACRIFICE_FIRST",
            items: [
                { name: "Mom", avatar: "👩" },
                { name: "Dad", avatar: "👨" },
                { name: "Teenager", avatar: "🎧" },
                { name: "Guest", avatar: "☕" }
            ]
        },
        dishes: {
            title: "Dish Duty Elimination Defense",
            rule: "SACRIFICE_FIRST",
            items: [
                { name: "Child 1", avatar: "🧒" },
                { name: "Child 2", avatar: "👧" },
                { name: "Child 3", avatar: "👦" }
            ]
        },
        movie: {
            title: "Movie Night Genre Selection",
            rule: "SURVIVOR_WINS",
            items: [
                { name: "Sci-Fi Cyberpunk", avatar: "🛸" },
                { name: "Psychological Horror", avatar: "👻" },
                { name: "Action Thriller", avatar: "💥" },
                { name: "Comedy", avatar: "🍿" },
                { name: "Animation", avatar: "🎨" }
            ]
        },
        first: {
            title: "Boardgame First Turn Initiative",
            rule: "SURVIVOR_WINS",
            items: [
                { name: "Player 1", avatar: "⚔️" },
                { name: "Player 2", avatar: "🛡️" },
                { name: "Player 3", avatar: "🏹" },
                { name: "Player 4", avatar: "🧙" }
            ]
        },
        custom: {
            title: "Custom Decision Protocol",
            rule: "SURVIVOR_WINS",
            items: [
                { name: "Option Alpha", avatar: "🎯" },
                { name: "Option Beta", avatar: "⚡" }
            ]
        }
    };

    // Telemetry Hacker Log Lines
    const TELEMETRY_LINES = [
        "ACQUIRING CASIMIR VACUUM BEAM AT FREQ 4.29 GHz...",
        "SAMPLING PLANCK SATELLITE 2.7255K THERMAL MICRO-NOISE...",
        "C-14 POISSON IONIZATION TIMING JITTER VERIFIED...",
        "SCHUMANN 7.83Hz ATMOSPHERIC VLF STATIC BUFFERED...",
        "CORONAL MASS EJECTION SOLAR WIND DYNAMICS STABLE...",
        "JOHNSON-NYQUIST RESISTOR BROWNIAN CURRENT ENCODED...",
        "LIGO INTERFEROMETER LASER METRIC PHASE LOCKED...",
        "PSR B1919+21 PULSAR TIMING PULSE NORMALIZED...",
        "LORENZ STRANGE ATTRACTOR TRAJECTORY EVALUATED...",
        "CPU TIME DRIFT CSPRNG ENTROPY POOL COLLATED...",
        "AVOIDING PSEUDO-RANDOM SEED REPETITIONS...",
        "DEATH-ROLL DOWN-SAMPLING TO 3-DIGIT MONOLITHS..."
    ];

    // ========================================================================
    // MATRIX RAIN CANVAS BACKGROUND
    // ========================================================================
    function initMatrixBg() {
        const canvas = document.getElementById("matrix-bg");
        if (!canvas) return;
        const ctx = canvas.getContext("2d");

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener("resize", resize);

        const chars = "0123456789ABCDEFｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜΩΔΣΨλπ√∞≈≠";
        const fontSize = 14;
        let columns = Math.floor(canvas.width / fontSize);
        let drops = Array(columns).fill(1);

        function drawMatrix() {
            ctx.fillStyle = "rgba(5, 8, 12, 0.15)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = "#00ff66";
            ctx.font = fontSize + "px monospace";

            if (drops.length !== columns) {
                columns = Math.floor(canvas.width / fontSize);
                drops = Array(columns).fill(1);
            }

            for (let i = 0; i < drops.length; i++) {
                const char = chars[Math.floor(Math.random() * chars.length)];
                const x = i * fontSize;
                const y = drops[i] * fontSize;

                if (Math.random() > 0.85) {
                    ctx.fillStyle = "#00f0ff";
                } else {
                    ctx.fillStyle = "#00ff66";
                }

                ctx.fillText(char, x, y);

                if (y > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
            requestAnimationFrame(drawMatrix);
        }
        drawMatrix();
    }

    // ========================================================================
    // SCREEN MANAGEMENT
    // ========================================================================
    function showScreen(screenId) {
        document.querySelectorAll(".screen").forEach(el => el.classList.remove("active"));
        const target = document.getElementById(screenId);
        if (target) {
            target.classList.add("active");
            activeScreen = screenId;
        }
    }

    // ========================================================================
    // SCREEN 1: TARGET CONFIGURATION & SETUP
    // ========================================================================
    function renderTargetsList() {
        const container = document.getElementById("targets-list-grid");
        const countBadge = document.getElementById("slot-count-badge");
        const addBtn = document.getElementById("btn-add-target");
        if (!container) return;

        countBadge.textContent = targets.length;
        addBtn.disabled = (targets.length >= 10);

        container.innerHTML = "";
        targets.forEach((target, index) => {
            const row = document.createElement("div");
            row.className = "target-row";

            row.innerHTML = `
                <span class="target-number">#${String(index + 1).padStart(2, '0')}</span>
                <span class="target-avatar-badge">${target.avatar}</span>
                <input type="text" class="target-input" value="${escapeHtml(target.name)}" placeholder="Target Name" maxlength="30" data-index="${index}">
                <button type="button" class="target-delete-btn" data-index="${index}" title="Remove Target" ${targets.length <= 2 ? 'disabled style="opacity:0.2; cursor:not-allowed;"' : ''}>×</button>
            `;

            container.appendChild(row);
        });

        // Event listeners for inputs
        container.querySelectorAll(".target-input").forEach(input => {
            input.addEventListener("input", e => {
                const idx = parseInt(e.target.dataset.index, 10);
                targets[idx].name = e.target.value;
            });
            input.addEventListener("keydown", () => window.soundEngine.playKeyClick());
        });

        // Event listeners for delete
        container.querySelectorAll(".target-delete-btn").forEach(btn => {
            btn.addEventListener("click", e => {
                if (targets.length <= 2) return;
                const idx = parseInt(e.currentTarget.dataset.index, 10);
                targets.splice(idx, 1);
                window.soundEngine.playKeyClick();
                renderTargetsList();
            });
        });
    }

    function addTargetSlot() {
        if (targets.length >= 10) return;
        const newIndex = targets.length;
        targets.push({
            name: `Target ${newIndex + 1}`,
            avatar: window.getPlayerAvatar(newIndex),
            color: window.getPlayerColor(newIndex)
        });
        window.soundEngine.playKeyClick();
        renderTargetsList();
    }

    function loadPreset(presetKey) {
        const preset = PRESETS[presetKey];
        if (!preset) return;

        document.getElementById("input-objective").value = preset.title;

        // Set rule mode
        ruleMode = preset.rule;
        const ruleRadio = document.querySelector(`input[name="rule-mode"][value="${ruleMode}"]`);
        if (ruleRadio) ruleRadio.checked = true;

        // Populate targets
        targets = preset.items.map((it, idx) => ({
            name: it.name,
            avatar: it.avatar,
            color: window.getPlayerColor(idx)
        }));

        window.soundEngine.playKeyClick();
        renderTargetsList();
    }

    function escapeHtml(str) {
        return (str || '').replace(/[&<>"']/g, m => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[m]));
    }

    // ========================================================================
    // SCREEN 2: SCIENTIFIC HACKING CEREMONY (10 CHANNELS -> 30 DIGITS)
    // ========================================================================
    let ceremonyTimeouts = [];
    let ceremonyOscilloscopeLoops = [];

    function clearCeremonyTasks() {
        ceremonyTimeouts.forEach(t => clearTimeout(t));
        ceremonyTimeouts = [];
        ceremonyOscilloscopeLoops.forEach(l => cancelAnimationFrame(l));
        ceremonyOscilloscopeLoops = [];
    }

    function startScientificCeremony(onComplete) {
        clearCeremonyTasks();
        showScreen("screen-ceremony");

        currentCeremony = window.entropyEngine.generate30DigitEntropyCeremony();
        const channels = window.entropyEngine.SCIENTIFIC_CHANNELS;

        // Initialize 30-Digit Top Assembly Display (10 slots of 3 dashes)
        const digitContainer = document.getElementById("digit-slots-container");
        digitContainer.innerHTML = "";
        for (let i = 0; i < 10; i++) {
            const slot = document.createElement("div");
            slot.id = `digit-slot-${i}`;
            slot.className = "digit-slot";
            slot.textContent = "---";
            digitContainer.appendChild(slot);
        }

        // Initialize Progress Bar
        const progressFill = document.getElementById("ceremony-progress-fill");
        progressFill.style.width = "0%";

        // Initialize 10 Scientific Channel Cards
        const channelsGrid = document.getElementById("channels-grid");
        channelsGrid.innerHTML = "";

        channels.forEach((ch, idx) => {
            const card = document.createElement("div");
            card.id = `channel-card-${idx}`;
            card.className = "channel-card rolling";
            card.innerHTML = `
                <div class="channel-header">
                    <span class="channel-name">${ch.name}</span>
                    <span class="channel-symbol">${ch.symbol}</span>
                </div>
                <canvas id="channel-canvas-${idx}" class="channel-canvas" width="240" height="44"></canvas>
                <div class="channel-footer">
                    <span id="channel-value-${idx}" class="channel-rolling-value">---------</span>
                    <span id="channel-status-${idx}" class="channel-status">HARVESTING...</span>
                </div>
            `;
            channelsGrid.appendChild(card);

            // Start Canvas Oscilloscope for this channel
            startChannelOscilloscope(idx, ch);
        });

        // Add Telemetry Log Output
        logTelemetry(`LAUNCHING 10-STREAM QUANTUM DEATH-ROLL GENERATOR`);

        // Animate each channel rolling down to its 3 digits
        const isFast = (speedMode === "warp");
        const stepDelay = isFast ? 80 : 350;
        let lockedCount = 0;

        currentCeremony.entropyChannels.forEach((rollData, idx) => {
            const card = document.getElementById(`channel-card-${idx}`);
            const valLabel = document.getElementById(`channel-value-${idx}`);
            const statusLabel = document.getElementById(`channel-status-${idx}`);
            const slotEl = document.getElementById(`digit-slot-${idx}`);

            const steps = rollData.steps;
            const totalSteps = steps.length;

            // Sequential animation through intermediate death-roll steps
            steps.forEach((stepVal, stepIdx) => {
                const isFinal = (stepIdx === totalSteps - 1);
                const delay = (idx * (isFast ? 100 : 280)) + (stepIdx * (isFast ? 50 : 180));

                const tId = setTimeout(() => {
                    if (isFinal) {
                        // Channel Locked!
                        valLabel.textContent = `[ ${rollData.threeDigitStr} ]`;
                        statusLabel.textContent = "LOCKED";
                        card.classList.remove("rolling");
                        card.classList.add("locked");

                        // Update Master 30-digit Slot
                        slotEl.textContent = rollData.threeDigitStr;
                        slotEl.classList.add("locked");

                        // Audio Chime
                        window.soundEngine.playLockChime(idx);
                        logTelemetry(`STREAM [${idx + 1}/10] ${rollData.channel.name} LOCKED -> ${rollData.threeDigitStr}`);

                        lockedCount++;
                        progressFill.style.width = `${(lockedCount / 10) * 100}%`;

                        if (lockedCount === 10) {
                            // All 10 locked in!
                            window.soundEngine.playSeedStabilized();
                            logTelemetry(`ALL 10 ENTROPY VECTORS STABILIZED: ${currentCeremony.combined30DigitStr}`);

                            const finishDelay = isFast ? 300 : 1200;
                            const finalTimer = setTimeout(() => {
                                if (onComplete) onComplete(currentCeremony);
                            }, finishDelay);
                            ceremonyTimeouts.push(finalTimer);
                        }
                    } else {
                        // Intermediate death-roll step
                        valLabel.textContent = stepVal.toLocaleString();
                        window.soundEngine.playDataChirp();
                    }
                }, delay);

                ceremonyTimeouts.push(tId);
            });
        });
    }

    function fastWarpCeremony(onComplete) {
        clearCeremonyTasks();
        if (!currentCeremony) {
            currentCeremony = window.entropyEngine.generate30DigitEntropyCeremony();
        }

        // Instantly fill all 10 slots
        currentCeremony.entropyChannels.forEach((rollData, idx) => {
            const card = document.getElementById(`channel-card-${idx}`);
            const valLabel = document.getElementById(`channel-value-${idx}`);
            const statusLabel = document.getElementById(`channel-status-${idx}`);
            const slotEl = document.getElementById(`digit-slot-${idx}`);

            if (card) {
                card.classList.remove("rolling");
                card.classList.add("locked");
            }
            if (valLabel) valLabel.textContent = `[ ${rollData.threeDigitStr} ]`;
            if (statusLabel) statusLabel.textContent = "LOCKED";
            if (slotEl) {
                slotEl.textContent = rollData.threeDigitStr;
                slotEl.classList.add("locked");
            }
        });

        const progressFill = document.getElementById("ceremony-progress-fill");
        if (progressFill) progressFill.style.width = "100%";

        window.soundEngine.playSeedStabilized();
        logTelemetry(`WARP JUMP: 30-DIGIT QUANTUM MASTER SEED COMPILED.`);

        setTimeout(() => {
            if (onComplete) onComplete(currentCeremony);
        }, 200);
    }

    function logTelemetry(msg) {
        const consoleEl = document.getElementById("telemetry-console");
        if (!consoleEl) return;
        const line = document.createElement("div");
        line.className = "telemetry-line";
        line.textContent = msg;
        consoleEl.appendChild(line);
        consoleEl.scrollTop = consoleEl.scrollHeight;
    }

    function startChannelOscilloscope(idx, channel) {
        const canvas = document.getElementById(`channel-canvas-${idx}`);
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        let phase = Math.random() * 100;

        function renderWave() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = channel.color || "#00f0ff";
            ctx.lineWidth = 1.5;
            ctx.beginPath();

            const midY = canvas.height / 2;
            const pts = 30;
            const dx = canvas.width / pts;

            for (let i = 0; i <= pts; i++) {
                const x = i * dx;
                let y = midY;
                const noise = channel.generator();

                if (channel.waveType === "thermal") {
                    y = midY + Math.sin(phase + i * 0.4) * 8 + (Math.random() - 0.5) * 6;
                } else if (channel.waveType === "quantum_spikes") {
                    y = midY + ((i % 5 === 0) ? (Math.random() - 0.5) * 26 : (Math.random() - 0.5) * 5);
                } else if (channel.waveType === "poisson_clicks") {
                    y = midY + ((Math.random() > 0.88) ? -18 : (Math.random() - 0.5) * 4);
                } else if (channel.waveType === "lightning_bursts") {
                    y = midY + ((Math.random() > 0.9) ? (Math.random() - 0.5) * 32 : (Math.random() - 0.5) * 2);
                } else {
                    y = midY + Math.sin(phase + i * 0.3) * 10 + (Math.random() - 0.5) * 8;
                }

                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }

            ctx.stroke();
            phase += 0.15;
            const animId = requestAnimationFrame(renderWave);
            ceremonyOscilloscopeLoops.push(animId);
        }

        renderWave();
    }

    // ========================================================================
    // SCREEN 3: BIGINT DEATH-ROLLING ARENA (BATTLEFIELD)
    // ========================================================================
    function initArenaView(entropy) {
        showScreen("screen-arena");

        if (!tournament) {
            tournament = new window.DeathRollTournament({
                objective: document.getElementById("input-objective").value || "Protocol",
                ruleMode: ruleMode,
                players: targets
            });
        }

        tournament.startRound(entropy);
        updateArenaUI();

        // If Auto-Play is checked, start auto-rolling
        if (autoPlay && !tournament.isGameOver) {
            scheduleAutoTurn();
        }
    }

    function updateArenaUI() {
        if (!tournament) return;

        // Header info
        document.getElementById("arena-objective-text").textContent = tournament.objective;
        document.getElementById("arena-round-number").textContent = String(tournament.currentRoundNumber).padStart(2, '0');
        
        const active = tournament.getActivePlayers();
        document.getElementById("arena-alive-count").textContent = `${active.length} / ${tournament.players.length}`;
        document.getElementById("arena-total-rolls").textContent = totalRollsCount;

        // Current BigInt Bound on Odometer
        const odoDisplay = document.getElementById("odometer-display");
        odoDisplay.textContent = formatBigIntWithSpaces(tournament.currentBound);
        odoDisplay.classList.remove("rolling", "zero-hit");

        // Active Player on Deck
        const activePlayer = tournament.getCurrentActivePlayer();
        const playerBadge = document.getElementById("active-player-name-badge");
        const btnPlayerLabel = document.getElementById("btn-player-name-label");
        const rollBtn = document.getElementById("btn-roll-action");

        if (activePlayer && !tournament.isGameOver) {
            playerBadge.textContent = `${activePlayer.avatar} ${activePlayer.name}`;
            playerBadge.style.color = activePlayer.color;
            btnPlayerLabel.textContent = activePlayer.name;
            rollBtn.disabled = isRolling;
        } else {
            playerBadge.textContent = "STANDBY";
            btnPlayerLabel.textContent = "---";
            rollBtn.disabled = true;
        }

        // Render Contestants Matrix
        renderContestantsMatrix();
    }

    function renderContestantsMatrix() {
        const matrixContainer = document.getElementById("contestants-matrix");
        if (!matrixContainer || !tournament) return;

        matrixContainer.innerHTML = "";
        const activePlayer = tournament.getCurrentActivePlayer();

        tournament.players.forEach(p => {
            const card = document.createElement("div");
            const isTurn = (!p.eliminated && activePlayer && activePlayer.id === p.id);
            card.className = `contestant-card ${p.eliminated ? 'eliminated' : ''} ${isTurn ? 'current-turn' : ''}`;

            const lastRoll = p.rolls.length > 0 ? p.rolls[p.rolls.length - 1] : null;
            let rollSummary = "Awaiting Turn...";
            if (lastRoll) {
                if (lastRoll.hitZero) {
                    rollSummary = `<span style="color:var(--neon-alert);">ROLLED 0 (ELIMINATED)</span>`;
                } else {
                    rollSummary = `Last Roll: ${formatBigIntTruncated(BigInt(lastRoll.rolledValue))}`;
                }
            }

            card.innerHTML = `
                <div class="contestant-card-top">
                    <div class="contestant-name-group">
                        <span class="contestant-avatar">${p.avatar}</span>
                        <span class="contestant-name" style="color:${p.color};">${escapeHtml(p.name)}</span>
                    </div>
                    <span class="contestant-status-badge ${p.eliminated ? 'status-dead' : 'status-alive'}">
                        ${p.eliminated ? 'ELIMINATED' : 'ACTIVE'}
                    </span>
                </div>
                <div class="contestant-rolls-history">${rollSummary}</div>
            `;

            matrixContainer.appendChild(card);
        });
    }

    // Format 30-digit BigInt with space groupings for awesome high-tech readability
    function formatBigIntWithSpaces(val) {
        const str = val.toString();
        // Insert thin space or regular space every 3 or 5 digits
        return str.replace(/\B(?=(\d{5})+(?!\d))/g, " ");
    }

    function formatBigIntTruncated(val) {
        const str = val.toString();
        if (str.length <= 8) return str;
        return `${str.substring(0, 4)}...${str.substring(str.length - 3)}`;
    }

    // Speed Controller
    function setSpeedLevel(level) {
        currentSpeedLevel = Math.max(1, Math.min(5, level));
        const cfg = SPEED_CONFIGS[currentSpeedLevel];

        const slider = document.getElementById("roll-speed-slider");
        if (slider) slider.value = currentSpeedLevel;

        const badge = document.getElementById("roll-speed-badge");
        if (badge) badge.textContent = cfg.label;

        // Highlight active quick button
        document.querySelectorAll(".speed-quick-btn").forEach(btn => {
            const btnSpeed = parseInt(btn.dataset.speed, 10);
            if (btnSpeed === currentSpeedLevel) {
                btn.classList.add("active");
            } else {
                btn.classList.remove("active");
            }
        });

        // If auto-pilot is waiting for next roll, immediately reschedule with new speed
        if (autoPlay && !isRolling && tournament && !tournament.isGameOver) {
            scheduleAutoTurn();
        }
    }

    // Executes a single player's roll with Hollywood odometer tumbling animation
    function triggerTurnRoll() {
        if (isRolling || !tournament || tournament.isGameOver) return;
        isRolling = true;

        const rollBtn = document.getElementById("btn-roll-action");
        rollBtn.disabled = true;

        const activePlayer = tournament.getCurrentActivePlayer();
        const odoDisplay = document.getElementById("odometer-display");
        odoDisplay.classList.add("rolling");

        // Execute tournament logic (gets the actual outcome BigInt)
        const turnResult = tournament.executeTurn();
        totalRollsCount++;

        const cfg = SPEED_CONFIGS[currentSpeedLevel] || SPEED_CONFIGS[2];
        const animationDuration = cfg.animDuration;
        const startTime = performance.now();
        const prevBound = turnResult.prevBound;
        const finalOutcome = turnResult.rollOutcome;

        // At ultra-fast speeds (e.g. 25x Ludicrous), execute an instant 1-frame tumble
        if (animationDuration <= 20) {
            odoDisplay.textContent = formatBigIntWithSpaces(finalOutcome);
            odoDisplay.classList.remove("rolling");

            if (turnResult.hitZero) {
                odoDisplay.classList.add("zero-hit");
                handleZeroHitElimination(turnResult);
            } else {
                if (Math.random() > 0.6) {
                    window.soundEngine.playOdometerTick(1);
                }
                isRolling = false;
                updateArenaUI();

                if (autoPlay && !tournament.isGameOver) {
                    scheduleAutoTurn();
                }
            }
            return;
        }

        function animateOdometer(now) {
            const elapsed = now - startTime;
            const progress = Math.min(1, elapsed / animationDuration);

            if (progress < 1) {
                // Generate a scrambled tumbling number of matching magnitude
                const randomScramble = window.secureRandomBigInt(prevBound);
                odoDisplay.textContent = formatBigIntWithSpaces(randomScramble);

                if (Math.random() > 0.4) {
                    window.soundEngine.playOdometerTick(progress);
                }

                requestAnimationFrame(animateOdometer);
            } else {
                // Lock in the final roll outcome!
                odoDisplay.textContent = formatBigIntWithSpaces(finalOutcome);
                odoDisplay.classList.remove("rolling");

                if (turnResult.hitZero) {
                    // HIT ZERO!
                    odoDisplay.classList.add("zero-hit");
                    handleZeroHitElimination(turnResult);
                } else {
                    // SURVIVED!
                    window.soundEngine.playSafeChirp();
                    isRolling = false;
                    updateArenaUI();

                    if (autoPlay && !tournament.isGameOver) {
                        scheduleAutoTurn();
                    }
                }
            }
        }

        requestAnimationFrame(animateOdometer);
    }

    function handleZeroHitElimination(turnResult) {
        window.soundEngine.playEliminationAlarm();

        // Show Elimination Modal Overlay
        const banner = document.getElementById("elimination-banner");
        const desc = document.getElementById("elimination-player-desc");

        const actionText = (tournament.ruleMode === "SACRIFICE_FIRST") ? 
            "WAS SACRIFICED TO DO THE CHORE / TASK!" : 
            "WAS ELIMINATED FROM THE TOURNAMENT!";

        desc.innerHTML = `<strong>${turnResult.player.avatar} ${escapeHtml(turnResult.player.name)}</strong> hit 0 and ${actionText}`;
        banner.classList.add("show");

        const cfg = SPEED_CONFIGS[currentSpeedLevel] || SPEED_CONFIGS[2];
        const elimDuration = cfg.elimDelay;

        setTimeout(() => {
            banner.classList.remove("show");
            isRolling = false;

            if (tournament.isGameOver) {
                // TOURNAMENT COMPLETED! Show Victory
                showVictoryScreen();
            } else {
                // Remaining players > 1: If fastCeremony is true, immediately fast-warp to avoid waiting
                if (cfg.fastCeremony) {
                    fastWarpCeremony((newEntropy) => {
                        initArenaView(newEntropy);
                    });
                } else {
                    startScientificCeremony((newEntropy) => {
                        initArenaView(newEntropy);
                    });
                }
            }
        }, elimDuration);
    }

    function scheduleAutoTurn() {
        if (autoPlayTimer) clearTimeout(autoPlayTimer);
        const cfg = SPEED_CONFIGS[currentSpeedLevel] || SPEED_CONFIGS[2];
        autoPlayTimer = setTimeout(() => {
            if (autoPlay && !isRolling && tournament && !tournament.isGameOver) {
                triggerTurnRoll();
            }
        }, cfg.autoDelay);
    }

    // ========================================================================
    // SCREEN 4: VICTORY & CRYPTOGRAPHIC AUDIT DEBRIEF
    // ========================================================================
    function showVictoryScreen() {
        showScreen("screen-victory");
        window.soundEngine.playVictoryFanfare();

        const avatarEl = document.getElementById("victory-avatar");
        const headerEl = document.getElementById("victory-header-text");
        const nameEl = document.getElementById("victory-target-name");

        if (tournament.ruleMode === "SACRIFICE_FIRST" && tournament.sacrificed) {
            avatarEl.textContent = tournament.sacrificed.avatar || "⚡";
            headerEl.textContent = "SACRIFICED FOR THE TASK";
            nameEl.textContent = tournament.sacrificed.name.toUpperCase();
            nameEl.style.color = "var(--neon-alert)";
        } else if (tournament.winner) {
            avatarEl.textContent = tournament.winner.avatar || "👑";
            headerEl.textContent = "SOLE SURVIVOR // PROTOCOL VICTOR";
            nameEl.textContent = tournament.winner.name.toUpperCase();
            nameEl.style.color = "var(--neon-green)";
        }

        renderAuditTrailTable();
    }

    function renderAuditTrailTable() {
        const tbody = document.getElementById("audit-table-body");
        if (!tbody || !tournament) return;

        tbody.innerHTML = "";
        tournament.history.forEach(item => {
            if (!item.rolledValue) return; // skip non-roll events
            const tr = document.createElement("tr");

            const isZero = item.hitZero;
            const resultBadge = isZero ? 
                `<span style="color:var(--neon-alert); font-weight:bold;">HIT 0 (${tournament.ruleMode === 'SACRIFICE_FIRST' ? 'SACRIFICED' : 'ELIMINATED'})</span>` : 
                `<span style="color:var(--neon-green);">SURVIVED</span>`;

            tr.innerHTML = `
                <td>ROUND ${String(item.round).padStart(2, '0')}</td>
                <td><strong>${escapeHtml(item.player.name)}</strong></td>
                <td style="color:var(--text-dim);">${formatBigIntTruncated(BigInt(item.rolledFrom))}</td>
                <td style="color:${isZero ? 'var(--neon-alert)' : 'var(--neon-cyan)'};">${formatBigIntTruncated(BigInt(item.rolledValue))}</td>
                <td>${resultBadge}</td>
                <td style="color:var(--text-dim); font-size:0.7rem;">${new Date(item.timestamp).toLocaleTimeString()}</td>
            `;

            tbody.appendChild(tr);
        });
    }

    function copyAuditLogToClipboard() {
        if (!tournament) return;
        let text = `==========================================================\n`;
        text += `QUANTUM TRUE RANDOMISER - CRYPTOGRAPHIC AUDIT LOG\n`;
        text += `Objective: ${tournament.objective}\n`;
        text += `Rule: ${tournament.ruleMode}\n`;
        text += `Date: ${new Date().toISOString()}\n`;
        text += `Winner/Chosen: ${tournament.winner ? tournament.winner.name : (tournament.sacrificed ? tournament.sacrificed.name : 'N/A')}\n`;
        text += `==========================================================\n\n`;

        tournament.history.forEach((h, i) => {
            if (h.type === "ROUND_START") {
                text += `[ROUND ${h.round}] Generated 30-Digit Seed: ${h.seedStr}\n`;
            } else if (h.rolledValue) {
                text += `  -> ${h.player.name} rolled 0 to ${h.rolledFrom}: RESULT = ${h.rolledValue} [${h.hitZero ? 'HIT 0!' : 'OK'}]\n`;
            }
        });

        text += `\nVerification: Unbiased Web Crypto Rejection Sampling across 10 Physical Telemetry Noise Channels.\n`;

        navigator.clipboard.writeText(text).then(() => {
            const btn = document.getElementById("btn-copy-audit");
            const originalText = btn.textContent;
            btn.textContent = "✓ COPIED TO CLIPBOARD!";
            window.soundEngine.playSafeChirp();
            setTimeout(() => { btn.textContent = originalText; }, 2000);
        }).catch(err => {
            console.warn("Failed to copy audit:", err);
        });
    }

    // ========================================================================
    // EVENT LISTENERS & INITIALISATION
    // ========================================================================
    function bindEvents() {
        // Audio Toggle & Volume
        const soundBtn = document.getElementById("btn-sound-toggle");
        const volumeSlider = document.getElementById("sound-volume");

        soundBtn.addEventListener("click", () => {
            window.soundEngine.init();
            const isMuted = !window.soundEngine.muted;
            window.soundEngine.setMuted(isMuted);
            soundBtn.textContent = isMuted ? "🔇 OFF" : "🔊 ON";
            soundBtn.style.borderColor = isMuted ? "var(--neon-alert)" : "var(--neon-cyan)";
            soundBtn.style.color = isMuted ? "var(--neon-alert)" : "var(--neon-cyan)";
        });

        volumeSlider.addEventListener("input", (e) => {
            window.soundEngine.init();
            window.soundEngine.setVolume(parseFloat(e.target.value));
        });

        // Setup Screen Buttons
        document.getElementById("btn-add-target").addEventListener("click", addTargetSlot);

        // Preset Chips
        document.querySelectorAll(".preset-chip").forEach(chip => {
            chip.addEventListener("click", e => {
                const presetKey = e.currentTarget.dataset.preset;
                loadPreset(presetKey);
            });
        });

        // Rule & Speed Radio Buttons
        document.querySelectorAll('input[name="rule-mode"]').forEach(r => {
            r.addEventListener("change", e => {
                ruleMode = e.target.value;
                window.soundEngine.playKeyClick();
            });
        });

        document.querySelectorAll('input[name="speed-mode"]').forEach(r => {
            r.addEventListener("change", e => {
                speedMode = e.target.value;
                if (speedMode === "warp") {
                    setSpeedLevel(4); // 10x Turbo
                } else {
                    setSpeedLevel(1); // 1x Cinematic
                }
                window.soundEngine.playKeyClick();
            });
        });

        // Roll Speed Slider & Quick Buttons
        const speedSlider = document.getElementById("roll-speed-slider");
        if (speedSlider) {
            speedSlider.addEventListener("input", (e) => {
                setSpeedLevel(parseInt(e.target.value, 10));
            });
        }

        document.querySelectorAll(".speed-quick-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const spd = parseInt(e.currentTarget.dataset.speed, 10);
                setSpeedLevel(spd);
                window.soundEngine.playKeyClick();
            });
        });

        // Engage Protocol Button
        document.getElementById("btn-engage-randomiser").addEventListener("click", () => {
            window.soundEngine.init();
            window.soundEngine.resume();
            window.soundEngine.playKeyClick();

            totalRollsCount = 0;
            tournament = null;

            startScientificCeremony((entropy) => {
                initArenaView(entropy);
            });
        });

        // Skip / Fast Warp Ceremony Button
        document.getElementById("btn-skip-ceremony").addEventListener("click", () => {
            fastWarpCeremony((entropy) => {
                initArenaView(entropy);
            });
        });

        // Arena Roll Action Button
        document.getElementById("btn-roll-action").addEventListener("click", triggerTurnRoll);

        // Auto-Play Checkbox
        const autoCheck = document.getElementById("chk-auto-play");
        autoCheck.addEventListener("change", e => {
            autoPlay = e.target.checked;
            window.soundEngine.playKeyClick();
            if (autoPlay && !isRolling && tournament && !tournament.isGameOver) {
                scheduleAutoTurn();
            }
        });

        // Reconfigure / Abort back to Setup
        document.getElementById("btn-abort-to-menu").addEventListener("click", () => {
            if (autoPlayTimer) clearTimeout(autoPlayTimer);
            autoPlay = false;
            autoCheck.checked = false;
            window.soundEngine.playKeyClick();
            showScreen("screen-setup");
        });

        // Victory Screen Actions
        document.getElementById("btn-play-again").addEventListener("click", () => {
            window.soundEngine.playKeyClick();
            totalRollsCount = 0;
            tournament = null;
            startScientificCeremony((entropy) => {
                initArenaView(entropy);
            });
        });

        document.getElementById("btn-edit-protocol").addEventListener("click", () => {
            window.soundEngine.playKeyClick();
            showScreen("screen-setup");
        });

        document.getElementById("btn-copy-audit").addEventListener("click", copyAuditLogToClipboard);

        // Global Keyboard Shortcut: Spacebar / Enter triggers Roll when in Arena
        window.addEventListener("keydown", (e) => {
            if (activeScreen === "screen-arena") {
                if (e.code === "Space" || e.code === "Enter") {
                    if (e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
                        e.preventDefault();
                        triggerTurnRoll();
                    }
                }
            }
        });

        // Touch / Click anywhere on window initializes AudioContext if suspended
        window.addEventListener("click", () => {
            window.soundEngine.init();
            window.soundEngine.resume();
        }, { once: true });
    }

    // Initialize application
    window.addEventListener("DOMContentLoaded", () => {
        initMatrixBg();
        renderTargetsList();
        bindEvents();
        setSpeedLevel(currentSpeedLevel);
    });
})();

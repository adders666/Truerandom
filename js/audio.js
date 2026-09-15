// ============================================================================
// AUDIO SYSTEM: Procedural Cyberpunk Synthesizer (Web Audio API)
// Zero external audio files required. All synthesized dynamically in real-time.
// ============================================================================

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.ambientNode = null;
        this.muted = false;
        this.volume = 0.6;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime);
            this.masterGain.connect(this.ctx.destination);
            this.initialized = true;
            this.startAmbientHum();
        } catch (e) {
            console.warn("Web Audio API not supported or blocked:", e);
        }
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    setMuted(mute) {
        this.muted = mute;
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setValueAtTime(mute ? 0 : this.volume, this.ctx.currentTime);
        }
    }

    setVolume(val) {
        this.volume = Math.max(0, Math.min(1, val));
        if (this.masterGain && this.ctx && !this.muted) {
            this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        }
    }

    startAmbientHum() {
        if (!this.ctx || this.ambientNode) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(48, this.ctx.currentTime); // 48Hz deep transformer hum

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(90, this.ctx.currentTime);

            gain.gain.setValueAtTime(0.015, this.ctx.currentTime); // very subtle background

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain);

            osc.start();
            this.ambientNode = { osc, gain };
        } catch (e) {
            // Non-critical
        }
    }

    // High-tech keystroke click
    playKeyClick() {
        if (!this.ctx || this.muted) return;
        this.resume();
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400 + Math.random() * 400, t);
        osc.frequency.exponentialRampToValueAtTime(300, t + 0.025);

        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 0.03);
    }

    // Fast data burst chirp
    playDataChirp() {
        if (!this.ctx || this.muted) return;
        this.resume();
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(800 + Math.random() * 1200, t);
        osc.frequency.setValueAtTime(1600 + Math.random() * 800, t + 0.015);

        gain.gain.setValueAtTime(0.06, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 0.04);
    }

    // Geiger counter click for radioactive channel
    playGeigerClick() {
        if (!this.ctx || this.muted) return;
        this.resume();
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(3200 + Math.random() * 800, t);

        gain.gain.setValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.01);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 0.015);
    }

    // Channel lock-in chime (when a scientific stream hits its 3-digit seed)
    playLockChime(index = 0) {
        if (!this.ctx || this.muted) return;
        this.resume();
        const t = this.ctx.currentTime;
        
        // Pentatonic sci-fi arpeggio based on channel index
        const baseFreqs = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51, 1567.98, 1760.00];
        const freq = baseFreqs[index % baseFreqs.length];

        const osc = this.ctx.createOscillator();
        const sub = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, t + 0.12);

        sub.type = 'triangle';
        sub.frequency.setValueAtTime(freq * 0.5, t);

        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

        osc.connect(gain);
        sub.connect(gain);
        gain.connect(this.masterGain);

        osc.start(t);
        sub.start(t);
        osc.stop(t + 0.25);
        sub.stop(t + 0.25);
    }

    // Grand assembly fanfare when all 10 slots lock into the 30-digit integer
    playSeedStabilized() {
        if (!this.ctx || this.muted) return;
        this.resume();
        const t = this.ctx.currentTime;

        const chords = [523.25, 659.25, 783.99, 1046.5]; // C major sci-fi chord
        chords.forEach((f, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(f, t + i * 0.05);

            gain.gain.setValueAtTime(0.08, t + i * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(3000, t);
            filter.frequency.exponentialRampToValueAtTime(800, t + 0.8);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain);

            osc.start(t + i * 0.05);
            osc.stop(t + 0.85);
        });
    }

    // Odometer spinning tick
    playOdometerTick(speedRatio = 1) {
        if (!this.ctx || this.muted) return;
        this.resume();
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        const basePitch = 600 + (1 - speedRatio) * 800; // pitch rises as speed slows down for suspense
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(basePitch, t);
        osc.frequency.exponentialRampToValueAtTime(basePitch * 0.5, t + 0.03);

        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 0.035);
    }

    // Tense heartbeat pulse for near-zero rolls
    playTenseHeartbeat() {
        if (!this.ctx || this.muted) return;
        this.resume();
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(75, t);
        osc.frequency.exponentialRampToValueAtTime(35, t + 0.15);

        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 0.2);
    }

    // Critical roll survival sound (whew!)
    playSafeChirp() {
        if (!this.ctx || this.muted) return;
        this.resume();
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, t);
        osc.frequency.exponentialRampToValueAtTime(880, t + 0.15);

        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 0.22);
    }

    // RED ALERT / ELIMINATION: Klaxon siren & glitch explosion
    playEliminationAlarm() {
        if (!this.ctx || this.muted) return;
        this.resume();
        const t = this.ctx.currentTime;

        // Two-tone Klaxon siren
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(950, t);
        osc.frequency.setValueAtTime(450, t + 0.2);
        osc.frequency.setValueAtTime(950, t + 0.4);
        osc.frequency.setValueAtTime(450, t + 0.6);

        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.85);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 0.9);

        // Sub-bass impact thud
        const sub = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(120, t);
        sub.frequency.exponentialRampToValueAtTime(25, t + 0.6);
        subGain.gain.setValueAtTime(0.4, t);
        subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.65);
        sub.connect(subGain);
        subGain.connect(this.masterGain);
        sub.start(t);
        sub.stop(t + 0.7);

        // Glitch noise burst
        this.playNoiseBurst(0.4, 0.2);
    }

    playNoiseBurst(duration = 0.3, volume = 0.15) {
        if (!this.ctx || this.muted) return;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1800, this.ctx.currentTime);
        filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(volume, this.ctx.currentTime);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        noise.start();
    }

    // Victory celebration fanfare
    playVictoryFanfare() {
        if (!this.ctx || this.muted) return;
        this.resume();
        const t = this.ctx.currentTime;

        const melody = [
            { f: 523.25, d: 0.15 }, // C5
            { f: 659.25, d: 0.15 }, // E5
            { f: 783.99, d: 0.15 }, // G5
            { f: 1046.50, d: 0.4 }, // C6
            { f: 880.00, d: 0.18 }, // A5
            { f: 1046.50, d: 0.8 }  // C6 grand hold
        ];

        let offset = 0;
        melody.forEach(note => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(note.f, t + offset);

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(3200, t + offset);

            gain.gain.setValueAtTime(0.18, t + offset);
            gain.gain.exponentialRampToValueAtTime(0.001, t + offset + note.d);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain);

            osc.start(t + offset);
            osc.stop(t + offset + note.d + 0.05);

            offset += note.d * 0.85;
        });
    }
}

window.soundEngine = new SoundEngine();

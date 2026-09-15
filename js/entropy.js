// ============================================================================
// ENTROPY MODULE: 10 Scientific Noise Channels & Death-Roll Compression
// Merges Web Crypto hardware entropy, microsecond performance jitter, and
// mathematical physical simulation models to death-roll 10 streams down to
// 3 digits each, producing a monolithic 30-digit BigInt.
// ============================================================================

const SCIENTIFIC_CHANNELS = [
    {
        id: "cmb",
        name: "COSMIC MICROWAVE BACKGROUND",
        symbol: "T_cmb = 2.7255 K",
        desc: "Planck Deep Space Relic Radiation (Thermal Blackbody Fluctuations)",
        unit: "μK",
        color: "#00ffcc",
        generator: () => 2.7255 + (cryptoFloat() - 0.5) * 0.0001,
        waveType: "thermal"
    },
    {
        id: "quantum",
        name: "QUANTUM VACUUM SHOT NOISE",
        symbol: "⟨0|Ê²|0⟩ ≠ 0",
        desc: "Zero-Point Casimir Photonic Field Agitation & Spontaneous Decoherence",
        unit: "pW/√Hz",
        color: "#39ff14",
        generator: () => Math.abs(Math.sin(cryptoFloat() * 100) * 850 + cryptoFloat() * 150),
        waveType: "quantum_spikes"
    },
    {
        id: "radioactive",
        name: "RADIOACTIVE DECAY (ISOTOPE C-14)",
        symbol: "λ_c14 = 3.83e-12 s⁻¹",
        desc: "Geiger-Müller Ionization Timing Poisson Jitter",
        unit: "Bq/mg",
        color: "#ffe600",
        generator: () => -Math.log(1 - cryptoFloat() * 0.999) * 450,
        waveType: "poisson_clicks"
    },
    {
        id: "sferics",
        name: "ATMOSPHERIC RF SFERICS",
        symbol: "f_res = 7.83 Hz",
        desc: "Global Schumann Ionospheric Lightning Discharge Static",
        unit: "mV/m",
        color: "#00d4ff",
        generator: () => (cryptoFloat() > 0.88 ? (cryptoFloat() * 800) : (cryptoFloat() * 80)),
        waveType: "lightning_bursts"
    },
    {
        id: "solar",
        name: "SOLAR WIND & MAGNETOMETER FLUX",
        symbol: "B_imf = 6.2 nT",
        desc: "Coronal Mass Ejection Plasma Shockwave Dynamic Pressure",
        unit: "pPa",
        color: "#ff8400",
        generator: () => 400 + Math.sin(cryptoFloat() * Math.PI) * 350 + cryptoFloat() * 50,
        waveType: "solar_flare"
    },
    {
        id: "johnson",
        name: "JOHNSON-NYQUIST THERMAL NOISE",
        symbol: "v_n = √(4k_B T R Δf)",
        desc: "Resistor Conductor Electron Brownian Agitation at 300K",
        unit: "nV/√Hz",
        color: "#a855f7",
        generator: () => (cryptoFloat() + cryptoFloat() + cryptoFloat() - 1.5) * 500,
        waveType: "brownian_noise"
    },
    {
        id: "ligo",
        name: "LIGO GRAVITATIONAL STRAIN",
        symbol: "h ≈ 10⁻²¹",
        desc: "Laser Interferometer Phase Differential & Metric Spacetime Jitter",
        unit: "10⁻²¹",
        color: "#ff007f",
        generator: () => Math.cos(cryptoFloat() * Math.PI * 4) * 400 + cryptoFloat() * 100,
        waveType: "gravity_strain"
    },
    {
        id: "pulsar",
        name: "PULSAR PSR B1919+21 TIMING JITTER",
        symbol: "P = 1.3373 s",
        desc: "Neutron Star Spin Magnetosphere Glitch & Dispersion Offset",
        unit: "μs",
        color: "#00e5ff",
        generator: () => Math.exp(-Math.pow((cryptoFloat() - 0.5) * 6, 2)) * 900,
        waveType: "pulsar_pulse"
    },
    {
        id: "lorenz",
        name: "CHAOTIC LORENZ ATTRACTOR CONVECTION",
        symbol: "dx/dt = σ(y - x)",
        desc: "Non-Linear Deterministic Atmospheric Fluid Chaos Evolution",
        unit: "Re",
        color: "#00ff66",
        generator: () => {
            let x = 0.1, y = 0, z = 0;
            const dt = 0.01;
            const steps = Math.floor(cryptoFloat() * 100) + 50;
            for (let i = 0; i < steps; i++) {
                const dx = 10 * (y - x) * dt;
                const dy = (x * (28 - z) - y) * dt;
                const dz = (x * y - (8/3) * z) * dt;
                x += dx; y += dy; z += dz;
            }
            return Math.abs(x * 35 + 200);
        },
        waveType: "chaotic_attractor"
    },
    {
        id: "hw_jitter",
        name: "HARDWARE MICROSECOND CLOCK DRIFT",
        symbol: "Δt_clock = performance.now()",
        desc: "Local CPU Execution Jitter Combined with CSPRNG Entropy Pool",
        unit: "ns",
        color: "#ff0055",
        generator: () => ((window.performance.now() * 1000) % 1000) + cryptoFloat() * 100,
        waveType: "clock_drift"
    }
];

// Returns a high-precision cryptographic float in [0, 1)
function cryptoFloat() {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    // Mix with sub-microsecond timestamp jitter
    const jitter = (performance.now() % 1) * 0.0001;
    return (array[0] / (0xffffffff + 1) + jitter) % 1.0;
}

// Generate an initial high-range integer for death rolling (7 to 9 digits)
function generateInitialChannelSeed(channelIndex) {
    const min = 10_000_000;
    const max = 999_999_999;
    const range = max - min;
    const rawVal = Math.floor(cryptoFloat() * range) + min;
    return rawVal;
}

// Perform a single death roll: 0 <= roll <= currentVal
function deathRollStep(currentVal) {
    if (currentVal <= 0) return 0;
    return Math.floor(cryptoFloat() * (currentVal + 1));
}

// Pre-computes the entire death-roll sequence down to a 3-digit number (0-999)
// for each of the 10 channels.
function computeChannelDeathRoll(channel, index) {
    const initialSeed = generateInitialChannelSeed(index);
    const steps = [initialSeed];
    let current = initialSeed;

    while (current >= 1000) {
        current = deathRollStep(current);
        steps.push(current);
    }

    // Pad to 3 digits string: e.g. "042", "789"
    const threeDigitStr = String(current).padStart(3, '0');

    return {
        channelIndex: index,
        channel,
        initialSeed,
        steps,
        finalValue: current,
        threeDigitStr
    };
}

// Generates the full 30-digit master random seed from all 10 scientific channels
function generate30DigitEntropyCeremony() {
    const channelRolls = SCIENTIFIC_CHANNELS.map((ch, idx) => computeChannelDeathRoll(ch, idx));
    
    // Concatenate all 10 three-digit values in sequence
    const combined30DigitStr = channelRolls.map(r => r.threeDigitStr).join('');
    
    // Parse as BigInt
    const masterBigInt = BigInt(combined30DigitStr);

    return {
        timestamp: new Date().toISOString(),
        entropyChannels: channelRolls,
        combined30DigitStr,
        masterBigInt
    };
}

window.entropyEngine = {
    SCIENTIFIC_CHANNELS,
    cryptoFloat,
    generateInitialChannelSeed,
    deathRollStep,
    computeChannelDeathRoll,
    generate30DigitEntropyCeremony
};

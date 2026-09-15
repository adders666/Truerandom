// ============================================================================
// DEATH ROLL ENGINE: BigInt Unbiased Random Sampling & Tournament Sequencer
// Implements cryptographically secure rejection sampling on 30-digit BigInts
// and manages turn-based elimination rounds until 1 remains.
// ============================================================================

// True uniform random BigInt in [0, maxVal] with ZERO modulo bias
function secureRandomBigInt(maxVal) {
    if (maxVal <= 0n) return 0n;
    if (maxVal === 1n) {
        const arr = new Uint8Array(1);
        window.crypto.getRandomValues(arr);
        return BigInt(arr[0] & 1);
    }

    const bitLength = maxVal.toString(2).length;
    const byteLength = Math.ceil(bitLength / 8);
    const mask = (1n << BigInt(bitLength)) - 1n;
    const buffer = new Uint8Array(byteLength);

    // Rejection sampling guarantees 100% uniform distribution
    while (true) {
        window.crypto.getRandomValues(buffer);
        let candidate = 0n;
        for (let i = 0; i < byteLength; i++) {
            candidate = (candidate << 8n) | BigInt(buffer[i]);
        }
        candidate &= mask;
        if (candidate <= maxVal) {
            return candidate;
        }
    }
}

class DeathRollTournament {
    constructor(config) {
        this.objective = config.objective || "SURVIVAL PROTOCOL";
        this.ruleMode = config.ruleMode || "SURVIVOR_WINS"; // "SURVIVOR_WINS" or "SACRIFICE_FIRST"
        this.initialPlayers = config.players.map((p, idx) => ({
            id: idx + 1,
            name: p.name.trim() || `Target ${idx + 1}`,
            color: p.color || getPlayerColor(idx),
            avatar: p.avatar || getPlayerAvatar(idx),
            eliminated: false,
            eliminatedInRound: null,
            rolls: []
        }));

        this.players = JSON.parse(JSON.stringify(this.initialPlayers));
        this.currentRoundNumber = 1;
        this.currentRoundEntropy = null;
        this.currentMasterSeed = 0n;
        this.currentBound = 0n;
        this.activePlayerIndex = 0; // index into remaining active players
        this.history = [];
        this.isGameOver = false;
        this.winner = null;
        this.sacrificed = null;
        this.lastRollResult = null;
    }

    getActivePlayers() {
        return this.players.filter(p => !p.eliminated);
    }

    getCurrentActivePlayer() {
        const active = this.getActivePlayers();
        if (active.length === 0) return null;
        return active[this.activePlayerIndex % active.length];
    }

    // Starts a new round with the given 30-digit scientific ceremony
    startRound(entropyCeremony) {
        this.currentRoundEntropy = entropyCeremony;
        this.currentMasterSeed = entropyCeremony.masterBigInt;
        this.currentBound = entropyCeremony.masterBigInt;
        // Don't reset activePlayerIndex to 0 so turn order naturally flows around
        const active = this.getActivePlayers();
        this.activePlayerIndex = this.activePlayerIndex % active.length;

        this.history.push({
            type: "ROUND_START",
            round: this.currentRoundNumber,
            seedStr: entropyCeremony.combined30DigitStr,
            seedBigInt: entropyCeremony.masterBigInt.toString(),
            activeCount: active.length,
            timestamp: new Date().toISOString()
        });
    }

    // Executes a turn for the currently active player
    executeTurn() {
        if (this.isGameOver) return null;
        const active = this.getActivePlayers();
        if (active.length === 0) return null;

        const player = active[this.activePlayerIndex % active.length];
        const prevBound = this.currentBound;

        // Death roll: 0 <= roll <= currentBound
        const rollOutcome = secureRandomBigInt(prevBound);
        const hitZero = (rollOutcome === 0n);

        const turnRecord = {
            round: this.currentRoundNumber,
            player: { id: player.id, name: player.name },
            rolledFrom: prevBound.toString(),
            rolledValue: rollOutcome.toString(),
            hitZero,
            timestamp: new Date().toISOString()
        };

        player.rolls.push(turnRecord);
        this.history.push(turnRecord);

        this.lastRollResult = {
            player,
            prevBound,
            rollOutcome,
            hitZero,
            round: this.currentRoundNumber
        };

        if (hitZero) {
            // Player hit 0!
            player.eliminated = true;
            player.eliminatedInRound = this.currentRoundNumber;

            if (this.ruleMode === "SACRIFICE_FIRST") {
                // In Sacrifice mode, hitting 0 means this player is chosen for the chore!
                this.sacrificed = player;
                this.isGameOver = true;
                this.history.push({
                    type: "GAME_OVER",
                    reason: "SACRIFICE_CHOSEN",
                    target: player,
                    timestamp: new Date().toISOString()
                });
            } else {
                // Battle Royale mode: Player is eliminated
                const remaining = this.getActivePlayers();
                if (remaining.length <= 1) {
                    this.isGameOver = true;
                    this.winner = remaining[0] || player; // edge case if only 1 was playing
                    this.history.push({
                        type: "GAME_OVER",
                        reason: "SOLE_SURVIVOR",
                        winner: this.winner,
                        timestamp: new Date().toISOString()
                    });
                } else {
                    // Advance to next elimination round (requires new 30-digit scientific ceremony)
                    this.currentRoundNumber++;
                    // Active player index points to the next survivor in line
                    if (this.activePlayerIndex >= remaining.length) {
                        this.activePlayerIndex = 0;
                    }
                }
            }
        } else {
            // Survived! Update the bound for the next contestant
            this.currentBound = rollOutcome;
            this.activePlayerIndex = (this.activePlayerIndex + 1) % active.length;
        }

        return this.lastRollResult;
    }
}

// Preset color palette for targets
const PLAYER_PALETTE = [
    "#00ffcc", // Cyber Cyan
    "#ff0055", // Neon Magenta
    "#ffe600", // Laser Yellow
    "#39ff14", // Acid Green
    "#a855f7", // Quantum Purple
    "#ff8400", // Solar Orange
    "#00d4ff", // Plasma Blue
    "#ff4444", // Crimson Red
    "#22c55e", // Matrix Green
    "#ec4899"  // Hot Pink
];

// Fun cyber/everyday avatars
const PLAYER_AVATARS = [
    "⚡", "🤖", "🍕", "☕", "🛸", "⚔️", "👾", "🎯", "🔥", "🛡️"
];

function getPlayerColor(index) {
    return PLAYER_PALETTE[index % PLAYER_PALETTE.length];
}

function getPlayerAvatar(index) {
    return PLAYER_AVATARS[index % PLAYER_AVATARS.length];
}

window.DeathRollTournament = DeathRollTournament;
window.secureRandomBigInt = secureRandomBigInt;
window.getPlayerColor = getPlayerColor;
window.getPlayerAvatar = getPlayerAvatar;

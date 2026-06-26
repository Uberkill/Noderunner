export const GameConfig = {
    // --- SCALING & GENERATION ---
    SCALING: {
        BASE_NODE_COUNT: 200,
        NODES_PER_DEPTH: 50,
        MAX_NODES: 800,         // Cap at 800 to prevent browser crashes at infinite depths
        CLUSTER_RADIUS: 18,     // How spread out the sector is
        WIN_DEPTH: 5            // The depth where the Blackbox appears
    },

    // --- PHYSICS & INTERACTION ---
    PHYSICS: {
        MAGNET_RADIUS: 1.2,
        MAGNET_PULL_SPEED: 0.04,
        SPRING_SPEED: 0.1,
        MAX_RADAR_DIST: 15
    },

    // --- VISUALS & COLORS ---
    VISUALS: {
        COLORS: {
            COLD: 0x00f0ff,     // Cyan
            WARM: 0xff00aa,     // Magenta
            HOT: 0xffffff,      // White
            VISITED_BASE: 0x330000,
            VISITED_GLOW: 0x110000,
            DEFAULT_GLOW: 0x444444
        },
        HEATMAP_RADII: {
            HOT: 8,
            WARM: 18
        },
        PING_DURATION_MS: 500
    },

    // --- AUDIO ---
    AUDIO: {
        BASE_FREQUENCY: 87.31,  // F2
        PENTATONIC_ROOT: 174.61 // F3
    }
};

import { create } from 'zustand';

// Helper to safely load from local storage
const loadState = (key, defaultValue, parser = null) => {
    try {
        const item = localStorage.getItem(key);
        if (item) {
            return parser ? parser(item) : JSON.parse(item);
        }
    } catch (e) {
        console.warn(`Could not load ${key} from local storage`, e);
    }
    return defaultValue;
};

const saveState = (key, value, serializer = null) => {
    try {
        localStorage.setItem(key, serializer ? serializer(value) : JSON.stringify(value));
    } catch (e) {
        console.warn(`Could not save ${key} to local storage`, e);
    }
};

export const useGameStore = create((set, get) => ({
    // UI State
    appState: 'boot',
    activeData: null,
    manualOpen: false,
    audioStarted: false,
    lastHint: null,
    volume: 0.3,
    
    // Persistent State (Load on initialization)
    depth: loadState('ONET_depth', 1),
    maxDepthUnlocked: loadState('ONET_maxDepth', 1),
    collectedFragments: loadState('ONET_fragments', [], (str) => JSON.parse(str)),
    unlockedArchives: loadState('ONET_archives', [], (str) => JSON.parse(str)),

    // Network & Combo State
    comboCount: 0,
    mappingProgress: { captured: 1, total: 100 },
    has100Percent: false,

    // Actions
    setAppState: (state) => set({ appState: state }),
    setActiveData: (data) => set({ activeData: data }),
    setManualOpen: (isOpen) => set({ manualOpen: isOpen }),
    setAudioStarted: (started) => set({ audioStarted: started }),
    setLastHint: (hint) => set({ lastHint: hint }),
    setVolume: (vol) => set({ volume: vol }),

    // Persistent Actions
    setDepth: (depthCalc) => set((state) => {
        const nextDepth = typeof depthCalc === 'function' ? depthCalc(state.depth) : depthCalc;
        saveState('ONET_depth', nextDepth);
        const maxD = Math.max(state.maxDepthUnlocked, nextDepth);
        saveState('ONET_maxDepth', maxD);
        return { depth: nextDepth, maxDepthUnlocked: maxD };
    }),
    
    addFragment: (fragmentId) => set((state) => {
        if (state.collectedFragments.includes(fragmentId)) return state;
        const next = [...state.collectedFragments, fragmentId];
        saveState('ONET_fragments', next);
        return { collectedFragments: next };
    }),

    addArchive: (depth) => set((state) => {
        if (state.unlockedArchives.includes(depth)) return state;
        const next = [...state.unlockedArchives, depth];
        saveState('ONET_archives', next);
        return { unlockedArchives: next };
    }),

    // Network Actions
    setComboCount: (calc) => set((state) => ({ comboCount: typeof calc === 'function' ? calc(state.comboCount) : calc })),
    
    setMappingProgress: (progressCalc) => set((state) => {
        const next = typeof progressCalc === 'function' ? progressCalc(state.mappingProgress) : progressCalc;
        return { mappingProgress: next };
    }),
    
    setHas100Percent: (val) => set((state) => ({ has100Percent: typeof val === 'function' ? val(state.has100Percent) : val })),

    // Global Resets
    hardReset: () => {
        localStorage.removeItem('ONET_depth');
        localStorage.removeItem('ONET_maxDepth');
        localStorage.removeItem('ONET_fragments');
        localStorage.removeItem('ONET_archives');
        set({
            appState: 'boot',
            activeData: null,
            lastHint: null,
            depth: 1,
            maxDepthUnlocked: 1,
            collectedFragments: [],
            unlockedArchives: [],
            comboCount: 0,
            mappingProgress: { captured: 1, total: 100 },
            has100Percent: false
        });
    }
}));

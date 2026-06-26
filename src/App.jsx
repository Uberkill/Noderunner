import { useState, useEffect, useCallback } from 'react';
import Scene from './Scene';
import Overlay from './Overlay';
import { audioManager } from './AudioManager';
import ScreenFX from './ScreenFX';
import BootScreen from './BootScreen';
import Assistant from './Assistant';
import DataDriveTracker from './components/ui/DataDriveTracker';
import ManualOverlay from './components/ui/ManualOverlay';

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

function App() {
    const [appState, setAppState] = useState('boot'); // 'boot' | 'running'
    const [activeData, setActiveData] = useState(null);
    const [manualOpen, setManualOpen] = useState(false);
    const [audioStarted, setAudioStarted] = useState(false);
    
    // Persistent State
    const [depth, setDepth] = useState(() => loadState('ONET_depth', 1));
    const [maxDepthUnlocked, setMaxDepthUnlocked] = useState(() => loadState('ONET_maxDepth', 1));
    const [collectedFragments, setCollectedFragments] = useState(() => loadState('ONET_fragments', new Set(), (str) => new Set(JSON.parse(str))));
    const [unlockedArchives, setUnlockedArchives] = useState(() => loadState('ONET_archives', new Set(), (str) => new Set(JSON.parse(str))));

    // Auto-save logic
    useEffect(() => {
        try {
            localStorage.setItem('ONET_depth', JSON.stringify(depth));
            localStorage.setItem('ONET_maxDepth', JSON.stringify(maxDepthUnlocked));
            localStorage.setItem('ONET_fragments', JSON.stringify([...collectedFragments]));
            localStorage.setItem('ONET_archives', JSON.stringify([...unlockedArchives]));
        } catch (e) {
            console.warn("Could not save to local storage", e);
        }
    }, [depth, maxDepthUnlocked, collectedFragments, unlockedArchives]);
    const [lastHint, setLastHint] = useState(null);
    const [volume, setVolume] = useState(0.3); // Default volume

    // Network Completion & Combo System
    const [comboCount, setComboCount] = useState(0);
    const [mappingProgress, setMappingProgress] = useState({ captured: 1, total: 100 });
    const [has100Percent, setHas100Percent] = useState(false);

    const getPhosphorColor = (d) => {
        switch(d) {
            case 1: return '#33FF00'; // Green
            case 2: return '#FFB000'; // Amber
            case 3: return '#00f0ff'; // Cyan
            case 4: return '#ff00aa'; // Magenta
            default: return '#ff0000'; // Red
        }
    };

    const phosphorColor = getPhosphorColor(depth);

    const handleStart = useCallback(() => {
        if (!audioStarted) {
            audioManager.initialize();
            audioManager.setVolume(volume);
            setAudioStarted(true);
        }
    }, [audioStarted, volume]);

    const handleVolumeChange = useCallback((e) => {
        const newVol = parseFloat(e.target.value);
        setVolume(newVol);
        if (audioStarted) {
            audioManager.setVolume(newVol);
        }
    }, [audioStarted]);

    const handleFoundKey = useCallback((isRestart = false) => {
        setActiveData(null); // Close overlay
        if (isRestart) {
            // WIPE SAVE DATA ON REBOOT
            localStorage.removeItem('ONET_depth');
            localStorage.removeItem('ONET_maxDepth');
            localStorage.removeItem('ONET_fragments');
            localStorage.removeItem('ONET_archives');

            setDepth(1);
            setMaxDepthUnlocked(1);
            setCollectedFragments(new Set());
            setUnlockedArchives(new Set());
            setComboCount(0);
            setHas100Percent(false);
            if (audioStarted) {
                audioManager.reset();
                audioManager.initialize(); // re-init base layers
                audioManager.setVolume(volume);
            }
        } else {
            setDepth(d => {
                const nextDepth = d + 1;
                setMaxDepthUnlocked(m => Math.max(m, nextDepth));
                return nextDepth;
            });
            setComboCount(0);
            setHas100Percent(false);
        }
    }, [audioStarted, volume]);

    const handleComboEvent = useCallback((event) => {
        if (event === 'break') {
            setComboCount(0);
        } else if (event === 'hit') {
            setComboCount(prev => prev + 1);
        }
    }, []);

    const handleProgressUpdate = useCallback((captured, total) => {
        setMappingProgress(prev => {
            if (prev.captured === captured && prev.total === total) return prev;
            return { captured, total };
        });
        
        setHas100Percent(prev => {
            if (captured === total && total > 0 && !prev) {
                setLastHint("DIAG_LOG: SECTOR TRACE 100% [ BONUS DATA UNLOCKED ]");
                audioManager.playNote(880, 0);
                audioManager.playNote(1046, 0.2);
                audioManager.playNote(1318, 0.4); // Happy arpeggio
                return true;
            }
            return prev;
        });
    }, []);

    const handleSceneSelect = useCallback((data) => {
        if (data?.isDebug) {
            setLastHint(data.message);
        } else {
            if (data?.type === 'corrupted') {
                setCollectedFragments(prev => {
                    const next = new Set(prev);
                    next.add(data.fragmentId);
                    return next;
                });
            }
            setActiveData(data);
        }
    }, []);

    const handleReadLog = useCallback((logData) => {
        if (logData.isArchive) {
            setUnlockedArchives(prev => new Set(prev).add(depth));
        }
        setActiveData({
            type: 'corrupted',
            title: logData.title,
            description: logData.description
        });
    }, [depth]);

    const handleCloseManual = useCallback(() => setManualOpen(false), []);
    const handleCloseOverlay = useCallback(() => setActiveData(null), []);

    return (
        <main
            style={{ 
                width: '100%', height: '100%', position: 'relative', background: 'var(--color-bg)',
                '--color-phosphor': phosphorColor,
                boxSizing: 'border-box',
                overflow: 'hidden'
            }}
        >
            <ScreenFX />
            
            {appState === 'boot' && (
                <BootScreen onComplete={() => {
                    handleStart();
                    setAppState('running');
                }} />
            )}

            {appState === 'running' && (
                <>
                    <Scene 
                        onSelect={handleSceneSelect} 
                        depth={depth} 
                        phosphorColor={phosphorColor} 
                        onComboEvent={handleComboEvent}
                        onProgressUpdate={handleProgressUpdate}
                    />
                    

                    {/* GLOBAL SCREEN FRAME */}
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        
                        {/* TOP BAR */}
                        <header className="mono-text" style={{ 
                            pointerEvents: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                            borderBottom: '1px solid var(--color-phosphor)', background: 'rgba(0,0,0,0.8)', padding: '10px 20px'
                        }}>
                            {/* Left Side: Branding & Status */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <div className="inverted-block text-lg">INGRAM MAINFRAME // DIAG_MODE</div>
                                    <div className="text-sm" style={{ color: 'var(--color-phosphor)' }}>[ STATUS: {audioStarted ? "ONLINE" : "SILENT"} ]</div>
                                    
                                </div>
                                <div className="text-xs" style={{ color: 'var(--color-phosphor)', opacity: 0.8 }}>
                                    NEURAL UPLINK ESTABLISHED.
                                </div>
                                
                                {/* MOVED DIRECTIVE HERE */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '10px' }}>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <span className="inverted-block text-xs">CURRENT_DIRECTIVE</span>
                                        <span className="text-sm" style={{ color: 'var(--color-phosphor)' }}>LOCATE SECTOR LINK</span>
                                    </div>
                                    {lastHint && <div className="text-xs" style={{ color: 'var(--color-phosphor)' }}>DIAG_LOG: {lastHint}</div>}
                                </div>
                            </div>

                            {/* Center Side: Network Mapping Progress */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', flex: 1 }}>
                                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                    <span className="inverted-block text-md">
                                        TRACE_PROGRESS: {Math.round((mappingProgress.captured / mappingProgress.total) * 100)}%
                                    </span>
                                </div>
                                {/* Progress Bar Container */}
                                <div style={{ width: '300px', height: '10px', border: `1px solid ${phosphorColor}`, position: 'relative' }}>
                                    <div style={{ 
                                        width: `${(mappingProgress.captured / mappingProgress.total) * 100}%`, 
                                        height: '100%', 
                                        background: phosphorColor,
                                        boxShadow: `0 0 10px ${phosphorColor}`,
                                        transition: 'width 0.3s ease-out'
                                    }}></div>
                                </div>
                                {has100Percent && <div className="text-xs breathing-glow" style={{ color: phosphorColor, textShadow: `0 0 5px ${phosphorColor}` }}>*** SECTOR TRACE COMPLETE ***</div>}
                                
                                {/* COMBO INDICATOR (MOVED HERE) */}
                                {comboCount > 0 && (
                                    <div 
                                        className={`text-lg ${comboCount >= 3 ? 'breathing-glow' : ''}`} 
                                        style={{ 
                                            color: phosphorColor, 
                                            marginTop: '5px', 
                                            fontWeight: 'bold', 
                                            textShadow: `0 0 10px ${phosphorColor}`,
                                            transition: 'transform 0.2s',
                                            transform: `scale(${comboCount >= 3 ? 1.1 : 1})`
                                        }}
                                    >
                                        x{comboCount}
                                    </div>
                                )}
                            </div>

                            {/* Right Side: Manual Button */}
                            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, alignItems: 'flex-end' }}>
                                <button 
                                    onClick={() => setManualOpen(!manualOpen)}
                                    className="mono-text breathing-glow"
                                    style={{ 
                                        background: manualOpen ? 'var(--color-phosphor)' : 'transparent', 
                                        color: manualOpen ? '#000' : 'var(--color-phosphor)', 
                                        border: '1px solid var(--color-phosphor)', 
                                        padding: '2px 8px', 
                                        cursor: 'pointer',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    [ ? ] DIAGNOSTIC_MANUAL
                                </button>
                            </div>
                        </header>

                        {/* MIDDLE INTERACTIVE SPACE */}
                        <div style={{ flex: 1, pointerEvents: 'none', position: 'relative' }}>
                            <ManualOverlay isOpen={manualOpen} onClose={handleCloseManual} />

                            {/* ABSOLUTE OVERLAY WINDOW (LEFT MIDDLE) */}
                            <div style={{ position: 'absolute', top: '50%', left: '40px', transform: 'translateY(-50%)', pointerEvents: 'auto', zIndex: 50 }}>
                                <Overlay data={activeData} onClose={handleCloseOverlay} onWarp={handleFoundKey} />
                            </div>

                        </div>

                        {/* BOTTOM FLOATING MODULES */}
                        <div className="mono-text" style={{ 
                            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', pointerEvents: 'none',
                            padding: '20px' // Floating offset from the bottom corners
                        }}>
                            {/* Left Side: Descent Tracker, & Volume */}
                            <div style={{ pointerEvents: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <DataDriveTracker 
                                    depth={depth} 
                                    collectedFragments={collectedFragments} 
                                    unlockedArchives={unlockedArchives}
                                    onReadLog={handleReadLog} 
                                />

                                {/* Sector Navigation UI */}
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button 
                                        onClick={() => setDepth(d => Math.max(1, d - 1))}
                                        disabled={depth <= 1}
                                        className="mono-text"
                                        style={{ background: 'transparent', border: '1px solid var(--color-phosphor)', color: 'var(--color-phosphor)', padding: '5px 15px', cursor: depth <= 1 ? 'not-allowed' : 'pointer', opacity: depth <= 1 ? 0.3 : 1 }}
                                    >
                                        &lt; PREV_SECTOR
                                    </button>
                                    <button 
                                        onClick={() => setDepth(d => Math.min(maxDepthUnlocked, d + 1))}
                                        disabled={depth >= maxDepthUnlocked}
                                        className="mono-text"
                                        style={{ background: 'transparent', border: '1px solid var(--color-phosphor)', color: 'var(--color-phosphor)', padding: '5px 15px', cursor: depth >= maxDepthUnlocked ? 'not-allowed' : 'pointer', opacity: depth >= maxDepthUnlocked ? 0.3 : 1 }}
                                    >
                                        NEXT_SECTOR &gt;
                                    </button>
                                </div>
                                
                                <div className="double-border" style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '5px', color: 'var(--color-phosphor)', width: 'fit-content' }}>
                                    <div><span className="text-xs">MASTER_GAIN: {Math.round(volume * 100)}%</span></div>
                                    <div className="text-lg" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <button 
                                            onClick={() => handleVolumeChange({ target: { value: Math.max(0, volume - 0.1) }})}
                                            aria-label="Decrease Volume"
                                            className="text-primary"
                                            style={{ background: 'transparent', border: '1px solid var(--color-phosphor)', color: 'var(--color-phosphor)', cursor: 'pointer', fontFamily: 'monospace', padding: '2px 8px', fontWeight: 'bold', lineHeight: '1' }}
                                        >
                                            -
                                        </button>
                                        <span style={{ letterSpacing: '2px' }}>{`[${'█'.repeat(Math.round(volume * 10))}${'·'.repeat(10 - Math.round(volume * 10))}]`}</span>
                                        <button 
                                            onClick={() => handleVolumeChange({ target: { value: Math.min(1, volume + 0.1) }})}
                                            aria-label="Increase Volume"
                                            className="text-primary"
                                            style={{ background: 'transparent', border: '1px solid var(--color-phosphor)', color: 'var(--color-phosphor)', cursor: 'pointer', fontFamily: 'monospace', padding: '2px 8px', fontWeight: 'bold', lineHeight: '1' }}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Assistant */}
                            <div style={{ pointerEvents: 'auto' }}>
                                <Assistant depth={depth} activeData={activeData} lastHint={lastHint} />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </main>
    );
}

export default App;

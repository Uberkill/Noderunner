import React, { useCallback } from 'react';
import Scene from './3d/Scene';
import Overlay from './ui/Overlay';
import { audioManager } from './audio/AudioManager';
import ScreenFX from './3d/ScreenFX';
import BootScreen from './ui/BootScreen';
import Assistant from './ui/Assistant';
import DataDriveTracker from './ui/DataDriveTracker';
import ManualOverlay from './ui/ManualOverlay';
import { useGameStore } from './core/store';

function App() {
    const { 
        appState, setAppState, 
        activeData, setActiveData, 
        manualOpen, setManualOpen,
        audioStarted, setAudioStarted,
        depth, setDepth, maxDepthUnlocked,
        lastHint, setLastHint,
        volume, setVolume,
        comboCount, setComboCount,
        mappingProgress, setHas100Percent, has100Percent
    } = useGameStore();

    const phosphorColor = getPhosphorColor(depth);

    const handleStart = useCallback(() => {
        if (!audioStarted) {
            audioManager.initialize();
            audioManager.setVolume(volume);
            setAudioStarted(true);
        }
    }, [audioStarted, volume, setAudioStarted]);

    const handleVolumeChange = useCallback((e) => {
        const newVol = parseFloat(e.target.value);
        setVolume(newVol);
        if (audioStarted) {
            audioManager.setVolume(newVol);
        }
    }, [audioStarted, setVolume]);

    const handleFoundKey = useCallback((isRestart = false) => {
        setActiveData(null);
        if (isRestart) {
            useGameStore.getState().hardReset();
            if (audioStarted) {
                audioManager.reset();
                audioManager.initialize();
                audioManager.setVolume(volume);
            }
        } else {
            setDepth(d => d + 1);
            setComboCount(0);
            setHas100Percent(false);
        }
    }, [audioStarted, volume, setActiveData, setDepth, setComboCount, setHas100Percent]);

    const handleCloseManual = useCallback(() => setManualOpen(false), [setManualOpen]);
    const handleCloseOverlay = useCallback(() => setActiveData(null), [setActiveData]);

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
                    <Scene phosphorColor={phosphorColor} onSelect={(data) => {
                        if (data && data.type === 'corrupted' && !data.isKey) {
                            useGameStore.getState().addFragment(data.id);
                        }
                        setActiveData(data);
                    }} />
                    
                    {/* GLOBAL SCREEN FRAME */}
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        
                        <header className="mono-text" style={{ 
                            pointerEvents: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                            borderBottom: '1px solid var(--color-phosphor)', background: 'rgba(0,0,0,0.8)', padding: '10px 20px'
                        }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <div className="inverted-block text-lg">INGRAM MAINFRAME // DIAG_MODE</div>
                                    <div className="text-sm" style={{ color: 'var(--color-phosphor)' }}>[ STATUS: {audioStarted ? "ONLINE" : "SILENT"} ]</div>
                                </div>
                                <div className="text-xs" style={{ color: 'var(--color-phosphor)', opacity: 0.8 }}>NEURAL UPLINK ESTABLISHED.</div>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '10px' }}>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <span className="inverted-block text-xs">CURRENT_DIRECTIVE</span>
                                        <span className="text-sm" style={{ color: 'var(--color-phosphor)' }}>LOCATE SECTOR LINK</span>
                                    </div>
                                    {lastHint && <div className="text-xs" style={{ color: 'var(--color-phosphor)' }}>DIAG_LOG: {lastHint}</div>}
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', flex: 1 }}>
                                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                    <span className="inverted-block text-md">
                                        TRACE_PROGRESS: {Math.round((mappingProgress.captured / mappingProgress.total) * 100)}%
                                    </span>
                                </div>
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
                                
                                {comboCount > 0 && (
                                    <div className={`text-lg ${comboCount >= 3 ? 'breathing-glow' : ''}`} style={{ 
                                            color: phosphorColor, marginTop: '5px', fontWeight: 'bold', textShadow: `0 0 10px ${phosphorColor}`,
                                            transition: 'transform 0.2s', transform: `scale(${comboCount >= 3 ? 1.1 : 1})`
                                        }}>
                                        x{comboCount}
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, alignItems: 'flex-end' }}>
                                <button onClick={() => setManualOpen(!manualOpen)} className="mono-text breathing-glow" style={{ 
                                        background: manualOpen ? 'var(--color-phosphor)' : 'transparent', color: manualOpen ? '#000' : 'var(--color-phosphor)', 
                                        border: '1px solid var(--color-phosphor)', padding: '2px 8px', cursor: 'pointer', fontWeight: 'bold'
                                    }}>
                                    [ ? ] DIAGNOSTIC_MANUAL
                                </button>
                            </div>
                        </header>

                        <div style={{ flex: 1, pointerEvents: 'none', position: 'relative' }}>
                            <ManualOverlay isOpen={manualOpen} onClose={handleCloseManual} />
                            <div style={{ position: 'absolute', top: '50%', left: '40px', transform: 'translateY(-50%)', pointerEvents: 'auto', zIndex: 50 }}>
                                {activeData && (activeData.isKey || activeData.type === 'blackbox' || activeData.isArchive) && (
                                    <Overlay data={activeData} onClose={handleCloseOverlay} onWarp={handleFoundKey} />
                                )}
                            </div>
                        </div>

                        <div className="mono-text" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', pointerEvents: 'none', padding: '20px' }}>
                            <div style={{ pointerEvents: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <DataDriveTracker />
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button onClick={() => setDepth(d => Math.max(1, d - 1))} disabled={depth <= 1} className="mono-text" style={{ background: 'transparent', border: '1px solid var(--color-phosphor)', color: 'var(--color-phosphor)', padding: '5px 15px', cursor: depth <= 1 ? 'not-allowed' : 'pointer', opacity: depth <= 1 ? 0.3 : 1 }}>
                                        &lt; PREV_SECTOR
                                    </button>
                                    <button onClick={() => setDepth(d => Math.min(maxDepthUnlocked, d + 1))} disabled={depth >= maxDepthUnlocked} className="mono-text" style={{ background: 'transparent', border: '1px solid var(--color-phosphor)', color: 'var(--color-phosphor)', padding: '5px 15px', cursor: depth >= maxDepthUnlocked ? 'not-allowed' : 'pointer', opacity: depth >= maxDepthUnlocked ? 0.3 : 1 }}>
                                        NEXT_SECTOR &gt;
                                    </button>
                                </div>
                                <div className="double-border" style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '5px', color: 'var(--color-phosphor)', width: 'fit-content' }}>
                                    <div><span className="text-xs">MASTER_GAIN: {Math.round(volume * 100)}%</span></div>
                                    <div className="text-lg" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <button onClick={() => handleVolumeChange({ target: { value: Math.max(0, volume - 0.1) }})} className="text-primary" style={{ background: 'transparent', border: '1px solid var(--color-phosphor)', color: 'var(--color-phosphor)', cursor: 'pointer', fontFamily: 'monospace', padding: '2px 8px', fontWeight: 'bold', lineHeight: '1' }}>-</button>
                                        <span style={{ letterSpacing: '2px' }}>{`[${'█'.repeat(Math.round(volume * 10))}${'·'.repeat(10 - Math.round(volume * 10))}]`}</span>
                                        <button onClick={() => handleVolumeChange({ target: { value: Math.min(1, volume + 0.1) }})} className="text-primary" style={{ background: 'transparent', border: '1px solid var(--color-phosphor)', color: 'var(--color-phosphor)', cursor: 'pointer', fontFamily: 'monospace', padding: '2px 8px', fontWeight: 'bold', lineHeight: '1' }}>+</button>
                                    </div>
                                </div>
                            </div>
                            <div style={{ pointerEvents: 'auto' }}>
                                <Assistant />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </main>
    );
}

function getPhosphorColor(d) {
    switch(d) {
        case 1: return '#33FF00';
        case 2: return '#FFB000';
        case 3: return '#00f0ff';
        case 4: return '#ff00aa';
        default: return '#ff0000';
    }
}

export default App;

import React, { useState } from 'react';
import { STORY_DATA } from '../../StoryData';

export default React.memo(function DataDriveTracker({ depth, collectedFragments, unlockedArchives, onReadLog }) {
    const [journalOpen, setJournalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(1);
    
    // Determine which stage we're on (cap at 5)
    const stageDepth = Math.min(depth, 5);
    const stageData = STORY_DATA[stageDepth];

    // Determine how many we've collected in this stage
    const stageFrags = stageData.fragments;
    const collectedInStage = stageFrags.filter(f => collectedFragments.has(f.id));
    const isStageComplete = collectedInStage.length === 5 || unlockedArchives.has(stageDepth);

    return (
        <>
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '15px',
                padding: '10px 20px',
                background: 'rgba(0,0,0,0.8)',
                border: '1px solid var(--color-phosphor)'
            }}>
                <div className="text-md" style={{ color: 'var(--color-phosphor)' }}>
                    [ L-0{stageDepth} ]
                </div>
                
                {/* Horizontal Progress Blocks */}
                <div style={{ display: 'flex', gap: '5px' }}>
                    {stageFrags.map((frag, idx) => {
                        const isCollected = collectedFragments.has(frag.id);
                        return (
                            <div 
                                key={frag.id}
                                style={{ 
                                    width: '15px', 
                                    height: '15px', 
                                    border: `1px solid ${isCollected ? 'var(--color-phosphor)' : 'rgba(255,0,0,0.5)'}`,
                                    background: isCollected ? 'var(--color-phosphor)' : 'transparent',
                                    boxShadow: isCollected ? '0 0 5px var(--color-phosphor)' : 'none'
                                }}
                            />
                        );
                    })}
                </div>

                {isStageComplete && !unlockedArchives.has(stageDepth) && (
                    <button 
                        onClick={() => onReadLog({ title: stageData.archive.title, description: stageData.archive.text, isArchive: true })}
                        className="inverted-block breathing-glow text-sm"
                        style={{ 
                            padding: '2px 10px', 
                            cursor: 'pointer',
                            background: 'var(--color-phosphor)',
                            color: 'black',
                            border: 'none',
                            fontWeight: 'bold'
                        }}
                    >
                        [!] ARCHIVE
                    </button>
                )}

                <div style={{ flex: 1 }}></div>

                <div className="text-xs" style={{ color: 'var(--color-phosphor)', opacity: 0.8 }}>
                    {collectedFragments.size} / 25
                </div>

                <button 
                    onClick={() => setJournalOpen(true)}
                    style={{
                        background: 'transparent',
                        border: '1px solid var(--color-phosphor)',
                        color: 'var(--color-phosphor)',
                        padding: '4px 10px',
                        cursor: 'pointer',
                        fontFamily: 'monospace',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                    }}
                >
                    <span>📖</span> JOURNAL
                </button>
            </div>

            {/* JOURNAL MODAL */}
            {journalOpen && (
                <div style={{
                    position: 'fixed',
                    top: '5%', left: '5%', right: '5%', bottom: '5%',
                    background: 'rgba(0, 0, 0, 0.95)',
                    border: '2px solid var(--color-phosphor)',
                    zIndex: 9999,
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '40px',
                    color: 'var(--color-phosphor)',
                    fontFamily: 'monospace',
                    overflowY: 'auto'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--color-phosphor)', paddingBottom: '10px', marginBottom: '30px' }}>
                        <h2 className="text-lg" style={{ margin: 0, textShadow: '0 0 10px var(--color-phosphor)' }}>SYSTEM JOURNAL // DECRYPTED LORE</h2>
                        <button 
                            onClick={() => setJournalOpen(false)}
                            style={{ background: 'transparent', color: 'var(--color-phosphor)', border: 'none', fontSize: '20px', cursor: 'pointer' }}
                        >
                            [X]
                        </button>
                    </div>

                    {/* TABS BAR */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginBottom: '30px' }}>
                        <button 
                            onClick={() => setActiveTab(prev => Math.max(1, prev - 1))}
                            style={{ background: 'transparent', border: '1px solid var(--color-phosphor)', color: 'var(--color-phosphor)', padding: '5px 15px', cursor: 'pointer' }}
                            disabled={activeTab === 1}
                        >
                            &lt;
                        </button>
                        {[1, 2, 3, 4, 5].map(num => (
                            <button
                                key={num}
                                onClick={() => setActiveTab(num)}
                                style={{
                                    background: activeTab === num ? 'var(--color-phosphor)' : 'transparent',
                                    color: activeTab === num ? 'var(--color-bg)' : 'var(--color-phosphor)',
                                    border: '1px solid var(--color-phosphor)',
                                    padding: '5px 15px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    fontFamily: 'monospace'
                                }}
                            >
                                LAYER {num}
                            </button>
                        ))}
                        <button 
                            onClick={() => setActiveTab(prev => Math.min(5, prev + 1))}
                            style={{ background: 'transparent', border: '1px solid var(--color-phosphor)', color: 'var(--color-phosphor)', padding: '5px 15px', cursor: 'pointer' }}
                            disabled={activeTab === 5}
                        >
                            &gt;
                        </button>
                    </div>

                    {/* ACTIVE LAYER CONTENT */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        {(() => {
                            const layerData = STORY_DATA[activeTab];
                            const layerArchiveUnlocked = unlockedArchives.has(activeTab);
                            const fragsInLayer = layerData.fragments.filter(f => collectedFragments.has(f.id));

                            return (
                                <>
                                    {/* Data Sectors (Fragments) */}
                                    <div>
                                        <h3 style={{ borderBottom: '1px solid var(--color-phosphor)', paddingBottom: '10px', marginBottom: '20px' }}>DATA SECTORS [{fragsInLayer.length}/5]</h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
                                            {layerData.fragments.map((frag, idx) => {
                                                const hasIt = collectedFragments.has(frag.id);
                                                return (
                                                    <div key={frag.id} style={{ 
                                                        border: `1px solid ${hasIt ? 'var(--color-phosphor)' : 'rgba(0,255,255,0.2)'}`, 
                                                        padding: '15px',
                                                        background: hasIt ? 'rgba(0,255,255,0.05)' : 'transparent',
                                                        opacity: hasIt ? 1 : 0.4
                                                    }}>
                                                        <div className="text-xs" style={{ marginBottom: '10px', color: 'rgba(0,255,255,0.6)' }}>
                                                            SECTOR 0{idx + 1}
                                                        </div>
                                                        <strong className="text-md" style={{ display: 'block', marginBottom: '10px' }}>
                                                            {hasIt ? frag.title : "[ CORRUPTED DATA ]"}
                                                        </strong>
                                                        <div className="text-sm" style={{ 
                                                            lineHeight: '1.6', 
                                                            fontFamily: 'sans-serif',
                                                            color: hasIt ? 'var(--color-phosphor)' : 'transparent',
                                                            textShadow: 'none',
                                                            fontWeight: '500'
                                                        }}>
                                                            {hasIt ? frag.text : "█████████████\n██████\n██████████"}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Major Archive */}
                                    <div style={{ marginTop: '20px' }}>
                                        <h3 style={{ borderBottom: '1px solid var(--color-phosphor)', paddingBottom: '10px', marginBottom: '20px' }}>MAJOR ARCHIVE</h3>
                                        <div style={{ 
                                            border: '1px solid var(--color-phosphor)', 
                                            padding: '25px', 
                                            background: layerArchiveUnlocked ? 'rgba(0,255,255,0.1)' : 'transparent' 
                                        }}>
                                            {layerArchiveUnlocked ? (
                                                <>
                                                    <strong className="text-lg" style={{ display: 'block', marginBottom: '20px', fontFamily: 'monospace' }}>
                                                        {layerData.archive.title}
                                                    </strong>
                                                    <div className="text-md" style={{ 
                                                        lineHeight: '1.8', 
                                                        fontFamily: 'sans-serif',
                                                        color: '#e0ffff',
                                                        textShadow: 'none',
                                                        fontWeight: '500',
                                                        maxWidth: '800px'
                                                    }}>
                                                        {layerData.archive.text.split('\n\n').map((para, i) => (
                                                            <p key={i} style={{ marginBottom: '15px' }}>{para}</p>
                                                        ))}
                                                    </div>
                                                </>
                                            ) : (
                                                <div style={{ opacity: 0.4, textAlign: 'center', padding: '40px 0', fontFamily: 'monospace' }}>
                                                    [ DECRYPTION PENDING: {fragsInLayer.length}/5 FRAGMENTS RECOVERED ]
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>
            )}
        </>
    );
});

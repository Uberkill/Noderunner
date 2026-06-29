import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// import { voiceManager } from './VoiceManager';

export default React.memo(function Overlay({ data, onClose, onWarp }) {
    const [decrypted, setDecrypted] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (data) {
            setDecrypted(false);
            setProgress(0);

            // If it's not the key node, decrypt instantly to show lore!
            if (!data.isKey) {
                setProgress(100);
                setDecrypted(true);
                
                // Lore fragments now stay open until manually closed
                return;
            }

            // Decryption Sequence for Key Node
            const duration = 2000; // 2 seconds to decrypt
            const interval = 50;
            const step = 100 / (duration / interval);

            const timer = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(timer);
                        setDecrypted(true);
                        return 100;
                    }
                    return prev + step;
                });
            }, interval);

            return () => {
                clearInterval(timer);
            };
        }
    }, [data]);

    return (
        <AnimatePresence>
            {data && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, x: -20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95, x: -20 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="overlay-title"
                    className="mono-text"
                    style={{
                        width: '500px',
                        maxHeight: '80vh',
                        background: 'rgba(0, 0, 0, 0.85)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid var(--color-phosphor)',
                        padding: '30px',
                        color: 'var(--color-text)',
                        display: 'flex',
                        flexDirection: 'column',
                        zIndex: 100,
                        boxShadow: '0 0 20px rgba(0,0,0,0.8)'
                    }}
                >
                    <button
                        onClick={onClose}
                        aria-label="Close Details"
                        className="mono-text text-secondary"
                        style={{
                            position: 'absolute',
                            top: '15px',
                            right: '15px',
                            background: 'transparent',
                            border: '1px solid var(--color-phosphor)',
                            color: 'var(--color-phosphor)',
                            cursor: 'pointer',
                            padding: '2px 6px',
                            fontSize: '12px'
                        }}
                    >
                        [ CLOSE ]
                    </button>

                    {/* Header */}
                    <div style={{ borderBottom: '4px double var(--color-phosphor)', paddingBottom: '10px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingRight: '10px' }}>
                        <div className="data-fragment-text text-xl" style={{
                            margin: 0,
                            color: 'var(--color-phosphor)',
                            opacity: decrypted ? 1 : 0.5,
                            fontWeight: 'bold',
                            letterSpacing: '2px'
                        }}>
                            {decrypted ? <span className="inverted-block"> {data.title.toUpperCase()} </span> : <span className="inverted-block" style={{ background: '#333', color: 'var(--color-phosphor)' }}> ENCRYPTED SIGNAL </span>}
                        </div>
                        <div className="text-sm" style={{ textAlign: 'right', marginTop: '5px' }}>
                            NODE_ID: {data.id?.substring(0,8).toUpperCase() || 'UNKNOWN'}<br/>
                            TYPE: {data.type?.toUpperCase() || 'DATA'}
                        </div>
                    </div>

                    {/* Decryption Bar */}
                    {!decrypted && (
                        <div style={{ marginBottom: '30px' }}>
                            <div aria-live="polite" style={{ color: 'var(--color-phosphor)', opacity: 0.5, marginBottom: '5px' }}>
                                DECRYPTING CLUSTER... {Math.floor(progress)}%
                            </div>
                            <div 
                                role="progressbar" 
                                aria-valuenow={Math.floor(progress)} 
                                aria-valuemin="0" 
                                aria-valuemax="100" 
                                style={{ width: '100%', height: '4px', background: '#222' }}
                            >
                                <div style={{ width: `${progress}%`, height: '100%', background: 'var(--color-phosphor)' }} />
                            </div>
                        </div>
                    )}

                    {/* Content */}
                    <div style={{ opacity: decrypted ? 1 : 0.3, transition: 'opacity 0.5s', flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
                        
                        {/* Tabular Data Grid */}
                        <div style={{
                            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px',
                            borderBottom: '2px dashed var(--color-phosphor)', paddingBottom: '15px', marginBottom: '15px',
                            fontFamily: 'monospace'
                        }}>
                            <div className="text-sm"><span className="text-xs">SECURITY:</span> <span style={{ opacity: 0.5 }}>{decrypted ? 'BYPASSED' : 'LOCKED'}</span></div>
                            <div className="text-sm"><span className="text-xs">ENCRYPTION:</span> <span style={{ opacity: 0.5 }}>AES-256</span></div>
                            <div className="text-sm"><span className="text-xs">FRAG_SIZE:</span> <span style={{ opacity: 0.5 }}>1024_B</span></div>
                            <div className="text-sm"><span className="text-xs">INTEGRITY:</span> <span style={{ opacity: 0.5 }}>STABLE</span></div>
                        </div>

                        {/* Structural Wireframe Placeholder */}
                        <div style={{
                            width: '100%',
                            height: '150px',
                            border: '1px solid var(--color-phosphor)',
                            marginBottom: '20px',
                            position: 'relative',
                            overflow: 'hidden',
                            display: 'flex', justifyContent: 'center', alignItems: 'center'
                        }}>
                            {/* Grid lines */}
                            <div style={{ position: 'absolute', top: 0, left: '50%', width: '1px', height: '100%', background: 'var(--color-phosphor)', opacity: 0.3 }} />
                            <div style={{ position: 'absolute', top: '50%', left: 0, width: '100%', height: '1px', background: 'var(--color-phosphor)', opacity: 0.3 }} />
                            <div style={{ position: 'absolute', top: 0, left: '25%', width: '1px', height: '100%', background: 'var(--color-phosphor)', opacity: 0.1 }} />
                            <div style={{ position: 'absolute', top: 0, left: '75%', width: '1px', height: '100%', background: 'var(--color-phosphor)', opacity: 0.1 }} />
                            
                            {/* The 'Object' */}
                            <div style={{ 
                                width: '60%', height: '60%', border: '2px solid var(--color-phosphor)', 
                                transform: 'rotateX(60deg) rotateZ(45deg)', transformStyle: 'preserve-3d'
                            }} />
                            <div className="text-xs" style={{ position: 'absolute', bottom: 5, right: 5 }}>[ TOPOLOGY_DIAGRAM ]</div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            {/* Distinct standalone vertical bar */}
                            <div style={{ width: '8px', height: '40px', background: 'var(--color-phosphor)' }} />
                            <div className="text-md" style={{
                                lineHeight: '1.6',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                                fontFamily: 'monospace',
                                fontWeight: '500',
                                color: 'var(--color-phosphor)'
                            }}>
                                {decrypted ? data.description : "x7F x91 SYSTEM FAILURE...\nDATA CORRUPTION DETECTED...\nHACKING SECURITY PROTOCOLS..."}
                            </div>
                        </div>

                        {/* Manual Warp Button for the Key Node */}
                        {decrypted && data.isKey && data.type !== 'blackbox' && (
                            <button
                                onClick={() => onWarp(false)}
                                className="mono-text"
                                style={{
                                    marginTop: '30px',
                                    padding: '15px',
                                    background: 'var(--color-phosphor)',
                                    border: 'none',
                                    color: '#000',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    letterSpacing: '2px',
                                    textTransform: 'uppercase',
                                    boxShadow: '0 0 15px var(--color-phosphor)'
                                }}
                            >
                                [ INITIATE DEEP DIVE ]
                            </button>
                        )}

                        {/* Win State Options */}
                        {decrypted && data.type === 'blackbox' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '30px' }}>
                                <button
                                    onClick={() => onWarp(true)} // true = restart
                                    className="mono-text"
                                    style={{
                                        padding: '15px',
                                        background: 'rgba(255, 0, 0, 0.2)',
                                        border: '1px solid red',
                                        color: '#ffaaaa',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        letterSpacing: '2px',
                                        textTransform: 'uppercase',
                                        boxShadow: '0 0 15px rgba(255, 0, 0, 0.5)'
                                    }}
                                >
                                    [ SYSTEM REBOOT (WIN) ]
                                </button>
                                <button
                                    onClick={() => onWarp(false)} // false = continue dive
                                    className="mono-text"
                                    style={{
                                        padding: '15px',
                                        background: 'transparent',
                                        border: '1px solid var(--color-secondary)',
                                        color: 'var(--color-secondary)',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        letterSpacing: '1px',
                                        textTransform: 'uppercase'
                                    }}
                                >
                                    [ IGNORE & CONTINUE DIVE ]
                                </button>
                            </div>
                        )}
                    </div>

                </motion.div>
            )}
        </AnimatePresence>
    );
});

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default React.memo(function ManualOverlay({ isOpen, onClose }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    drag
                    dragMomentum={false}
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    role="dialog"
                    aria-modal="true"
                    className="mono-text"
                    style={{
                        position: 'absolute',
                        bottom: '150px', // Above the Assistant
                        right: '20px',
                        width: '400px', // slightly slimmer to fit right side better
                        pointerEvents: 'auto',
                        cursor: 'grab',
                        background: 'rgba(0, 0, 0, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '2px solid var(--color-phosphor)',
                        padding: '30px',
                        color: 'var(--color-text)',
                        display: 'flex',
                        flexDirection: 'column',
                        zIndex: 200,
                        boxShadow: '0 10px 30px rgba(0,0,0,0.8)'
                    }}
                >
                    <button
                        onClick={onClose}
                        className="mono-text text-sm"
                        style={{
                            position: 'absolute',
                            top: '15px',
                            right: '15px',
                            background: 'transparent',
                            border: '1px solid var(--color-phosphor)',
                            color: 'var(--color-phosphor)',
                            cursor: 'pointer',
                            padding: '2px 6px',
                        }}
                    >
                        [ CLOSE ]
                    </button>

                    <h2 className="text-lg" style={{ borderBottom: '2px solid var(--color-phosphor)', paddingBottom: '10px', marginTop: 0 }}>
                        INGRAM CORP // MAINTENANCE PROTOCOL v1.04
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '10px' }}>
                        <div>
                            <span className="inverted-block text-sm" style={{ marginBottom: '5px' }}>NAVIGATION OVERRIDE</span>
                            <div className="text-md" style={{ lineHeight: '1.5' }}>
                                - Left Click + Drag the void to rotate the corrupted sector.<br/>
                                - Scroll Wheel to inspect depth and structure.
                            </div>
                        </div>

                        <div>
                            <span className="inverted-block text-sm" style={{ marginBottom: '5px' }}>TRACE DIRECTIVES</span>
                            <div className="text-md" style={{ lineHeight: '1.5' }}>
                                - Click nodes to run a diagnostic trace. Most are empty routing nodes.<br/>
                                - Find and rebuild <span style={{ fontWeight: 'bold' }}>5 Corrupted Fragments</span> per sector to unlock the primary archive.<br/>
                                - Locate the <span style={{ fontWeight: 'bold' }}>Gateway Node</span> (usually furthest away) to bypass into older architectures.
                            </div>
                        </div>

                        <div>
                            <span className="inverted-block text-sm" style={{ marginBottom: '5px' }}>SYSTEM HAZARDS</span>
                            <div className="text-md" style={{ lineHeight: '1.5' }}>
                                - <span style={{ fontWeight: 'bold' }}>Chain-Linking:</span> Tracing nodes rapidly stabilizes the local network (Combo Multiplier).<br/>
                                - <span style={{ fontWeight: 'bold' }}>Volatile Corruption:</span> WARNING: Red nodes contain volatile code. Interaction will sever the trace link.<br/>
                                - <span style={{ fontWeight: 'bold' }}>Sector Traversal:</span> You can return to previously stabilized sectors using the bottom-left navigation menu to hunt for missed data.
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
});

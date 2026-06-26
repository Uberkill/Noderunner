import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BOOT_SEQUENCE = [
    "BIOS Date 04/18/88 14:11:03 Ver 1.04",
    "CPU: INGRAM CORP. NEURAL-LACE COPROCESSOR",
    "Speed: 4.77 MHz",
    "Memory Test: 640K OK",
    "",
    "Loading O-NET V1...",
    "Mounting Virtual Sub-Ether Volume [C:]... OK",
    "Initializing Phosphor Drivers... OK",
    "Establishing Audio Resonance... OK",
    "",
    "SYSTEM READY."
];

export default function BootScreen({ onComplete }) {
    const [lines, setLines] = useState([]);
    const [phase, setPhase] = useState('terminal'); // 'terminal' | 'briefing'

    useEffect(() => {
        let currentLine = 0;
        let timeoutIds = [];

        const nextLine = () => {
            if (currentLine < BOOT_SEQUENCE.length) {
                setLines(prev => [...prev, BOOT_SEQUENCE[currentLine]]);
                currentLine++;
                // Accessible timing: 150-350ms per line. No strobing.
                const delay = Math.random() * 200 + 150; 
                const id = setTimeout(nextLine, delay);
                timeoutIds.push(id);
            } else {
                const id = setTimeout(() => setPhase('briefing'), 1000);
                timeoutIds.push(id);
            }
        };

        if (phase === 'terminal') {
            const id = setTimeout(nextLine, 500);
            timeoutIds.push(id);
        }

        return () => {
            timeoutIds.forEach(clearTimeout);
        };
    }, [phase]);

    return (
        <div className="mono-text" style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: '#000', color: 'var(--color-phosphor)',
            padding: '40px', boxSizing: 'border-box', zIndex: 100,
            display: 'flex', flexDirection: 'column',
            justifyContent: 'center', alignItems: 'center',
            overflow: 'hidden'
        }}>
            <AnimatePresence mode="wait">
                {phase === 'terminal' && (
                    <motion.div 
                        key="terminal"
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.5 }}
                        style={{ width: '600px', maxWidth: '100%', textShadow: '0 0 5px var(--color-phosphor)' }}
                    >
                        {lines.map((line, i) => (
                            <div key={i} className="text-md" style={{ marginBottom: '8px', minHeight: '1em' }}>{line}</div>
                        ))}
                        <div className="breathing-glow text-md" style={{ marginTop: '8px', minHeight: '1em' }}>█</div>
                    </motion.div>
                )}

                {phase === 'briefing' && (
                    <motion.div
                        key="briefing"
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        style={{
                            position: 'relative',
                            width: '600px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            textAlign: 'center',
                            border: '2px solid var(--color-phosphor)',
                            background: 'rgba(0, 0, 0, 0.9)',
                            padding: '50px 40px',
                            boxShadow: '0 0 30px rgba(0,0,0,0.8)'
                        }}
                    >
                        {/* Static Content Container */}
                        <div style={{ position: 'relative', zIndex: 10, width: '100%' }}>
                            <h1 className="text-hero" style={{ marginBottom: '5px' }}>DIAGNOSTIC MODE</h1>
                            <div className="text-md" style={{ marginBottom: '40px', opacity: 0.8, letterSpacing: '2px' }}>SECTOR TRACE INITIATED</div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left', marginBottom: '50px' }}>
                                <div className="text-sm" style={{ color: 'var(--color-secondary, #FFB000)', marginBottom: '10px', fontWeight: 'bold' }}>
                                    WARNING: SEVERE SYSTEM CORRUPTION. REPAIR TECHNICIAN REQUIRED.
                                </div>
                                <div>
                                    <span className="inverted-block text-sm" style={{ marginBottom: '5px' }}>INTERFACE_OVERRIDE</span>
                                    <div className="text-md">Manual input required. Drag to rotate system cluster. Scroll to inspect depth.</div>
                                </div>
                                <div>
                                    <span className="inverted-block text-sm" style={{ marginBottom: '5px' }}>TRACE_PROTOCOL</span>
                                    <div className="text-md">Trace network nodes to rebuild corrupted data fragments. Recover 5 fragments to bypass Sector Archive lockout.</div>
                                </div>
                                <div>
                                    <span className="inverted-block text-sm" style={{ marginBottom: '5px' }}>DEEP_SCAN</span>
                                    <div className="text-md">Locate the deeper system Gateway to descend into older architectures.</div>
                                </div>
                            </div>

                            <button 
                                onClick={onComplete}
                                className="mono-text breathing-glow"
                                style={{
                                    background: 'var(--color-phosphor)',
                                    color: '#000',
                                    border: 'none',
                                    padding: '15px 30px',
                                    cursor: 'pointer',
                                    fontSize: '18px',
                                    fontWeight: 'bold',
                                    boxShadow: '0 0 15px var(--color-phosphor)'
                                }}
                            >
                                [ INITIATE SYSTEM TRACE ]
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

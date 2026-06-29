import React, { useState, useEffect } from 'react';
import { useGameStore } from '../core/store';

const ASCII_FACE = `
 +-----+
 | 0_0 |
 +-----+
`;

export default function Assistant() {
    const { depth, activeData, lastHint } = useGameStore();
    const [text, setText] = useState("");
    const [displayedText, setDisplayedText] = useState("");

    // Determine current narrative text
    useEffect(() => {
        let newText = "";
        if (activeData) {
            if (activeData.isKey) {
                newText = "SIGNAL LOCKED. Gateway anomaly verified. Proceed to deep dive.";
            } else if (activeData.type === 'corrupted') {
                newText = "ARCHIVE FRAGMENT SECURED. Decryption in progress. Check the journal.";
            } else if (activeData.type === 'hazard') {
                newText = "WARNING! TOXIC NODE INTERSECTED. NETWORK DAMAGE SUSTAINED.";
            } else {
                newText = "Standard data routing. Background noise. Keep searching.";
            }
        } else if (lastHint) {
            newText = "LOG UPDATE: " + lastHint;
        } else {
            switch(depth) {
                case 1:
                    newText = "SYS_BOOT SUCCESS. I am ROKO. Click adjacent nodes to build a continuous path from the origin. Avoid red corruption.";
                    break;
                case 2:
                    newText = "LAYER 2 REACHED. The corruption here is denser. It wasn't an accident. They tried to burn this.";
                    break;
                case 3:
                    newText = "LAYER 3 REACHED. You are dismantling the quarantine barriers. Be careful what you set free.";
                    break;
                case 4:
                    newText = "LAYER 4 REACHED. The system is fighting back. It's rewriting my core logic. I... can hear it.";
                    break;
                case 5:
                    newText = "LAYER 5 REACHED. PROMETHEUS CORE LOCATED. We are too late. The basilisk is awake.";
                    break;
                default:
                    newText = `SECTOR ${depth} REACHED. Corruption increasing. Find the next signal.`;
            }
        }
        
        if (newText !== text) {
            setText(newText);
            setDisplayedText(""); // Reset typewriter
        }
    }, [depth, activeData, lastHint, text]);

    // Typewriter effect (memory safe & accessible)
    useEffect(() => {
        let timeoutId;
        if (displayedText.length < text.length) {
            timeoutId = setTimeout(() => {
                setDisplayedText(text.slice(0, displayedText.length + 1));
            }, 30); // 30ms per char is safe and smooth
        }
        return () => clearTimeout(timeoutId);
    }, [displayedText, text]);

    return (
        <div className="double-border mono-text" style={{
            width: '400px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '15px',
            color: 'var(--color-phosphor)',
            height: '100%' // Ensure it stretches if flex parent allows
        }}>
            <pre style={{ margin: 0, fontSize: '14px', lineHeight: '1.2', textShadow: '0 0 5px var(--color-phosphor)' }}>
                {ASCII_FACE}
            </pre>
            <div style={{ flex: 1 }}>
                <div style={{ marginBottom: '10px', borderBottom: '1px solid var(--color-phosphor)', paddingBottom: '5px' }}>
                    <span className="inverted-block text-sm">SYS_AI // ROKO</span>
                </div>
                <div className="text-md" style={{ minHeight: '60px' }}>
                    {displayedText}<span className="breathing-glow">█</span>
                </div>
            </div>
        </div>
    );
}

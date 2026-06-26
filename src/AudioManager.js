import { GameConfig } from './GameConfig';

class AudioManager {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.proximityGain = null;
        this.depthLayers = {};
        this.isInitialized = false;
    }

    reset() {
        if (this.ctx) {
            this.ctx.close();
            this.ctx = null;
        }
        this.depthLayers = {};
        this.isInitialized = false;
        this.masterGain = null;
        this.proximityGain = null;
    }

    initialize() {
        if (this.isInitialized) return;

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.3; // Default volume
        this.masterGain.connect(this.ctx.destination);

        // --- FX BUS: DELAY (PING PONG-ISH) ---
        this.delayNode = this.ctx.createDelay();
        this.delayNode.delayTime.value = 0.4; // 400ms delay

        this.feedbackGain = this.ctx.createGain();
        this.feedbackGain.gain.value = 0.4; // 40% Feedback

        // Filter for the delay repeats (Dub style)
        this.delayFilter = this.ctx.createBiquadFilter();
        this.delayFilter.type = "lowpass";
        this.delayFilter.frequency.value = 800;

        // Graph: Master -> Delay -> Filter -> Feedback -> Delay
        //       Delay -> Destination
        this.masterGain.connect(this.delayNode);
        this.delayNode.connect(this.delayFilter);
        this.delayFilter.connect(this.feedbackGain);
        this.feedbackGain.connect(this.delayNode);
        this.delayNode.connect(this.ctx.destination);


        // 1. Base Layer (Depth 1) - Deep drone instead of irritating hum
        // Lower frequencies and drastically reduced volume
        this.createPad(GameConfig.AUDIO.BASE_FREQUENCY, 'sine', 0.05); 
        this.createPad(GameConfig.AUDIO.BASE_FREQUENCY * 1.5, 'sine', 0.02); 

        // 2. Proximity Layer - Softer tone
        this.proximityGain = this.ctx.createGain();
        this.proximityGain.gain.value = 0;
        this.proximityGain.connect(this.masterGain);
        this.createLayer(this.proximityGain, GameConfig.AUDIO.BASE_FREQUENCY * 3, 'sine', 0.02); 
        this.createLayer(this.proximityGain, GameConfig.AUDIO.BASE_FREQUENCY * 3.75, 'sine', 0.02);

        this.isInitialized = true;
    }

    setVolume(level) {
        if (this.masterGain) {
            // Smoothly transition volume
            this.masterGain.gain.linearRampToValueAtTime(level, this.ctx.currentTime + 0.1);
        }
    }

    updateDepth(depth) {
        if (!this.ctx || !this.isInitialized) return;

        if (!this.depthLayers[depth]) {
            this.depthLayers[depth] = true;
            
            // Algorithmic layering for infinite depths
            // As depth increases, we add lower sub-bass and higher dissonant frequencies
            const base = GameConfig.AUDIO.BASE_FREQUENCY;
            
            if (depth === 2) {
                this.createPad(base / 2, 'sawtooth', 0.04); // Sub Bass
            } else if (depth === 3) {
                this.createPad(base * 2.25, 'sine', 0.05); // Resonance
            } else if (depth === 4) {
                this.createLayer(this.masterGain, base * 16, 'triangle', 0.02); // Void Shimmer
            } else if (depth >= GameConfig.SCALING.WIN_DEPTH) {
                // Beyond win depth, add dissonant layers
                // Use prime multipliers to ensure dissonance
                const primes = [3.89, 4.11, 5.03, 6.17, 7.39, 8.53, 9.71];
                const multiplier = primes[depth % primes.length];
                
                this.createPad(base * multiplier, 'sine', 0.05);
            }
        }
    }

    updateProximity(value) {
        if (this.proximityGain) {
            // Directly setting the value prevents scheduling thousands of audio events per second
            // which causes Web Audio Context freezing on some browsers.
            this.proximityGain.gain.value = value * 0.4;
        }
    }

    createPad(freq, type, vol) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        const filter = this.ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 600;

        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + 3);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        
        osc.onended = () => {
            osc.disconnect();
            filter.disconnect();
            gain.disconnect();
        };
        
        osc.start();
    }

    createLayer(destinationNode, freq, type, vol) {
        const osc = this.ctx.createOscillator();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        const panner = this.ctx.createStereoPanner();
        const lfo = this.ctx.createOscillator();
        lfo.frequency.value = 0.2;
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.value = 1;

        lfo.connect(lfoGain);
        lfoGain.connect(panner.pan);
        lfo.start();

        osc.connect(panner);
        panner.connect(destinationNode);
        
        osc.onended = () => {
            osc.disconnect();
            panner.disconnect();
            lfo.disconnect();
            lfoGain.disconnect();
        };

        osc.start();
    }

    // --- INTERACTION ---

    getPentatonicNote(index) {
        // Pentatonic Scale based on config root
        const root = GameConfig.AUDIO.PENTATONIC_ROOT;
        const ratios = [
            1,          // F
            9 / 8,        // G
            5 / 4,        // A
            3 / 2,        // C
            5 / 3,        // D
            2,          // F (Next Octave)
            9 / 8 * 2,    // G
            5 / 4 * 2,    // A
            3 / 2 * 2,    // C
            5 / 3 * 2     // D
        ];

        // Wrap around array
        const ratio = ratios[index % ratios.length];
        // Add octave shift for every 10 indices
        const octave = Math.floor(index / ratios.length);

        return root * ratio * Math.pow(2, octave);
    }

    playDataClick(index, isKey) {
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Panning based on randomness or we could pass X position? 
        // For now, random pan for "Sparkle" effect
        const panner = this.ctx.createStereoPanner();
        panner.pan.value = (Math.random() * 2) - 1;

        if (isKey) {
            // Success: F Major Upward Sweep
            this.playNote(523.25, 0); // C5
            this.playNote(698.46, 0.1); // F5
            this.playNote(880.00, 0.2); // A5
            this.playNote(1046.50, 0.4); // C6
        } else {
            // Standard Hover: Pentatonic Pluck
            const freq = this.getPentatonicNote(index);

            osc.type = 'triangle'; // Softer than sine, richer
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

            gain.gain.setValueAtTime(0, this.ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.05, this.ctx.currentTime + 0.01); // Quick attack
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3); // Short decay
            gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.35); // Prevent pop

            osc.connect(gain);
            gain.connect(panner);
            panner.connect(this.masterGain);

            osc.onended = () => {
                osc.disconnect();
                gain.disconnect();
                panner.disconnect();
            };

            osc.start();
            osc.stop(this.ctx.currentTime + 0.4);
        }
    }

    playNote(freq, delay) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + delay);

        gain.gain.setValueAtTime(0, this.ctx.currentTime + delay);
        gain.gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + delay + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + delay + 2);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + delay + 2.4);

        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.onended = () => {
            osc.disconnect();
            gain.disconnect();
        };
        
        osc.start(this.ctx.currentTime + delay);
        osc.stop(this.ctx.currentTime + delay + 2.5);
    }

    playErrorSound() {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        
        // Dissonant low frequency dropping further
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.3);

        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.3, this.ctx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.onended = () => {
            osc.disconnect();
            gain.disconnect();
        };
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.5);
    }
}

export const audioManager = new AudioManager();

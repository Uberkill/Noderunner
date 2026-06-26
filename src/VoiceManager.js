class VoiceManager {
    constructor() {
        this.synth = window.speechSynthesis;
        this.voices = [];
        this.glitchInterval = null;
    }

    speak(text) {
        if (this.synth.speaking) {
            this.synth.cancel();
            if (this.glitchInterval) clearInterval(this.glitchInterval);
        }

        const utterance = new SpeechSynthesisUtterance(text);

        // Find a "creepy" voice if possible
        const voices = this.synth.getVoices();
        // Prefer "Google UK English Male" or similar robotic voices
        const preferredVoice = voices.find(v => v.name.includes("Google") || v.name.includes("Male")) || voices[0];

        if (preferredVoice) utterance.voice = preferredVoice;

        // Start parameters
        utterance.pitch = 0.8; // Deep
        utterance.rate = 0.9;  // Slow
        utterance.volume = 0.8;

        // The "Ghost" Effect: Randomly modulate pitch/rate while speaking
        this.glitchInterval = setInterval(() => {
            if (!this.synth.speaking) {
                clearInterval(this.glitchInterval);
                return;
            }

            // We can't change utterance params mid-flight in standard WebSpeech API comfortably without restart,
            // so we simulate "corruption" by pausing/resuming rapidly or just accepting the static tone
            // For now, we rely on the clean "AI" voice reading "Corrupted" text.
        }, 100);

        this.synth.speak(utterance);
    }

    stop() {
        this.synth.cancel();
        if (this.glitchInterval) clearInterval(this.glitchInterval);
    }
}

export const voiceManager = new VoiceManager();

import React, { useCallback, useRef, useMemo } from 'react';

/**
 * Custom hook for playing game sound effects
 * Uses Web Audio API for better performance
 */
const useSoundEffects = (enabled = true) => {
    const audioContextRef = useRef(null);

    // Initialize audio context on first use
    const getAudioContext = useCallback(() => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        return audioContextRef.current;
    }, []);

    // Generate a simple tone
    const playTone = useCallback((frequency, duration, type = 'sine') => {
        if (!enabled) return;

        try {
            const ctx = getAudioContext();
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.type = type;
            oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

            gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + duration);
        } catch (e) {
            console.warn('Sound effect failed:', e);
        }
    }, [enabled, getAudioContext]);

    // Memoize the sounds object to prevent re-renders
    const sounds = useMemo(() => ({
        // Goat placement - soft click
        placeGoat: () => playTone(440, 0.1, 'sine'),

        // Tiger move - deeper tone
        moveTiger: () => playTone(220, 0.15, 'triangle'),

        // Goat move - medium tone
        moveGoat: () => playTone(330, 0.1, 'sine'),

        // Capture - dramatic two-tone
        capture: () => {
            playTone(440, 0.1, 'sawtooth');
            setTimeout(() => playTone(220, 0.2, 'sawtooth'), 100);
        },

        // Selection - light click
        select: () => playTone(660, 0.05, 'sine'),

        // Invalid move - error buzz
        invalid: () => playTone(150, 0.15, 'square'),

        // Victory - triumphant melody
        victory: () => {
            playTone(523, 0.15, 'sine'); // C5
            setTimeout(() => playTone(659, 0.15, 'sine'), 150); // E5
            setTimeout(() => playTone(784, 0.3, 'sine'), 300); // G5
        },

        // New game - reset tone
        newGame: () => {
            playTone(392, 0.1, 'sine'); // G4
            setTimeout(() => playTone(523, 0.15, 'sine'), 100); // C5
        }
    }), [playTone]);

    return sounds;
};

export default useSoundEffects;

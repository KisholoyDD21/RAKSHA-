import { useCallback, useRef, useState } from 'react';

// Web Speech API isn't universally supported (solid in Chrome/Edge, absent
// or partial in Firefox and some mobile browsers) — `supported` lets the UI
// hide voice controls gracefully instead of showing a button that fails.
const SpeechRecognitionImpl =
  typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

export function useVoice() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);
  const supported = !!SpeechRecognitionImpl;
  const synthesisSupported = typeof window !== 'undefined' && !!window.speechSynthesis;

  const startListening = useCallback(
    (onResult) => {
      if (!SpeechRecognitionImpl) return;
      const recognition = new SpeechRecognitionImpl();
      recognition.lang = 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        onResult?.(text);
      };
      recognition.onend = () => setListening(false);
      recognition.onerror = () => setListening(false);
      recognitionRef.current = recognition;
      setListening(true);
      recognition.start();
    },
    []
  );

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  const speak = useCallback((text, lang = 'en-IN') => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  }, []);

  return { listening, transcript, supported, synthesisSupported, startListening, stopListening, speak };
}

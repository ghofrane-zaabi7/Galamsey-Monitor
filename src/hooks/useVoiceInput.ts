/**
 * Voice Input Hook - Speech to Text functionality
 * Supports English and Twi (Akan) languages
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// Web Speech API type declarations
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  lang: string;
  onstart: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
  onend: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionErrorEvent) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

// Language codes for speech recognition
export const SUPPORTED_LANGUAGES = {
  en: { code: 'en-GH', name: 'English', nativeName: 'English' },
  tw: { code: 'ak-GH', name: 'Twi (Akan)', nativeName: 'Twi' },
} as const;

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;

interface VoiceInputState {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  isSupported: boolean;
  confidence: number;
  language: LanguageCode;
}

interface VoiceInputActions {
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  setLanguage: (lang: LanguageCode) => void;
  appendToTranscript: (text: string) => void;
}

interface UseVoiceInputOptions {
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
  language?: LanguageCode;
  onResult?: (transcript: string, confidence: number) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

// Check if speech recognition is supported
function getSpeechRecognition(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null;

  return (
    (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor }).SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition ||
    null
  );
}

export function useVoiceInput(options: UseVoiceInputOptions = {}): VoiceInputState & VoiceInputActions {
  const {
    continuous = true,
    interimResults = true,
    maxAlternatives = 1,
    language: initialLanguage = 'en',
    onResult,
    onError,
    onStart,
    onEnd,
  } = options;

  const [state, setState] = useState<VoiceInputState>({
    isListening: false,
    transcript: '',
    interimTranscript: '',
    error: null,
    isSupported: false,
    confidence: 0,
    language: initialLanguage,
  });

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const finalTranscriptRef = useRef('');

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognitionAPI = getSpeechRecognition();

    if (!SpeechRecognitionAPI) {
      setState((prev) => ({
        ...prev,
        isSupported: false,
        error: 'Speech recognition is not supported in this browser',
      }));
      return;
    }

    setState((prev) => ({ ...prev, isSupported: true }));

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.maxAlternatives = maxAlternatives;
    recognition.lang = SUPPORTED_LANGUAGES[state.language].code;

    recognition.onstart = () => {
      setState((prev) => ({
        ...prev,
        isListening: true,
        error: null,
      }));
      onStart?.();
    };

    recognition.onend = () => {
      setState((prev) => ({
        ...prev,
        isListening: false,
        interimTranscript: '',
      }));
      onEnd?.();
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = finalTranscriptRef.current;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;

        if (result.isFinal) {
          finalTranscript += transcript + ' ';
          finalTranscriptRef.current = finalTranscript;

          const confidence = result[0].confidence || 0;
          setState((prev) => ({
            ...prev,
            transcript: finalTranscript.trim(),
            confidence,
          }));

          onResult?.(finalTranscript.trim(), confidence);
        } else {
          interimTranscript += transcript;
        }
      }

      setState((prev) => ({
        ...prev,
        interimTranscript,
      }));
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      let errorMessage = 'An error occurred during speech recognition';

      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech was detected. Please try again.';
          break;
        case 'audio-capture':
          errorMessage = 'No microphone was found or microphone access was denied.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone access was denied. Please allow microphone access in your browser settings.';
          break;
        case 'network':
          errorMessage = 'A network error occurred. Please check your internet connection.';
          break;
        case 'aborted':
          errorMessage = 'Speech recognition was aborted.';
          break;
        case 'language-not-supported':
          errorMessage = 'The selected language is not supported on this device.';
          break;
        default:
          errorMessage = `Speech recognition error: ${event.error}`;
      }

      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isListening: false,
      }));

      onError?.(errorMessage);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, [continuous, interimResults, maxAlternatives, state.language, onResult, onError, onStart, onEnd]);

  // Update language when it changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = SUPPORTED_LANGUAGES[state.language].code;
    }
  }, [state.language]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !state.isListening) {
      try {
        finalTranscriptRef.current = state.transcript ? state.transcript + ' ' : '';
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
      }
    }
  }, [state.isListening, state.transcript]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && state.isListening) {
      recognitionRef.current.stop();
    }
  }, [state.isListening]);

  const resetTranscript = useCallback(() => {
    finalTranscriptRef.current = '';
    setState((prev) => ({
      ...prev,
      transcript: '',
      interimTranscript: '',
      confidence: 0,
    }));
  }, []);

  const setLanguage = useCallback((lang: LanguageCode) => {
    setState((prev) => ({
      ...prev,
      language: lang,
    }));
  }, []);

  const appendToTranscript = useCallback((text: string) => {
    finalTranscriptRef.current = (finalTranscriptRef.current + ' ' + text).trim();
    setState((prev) => ({
      ...prev,
      transcript: finalTranscriptRef.current,
    }));
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
    resetTranscript,
    setLanguage,
    appendToTranscript,
  };
}

// Voice input button component helper
export function getVoiceInputStatus(isListening: boolean, error: string | null, isSupported: boolean): {
  color: string;
  bgColor: string;
  message: string;
  icon: 'mic' | 'mic-off' | 'alert';
} {
  if (!isSupported) {
    return {
      color: 'text-gray-400',
      bgColor: 'bg-gray-100',
      message: 'Voice input not supported',
      icon: 'mic-off',
    };
  }

  if (error) {
    return {
      color: 'text-red-500',
      bgColor: 'bg-red-100',
      message: error,
      icon: 'alert',
    };
  }

  if (isListening) {
    return {
      color: 'text-ghana-red',
      bgColor: 'bg-red-100',
      message: 'Listening... Tap to stop',
      icon: 'mic',
    };
  }

  return {
    color: 'text-ghana-green',
    bgColor: 'bg-ghana-green/10',
    message: 'Tap to speak',
    icon: 'mic',
  };
}

// Format confidence as percentage
export function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

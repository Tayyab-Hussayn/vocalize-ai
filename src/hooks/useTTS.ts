import { useState, useCallback, useRef } from 'react';
import type { TTSRequest, TTSResponse, Voice, GenerationHistory } from '@/types';

// API Base URL - uses environment variable or defaults to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Default voices in case API fails
const DEFAULT_VOICES: Voice[] = [
  { id: 'en-US-AriaNeural', name: 'Aria', gender: 'female', accent: 'American', language: 'English (US)' },
  { id: 'en-US-GuyNeural', name: 'Guy', gender: 'male', accent: 'American', language: 'English (US)' },
  { id: 'en-US-JennyNeural', name: 'Jenny', gender: 'female', accent: 'American', language: 'English (US)' },
  { id: 'en-GB-SoniaNeural', name: 'Sonia', gender: 'female', accent: 'British', language: 'English (UK)' },
  { id: 'en-GB-RyanNeural', name: 'Ryan', gender: 'male', accent: 'British', language: 'English (UK)' },
  { id: 'en-AU-NatashaNeural', name: 'Natasha', gender: 'female', accent: 'Australian', language: 'English (AU)' },
  { id: 'en-CA-ClaraNeural', name: 'Clara', gender: 'female', accent: 'Canadian', language: 'English (CA)' },
  { id: 'en-IN-NeerjaNeural', name: 'Neerja', gender: 'female', accent: 'Indian', language: 'English (IN)' },
  { id: 'en-IE-EmilyNeural', name: 'Emily', gender: 'female', accent: 'Irish', language: 'English (IE)' },
  { id: 'en-ZA-LeahNeural', name: 'Leah', gender: 'female', accent: 'South African', language: 'English (ZA)' },
];

// Check if Web Speech API is available
const isWebSpeechAvailable = () => {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
};

// Convert Web Speech API voices to our Voice format
const getWebSpeechVoices = (): Voice[] => {
  if (!isWebSpeechAvailable()) return [];
  
  const synth = window.speechSynthesis;
  const voices = synth.getVoices();
  
  return voices.slice(0, 20).map((v, i) => ({
    id: `webspeech-${i}`,
    name: v.name.split(' ')[0] || v.name,
    gender: v.name.toLowerCase().includes('female') ? 'female' : 'male',
    accent: v.lang.split('-')[1] || 'Default',
    language: v.lang,
  }));
};

// Generate audio using Web Speech API
const generateWithWebSpeech = async (request: TTSRequest): Promise<TTSResponse> => {
  return new Promise((resolve, reject) => {
    if (!isWebSpeechAvailable()) {
      reject(new Error('Web Speech API not available'));
      return;
    }

    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(request.text);
    
    // Get available voices
    const voices = synth.getVoices();
    
    // Try to find a matching voice or use default
    const voiceIndex = Math.min(parseInt(request.voice.split('-').pop() || '0'), voices.length - 1);
    if (voices[voiceIndex]) {
      utterance.voice = voices[voiceIndex];
    }
    
    // Apply settings
    utterance.rate = request.rate;
    utterance.pitch = request.pitch;
    utterance.volume = request.volume;

    // Estimate duration
    const estimatedDuration = request.text.length * 0.08 / request.rate;

    utterance.onend = () => {
      // Web Speech API doesn't provide audio data, so we return success without audio URL
      // The audio will play directly through the browser
      resolve({
        success: true,
        audioUrl: '',
        duration: Math.ceil(estimatedDuration),
      });
    };

    utterance.onerror = (event) => {
      reject(new Error(`Speech synthesis error: ${event.error}`));
    };

    // Speak the text
    synth.speak(utterance);
  });
};

export function useTTS() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<GenerationHistory[]>([]);
  const [voices, setVoices] = useState<Voice[]>(DEFAULT_VOICES);
  const [useWebSpeech, setUseWebSpeech] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch voices from backend on mount
  const fetchVoices = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/voices`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch voices');
      }
      
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setVoices(data);
        setUseWebSpeech(false);
      }
    } catch (err) {
      console.warn('Could not fetch voices from backend, using Web Speech API:', err);
      // Fall back to Web Speech API voices
      if (isWebSpeechAvailable()) {
        const webSpeechVoices = getWebSpeechVoices();
        if (webSpeechVoices.length > 0) {
          setVoices(webSpeechVoices);
          setUseWebSpeech(true);
        }
      }
    }
  }, []);

  const generateSpeech = useCallback(async (request: TTSRequest): Promise<TTSResponse | null> => {
    setIsGenerating(true);
    setError(null);

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      // If using Web Speech API
      if (useWebSpeech || !API_BASE_URL) {
        const result = await generateWithWebSpeech(request);
        
        // Add to history
        const historyItem: GenerationHistory = {
          id: Date.now().toString(),
          text: request.text,
          voice: request.voice,
          audioUrl: '',
          createdAt: new Date(),
          duration: result.duration || 0,
        };
        setHistory(prev => [historyItem, ...prev].slice(0, 10));
        
        setIsGenerating(false);
        return result;
      }

      // Call the backend API
      const response = await fetch(`${API_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        // If backend fails, try Web Speech API as fallback
        if (isWebSpeechAvailable()) {
          console.log('Backend failed, falling back to Web Speech API');
          setUseWebSpeech(true);
          const result = await generateWithWebSpeech(request);
          
          const historyItem: GenerationHistory = {
            id: Date.now().toString(),
            text: request.text,
            voice: request.voice,
            audioUrl: '',
            createdAt: new Date(),
            duration: result.duration || 0,
          };
          setHistory(prev => [historyItem, ...prev].slice(0, 10));
          
          setIsGenerating(false);
          return result;
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate speech');
      }

      // Convert base64 to audio URL
      const audioUrl = data.audio_base64 
        ? `data:audio/mp3;base64,${data.audio_base64}`
        : '';

      const result: TTSResponse = {
        success: true,
        audioUrl,
        duration: data.duration || 0,
      };

      // Add to history
      const historyItem: GenerationHistory = {
        id: Date.now().toString(),
        text: request.text,
        voice: request.voice,
        audioUrl,
        createdAt: new Date(),
        duration: data.duration || 0,
      };
      setHistory(prev => [historyItem, ...prev].slice(0, 10));

      return result;
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return null;
      }
      
      // Try Web Speech API as final fallback
      if (isWebSpeechAvailable() && !useWebSpeech) {
        try {
          console.log('Error occurred, trying Web Speech API fallback');
          setUseWebSpeech(true);
          const result = await generateWithWebSpeech(request);
          
          const historyItem: GenerationHistory = {
            id: Date.now().toString(),
            text: request.text,
            voice: request.voice,
            audioUrl: '',
            createdAt: new Date(),
            duration: result.duration || 0,
          };
          setHistory(prev => [historyItem, ...prev].slice(0, 10));
          
          setIsGenerating(false);
          return result;
        } catch (webSpeechErr) {
          console.error('Web Speech API also failed:', webSpeechErr);
        }
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate speech';
      setError(errorMessage);
      return { audioUrl: '', duration: 0, success: false, error: errorMessage };
    } finally {
      setIsGenerating(false);
    }
  }, [useWebSpeech]);

  const getVoices = useCallback(async (): Promise<Voice[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/voices`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch voices');
      }
      
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setVoices(data);
        setUseWebSpeech(false);
        return data;
      }
      return voices;
    } catch (err) {
      // Fall back to Web Speech API voices
      if (isWebSpeechAvailable()) {
        const webSpeechVoices = getWebSpeechVoices();
        if (webSpeechVoices.length > 0) {
          setVoices(webSpeechVoices);
          setUseWebSpeech(true);
          return webSpeechVoices;
        }
      }
      setError('Failed to fetch voices from server');
      return voices;
    }
  }, [voices]);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const removeFromHistory = useCallback((id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  }, []);

  const cancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (isWebSpeechAvailable() && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    setIsGenerating(false);
  }, []);

  return {
    generateSpeech,
    getVoices,
    fetchVoices,
    isGenerating,
    error,
    history,
    clearHistory,
    removeFromHistory,
    cancelGeneration,
    voices,
    useWebSpeech,
  };
}

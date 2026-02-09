import { useState, useRef, useCallback, useEffect } from 'react';
import type { AudioControls } from '@/types';

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [controls, setControls] = useState<AudioControls>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
  });

  const loadAudio = useCallback((url: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = url;
      audioRef.current.load();
    } else {
      audioRef.current = new Audio(url);
    }

    const audio = audioRef.current;
    
    audio.onloadedmetadata = () => {
      setControls(prev => ({
        ...prev,
        duration: audio.duration,
        currentTime: 0,
      }));
    };

    audio.ontimeupdate = () => {
      setControls(prev => ({
        ...prev,
        currentTime: audio.currentTime,
      }));
    };

    audio.onended = () => {
      setControls(prev => ({
        ...prev,
        isPlaying: false,
        currentTime: 0,
      }));
    };

    audio.onerror = () => {
      setControls(prev => ({
        ...prev,
        isPlaying: false,
      }));
    };
  }, []);

  const play = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setControls(prev => ({ ...prev, isPlaying: true }));
      }).catch(() => {
        setControls(prev => ({ ...prev, isPlaying: false }));
      });
    }
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setControls(prev => ({ ...prev, isPlaying: false }));
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (controls.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [controls.isPlaying, play, pause]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setControls(prev => ({ ...prev, currentTime: time }));
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      setControls(prev => ({ ...prev, volume }));
    }
  }, []);

  const download = useCallback((filename?: string) => {
    if (audioRef.current && audioRef.current.src) {
      const link = document.createElement('a');
      link.href = audioRef.current.src;
      link.download = filename || `voice-ai-${Date.now()}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, []);

  const formatTime = useCallback((seconds: number): string => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  return {
    ...controls,
    loadAudio,
    play,
    pause,
    togglePlay,
    seek,
    setVolume,
    download,
    formatTime,
  };
}

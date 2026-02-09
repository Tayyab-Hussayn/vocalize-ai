export interface Voice {
  id: string;
  name: string;
  gender: 'male' | 'female';
  accent: string;
  language: string;
  preview?: string;
}

export interface TTSRequest {
  text: string;
  voice: string;
  rate: number;
  pitch: number;
  volume: number;
}

export interface TTSResponse {
  audioUrl: string;
  duration: number;
  success: boolean;
  error?: string;
}

export interface GenerationHistory {
  id: string;
  text: string;
  voice: string;
  audioUrl: string;
  createdAt: Date;
  duration: number;
}

export interface AudioControls {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
}

export type Theme = 'dark' | 'light';

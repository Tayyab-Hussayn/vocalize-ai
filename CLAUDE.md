# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VoiceAI is a text-to-speech web application with a React/TypeScript frontend and Python FastAPI backend. The app uses Microsoft Edge-TTS for high-quality voice synthesis, with a Web Speech API fallback when the backend is unavailable.

## Development Commands

### Frontend
```bash
npm install              # Install dependencies
npm run dev             # Start Vite dev server (http://localhost:5173)
npm run build           # TypeScript compile + Vite production build
npm run lint            # Run ESLint
npm run preview         # Preview production build
```

### Backend
```bash
cd backend
pip install -r requirements.txt   # Install Python dependencies
python main.py                    # Start FastAPI server (http://localhost:8000)
```

The backend must be running for full functionality (voice download, high-quality synthesis). Without it, the app falls back to browser's Web Speech API.

## Architecture

### Dual-Mode TTS System

The application has a sophisticated fallback mechanism:

1. **Primary Mode (Backend)**: Uses FastAPI + edge-tts for high-quality voices
   - 60+ voices across 15+ languages
   - Returns base64-encoded MP3 audio
   - Supports download functionality
   - Controlled via `useTTS` hook in `src/hooks/useTTS.ts`

2. **Fallback Mode (Web Speech API)**: Browser-native synthesis
   - Activates automatically if backend is unreachable
   - No download capability
   - Uses browser's built-in voices
   - User sees an info banner when in this mode

The `useTTS` hook manages this fallback logic automatically. Check the `useWebSpeech` state to determine which mode is active.

### Frontend Structure

- **Sections** (`src/sections/`): Page components (Hero, Generator, Features, Footer, Navbar)
- **Hooks** (`src/hooks/`):
  - `useTTS.ts`: TTS generation, voice fetching, fallback logic, history management
  - `useAudioPlayer.ts`: Audio playback controls (play/pause/seek/download)
- **Types** (`src/types/index.ts`): TypeScript interfaces for Voice, TTSRequest, TTSResponse, etc.
- **Components** (`src/components/ui/`): shadcn/ui components

### Backend Structure

- **Single file**: `backend/main.py` contains all API logic
- **Endpoints**:
  - `GET /api/voices` - Returns available voices (with optional filters)
  - `POST /api/generate` - Generates TTS audio, returns base64 MP3
  - `POST /api/generate/stream` - Streaming audio response
  - `GET /health` - Health check

### Key Patterns

1. **Path Aliases**: Use `@/` to reference `src/` directory (configured in vite.config.ts)
   ```typescript
   import { useTTS } from '@/hooks/useTTS';
   ```

2. **Voice Selection**: Generator component filters voices by language first, then splits into male/female dropdowns

3. **Audio Handling**: Backend returns base64 audio converted to data URL:
   ```typescript
   const audioUrl = `data:audio/mp3;base64,${data.audio_base64}`;
   ```

4. **History Management**: `useTTS` hook maintains last 10 generations in state

## Configuration

### Environment Variables

Create `.env` file in root:
```env
VITE_API_URL=http://localhost:8000
```

For production, update to your deployed backend URL.

### Backend CORS

Backend CORS origins configured via environment variable or defaults in `backend/main.py`:
```python
ALLOWED_ORIGINS = ["http://localhost:5173", "https://vocalera.vercel.app"]
```

## Styling

- **Framework**: Tailwind CSS with custom configuration
- **Theme**: Purple-based color scheme (primary: #453478)
- **Components**: shadcn/ui with "new-york" style variant
- **Animations**: Framer Motion for transitions and AnimatePresence

Custom Tailwind extensions in `tailwind.config.js`:
- Purple color palette (50-950)
- Custom shadows (card, button, purple-sm/md/lg)
- Custom animations (fade-in, slide-up, pulse-soft)

## Important Notes

- The Generator component (`src/sections/Generator.tsx`) is the core of the application - most TTS logic lives here
- When backend is unavailable, the app automatically switches to Web Speech API mode and displays an info banner
- Voice data is hardcoded in `backend/main.py` (VOICES array) - not fetched from edge-tts dynamically
- Character limit is 5000 characters (MAX_CHARS constant in Generator.tsx)
- Audio player only shows for backend-generated audio (not Web Speech API mode)

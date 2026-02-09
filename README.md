# VoiceAI - Text-to-Speech Application

A professional, modern text-to-speech web application powered by Edge-TTS. Built with React, TypeScript, Tailwind CSS, and FastAPI.

![VoiceAI Screenshot](https://via.placeholder.com/800x400/0f172a/06b6d4?text=VoiceAI)

## Features

- **Free Forever**: No subscriptions, no hidden fees
- **Natural Voices**: 50+ AI-powered voices with multiple accents
- **Instant Generation**: Generate speech in under 2 seconds
- **Multi-Language**: Support for 15+ languages
- **Customizable**: Control speed, pitch, and volume
- **Modern UI**: Glassmorphism design with smooth animations
- **Responsive**: Works on desktop, tablet, and mobile

## Tech Stack

### Frontend
- React 18+ with TypeScript
- Vite for fast development
- Tailwind CSS for styling
- Framer Motion for animations
- shadcn/ui components
- Lucide React icons

### Backend
- Python FastAPI
- Edge-TTS library (Microsoft Edge text-to-speech)
- Async/await for performance

## Quick Start

### Prerequisites
- Node.js 18+ 
- Python 3.9+

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/voiceai.git
cd voiceai
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd backend
pip install -r requirements.txt
cd ..
```

4. Start the backend server:
```bash
cd backend
python main.py
```

5. In a new terminal, start the frontend:
```bash
npm run dev
```

6. Open your browser and navigate to `http://localhost:5173`

## API Endpoints

### GET /api/voices
Get a list of available voices.

**Query Parameters:**
- `language` (optional): Filter by language
- `gender` (optional): Filter by gender (male/female)
- `accent` (optional): Filter by accent

**Response:**
```json
[
  {
    "id": "en-US-AriaNeural",
    "name": "Aria",
    "gender": "female",
    "accent": "American",
    "language": "English (US)"
  }
]
```

### POST /api/generate
Generate text-to-speech audio.

**Request Body:**
```json
{
  "text": "Hello, world!",
  "voice": "en-US-AriaNeural",
  "rate": 1.0,
  "pitch": 1.0,
  "volume": 1.0
}
```

**Response:**
```json
{
  "success": true,
  "audio_base64": "...",
  "duration": 1.5
}
```

## Project Structure

```
voiceai/
├── src/
│   ├── components/ui/     # shadcn/ui components
│   ├── hooks/             # Custom React hooks
│   ├── sections/          # Page sections
│   ├── types/             # TypeScript types
│   ├── App.tsx            # Main app component
│   ├── index.css          # Global styles
│   └── main.tsx           # Entry point
├── backend/
│   ├── main.py            # FastAPI application
│   └── requirements.txt   # Python dependencies
├── public/                # Static assets
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## Configuration

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:8000
```

## Building for Production

### Frontend
```bash
npm run build
```

The built files will be in the `dist/` directory.

### Backend
For production deployment, use a WSGI server like Gunicorn:

```bash
cd backend
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## Docker Deployment

Build and run with Docker:

```bash
# Build the image
docker build -t voiceai .

# Run the container
docker run -p 8000:8000 -p 5173:5173 voiceai
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Edge-TTS](https://github.com/rany2/edge-tts) - Text-to-speech library
- [FastAPI](https://fastapi.tiangolo.com/) - Web framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework

## Support

For support, email hello@voiceai.com or open an issue on GitHub.

---

Made with ❤️ using Edge-TTS

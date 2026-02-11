"""
VoiceAI Backend API
FastAPI application for text-to-speech conversion using edge-tts
"""

import asyncio
import io
import base64
import tempfile
import os
from typing import List, Optional
from pathlib import Path

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel, Field
import edge_tts

# Initialize FastAPI app
app = FastAPI(
    title="VoiceAI API",
    description="Text-to-Speech API powered by Edge-TTS",
    version="1.0.0",
)

# CORS middleware
# Get allowed origins from environment variable or use defaults
allowed_origins_str = os.getenv(
    "ALLOWED_ORIGINS",
    "https://vocalise.vercel.app,http://localhost:5173, https://vocalera.vercel.app/"
)
ALLOWED_ORIGINS = [origin.strip() for origin in allowed_origins_str.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Temporary directory for audio files
TEMP_DIR = Path(tempfile.gettempdir()) / "voiceai"
TEMP_DIR.mkdir(exist_ok=True)


# ============== Models ==============

class Voice(BaseModel):
    """Voice model"""
    id: str
    name: str
    gender: str
    accent: str
    language: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "en-US-AriaNeural",
                "name": "Aria",
                "gender": "female",
                "accent": "American",
                "language": "English (US)"
            }
        }


class TTSRequest(BaseModel):
    """Text-to-Speech request model"""
    text: str = Field(..., min_length=1, max_length=5000, description="Text to convert to speech")
    voice: str = Field(default="en-US-AriaNeural", description="Voice ID to use")
    rate: float = Field(default=1.0, ge=0.5, le=2.0, description="Speech rate (0.5 to 2.0)")
    pitch: float = Field(default=1.0, ge=0.5, le=2.0, description="Speech pitch (0.5 to 2.0)")
    volume: float = Field(default=1.0, ge=0.0, le=1.0, description="Volume level (0.0 to 1.0)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "text": "Hello, this is a test of the VoiceAI text-to-speech system.",
                "voice": "en-US-AriaNeural",
                "rate": 1.0,
                "pitch": 1.0,
                "volume": 1.0
            }
        }


class TTSResponse(BaseModel):
    """Text-to-Speech response model"""
    success: bool
    audio_url: Optional[str] = None
    audio_base64: Optional[str] = None
    duration: float = 0.0
    error: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "audio_url": "/api/audio/12345.mp3",
                "duration": 3.5
            }
        }


# ============== Voice Data ==============

VOICES = [
    # English (US)
    Voice(id="en-US-AriaNeural", name="Aria", gender="female", accent="American", language="English (US)"),
    Voice(id="en-US-AnaNeural", name="Ana", gender="female", accent="American", language="English (US)"),
    Voice(id="en-US-ChristopherNeural", name="Christopher", gender="male", accent="American", language="English (US)"),
    Voice(id="en-US-EricNeural", name="Eric", gender="male", accent="American", language="English (US)"),
    Voice(id="en-US-GuyNeural", name="Guy", gender="male", accent="American", language="English (US)"),
    Voice(id="en-US-JennyNeural", name="Jenny", gender="female", accent="American", language="English (US)"),
    Voice(id="en-US-MichelleNeural", name="Michelle", gender="female", accent="American", language="English (US)"),
    Voice(id="en-US-RogerNeural", name="Roger", gender="male", accent="American", language="English (US)"),
    Voice(id="en-US-SteffanNeural", name="Steffan", gender="male", accent="American", language="English (US)"),
    
    # English (UK)
    Voice(id="en-GB-LibbyNeural", name="Libby", gender="female", accent="British", language="English (UK)"),
    Voice(id="en-GB-MaisieNeural", name="Maisie", gender="female", accent="British", language="English (UK)"),
    Voice(id="en-GB-RyanNeural", name="Ryan", gender="male", accent="British", language="English (UK)"),
    Voice(id="en-GB-SoniaNeural", name="Sonia", gender="female", accent="British", language="English (UK)"),
    Voice(id="en-GB-ThomasNeural", name="Thomas", gender="male", accent="British", language="English (UK)"),
    
    # English (Australian)
    Voice(id="en-AU-NatashaNeural", name="Natasha", gender="female", accent="Australian", language="English (AU)"),
    Voice(id="en-AU-WilliamNeural", name="William", gender="male", accent="Australian", language="English (AU)"),
    
    # English (Canadian)
    Voice(id="en-CA-ClaraNeural", name="Clara", gender="female", accent="Canadian", language="English (CA)"),
    Voice(id="en-CA-LiamNeural", name="Liam", gender="male", accent="Canadian", language="English (CA)"),
    
    # English (Indian)
    Voice(id="en-IN-NeerjaNeural", name="Neerja", gender="female", accent="Indian", language="English (IN)"),
    Voice(id="en-IN-PrabhatNeural", name="Prabhat", gender="male", accent="Indian", language="English (IN)"),
    
    # English (Irish)
    Voice(id="en-IE-EmilyNeural", name="Emily", gender="female", accent="Irish", language="English (IE)"),
    Voice(id="en-IE-ConnorNeural", name="Connor", gender="male", accent="Irish", language="English (IE)"),
    
    # English (South African)
    Voice(id="en-ZA-LeahNeural", name="Leah", gender="female", accent="South African", language="English (ZA)"),
    Voice(id="en-ZA-LukeNeural", name="Luke", gender="male", accent="South African", language="English (ZA)"),
    
    # Spanish
    Voice(id="es-ES-ElviraNeural", name="Elvira", gender="female", accent="Spanish", language="Spanish (Spain)"),
    Voice(id="es-ES-AlvaroNeural", name="Alvaro", gender="male", accent="Spanish", language="Spanish (Spain)"),
    Voice(id="es-MX-DaliaNeural", name="Dalia", gender="female", accent="Mexican", language="Spanish (Mexico)"),
    Voice(id="es-MX-JorgeNeural", name="Jorge", gender="male", accent="Mexican", language="Spanish (Mexico)"),
    
    # French
    Voice(id="fr-FR-DeniseNeural", name="Denise", gender="female", accent="French", language="French (France)"),
    Voice(id="fr-FR-HenriNeural", name="Henri", gender="male", accent="French", language="French (France)"),
    Voice(id="fr-CA-SylvieNeural", name="Sylvie", gender="female", accent="Canadian", language="French (Canada)"),
    Voice(id="fr-CA-JeanNeural", name="Jean", gender="male", accent="Canadian", language="French (Canada)"),
    
    # German
    Voice(id="de-DE-KatjaNeural", name="Katja", gender="female", accent="German", language="German"),
    Voice(id="de-DE-ConradNeural", name="Conrad", gender="male", accent="German", language="German"),
    
    # Italian
    Voice(id="it-IT-ElsaNeural", name="Elsa", gender="female", accent="Italian", language="Italian"),
    Voice(id="it-IT-DiegoNeural", name="Diego", gender="male", accent="Italian", language="Italian"),
    
    # Portuguese
    Voice(id="pt-BR-FranciscaNeural", name="Francisca", gender="female", accent="Brazilian", language="Portuguese (Brazil)"),
    Voice(id="pt-BR-AntonioNeural", name="Antonio", gender="male", accent="Brazilian", language="Portuguese (Brazil)"),
    
    # Japanese
    Voice(id="ja-JP-NanamiNeural", name="Nanami", gender="female", accent="Japanese", language="Japanese"),
    Voice(id="ja-JP-KeitaNeural", name="Keita", gender="male", accent="Japanese", language="Japanese"),
    
    # Korean
    Voice(id="ko-KR-SunHiNeural", name="SunHi", gender="female", accent="Korean", language="Korean"),
    Voice(id="ko-KR-InJoonNeural", name="InJoon", gender="male", accent="Korean", language="Korean"),
    
    # Chinese
    Voice(id="zh-CN-XiaoxiaoNeural", name="Xiaoxiao", gender="female", accent="Mandarin", language="Chinese (Simplified)"),
    Voice(id="zh-CN-YunxiNeural", name="Yunxi", gender="male", accent="Mandarin", language="Chinese (Simplified)"),
    Voice(id="zh-TW-HsiaoChenNeural", name="HsiaoChen", gender="female", accent="Taiwanese", language="Chinese (Traditional)"),
    Voice(id="zh-TW-YunJheNeural", name="YunJhe", gender="male", accent="Taiwanese", language="Chinese (Traditional)"),
    
    # Russian
    Voice(id="ru-RU-SvetlanaNeural", name="Svetlana", gender="female", accent="Russian", language="Russian"),
    Voice(id="ru-RU-DmitryNeural", name="Dmitry", gender="male", accent="Russian", language="Russian"),
    
    # Arabic
    Voice(id="ar-SA-ZariyahNeural", name="Zariyah", gender="female", accent="Saudi", language="Arabic"),
    Voice(id="ar-SA-HamedNeural", name="Hamed", gender="male", accent="Saudi", language="Arabic"),
    
    # Hindi
    Voice(id="hi-IN-SwaraNeural", name="Swara", gender="female", accent="Indian", language="Hindi"),
    Voice(id="hi-IN-MadhurNeural", name="Madhur", gender="male", accent="Indian", language="Hindi"),
    
    # Dutch
    Voice(id="nl-NL-ColetteNeural", name="Colette", gender="female", accent="Dutch", language="Dutch"),
    Voice(id="nl-NL-FennaNeural", name="Fenna", gender="female", accent="Dutch", language="Dutch"),
    Voice(id="nl-NL-MaartenNeural", name="Maarten", gender="male", accent="Dutch", language="Dutch"),
    
    # Polish
    Voice(id="pl-PL-AgnieszkaNeural", name="Agnieszka", gender="female", accent="Polish", language="Polish"),
    Voice(id="pl-PL-MarekNeural", name="Marek", gender="male", accent="Polish", language="Polish"),
    
    # Turkish
    Voice(id="tr-TR-EmelNeural", name="Emel", gender="female", accent="Turkish", language="Turkish"),
    Voice(id="tr-TR-AhmetNeural", name="Ahmet", gender="male", accent="Turkish", language="Turkish"),
]


# ============== Helper Functions ==============

def format_rate(rate: float) -> str:
    """Format rate for edge-tts"""
    percentage = int((rate - 1) * 100)
    if percentage >= 0:
        return f"+{percentage}%"
    return f"{percentage}%"


def format_pitch(pitch: float) -> str:
    """Format pitch for edge-tts"""
    percentage = int((pitch - 1) * 100)
    if percentage >= 0:
        return f"+{percentage}Hz"
    return f"{percentage}Hz"


def format_volume(volume: float) -> str:
    """Format volume for edge-tts"""
    percentage = int(volume * 100)
    return f"+{percentage}%"


async def generate_speech(
    text: str,
    voice: str,
    rate: float = 1.0,
    pitch: float = 1.0,
    volume: float = 1.0
) -> tuple[bytes, float]:
    """
    Generate speech using edge-tts
    
    Returns:
        tuple: (audio_bytes, estimated_duration)
    """
    # Create communicate instance
    communicate = edge_tts.Communicate(
        text=text,
        voice=voice,
        rate=format_rate(rate),
        pitch=format_pitch(pitch),
        volume=format_volume(volume),
    )
    
    # Collect audio data
    audio_bytes = io.BytesIO()
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_bytes.write(chunk["data"])
    
    # Estimate duration (rough approximation: ~13 chars per second at normal rate)
    estimated_duration = len(text) / (13 * rate)
    
    return audio_bytes.getvalue(), estimated_duration


# ============== API Endpoints ==============

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "VoiceAI API - Text-to-Speech powered by Edge-TTS",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/api/voices", response_model=List[Voice])
async def get_voices(
    language: Optional[str] = None,
    gender: Optional[str] = None,
    accent: Optional[str] = None,
):
    """
    Get list of available voices
    
    Optional query parameters:
    - language: Filter by language (e.g., "English", "Spanish")
    - gender: Filter by gender ("male" or "female")
    - accent: Filter by accent (e.g., "American", "British")
    """
    filtered_voices = VOICES
    
    if language:
        filtered_voices = [v for v in filtered_voices if language.lower() in v.language.lower()]
    
    if gender:
        filtered_voices = [v for v in filtered_voices if v.gender.lower() == gender.lower()]
    
    if accent:
        filtered_voices = [v for v in filtered_voices if accent.lower() in v.accent.lower()]
    
    return filtered_voices


@app.post("/api/generate", response_model=TTSResponse)
async def generate_tts(request: TTSRequest):
    """
    Generate text-to-speech audio
    
    Returns base64-encoded audio data that can be played directly in the browser.
    """
    try:
        # Validate voice
        voice_ids = [v.id for v in VOICES]
        if request.voice not in voice_ids:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid voice ID. Use /api/voices to get available voices."
            )
        
        # Generate speech
        audio_data, duration = await generate_speech(
            text=request.text,
            voice=request.voice,
            rate=request.rate,
            pitch=request.pitch,
            volume=request.volume,
        )
        
        # Encode to base64
        audio_base64 = base64.b64encode(audio_data).decode('utf-8')
        
        return TTSResponse(
            success=True,
            audio_base64=audio_base64,
            duration=round(duration, 2),
        )
        
    except HTTPException:
        raise
    except Exception as e:
        return TTSResponse(
            success=False,
            error=str(e),
        )


@app.post("/api/generate/stream")
async def generate_tts_stream(request: TTSRequest):
    """
    Generate text-to-speech audio and stream it back
    
    Returns audio data as a streaming response.
    """
    try:
        # Validate voice
        voice_ids = [v.id for v in VOICES]
        if request.voice not in voice_ids:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid voice ID. Use /api/voices to get available voices."
            )
        
        # Generate speech
        audio_data, _ = await generate_speech(
            text=request.text,
            voice=request.voice,
            rate=request.rate,
            pitch=request.pitch,
            volume=request.volume,
        )
        
        # Return as streaming response
        return StreamingResponse(
            io.BytesIO(audio_data),
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": f"attachment; filename=voiceai-{request.voice}.mp3"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy", 
        "service": "voiceai-api",
        "allowed_origins": ALLOWED_ORIGINS
    }


# ============== Main ==============

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

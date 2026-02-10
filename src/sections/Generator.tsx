import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  Volume2,
  Play,
  Pause,
  Download,
  Settings2,
  Sparkles,
  AlertCircle,
  Check,
  RotateCcw,
  History,
  X,
  ChevronDown,
  Wand2,
  Info,
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTTS } from '@/hooks/useTTS';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import type { TTSRequest } from '@/types';

const MAX_CHARS = 5000;

export function Generator() {
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('en-US-GuyNeural'); // Default to male voice
  const [rate, setRate] = useState([1]);
  const [pitch, setPitch] = useState([1]);
  const [volume, setVolume] = useState([1]);
  const [showHistory, setShowHistory] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [generationSuccess, setGenerationSuccess] = useState(false);
  const [isWebSpeechMode, setIsWebSpeechMode] = useState(false);
  
  const generatorRef = useRef<HTMLDivElement>(null);
  const { generateSpeech, fetchVoices, isGenerating, error, voices, history, removeFromHistory, useWebSpeech } = useTTS();

  // Separate voices by gender
  const maleVoices = voices.filter(v => v.gender === 'male');
  const femaleVoices = voices.filter(v => v.gender === 'female');

  useEffect(() => {
    fetchVoices();
  }, [fetchVoices]);

  useEffect(() => {
    setIsWebSpeechMode(useWebSpeech);
  }, [useWebSpeech]);

  const { 
    isPlaying, 
    currentTime, 
    duration, 
    loadAudio, 
    togglePlay, 
    seek, 
    setVolume: setAudioVolume,
    download,
    formatTime 
  } = useAudioPlayer();

  const handleGenerate = async () => {
    if (!text.trim()) return;
    
    setGenerationSuccess(false);
    setAudioUrl(null);
    
    const request: TTSRequest = {
      text: text.trim(),
      voice: selectedVoice,
      rate: rate[0],
      pitch: pitch[0],
      volume: volume[0],
    };

    const response = await generateSpeech(request);
    if (response?.success) {
      setGenerationSuccess(true);
      if (response.audioUrl) {
        setAudioUrl(response.audioUrl);
        loadAudio(response.audioUrl);
      }
    }
  };

  const handleClear = () => {
    setText('');
    setAudioUrl(null);
    setGenerationSuccess(false);
  };

  const handleDownload = () => {
    if (audioUrl) {
      download(`voice-ai-${Date.now()}.mp3`);
    }
  };

  const selectedVoiceData = voices.find(v => v.id === selectedVoice);
  const charCount = text.length;
  const isOverLimit = charCount > MAX_CHARS;

  return (
    <section
      ref={generatorRef}
      id="generator"
      className="relative py-24 bg-gray-50"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Generate Your <span className="text-[#453478]">Voice</span>
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Enter your text, customize the voice settings, and generate natural-sounding speech in seconds.
          </p>
        </motion.div>

        {/* Main Generator Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-3xl border border-gray-200 shadow-lg shadow-purple-100/50 p-6 sm:p-8 lg:p-10"
        >
          {/* Web Speech API Notice */}
          {isWebSpeechMode && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-2xl bg-[#EDE9F5] border border-purple-200 text-[#453478] text-sm flex items-start gap-3"
            >
              <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Using browser's built-in speech synthesis</p>
                <p className="text-gray-600 mt-1">For higher quality voices with download support, run the backend server locally.</p>
              </div>
            </motion.div>
          )}

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left: Text Input */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-[#453478]" />
                  Enter Text
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="p-2.5 rounded-xl text-gray-500 hover:text-[#453478] hover:bg-[#EDE9F5] transition-all"
                    aria-label="Toggle history"
                  >
                    <History className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleClear}
                    className="p-2.5 rounded-xl text-gray-500 hover:text-[#453478] hover:bg-[#EDE9F5] transition-all"
                    aria-label="Clear text"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="relative">
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type or paste your text here..."
                  className="min-h-[280px] resize-none bg-white border-2 border-gray-200 rounded-2xl text-gray-900 placeholder:text-gray-400 focus:border-[#453478] focus:ring-4 focus:ring-purple-100 scrollbar-thin"
                  maxLength={MAX_CHARS + 100}
                />
                
                {/* Character Counter */}
                <div className="absolute bottom-4 right-4 text-xs bg-white px-2 py-1 rounded-lg border border-gray-100">
                  <span className={`${isOverLimit ? 'text-red-500' : 'text-gray-500'}`}>
                    {charCount.toLocaleString()}
                  </span>
                  <span className="text-gray-400"> / {MAX_CHARS.toLocaleString()}</span>
                </div>
              </div>

              {isOverLimit && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm"
                >
                  <AlertCircle className="w-4 h-4" />
                  Text exceeds maximum character limit
                </motion.div>
              )}

              {/* History Panel */}
              <AnimatePresence>
                {showHistory && history.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4 space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">Recent Generations</span>
                        <button
                          onClick={() => setShowHistory(false)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      {history.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-white border border-gray-100 hover:border-gray-200 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-700 truncate">{item.text}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{item.voice} • {item.duration}s</p>
                          </div>
                          <button
                            onClick={() => removeFromHistory(item.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right: Voice Controls */}
            <div className="space-y-6">
              {/* Voice Selection */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Mic className="w-4 h-4 text-[#453478]" />
                  Select Voice
                </label>
                <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                  <SelectTrigger className="bg-white border-2 border-gray-200 rounded-2xl h-12 text-gray-900 focus:border-[#453478] focus:ring-4 focus:ring-purple-100">
                    <SelectValue placeholder="Choose a voice" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 rounded-2xl max-h-72">
                    {/* Male Voices Section */}
                    {maleVoices.length > 0 && (
                      <SelectGroup>
                        <SelectLabel className="text-blue-600 font-semibold">Male Voices</SelectLabel>
                        {maleVoices.map((voice) => (
                          <SelectItem
                            key={voice.id}
                            value={voice.id}
                            className="text-gray-900 hover:bg-[#EDE9F5] focus:bg-[#EDE9F5] rounded-xl mx-1 my-0.5"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-blue-400" />
                              <span>{voice.name}</span>
                              <span className="text-gray-400 text-xs">({voice.accent})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    )}
                    
                    {/* Female Voices Section */}
                    {femaleVoices.length > 0 && (
                      <SelectGroup>
                        <SelectLabel className="text-pink-600 font-semibold">Female Voices</SelectLabel>
                        {femaleVoices.map((voice) => (
                          <SelectItem
                            key={voice.id}
                            value={voice.id}
                            className="text-gray-900 hover:bg-[#EDE9F5] focus:bg-[#EDE9F5] rounded-xl mx-1 my-0.5"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-pink-400" />
                              <span>{voice.name}</span>
                              <span className="text-gray-400 text-xs">({voice.accent})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    )}
                  </SelectContent>
                </Select>
                {selectedVoiceData && (
                  <p className="text-xs text-gray-500">
                    {selectedVoiceData.language} • {selectedVoiceData.gender === 'female' ? 'Female' : 'Male'} voice
                  </p>
                )}
              </div>

              {/* Advanced Settings Toggle */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#453478] font-medium transition-colors"
              >
                <Settings2 className="w-4 h-4" />
                Advanced Settings
                <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
              </button>

              {/* Advanced Settings */}
              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-6 overflow-hidden bg-gray-50 rounded-2xl p-5 border border-gray-100"
                  >
                    {/* Speed Control */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-gray-700 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-[#453478]" />
                          Speed
                        </label>
                        <span className="text-sm font-semibold text-[#453478] bg-[#EDE9F5] px-2 py-1 rounded-lg">{rate[0].toFixed(1)}x</span>
                      </div>
                      <Slider
                        value={rate}
                        onValueChange={setRate}
                        min={0.5}
                        max={2}
                        step={0.1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Slow</span>
                        <span>Normal</span>
                        <span>Fast</span>
                      </div>
                    </div>

                    {/* Pitch Control */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-gray-700 flex items-center gap-2">
                          <Volume2 className="w-4 h-4 text-[#453478]" />
                          Pitch
                        </label>
                        <span className="text-sm font-semibold text-[#453478] bg-[#EDE9F5] px-2 py-1 rounded-lg">{pitch[0].toFixed(1)}</span>
                      </div>
                      <Slider
                        value={pitch}
                        onValueChange={setPitch}
                        min={0.5}
                        max={2}
                        step={0.1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Low</span>
                        <span>Normal</span>
                        <span>High</span>
                      </div>
                    </div>

                    {/* Volume Control */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-gray-700 flex items-center gap-2">
                          <Volume2 className="w-4 h-4 text-[#453478]" />
                          Volume
                        </label>
                        <span className="text-sm font-semibold text-[#453478] bg-[#EDE9F5] px-2 py-1 rounded-lg">{Math.round(volume[0] * 100)}%</span>
                      </div>
                      <Slider
                        value={volume}
                        onValueChange={(val) => {
                          setVolume(val);
                          setAudioVolume(val[0]);
                        }}
                        min={0}
                        max={1}
                        step={0.05}
                        className="w-full"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={!text.trim() || isOverLimit || isGenerating}
                className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Speech
                  </>
                )}
              </button>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  {error}
                </motion.div>
              )}
            </div>
          </div>

          {/* Audio Player - Only show when backend audio is available */}
          <AnimatePresence>
            {audioUrl && !isWebSpeechMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-8 pt-8 border-t border-gray-100"
              >
                <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5 sm:p-6">
                  <div className="flex items-center gap-4">
                    {/* Play/Pause Button */}
                    <button
                      onClick={togglePlay}
                      className="w-14 h-14 rounded-full bg-[#453478] hover:bg-[#5A4491] flex items-center justify-center flex-shrink-0 shadow-purple-md transition-all hover:scale-105"
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6 text-white" />
                      ) : (
                        <Play className="w-6 h-6 text-white ml-1" />
                      )}
                    </button>

                    {/* Progress Bar */}
                    <div className="flex-1 space-y-2">
                      <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                        <input
                          type="range"
                          min={0}
                          max={duration || 100}
                          value={currentTime}
                          onChange={(e) => seek(Number(e.target.value))}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div
                          className="absolute left-0 top-0 h-full bg-[#453478] rounded-full transition-all"
                          style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 font-medium">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>

                    {/* Download Button */}
                    <button
                      onClick={handleDownload}
                      className="p-3.5 rounded-xl bg-white border border-gray-200 hover:border-[#453478] hover:bg-[#EDE9F5] text-gray-600 hover:text-[#453478] transition-all"
                      aria-label="Download audio"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Success Indicator */}
                  <div className="mt-4 flex items-center gap-2 text-sm text-emerald-600 font-medium">
                    <Check className="w-5 h-5" />
                    <span>Audio generated successfully!</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Web Speech Success Message */}
          <AnimatePresence>
            {generationSuccess && isWebSpeechMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-8 pt-8 border-t border-gray-100"
              >
                <div className="bg-[#EDE9F5] rounded-2xl border border-purple-200 p-5 sm:p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-[#453478] flex items-center justify-center flex-shrink-0">
                      <Volume2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-gray-900 font-semibold">Speech is playing...</h4>
                      <p className="text-gray-600 text-sm">Using your browser's built-in voice synthesis</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center gap-2 text-sm text-emerald-600 font-medium">
                    <Check className="w-5 h-5" />
                    <span>Speech generated and playing!</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Save, RotateCcw } from 'lucide-react';
import { audioEngine } from '../services/audioEngine';

interface RecorderProps {
  onRecordingComplete: (blob: Blob) => void;
}

const Recorder: React.FC<RecorderProps> = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode | null>(null);
  
  const timerRef = useRef<number>();

  const startRecording = async () => {
    try {
        const ctx = audioEngine.getCheckContext(); // Ensure context is running
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Setup visualizer
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current = analyser;

        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        chunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
            setAudioBlob(blob);
            stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
            if(animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };

        mediaRecorder.start();
        setIsRecording(true);
        setRecordingTime(0);
        timerRef.current = window.setInterval(() => {
            setRecordingTime(t => t + 1);
        }, 1000);

        drawWaveform();
    } catch (err) {
        console.error("Microphone access denied", err);
        alert("Microphone access required to record voice.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        if(timerRef.current) clearInterval(timerRef.current);
    }
  };

  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    if (!canvasCtx) return;

    const draw = () => {
        animationFrameRef.current = requestAnimationFrame(draw);
        analyser.getByteTimeDomainData(dataArray);

        canvasCtx.fillStyle = '#0E0E10';
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = '#00C2A8';
        canvasCtx.beginPath();

        const sliceWidth = canvas.width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = (v * canvas.height) / 2;

            if (i === 0) canvasCtx.moveTo(x, y);
            else canvasCtx.lineTo(x, y);

            x += sliceWidth;
        }

        canvasCtx.lineTo(canvas.width, canvas.height / 2);
        canvasCtx.stroke();
    };

    draw();
  };

  const handleSave = () => {
    if (audioBlob) {
        onRecordingComplete(audioBlob);
        setAudioBlob(null);
        setRecordingTime(0);
    }
  };

  const handleDiscard = () => {
    setAudioBlob(null);
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8 w-full">
        {/* Viz Area */}
        <div className="relative w-full h-48 bg-bv-surface rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
            {isRecording ? (
                <canvas ref={canvasRef} width={600} height={192} className="w-full h-full" />
            ) : audioBlob ? (
                <div className="text-bv-teal font-bold text-xl">Recording Ready</div>
            ) : (
                <div className="text-neutral-600 text-sm">Waveform will appear here</div>
            )}
            
            {/* Timer Overlay */}
            {isRecording && (
                <div className="absolute top-4 right-4 bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    {formatTime(recordingTime)}
                </div>
            )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6">
            {!audioBlob ? (
                <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`
                        w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg
                        ${isRecording 
                            ? 'bg-red-500 hover:bg-red-600 scale-110' 
                            : 'bg-gradient-primary hover:scale-105'
                        }
                    `}
                >
                    {isRecording ? <Square size={32} fill="white" /> : <Mic size={40} />}
                </button>
            ) : (
                <div className="flex gap-4">
                    <button 
                        onClick={handleDiscard}
                        className="w-16 h-16 rounded-full bg-neutral-700 hover:bg-neutral-600 flex items-center justify-center transition-colors"
                    >
                        <RotateCcw size={24} />
                    </button>
                    <button 
                        onClick={handleSave}
                        className="w-24 h-24 rounded-full bg-gradient-cta flex items-center justify-center transition-transform hover:scale-105 shadow-lg shadow-amber-500/20"
                    >
                        <Save size={32} className="ml-1" />
                    </button>
                </div>
            )}
        </div>

        <p className="text-neutral-400 text-center max-w-xs">
            {isRecording 
                ? "Recording... Hum a melody or beatbox a rhythm." 
                : audioBlob 
                    ? "Review your take. Save to add to tracks."
                    : "Tap to record. BeatVox will convert your voice to MIDI (Simulated)."}
        </p>
    </div>
  );
};

export default Recorder;

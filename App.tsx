import React, { useState } from 'react';
import { Mic, Grid, Layers, Play, Pause, Share, Plus } from 'lucide-react';
import { Track, TrackType, ProjectState } from './types';
import Recorder from './components/Recorder';
import BeatPad from './components/BeatPad';
import TrackList from './components/TrackList';
import SparkAI from './components/SparkAI';
import { audioEngine } from './services/audioEngine';

enum Tab {
  CAPTURE = 'CAPTURE',
  PAD = 'PAD',
  LAYERS = 'LAYERS'
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.CAPTURE);
  const [project, setProject] = useState<ProjectState>({
    bpm: 120,
    isPlaying: false,
    tracks: [],
    selectedTrackId: null
  });

  const handleRecordingComplete = (blob: Blob) => {
    const newTrack: Track = {
        id: Date.now().toString(),
        name: `Voice Take ${project.tracks.length + 1}`,
        type: TrackType.VOICE,
        isMuted: false,
        volume: 1.0,
        blob: blob,
        color: '#6B5BFF'
    };
    setProject(prev => ({
        ...prev,
        tracks: [...prev.tracks, newTrack]
    }));
    setActiveTab(Tab.LAYERS); // Switch to layers to see result
  };

  const deleteTrack = (id: string) => {
      setProject(prev => ({
          ...prev,
          tracks: prev.tracks.filter(t => t.id !== id)
      }));
  };

  const toggleMute = (id: string) => {
    setProject(prev => ({
        ...prev,
        tracks: prev.tracks.map(t => t.id === id ? {...t, isMuted: !t.isMuted} : t)
    }));
  };

  const togglePlayback = () => {
      // Very simple playback simulation
      // In a real app, this would schedule the sequencer
      const newState = !project.isPlaying;
      setProject(prev => ({...prev, isPlaying: newState}));
      
      if (newState) {
          // Play all unmuted audio blobs
          project.tracks.forEach(t => {
              if (t.blob && !t.isMuted) {
                  audioEngine.playBlob(t.blob);
              }
          });
      }
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-black text-white relative overflow-hidden shadow-2xl">
      {/* Top Bar */}
      <header className="px-6 py-4 flex justify-between items-center z-10 bg-black/80 backdrop-blur-md sticky top-0">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-hero flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full" />
            </div>
            <h1 className="font-sans font-extrabold text-xl tracking-tight">BeatVox</h1>
        </div>
        <div className="flex items-center gap-3">
             <div className="bg-neutral-800 px-3 py-1 rounded-full text-xs font-mono font-bold text-bv-teal border border-neutral-700">
                {project.bpm} BPM
             </div>
             <button className="text-bv-indigo hover:text-white transition-colors">
                <Share size={20} />
             </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide">
        {activeTab === Tab.CAPTURE && (
            <div className="h-full flex flex-col justify-center animate-in fade-in zoom-in-95 duration-300">
                <Recorder onRecordingComplete={handleRecordingComplete} />
            </div>
        )}

        {activeTab === Tab.PAD && (
            <div className="h-full flex flex-col animate-in slide-in-from-right duration-300">
                <BeatPad />
                <div className="mt-auto">
                    <SparkAI />
                </div>
            </div>
        )}

        {activeTab === Tab.LAYERS && (
            <div className="h-full flex flex-col gap-6 animate-in slide-in-from-right duration-300">
                <div>
                    <h2 className="text-2xl font-bold mb-4">Your Loop</h2>
                    <TrackList 
                        tracks={project.tracks} 
                        onDelete={deleteTrack} 
                        onToggleMute={toggleMute}
                    />
                </div>
                <div className="mt-auto">
                    <SparkAI />
                </div>
            </div>
        )}
      </main>

      {/* Playback & Nav */}
      <div className="bg-bv-surface border-t border-neutral-800 px-6 py-4 pb-8 z-20">
          {/* Mini Transport */}
          <div className="flex justify-center mb-6">
             <button 
                onClick={togglePlayback}
                className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]"
             >
                 {project.isPlaying ? <Pause size={24} fill="black" /> : <Play size={24} fill="black" className="ml-1" />}
             </button>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex justify-between items-center bg-black/40 rounded-2xl p-1 border border-neutral-800">
            <button 
                onClick={() => setActiveTab(Tab.CAPTURE)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl transition-all ${activeTab === Tab.CAPTURE ? 'bg-bv-indigo/20 text-bv-indigo' : 'text-neutral-500 hover:text-white'}`}
            >
                <Mic size={20} />
                <span className="text-[10px] font-bold uppercase tracking-wide">Voice</span>
            </button>
            <button 
                onClick={() => setActiveTab(Tab.PAD)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl transition-all ${activeTab === Tab.PAD ? 'bg-bv-teal/20 text-bv-teal' : 'text-neutral-500 hover:text-white'}`}
            >
                <Grid size={20} />
                <span className="text-[10px] font-bold uppercase tracking-wide">Beat Pad</span>
            </button>
            <button 
                onClick={() => setActiveTab(Tab.LAYERS)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl transition-all ${activeTab === Tab.LAYERS ? 'bg-bv-amber/20 text-bv-amber' : 'text-neutral-500 hover:text-white'}`}
            >
                <div className="relative">
                    <Layers size={20} />
                    {project.tracks.length > 0 && (
                        <span className="absolute -top-1 -right-2 bg-bv-indigo text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                            {project.tracks.length}
                        </span>
                    )}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wide">Layers</span>
            </button>
          </nav>
      </div>
    </div>
  );
};

export default App;

import React from 'react';
import { Track, TrackType } from '../types';
import { Play, Mic, Trash2, Volume2, VolumeX } from 'lucide-react';
import { audioEngine } from '../services/audioEngine';

interface TrackListProps {
  tracks: Track[];
  onDelete: (id: string) => void;
  onToggleMute: (id: string) => void;
}

const TrackList: React.FC<TrackListProps> = ({ tracks, onDelete, onToggleMute }) => {
  
  const handlePreview = (track: Track) => {
    if (track.blob) {
        audioEngine.playBlob(track.blob);
    }
  };

  if (tracks.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center h-full text-neutral-600">
              <p>No tracks yet.</p>
              <p className="text-sm">Record vocals or create a beat pattern.</p>
          </div>
      );
  }

  return (
    <div className="space-y-3 w-full pb-20">
      {tracks.map((track) => (
        <div 
            key={track.id} 
            className="w-full bg-bv-surface border border-neutral-800 rounded-xl p-3 flex items-center gap-4 transition-colors hover:border-neutral-700"
        >
            {/* Icon Type */}
            <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${track.type === TrackType.VOICE ? 'bg-bv-indigo/20 text-bv-indigo' : 'bg-bv-teal/20 text-bv-teal'}`}
            >
                {track.type === TrackType.VOICE ? <Mic size={18} /> : <span className="font-bold text-xs">BEAT</span>}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <h4 className="font-bold text-white truncate">{track.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-neutral-500 bg-neutral-900 px-1.5 py-0.5 rounded">
                        {track.type === TrackType.VOICE ? 'Audio' : 'MIDI'}
                    </span>
                    {track.isMuted && <span className="text-xs text-red-400">Muted</span>}
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
                 <button 
                    onClick={() => handlePreview(track)}
                    disabled={!track.blob}
                    className="p-2 text-neutral-400 hover:text-white disabled:opacity-30"
                >
                    <Play size={18} />
                </button>
                <button 
                    onClick={() => onToggleMute(track.id)}
                    className={`p-2 ${track.isMuted ? 'text-red-400' : 'text-neutral-400 hover:text-white'}`}
                >
                    {track.isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <button 
                    onClick={() => onDelete(track.id)}
                    className="p-2 text-neutral-400 hover:text-red-400"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
      ))}
    </div>
  );
};

export default TrackList;

import React, { useState } from 'react';
import { SOUND_MAP, PadSound } from '../types';
import { audioEngine } from '../services/audioEngine';

const BeatPad: React.FC = () => {
  const [activePad, setActivePad] = useState<number | null>(null);

  const handlePadClick = (index: number) => {
    setActivePad(index);
    const sound = SOUND_MAP[index] || 'KICK';
    audioEngine.playDrum(sound);
    setTimeout(() => setActivePad(null), 150);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4">
      <div className="grid grid-cols-4 gap-3 w-full max-w-md aspect-square">
        {Array.from({ length: 16 }).map((_, i) => (
          <button
            key={i}
            onClick={() => handlePadClick(i)}
            className={`
              relative w-full h-full rounded-xl transition-all duration-75 select-none
              flex items-center justify-center overflow-hidden
              ${activePad === i 
                ? 'bg-bv-indigo scale-95 shadow-[0_0_15px_rgba(107,91,255,0.6)]' 
                : 'bg-bv-surface hover:bg-neutral-800 shadow-md'}
            `}
          >
             {/* Simple decoration */}
             <div className={`w-2 h-2 rounded-full absolute top-2 right-2 ${activePad === i ? 'bg-white' : 'bg-neutral-700'}`} />
             <span className="text-xs text-neutral-500 font-bold tracking-widest">{SOUND_MAP[i].replace('_', ' ')}</span>
          </button>
        ))}
      </div>
      <p className="mt-4 text-neutral-500 text-sm">Tap pads to play. 4x4 Grid.</p>
    </div>
  );
};

export default BeatPad;

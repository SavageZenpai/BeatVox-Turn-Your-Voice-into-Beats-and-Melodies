export enum TrackType {
  VOICE = 'VOICE',
  BEAT = 'BEAT',
  AI = 'AI'
}

export interface Track {
  id: string;
  name: string;
  type: TrackType;
  isMuted: boolean;
  volume: number; // 0.0 to 1.0
  blob?: Blob; // For voice recordings
  pattern?: boolean[][]; // For beat sequencer (future)
  color: string;
}

export interface ProjectState {
  bpm: number;
  isPlaying: boolean;
  tracks: Track[];
  selectedTrackId: string | null;
}

export type PadSound = 'KICK' | 'SNARE' | 'HIHAT_CLOSED' | 'HIHAT_OPEN' | 'CLAP' | 'TOM' | 'CRASH' | 'RIDE' | 'PERC1' | 'PERC2' | 'FX1' | 'FX2' | 'VOX1' | 'VOX2' | 'BASS' | 'SYNTH';

export const SOUND_MAP: Record<number, PadSound> = {
  0: 'KICK', 1: 'SNARE', 2: 'HIHAT_CLOSED', 3: 'CLAP',
  4: 'TOM', 5: 'HIHAT_OPEN', 6: 'PERC1', 7: 'FX1',
  8: 'KICK', 9: 'SNARE', 10: 'CRASH', 11: 'RIDE',
  12: 'BASS', 13: 'SYNTH', 14: 'VOX1', 15: 'VOX2'
};

import { PadSound } from '../types';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  
  constructor() {
    // Lazy initialization on first user interaction
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  getCheckContext(): AudioContext {
    if (!this.ctx) this.init();
    return this.ctx!;
  }

  playDrum(sound: PadSound) {
    const ctx = this.getCheckContext();
    const t = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    // Simple synthesis for drum sounds
    switch (sound) {
      case 'KICK':
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(0.01, t + 0.5);
        gain.gain.setValueAtTime(1, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
        osc.connect(gain);
        break;
      case 'SNARE':
        // Noise burst for snare (simulated with random buffer or high freq osc for simplicity in this MVP)
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(250, t);
        gain.gain.setValueAtTime(0.7, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
        osc.connect(gain);
        // Ideally add noise here, but keeping it simple/performant without external assets
        break;
      case 'HIHAT_CLOSED':
      case 'HIHAT_OPEN':
        // High frequency square for metallic sound
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, t);
        // Randomize freq slightly for "metal" texture? difficult with simple osc. 
        // Just use high pitch square with bandpass in a real app.
        // Simplified:
        osc.frequency.setValueAtTime(1200, t);
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + (sound === 'HIHAT_OPEN' ? 0.3 : 0.05));
        osc.connect(gain);
        break;
      default:
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, t);
        gain.gain.setValueAtTime(0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
        osc.connect(gain);
        break;
    }

    gain.connect(this.masterGain!);
    osc.start(t);
    osc.stop(t + 1);
  }

  async playBlob(blob: Blob) {
    if (!blob) return;
    const ctx = this.getCheckContext();
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.masterGain!);
    source.start();
  }
}

export const audioEngine = new AudioEngine();

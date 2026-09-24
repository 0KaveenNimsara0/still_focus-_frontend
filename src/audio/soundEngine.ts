// Procedural audio generation using the Web Audio API.
// This requires zero external network requests, zero MP3 assets, and works offline reliably with full licensing safety.

export type SoundChannelId = 'rain' | 'waves' | 'forest' | 'noise';

export interface SoundChannelMeta {
  id: SoundChannelId;
  name: string;
  description: string;
  category: 'procedural-nature' | 'procedural-texture';
}

export const SOUND_CHANNELS: SoundChannelMeta[] = [
  {
    id: 'rain',
    name: 'Gentle Rain',
    description: 'Continuous soft rainfall with filtered Brownian texture',
    category: 'procedural-nature',
  },
  {
    id: 'waves',
    name: 'Ocean Swell',
    description: 'Slow low-frequency resonant sea waves',
    category: 'procedural-nature',
  },
  {
    id: 'forest',
    name: 'Forest Wind',
    description: 'Subtle breeze through pine trees and leafy rustle',
    category: 'procedural-nature',
  },
  {
    id: 'noise',
    name: 'Pink Noise',
    description: 'Balanced 1/f noise for deep acoustic masking',
    category: 'procedural-texture',
  },
];

export interface SoundPreset {
  id: string;
  name: string;
  description: string;
  volumes: Record<SoundChannelId, number>;
}

export const SOUND_PRESETS: SoundPreset[] = [
  {
    id: 'deep-work',
    name: 'Deep Sanctuary',
    description: 'Immersive rain and masking pink noise for isolation',
    volumes: { rain: 0.6, noise: 0.35, waves: 0.0, forest: 0.1 },
  },
  {
    id: 'coastal-calm',
    name: 'Coastal Horizon',
    description: 'Rhythmic ocean swells and gentle breeze',
    volumes: { waves: 0.7, forest: 0.25, rain: 0.1, noise: 0.0 },
  },
  {
    id: 'still-woods',
    name: 'Still Woods',
    description: 'Wind whispers with light distant raindrops',
    volumes: { forest: 0.65, rain: 0.2, waves: 0.0, noise: 0.1 },
  },
  {
    id: 'minimal-mask',
    name: 'Pure Stillness',
    description: 'Gentle pink noise texture to soften room acoustics',
    volumes: { noise: 0.45, rain: 0.0, waves: 0.0, forest: 0.0 },
  },
];

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private channelGains: Map<SoundChannelId, GainNode> = new Map();
  private channelSources: Map<SoundChannelId, { stop: () => void }> = new Map();

  private initContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public getContextState(): string {
    return this.ctx ? this.ctx.state : 'uninitialized';
  }

  public setMasterVolume(volume: number, muted: boolean): void {
    if (!this.masterGain || !this.ctx) return;
    const targetVol = muted ? 0 : Math.max(0, Math.min(1, volume));
    this.masterGain.gain.setTargetAtTime(targetVol, this.ctx.currentTime, 0.05);
  }

  public setChannelVolume(channelId: SoundChannelId, volume: number): void {
    const gainNode = this.channelGains.get(channelId);
    if (!gainNode || !this.ctx) return;
    const target = Math.max(0, Math.min(1, volume));
    gainNode.gain.setTargetAtTime(target, this.ctx.currentTime, 0.05);
  }

  public startChannel(channelId: SoundChannelId, volume: number): boolean {
    try {
      const ctx = this.initContext();
      if (this.channelSources.has(channelId)) {
        // Already running, just ensure volume
        this.setChannelVolume(channelId, volume);
        return true;
      }

      // Create channel gain
      let chGain = this.channelGains.get(channelId);
      if (!chGain) {
        chGain = ctx.createGain();
        chGain.connect(this.masterGain!);
        this.channelGains.set(channelId, chGain);
      }
      chGain.gain.setValueAtTime(volume, ctx.currentTime);

      // Synthesize specific procedural textures
      let controller: { stop: () => void };
      switch (channelId) {
        case 'rain':
          controller = this.createRainSynthesizer(ctx, chGain);
          break;
        case 'waves':
          controller = this.createWavesSynthesizer(ctx, chGain);
          break;
        case 'forest':
          controller = this.createForestSynthesizer(ctx, chGain);
          break;
        case 'noise':
          controller = this.createPinkNoiseSynthesizer(ctx, chGain);
          break;
      }

      this.channelSources.set(channelId, controller);
      return true;
    } catch (e) {
      console.error(`[STILL Audio] Failed to start channel ${channelId}:`, e);
      return false;
    }
  }

  public stopChannel(channelId: SoundChannelId): void {
    const src = this.channelSources.get(channelId);
    if (src) {
      try {
        src.stop();
      } catch (e) {
        console.warn(`[STILL Audio] Error stopping channel ${channelId}:`, e);
      }
      this.channelSources.delete(channelId);
    }
  }

  public stopAll(): void {
    for (const [id] of this.channelSources) {
      this.stopChannel(id);
    }
  }

  // Chime sound played when a focus or break session finishes
  public playCompletionChime(volume: number = 0.6): void {
    try {
      const ctx = this.initContext();
      const now = ctx.currentTime;

      // Soft dual bell tone (e.g. 528Hz and 660Hz with gentle decay)
      const freqs = [528, 660, 792];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        const noteGain = (volume * 0.3) / (idx + 1);
        gain.gain.setValueAtTime(0, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(noteGain, now + idx * 0.08 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 1.8);

        osc.connect(gain);
        gain.connect(this.masterGain || ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 2.0);
      });
    } catch (e) {
      console.warn('[STILL Audio] Could not play completion chime:', e);
    }
  }

  // --- Procedural Synthesizers ---

  // 1. Gentle Rain: Pink/Brown noise passed through low-pass + mild band-pass filters
  private createRainSynthesizer(ctx: AudioContext, destination: AudioNode): { stop: () => void } {
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, ctx.currentTime);

    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(250, ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(highpass);
    highpass.connect(destination);

    whiteNoise.start();

    return {
      stop: () => {
        try {
          whiteNoise.stop();
          whiteNoise.disconnect();
          filter.disconnect();
          highpass.disconnect();
        } catch {
          // ignore
        }
      },
    };
  }

  // 2. Ocean Swell: Low-passed filtered noise modulated with slow LFO for rhythmic swells
  private createWavesSynthesizer(ctx: AudioContext, destination: AudioNode): { stop: () => void } {
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // gain compensation
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, ctx.currentTime);

    const waveGain = ctx.createGain();
    waveGain.gain.setValueAtTime(0.3, ctx.currentTime);

    // LFO for ocean wave periodicity (e.g. 0.12 Hz ~ 8 seconds per wave)
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.12, ctx.currentTime);

    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(0.25, ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(waveGain.gain);

    noiseSource.connect(filter);
    filter.connect(waveGain);
    waveGain.connect(destination);

    noiseSource.start();
    lfo.start();

    return {
      stop: () => {
        try {
          noiseSource.stop();
          lfo.stop();
          noiseSource.disconnect();
          filter.disconnect();
          waveGain.disconnect();
          lfo.disconnect();
          lfoGain.disconnect();
        } catch {
          // ignore
        }
      },
    };
  }

  // 3. Forest Wind: Modulated bandpass filter sweeping softly across mid frequencies
  private createForestSynthesizer(ctx: AudioContext, destination: AudioNode): { stop: () => void } {
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, ctx.currentTime);
    filter.Q.setValueAtTime(1.8, ctx.currentTime);

    // Gentle wind sweep LFO
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.18, ctx.currentTime);

    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(220, ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    noiseSource.connect(filter);
    filter.connect(destination);

    noiseSource.start();
    lfo.start();

    return {
      stop: () => {
        try {
          noiseSource.stop();
          lfo.stop();
          noiseSource.disconnect();
          filter.disconnect();
          lfo.disconnect();
          lfoGain.disconnect();
        } catch {
          // ignore
        }
      },
    };
  }

  // 4. Pink Noise: standard 1/f noise for acoustic isolation
  private createPinkNoiseSynthesizer(ctx: AudioContext, destination: AudioNode): { stop: () => void } {
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.1;
      b6 = white * 0.115926;
    }

    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    source.connect(destination);
    source.start();

    return {
      stop: () => {
        try {
          source.stop();
          source.disconnect();
        } catch {
          // ignore
        }
      },
    };
  }
}

export const soundEngine = new SoundEngine();

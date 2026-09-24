import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usePreferences } from './PreferencesContext';
import { soundEngine, SOUND_PRESETS, type SoundChannelId } from '../audio/soundEngine';

interface AudioMixerContextType {
  activeChannels: Set<SoundChannelId>;
  toggleChannel: (channelId: SoundChannelId) => void;
  setChannelVolume: (channelId: SoundChannelId, volume: number) => void;
  masterVolume: number;
  setMasterVolume: (volume: number) => void;
  isMuted: boolean;
  toggleMute: () => void;
  applyPreset: (presetId: string) => void;
  activePresetId: string | null;
  stopAllChannels: () => void;
  userHasInteracted: boolean;
}

const AudioMixerContext = createContext<AudioMixerContextType | null>(null);

export const AudioMixerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { preferences, setSoundMixerMasterVolume, setSoundMixerMuted, setChannelVolume: persistChannelVol } = usePreferences();
  const [activeChannels, setActiveChannels] = useState<Set<SoundChannelId>>(new Set());
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [userHasInteracted, setUserHasInteracted] = useState<boolean>(false);

  // Sync master volume
  useEffect(() => {
    soundEngine.setMasterVolume(preferences.soundMixerMasterVolume, preferences.soundMixerMuted);
  }, [preferences.soundMixerMasterVolume, preferences.soundMixerMuted]);

  // Handle channel start/stop cleanly
  const toggleChannel = useCallback((channelId: SoundChannelId) => {
    setUserHasInteracted(true);
    setActivePresetId(null);
    setActiveChannels(prev => {
      const next = new Set(prev);
      if (next.has(channelId)) {
        next.delete(channelId);
        soundEngine.stopChannel(channelId);
      } else {
        next.add(channelId);
        const vol = preferences.channelVolumes[channelId] ?? 0.5;
        soundEngine.startChannel(channelId, vol);
      }
      return next;
    });
  }, [preferences.channelVolumes]);

  const setChannelVolume = useCallback((channelId: SoundChannelId, volume: number) => {
    persistChannelVol(channelId, volume);
    if (activeChannels.has(channelId)) {
      soundEngine.setChannelVolume(channelId, volume);
    }
  }, [activeChannels, persistChannelVol]);

  const setMasterVolume = useCallback((volume: number) => {
    setSoundMixerMasterVolume(volume);
  }, [setSoundMixerMasterVolume]);

  const toggleMute = useCallback(() => {
    setSoundMixerMuted(!preferences.soundMixerMuted);
  }, [preferences.soundMixerMuted, setSoundMixerMuted]);

  const applyPreset = useCallback((presetId: string) => {
    setUserHasInteracted(true);
    const preset = SOUND_PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    setActivePresetId(presetId);
    const nextActive = new Set<SoundChannelId>();

    // Stop current active ones first
    soundEngine.stopAll();

    // Start preset channels
    (Object.keys(preset.volumes) as SoundChannelId[]).forEach(ch => {
      const vol = preset.volumes[ch];
      persistChannelVol(ch, vol);
      if (vol > 0.05) {
        nextActive.add(ch);
        soundEngine.startChannel(ch, vol);
      }
    });

    setActiveChannels(nextActive);
  }, [persistChannelVol]);

  const stopAllChannels = useCallback(() => {
    soundEngine.stopAll();
    setActiveChannels(new Set());
    setActivePresetId(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      soundEngine.stopAll();
    };
  }, []);

  return (
    <AudioMixerContext.Provider
      value={{
        activeChannels,
        toggleChannel,
        setChannelVolume,
        masterVolume: preferences.soundMixerMasterVolume,
        setMasterVolume,
        isMuted: preferences.soundMixerMuted,
        toggleMute,
        applyPreset,
        activePresetId,
        stopAllChannels,
        userHasInteracted,
      }}
    >
      {children}
    </AudioMixerContext.Provider>
  );
};

export function useAudioMixer(): AudioMixerContextType {
  const ctx = useContext(AudioMixerContext);
  if (!ctx) {
    throw new Error('useAudioMixer must be used within an AudioMixerProvider');
  }
  return ctx;
}

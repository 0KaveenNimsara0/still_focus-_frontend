import React from 'react';
import { Volume2, VolumeX, Sliders, CloudRain, Waves, Trees, Sparkles, Power } from 'lucide-react';
import { useAudioMixer } from '../context/AudioMixerContext';
import { SOUND_CHANNELS, SOUND_PRESETS, type SoundChannelId } from '../audio/soundEngine';
import { usePreferences } from '../context/PreferencesContext';
import { cn } from '../utils/formatters';

const CHANNEL_ICONS: Record<SoundChannelId, React.ReactNode> = {
  rain: <CloudRain size={16} />,
  waves: <Waves size={16} />,
  forest: <Trees size={16} />,
  noise: <Sparkles size={16} />,
};

export const SoundMixer: React.FC = () => {
  const {
    activeChannels,
    toggleChannel,
    setChannelVolume,
    masterVolume,
    setMasterVolume,
    isMuted,
    toggleMute,
    applyPreset,
    activePresetId,
    stopAllChannels,
  } = useAudioMixer();

  const { preferences } = usePreferences();

  const activeCount = activeChannels.size;

  return (
    <div className="bg-[var(--surface-app)] border border-[var(--border-app)] rounded-2xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sliders size={16} className="text-[var(--accent-app)]" />
          <h2 className="text-sm font-semibold tracking-wide uppercase text-[var(--text-app)]">
            Ambient Sound
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <button
              onClick={stopAllChannels}
              className="text-xs text-[var(--text-subtle)] hover:text-red-500 transition-colors flex items-center gap-1"
              title="Stop all sounds"
            >
              <Power size={12} />
              <span>Silence all</span>
            </button>
          )}

          <button
            onClick={toggleMute}
            className={cn(
              'p-1.5 rounded-full border transition-colors',
              isMuted
                ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950 dark:border-red-900'
                : 'text-[var(--text-muted)] border-[var(--border-app)] hover:bg-[var(--surface-hover)]'
            )}
            title={isMuted ? 'Unmute master' : 'Mute master'}
            aria-label={isMuted ? 'Unmute master' : 'Mute master'}
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
        </div>
      </div>

      {/* Master volume slider */}
      <div className="flex items-center gap-3 mb-5 px-3 py-2 bg-[var(--surface-hover)] rounded-xl border border-[var(--border-app)]">
        <span className="text-xs text-[var(--text-muted)] font-medium">Master</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.02"
          value={isMuted ? 0 : masterVolume}
          onChange={e => {
            if (isMuted) toggleMute();
            setMasterVolume(parseFloat(e.target.value));
          }}
          className="w-full accent-[var(--accent-app)] h-1.5 cursor-pointer bg-[var(--border-app)] rounded-lg"
          aria-label="Master volume"
        />
        <span className="text-[11px] font-mono text-[var(--text-subtle)] w-8 text-right">
          {isMuted ? '0%' : `${Math.round(masterVolume * 100)}%`}
        </span>
      </div>

      {/* Sound channels grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        {SOUND_CHANNELS.map(ch => {
          const isActive = activeChannels.has(ch.id);
          const channelVol = preferences.channelVolumes[ch.id] ?? 0.5;

          return (
            <div
              key={ch.id}
              className={cn(
                'p-3 rounded-xl border transition-all duration-150 flex flex-col justify-between gap-2.5',
                isActive
                  ? 'bg-[var(--accent-light)] border-[var(--accent-app)]'
                  : 'bg-[var(--surface-app)] border-[var(--border-app)] hover:border-[var(--border-app)]'
              )}
            >
              <div className="flex items-center justify-between">
                <button
                  onClick={() => toggleChannel(ch.id)}
                  className="flex items-center gap-2 text-left focus:outline-none"
                  aria-pressed={isActive}
                >
                  <span
                    className={cn(
                      'p-1.5 rounded-lg transition-colors',
                      isActive
                        ? 'bg-[var(--accent-app)] text-white'
                        : 'bg-[var(--surface-hover)] text-[var(--text-subtle)]'
                    )}
                  >
                    {CHANNEL_ICONS[ch.id]}
                  </span>
                  <div>
                    <span className="text-xs font-medium block text-[var(--text-app)]">
                      {ch.name}
                    </span>
                    <span className="text-[10px] text-[var(--text-subtle)] block leading-tight">
                      {ch.category === 'procedural-nature' ? 'Procedural synth' : 'Acoustic texture'}
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => toggleChannel(ch.id)}
                  className={cn(
                    'text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors',
                    isActive
                      ? 'bg-[var(--accent-app)] text-white'
                      : 'bg-[var(--surface-hover)] text-[var(--text-subtle)] hover:text-[var(--text-app)]'
                  )}
                  aria-label={`${isActive ? 'Stop' : 'Play'} ${ch.name}`}
                >
                  {isActive ? 'On' : 'Off'}
                </button>
              </div>

              {/* Individual volume slider */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={channelVol}
                  onChange={e => setChannelVolume(ch.id, parseFloat(e.target.value))}
                  disabled={!isActive}
                  className="w-full accent-[var(--accent-app)] h-1 cursor-pointer disabled:opacity-40"
                  aria-label={`${ch.name} volume`}
                />
                <span className="text-[10px] font-mono text-[var(--text-subtle)] w-6 text-right">
                  {Math.round(channelVol * 100)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preset mixes */}
      <div>
        <span className="text-[11px] font-medium text-[var(--text-subtle)] block mb-2">
          Curated Soundscapes
        </span>
        <div className="flex flex-wrap gap-1.5">
          {SOUND_PRESETS.map(preset => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset.id)}
              className={cn(
                'text-xs px-3 py-1.5 rounded-full border transition-all',
                activePresetId === preset.id
                  ? 'bg-[var(--accent-app)] text-white border-[var(--accent-app)] shadow-xs'
                  : 'bg-[var(--surface-hover)] border-[var(--border-app)] text-[var(--text-muted)] hover:text-[var(--text-app)]'
              )}
              title={preset.description}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

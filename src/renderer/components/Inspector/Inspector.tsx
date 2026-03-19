import React from 'react'
import { useProjectStore } from '../../stores/project'
import { useUIStore } from '../../stores/ui'
import { PRESET_BACKGROUNDS, backgroundToCSS } from '../../canvas/effects'
import { RESOLUTION_PRESETS } from '../../../shared/constants'

export const Inspector: React.FC = () => {
  const background = useProjectStore((s) => s.background)
  const setBackground = useProjectStore((s) => s.setBackground)
  const padding = useProjectStore((s) => s.padding)
  const setPadding = useProjectStore((s) => s.setPadding)
  const borderRadius = useProjectStore((s) => s.borderRadius)
  const setBorderRadius = useProjectStore((s) => s.setBorderRadius)
  const shadow = useProjectStore((s) => s.shadow)
  const setShadow = useProjectStore((s) => s.setShadow)
  const resolution = useProjectStore((s) => s.resolution)
  const setResolution = useProjectStore((s) => s.setResolution)
  const activePanel = useUIStore((s) => s.activePanel)
  const setActivePanel = useUIStore((s) => s.setActivePanel)

  return (
    <div className="w-64 bg-surface-light border-l border-white/10 flex flex-col overflow-y-auto">
      {/* Panel tabs */}
      <div className="flex border-b border-white/10">
        {(['inspector', 'backgrounds', 'frames'] as const).map((panel) => (
          <button
            key={panel}
            onClick={() => setActivePanel(panel)}
            className={`flex-1 py-2 text-xs capitalize transition-colors ${
              activePanel === panel
                ? 'text-accent border-b-2 border-accent'
                : 'text-white/50 hover:text-white/70'
            }`}
          >
            {panel}
          </button>
        ))}
      </div>

      <div className="p-3 space-y-4">
        {activePanel === 'inspector' && (
          <>
            {/* Padding */}
            <div>
              <label className="text-xs text-white/50 block mb-1">Padding</label>
              <input
                type="range"
                min="0"
                max="120"
                value={padding}
                onChange={(e) => setPadding(Number(e.target.value))}
                className="w-full accent-accent"
              />
              <span className="text-xs text-white/40">{padding}px</span>
            </div>

            {/* Border Radius */}
            <div>
              <label className="text-xs text-white/50 block mb-1">Corner Radius</label>
              <input
                type="range"
                min="0"
                max="40"
                value={borderRadius}
                onChange={(e) => setBorderRadius(Number(e.target.value))}
                className="w-full accent-accent"
              />
              <span className="text-xs text-white/40">{borderRadius}px</span>
            </div>

            {/* Shadow */}
            <div className="flex items-center justify-between">
              <label className="text-xs text-white/50">Shadow</label>
              <button
                onClick={() => setShadow(!shadow)}
                className={`w-8 h-4 rounded-full transition-colors ${
                  shadow ? 'bg-accent' : 'bg-white/20'
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full bg-white transition-transform ${
                    shadow ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Resolution */}
            <div>
              <label className="text-xs text-white/50 block mb-1">Resolution</label>
              <select
                value={`${resolution.width}x${resolution.height}`}
                onChange={(e) => {
                  const [w, h] = e.target.value.split('x').map(Number)
                  setResolution({ width: w, height: h })
                }}
                className="w-full bg-surface border border-white/10 rounded px-2 py-1 text-sm text-white/80"
              >
                {Object.entries(RESOLUTION_PRESETS).map(([name, res]) => (
                  <option key={name} value={`${res.width}x${res.height}`}>
                    {name} ({res.width}x{res.height})
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {activePanel === 'backgrounds' && (
          <div className="grid grid-cols-2 gap-2">
            {PRESET_BACKGROUNDS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => setBackground(preset.config)}
                className={`h-16 rounded-lg border-2 transition-colors ${
                  JSON.stringify(background) === JSON.stringify(preset.config)
                    ? 'border-accent'
                    : 'border-transparent hover:border-white/20'
                }`}
                style={{ background: backgroundToCSS(preset.config) }}
                title={preset.name}
              />
            ))}
          </div>
        )}

        {activePanel === 'frames' && (
          <div className="text-xs text-white/40 text-center py-8">
            Device frames coming soon.
            <br />
            MacBook, iPhone, Browser frames.
          </div>
        )}
      </div>
    </div>
  )
}

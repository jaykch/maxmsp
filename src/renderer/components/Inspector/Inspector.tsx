import React from 'react'
import { useProjectStore } from '../../stores/project'
import { useUIStore } from '../../stores/ui'
import { PRESET_BACKGROUNDS, backgroundToCSS } from '../../canvas/effects'
import { RESOLUTION_PRESETS } from '../../../shared/constants'

const ASPECT_PRESETS = [
  { label: '16:9', value: '16:9' },
  { label: '9:16', value: '9:16' },
  { label: '4:3', value: '4:3' },
  { label: '1:1', value: '1:1' },
  { label: '4:5', value: '4:5' },
  { label: '21:9', value: '21:9' },
  { label: 'Free', value: 'free' }
]

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
  const crop = useProjectStore((s) => s.crop)
  const setCrop = useProjectStore((s) => s.setCrop)
  const activePanel = useUIStore((s) => s.activePanel)
  const setActivePanel = useUIStore((s) => s.setActivePanel)

  const handleAspectChange = (aspect: string) => {
    setCrop({ aspect })
    // Auto-calculate crop rect from aspect ratio
    if (aspect === 'free') return
    const [w, h] = aspect.split(':').map(Number)
    const ratio = w / h
    const canvasRatio = resolution.width / resolution.height
    if (ratio > canvasRatio) {
      const cropH = canvasRatio / ratio
      setCrop({ width: 1, height: cropH, x: 0, y: (1 - cropH) / 2 })
    } else {
      const cropW = ratio / canvasRatio
      setCrop({ width: cropW, height: 1, x: (1 - cropW) / 2, y: 0 })
    }
  }

  const selectClass = "w-full bg-white/[0.04] border border-surface-border rounded-md px-2.5 py-1.5 text-[12px] text-white/60 focus:outline-none focus:border-white/15 transition-colors"

  const toggleClass = (active: boolean) =>
    `w-8 h-[18px] rounded-full transition-colors relative ${active ? 'bg-accent' : 'bg-white/10'}`

  const toggleDot = (active: boolean) =>
    `absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white transition-transform shadow-sm ${active ? 'left-[16px]' : 'left-[2px]'}`

  return (
    <div className="w-60 bg-surface-light border-l border-surface-border flex flex-col overflow-y-auto">
      {/* Tabs */}
      <div className="flex border-b border-surface-border">
        {(['inspector', 'crop', 'backgrounds', 'frames'] as const).map((panel) => (
          <button
            key={panel}
            onClick={() => setActivePanel(panel)}
            className={`flex-1 py-2.5 text-[10px] uppercase tracking-wider font-medium transition-colors ${
              activePanel === panel
                ? 'text-white border-b border-white/30'
                : 'text-white/25 hover:text-white/40'
            }`}
          >
            {panel}
          </button>
        ))}
      </div>

      <div className="p-3 space-y-5">
        {activePanel === 'inspector' && (
          <>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] text-white/30 uppercase tracking-wider">Padding</label>
                <span className="text-[10px] text-white/20 font-mono">{padding}px</span>
              </div>
              <input type="range" min="0" max="120" value={padding} onChange={(e) => setPadding(Number(e.target.value))} className="w-full" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] text-white/30 uppercase tracking-wider">Corners</label>
                <span className="text-[10px] text-white/20 font-mono">{borderRadius}px</span>
              </div>
              <input type="range" min="0" max="40" value={borderRadius} onChange={(e) => setBorderRadius(Number(e.target.value))} className="w-full" />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-[10px] text-white/30 uppercase tracking-wider">Shadow</label>
              <button onClick={() => setShadow(!shadow)} className={toggleClass(shadow)}>
                <div className={toggleDot(shadow)} />
              </button>
            </div>

            <div>
              <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-2">Resolution</label>
              <select
                value={`${resolution.width}x${resolution.height}`}
                onChange={(e) => {
                  const [w, h] = e.target.value.split('x').map(Number)
                  setResolution({ width: w, height: h })
                }}
                className={selectClass}
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

        {activePanel === 'crop' && (
          <>
            {/* Enable/disable crop */}
            <div className="flex items-center justify-between">
              <label className="text-[10px] text-white/30 uppercase tracking-wider">Enable Crop</label>
              <button onClick={() => setCrop({ enabled: !crop.enabled })} className={toggleClass(crop.enabled)}>
                <div className={toggleDot(crop.enabled)} />
              </button>
            </div>

            {crop.enabled && (
              <>
                {/* Aspect ratio presets */}
                <div>
                  <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-2">Aspect Ratio</label>
                  <div className="grid grid-cols-4 gap-1">
                    {ASPECT_PRESETS.map((preset) => (
                      <button
                        key={preset.value}
                        onClick={() => handleAspectChange(preset.value)}
                        className={`py-1.5 rounded-md text-[10px] transition-all ${
                          crop.aspect === preset.value
                            ? 'bg-accent text-white'
                            : 'bg-white/[0.04] text-white/40 hover:bg-white/[0.08]'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Visual crop preview */}
                <div>
                  <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-2">Crop Area</label>
                  <div className="relative w-full aspect-video bg-white/[0.03] rounded-md border border-surface-border overflow-hidden">
                    {/* Darkened outside area */}
                    <div className="absolute inset-0 bg-black/50" />
                    {/* Active crop region */}
                    <div
                      className="absolute border-2 border-white/60 bg-transparent"
                      style={{
                        left: `${crop.x * 100}%`,
                        top: `${crop.y * 100}%`,
                        width: `${crop.width * 100}%`,
                        height: `${crop.height * 100}%`
                      }}
                    >
                      {/* Rule of thirds grid */}
                      <div className="absolute inset-0">
                        <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/20" />
                        <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/20" />
                        <div className="absolute top-1/3 left-0 right-0 h-px bg-white/20" />
                        <div className="absolute top-2/3 left-0 right-0 h-px bg-white/20" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Crop dimensions */}
                <div className="text-[10px] text-white/20 font-mono text-center">
                  {Math.round(crop.width * resolution.width)} x {Math.round(crop.height * resolution.height)}
                </div>
              </>
            )}
          </>
        )}

        {activePanel === 'backgrounds' && (
          <div className="grid grid-cols-3 gap-1.5">
            {PRESET_BACKGROUNDS.map((preset) => {
              const isSelected = JSON.stringify(background) === JSON.stringify(preset.config)
              const hasThumb = !!preset.thumbnailUrl
              const thumbStyle: React.CSSProperties = hasThumb
                ? { backgroundImage: `url(${preset.thumbnailUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                : { background: backgroundToCSS(preset.config) }

              return (
                <button
                  key={preset.name}
                  onClick={() => setBackground(preset.config)}
                  className={`aspect-square rounded-lg border transition-all relative group overflow-hidden ${
                    isSelected
                      ? 'border-white/40 shadow-glow scale-[1.02]'
                      : 'border-surface-border hover:border-white/15'
                  }`}
                  style={thumbStyle}
                  title={preset.name}
                >
                  <span className="absolute bottom-0 left-0 right-0 text-[8px] text-white/0 group-hover:text-white/70 transition-colors bg-gradient-to-t from-black/60 to-transparent rounded-b-lg py-1 text-center">
                    {preset.name}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {activePanel === 'frames' && (
          <div className="text-[11px] text-white/20 text-center py-10 leading-relaxed">
            Device frames coming soon.
            <br />
            MacBook, iPhone, Browser.
          </div>
        )}
      </div>
    </div>
  )
}

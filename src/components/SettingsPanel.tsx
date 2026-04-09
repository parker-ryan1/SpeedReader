import { ReaderSettings } from '../App'
import './SettingsPanel.css'

interface Props {
  settings: ReaderSettings
  onSettingsChange: (s: ReaderSettings) => void
  onClose: () => void
}

const FONT_OPTIONS = [
  { label: 'Georgia (Serif)', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
  { label: 'Arial (Sans)', value: 'Arial, sans-serif' },
  { label: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
  { label: 'Courier New (Mono)', value: '"Courier New", Courier, monospace' },
  { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
]

const THEME_OPTIONS: { label: string; value: ReaderSettings['theme'] }[] = [
  { label: 'Dark', value: 'dark' },
  { label: 'Light', value: 'light' },
  { label: 'Sepia', value: 'sepia' },
]

export default function SettingsPanel({ settings, onSettingsChange, onClose }: Props) {
  const update = (partial: Partial<ReaderSettings>) =>
    onSettingsChange({ ...settings, ...partial })

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="settings-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="settings-body">
          {/* Font Size */}
          <div className="setting-group">
            <label className="setting-label">
              Font Size
              <span className="setting-value">{settings.fontSize}px</span>
            </label>
            <div className="slider-row">
              <span className="range-min">24</span>
              <input
                type="range"
                min={24}
                max={120}
                step={2}
                value={settings.fontSize}
                onChange={(e) => update({ fontSize: parseInt(e.target.value) })}
                className="setting-slider"
              />
              <span className="range-max">120</span>
            </div>
            <div className="font-size-preview" style={{ fontSize: `${Math.min(settings.fontSize, 48)}px`, fontFamily: settings.fontFamily }}>
              Aa
            </div>
          </div>

          {/* WPM */}
          <div className="setting-group">
            <label className="setting-label">
              Reading Speed
              <span className="setting-value">{settings.wpm} WPM</span>
            </label>
            <div className="slider-row">
              <span className="range-min">50</span>
              <input
                type="range"
                min={50}
                max={1500}
                step={10}
                value={settings.wpm}
                onChange={(e) => update({ wpm: parseInt(e.target.value) })}
                className="setting-slider"
              />
              <span className="range-max">1500</span>
            </div>
          </div>

          {/* Focus Line Gap */}
          <div className="setting-group">
            <label className="setting-label">
              Focus Line Gap
              <span className="setting-value">{settings.lineGap.toFixed(1)}em</span>
            </label>
            <div className="slider-row">
              <span className="range-min">0.3</span>
              <input
                type="range"
                min={0.3}
                max={3.0}
                step={0.1}
                value={settings.lineGap}
                onChange={(e) => update({ lineGap: parseFloat(e.target.value) })}
                className="setting-slider"
              />
              <span className="range-max">3.0</span>
            </div>
            <p className="setting-hint">Controls the gap in the red vertical line around the focus letter.</p>
          </div>

          {/* Punctuation Pause */}
          <div className="setting-group">
            <label className="setting-label">
              Punctuation Pause
              <span className="setting-value">
                {settings.punctuationPause === 1
                  ? 'Off'
                  : `${settings.punctuationPause.toFixed(1)}×`}
              </span>
            </label>
            <div className="slider-row">
              <span className="range-min">Off</span>
              <input
                type="range"
                min={1}
                max={4}
                step={0.25}
                value={settings.punctuationPause}
                onChange={(e) => update({ punctuationPause: parseFloat(e.target.value) })}
                className="setting-slider"
              />
              <span className="range-max">4×</span>
            </div>
            <p className="setting-hint">
              Multiplies the display time for words ending in . ! ? , ; : —
            </p>
          </div>

          {/* Font Family */}
          <div className="setting-group">
            <label className="setting-label">Font Family</label>
            <div className="option-grid">
              {FONT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  className={`option-btn ${settings.fontFamily === opt.value ? 'selected' : ''}`}
                  onClick={() => update({ fontFamily: opt.value })}
                  style={{ fontFamily: opt.value }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Theme */}
          <div className="setting-group">
            <label className="setting-label">Theme</label>
            <div className="theme-row">
              {THEME_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  className={`theme-btn theme-${opt.value} ${settings.theme === opt.value ? 'selected' : ''}`}
                  onClick={() => update({ theme: opt.value })}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

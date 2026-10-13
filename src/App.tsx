import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react"

type ViewMode = "bridge" | "systems" | "standby"
type ZoneId = "A" | "B" | "C"
type Zone = {
  id: ZoneId
  name: string
  x: number
  y: number
  w: number
  h: number
  pad: number
}

const initialZones: Zone[] = [
  { id: "A", name: "HAUPTFELD LINKS", x: 3, y: 8, w: 45, h: 43, pad: 5 },
  { id: "B", name: "HAUPTFELD RECHTS", x: 52, y: 8, w: 45, h: 43, pad: 5 },
  { id: "C", name: "STATUSKANAL", x: 3, y: 56, w: 94, h: 12, pad: 2 },
]

const moduleNames = {
  primary: "Primäranzeige",
  metrics: "Statuswerte",
  navigation: "Navigation / Wetter",
  warning: "Warnzone",
}

function Icon({
  name,
  size = 24,
}: {
  name: "ship" | "nav" | "leaf" | "server" | "network" | "power" | "cloud" | "clock" | "alert"
  size?: number
}) {
  const paths: Record<typeof name, ReactNode> = {
    ship: (
      <>
        <path d="M12 2 8 8l1 6-4 4 5-1 2 5 2-5 5 1-4-4 1-6-4-6Z" />
        <path d="m9 14 3-2 3 2" />
      </>
    ),
    nav: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
      </>
    ),
    leaf: (
      <>
        <path d="M19 4C9 4 5 9 5 15c4 0 10-2 14-11Z" />
        <path d="M5 20c1-5 5-9 10-12" />
      </>
    ),
    server: (
      <>
        <rect x="4" y="4" width="16" height="6" rx="1" />
        <rect x="4" y="14" width="16" height="6" rx="1" />
        <path d="M8 7h.01M8 17h.01M12 7h5M12 17h5" />
      </>
    ),
    network: (
      <>
        <circle cx="12" cy="18" r="1" />
        <path d="M8.5 14.5a5 5 0 0 1 7 0M5 11a10 10 0 0 1 14 0" />
      </>
    ),
    power: (
      <>
        <path d="M12 2v10M7 5.5a8 8 0 1 0 10 0" />
      </>
    ),
    cloud: (
      <path d="M6 18h11a4 4 0 0 0 .5-8A6 6 0 0 0 6 8.5 4.8 4.8 0 0 0 6 18Z" />
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    alert: (
      <>
        <path d="M12 3 2.8 20h18.4L12 3Z" />
        <path d="M12 9v5M12 17h.01" />
      </>
    ),
  }

  return (
    <svg
      aria-hidden="true"
      className="icon"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      {paths[name]}
    </svg>
  )
}

function Frame({
  children,
  className = "",
  eyebrow,
  status,
}: {
  children: ReactNode
  className?: string
  eyebrow: string
  status?: string
}) {
  return (
    <section className={`frame ${className}`}>
      <span className="corner corner-tl" />
      <span className="corner corner-br" />
      <header className="frame-head">
        <span>{eyebrow}</span>
        {status && <span className="frame-status">{status}</span>}
      </header>
      <div className="frame-content">{children}</div>
    </section>
  )
}

function Gauge({
  label,
  value,
  note,
  level = "normal",
}: {
  label: string
  value: number
  note?: string
  level?: "normal" | "ice" | "critical"
}) {
  return (
    <div className={`gauge gauge-${level}`}>
      <div className="gauge-top">
        <span>{label}</span>
        <strong>
          {value}
          <small>%</small>
        </strong>
      </div>
      <div className="gauge-track">
        <span style={{ width: `${value}%` }} />
        {Array.from({ length: 9 }).map((_, index) => (
          <i key={index} />
        ))}
      </div>
      {note && <span className="gauge-note">{note}</span>}
    </div>
  )
}

function Metric({
  icon,
  label,
  value,
  unit,
  tone = "amber",
}: {
  icon?: Parameters<typeof Icon>[0]["name"]
  label: string
  value: string
  unit?: string
  tone?: "amber" | "ice" | "red" | "muted"
}) {
  return (
    <div className={`metric metric-${tone}`}>
      <div className="metric-label">
        {icon && <Icon name={icon} size={18} />}
        <span>{label}</span>
      </div>
      <div className="metric-value">
        {value}
        {unit && <small>{unit}</small>}
      </div>
    </div>
  )
}

function RavenMark() {
  return (
    <svg className="raven-mark" viewBox="0 0 100 76" aria-label="Hugin Prime">
      <path d="M50 4 35 17 18 11l8 18L8 24l15 19 19 5 8 22 8-22 19-5 15-19-18 5 8-18-17 6L50 4Z" />
      <path
        className="raven-cut"
        d="m50 18-8 14 8 8 8-8-8-14ZM29 31l13 5-9 4-4-9Zm42 0-13 5 9 4 4-9Z"
      />
    </svg>
  )
}

function BridgeView({
  slot,
  modules,
  testWarning,
}: {
  slot: ZoneId
  modules: Record<string, boolean>
  testWarning: boolean
}) {
  if (slot === "A") {
    return (
      <div className="zone-layout main-instrument bridge-left">
        {modules.primary && (
          <div className="instrument-title">
            <RavenMark />
            <div>
              <span className="kicker">CMDR / AKTIVES SCHIFF</span>
              <div className="hero-name">NARKON</div>
              <span className="subline">KRAIT MK II · HUGIN'S SPEAR</span>
            </div>
            <div className="online-tag">
              <i /> DEMO
            </div>
          </div>
        )}
        {modules.metrics && (
          <div className="primary-readout">
            <div className="flight-state">
              <span className="kicker">FLUGSTATUS</span>
              <strong>SUPERCRUISE</strong>
              <div className="velocity">
                <b>18.4</b>
                <span>C</span>
              </div>
            </div>
            <div className="compact-vitals">
              <Gauge label="TREIBSTOFF" value={68} note="18,6 T" />
              <Gauge label="HÜLLE" value={94} note="NOMINAL" />
            </div>
            <div className="compact-reticle">
              <span />
              <Icon name="ship" size={58} />
            </div>
          </div>
        )}
      </div>
    )
  }

  if (slot === "B") {
    return (
      <div className="zone-layout main-instrument bridge-right">
        {modules.navigation && (
          <Frame
            className="route-frame"
            eyebrow="SPRUNGROUTE"
            status="NAV / 04"
          >
            <div className="route">
              <div>
                <span>AKTUELL</span>
                <strong>COL 285 SECTOR UF-N C7-12</strong>
              </div>
              <div className="route-line">
                <i />
                <i />
                <i />
                <i />
                <i />
              </div>
              <div>
                <span>ZIEL</span>
                <strong>BLAA EOHN YZ-G D10-0</strong>
              </div>
              <div className="jump-count">
                <strong>4</strong>
                <span>SPRÜNGE</span>
              </div>
            </div>
          </Frame>
        )}
        {modules.metrics && (
          <div className="vital-matrix">
            <Gauge label="SCHILDE" value={82} note="3 RINGE" level="ice" />
            <Gauge label="FRACHT" value={31} note="20 / 64 T" />
            <Metric label="ENTFERNUNG" value="1.240" unit="LS" />
            <Metric label="AUSRICHTUNG" value="084" unit="°" tone="ice" />
          </div>
        )}
      </div>
    )
  }

  return modules.warning ? (
    <div className="zone-layout status-rail">
      <div className="rail-cell exo-rail">
        <Icon name="leaf" size={27} />
        <span>EXOBIOLOGIE</span>
        <strong>STRATUM · SCAN 02/03</strong>
      </div>
      <div className="rail-cell">
        <span>MASSESPERRE</span>
        <strong>FREI</strong>
      </div>
      <div className="rail-cell">
        <span>ZIEL</span>
        <strong>1.240 LS</strong>
      </div>
      <div className={`rail-alert ${testWarning ? "is-critical" : ""}`}>
        <Icon name={testWarning ? "alert" : "nav"} size={25} />
        <div>
          <span>{testWarning ? "KRITISCHE WARNUNG" : "TAKTISCH"}</span>
          <strong>{testWarning ? "HÜLLE UNTER 20%" : "KEINE GEFAHR"}</strong>
        </div>
      </div>
    </div>
  ) : null
}

function SystemsView({
  slot,
  modules,
  testWarning,
}: {
  slot: ZoneId
  modules: Record<string, boolean>
  testWarning: boolean
}) {
  if (slot === "A") {
    return (
      <div className="zone-layout main-instrument systems-main">
        {modules.primary && (
          <div className="instrument-title">
            <RavenMark />
            <div>
              <span className="kicker">KOMMANDO DECK 01</span>
              <div className="hero-name">HUGIN PRIME</div>
              <span className="subline">RAUMSYSTEME · LOKALER BETRIEB</span>
            </div>
            <div className="online-tag">
              <i /> NOMINAL
            </div>
          </div>
        )}
        {modules.metrics && (
          <div className="system-metric-grid">
            <Metric icon="power" label="LEISTUNG" value="486" unit="W" />
            <Metric label="RAUM" value="21,8" unit="°C" />
            <Metric label="LUFTFEUCHTE" value="48" unit="%" />
            <Metric label="GERÄTE AKTIV" value="07" />
          </div>
        )}
      </div>
    )
  }

  if (slot === "B") {
    return (
      <div className="zone-layout main-instrument systems-secondary">
        {modules.navigation && (
          <Frame className="weather-frame" eyebrow="SIEVERSTEDT" status="DEMO">
            <div className="weather">
              <Icon name="cloud" size={58} />
              <div>
                <strong>9°</strong>
                <span>BEWÖLKT</span>
              </div>
              <div className="weather-detail">
                <span>GEFÜHLT</span>
                <b>7°</b>
                <span>WIND</span>
                <b>14 KM/H</b>
              </div>
            </div>
          </Frame>
        )}
        {modules.metrics && (
          <div className="network-block">
            <Metric
              icon="server"
              label="PRIME SERVER"
              value="ONLINE"
              tone="ice"
            />
            <Metric
              icon="network"
              label="NETZWERK"
              value="942"
              unit="MBIT"
              tone="ice"
            />
            <div className="light-scene">
              <span>LICHTMODUS</span>
              <strong>BRÜCKE</strong>
            </div>
          </div>
        )}
      </div>
    )
  }

  return modules.warning ? (
    <div className="zone-layout status-rail">
      <div className="rail-cell">
        <span>SYSTEMGESUNDHEIT</span>
        <strong>{testWarning ? "STÖRUNG" : "NORMALBETRIEB"}</strong>
      </div>
      <div className="rail-cell">
        <span>SERVER</span>
        <strong>ONLINE</strong>
      </div>
      <div className="rail-cell">
        <span>BACKUP</span>
        <strong>IN 42 MIN</strong>
      </div>
      <div className={`rail-alert ${testWarning ? "is-critical" : ""}`}>
        <Icon name={testWarning ? "alert" : "server"} size={25} />
        <div>
          <span>{testWarning ? "STÖRUNG" : "STATUS"}</span>
          <strong>
            {testWarning ? "NETZWERK-KNOTEN AUS" : "SYSTEME BEREIT"}
          </strong>
        </div>
      </div>
    </div>
  ) : null
}

function StandbyView({
  slot,
  now,
  modules,
}: {
  slot: ZoneId
  now: Date
  modules: Record<string, boolean>
}) {
  const time = now.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  })
  const seconds = now
    .toLocaleTimeString("de-DE", { second: "2-digit" })
    .slice(-2)
  const date = now.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  })

  if (slot === "A") {
    return modules.primary ? (
      <div className="zone-layout standby-id standby-main">
        <RavenMark />
        <div>
          <span className="kicker">HUGIN PRIME</span>
          <strong>HP–CD01</strong>
          <span className="subline">KOMMANDO DECK 01 · STANDBY</span>
        </div>
        <span className="activity-dot" />
      </div>
    ) : null
  }

  if (slot === "B") {
    return modules.navigation ? (
      <div className="zone-layout standby-clock">
        <div className="clock">
          <strong>{time}</strong>
          <span>{seconds}</span>
        </div>
        <div className="date">{date.toUpperCase()}</div>
        <div className="standby-rule">
          <i />
        </div>
      </div>
    ) : null
  }

  return modules.warning ? (
    <div className="zone-layout status-rail standby-rail">
      <div className="rail-cell">
        <span>RAUM</span>
        <strong>21,8 °C</strong>
      </div>
      <div className="rail-cell">
        <span>LEISTUNG</span>
        <strong>184 W</strong>
      </div>
      <div className="rail-cell">
        <span>SERVER</span>
        <strong>ONLINE</strong>
      </div>
      <div className="rail-alert">
        <span className="activity-dot" />
        <div>
          <span>AKTIVITÄT</span>
          <strong>ALLE SYSTEME BEREIT</strong>
        </div>
      </div>
    </div>
  ) : null
}

function RangeControl({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  onChange: (value: number) => void
}) {
  return (
    <label className="range-control">
      <span>
        {label}
        <b>{value}</b>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  )
}

function ControlPanel({
  mode,
  setMode,
  brightness,
  setBrightness,
  accent,
  setAccent,
  zones,
  setZones,
  modules,
  setModules,
  calibration,
  setCalibration,
  testWarning,
  setTestWarning,
  resolution,
  setResolution,
  onClose,
}: {
  mode: ViewMode
  setMode: (mode: ViewMode) => void
  brightness: number
  setBrightness: (value: number) => void
  accent: string
  setAccent: (value: string) => void
  zones: Zone[]
  setZones: (zones: Zone[]) => void
  modules: Record<string, boolean>
  setModules: (modules: Record<string, boolean>) => void
  calibration: boolean
  setCalibration: (value: boolean) => void
  testWarning: boolean
  setTestWarning: (value: boolean) => void
  resolution: { w: number h: number }
  setResolution: (value: { w: number h: number }) => void
  onClose: () => void
}) {
  const [activeZone, setActiveZone] = useState<ZoneId>("A")
  const zone = zones.find((item) => item.id === activeZone)!
  const updateZone = (key: keyof Zone, value: number) =>
    setZones(
      zones.map((item) =>
        item.id === activeZone ? { ...item, [key]: value } : item,
      ),
    )

  return (
    <aside className="control-panel" aria-label="Projektionskonsole">
      <div className="panel-header">
        <div>
          <span>HUGIN PRIME</span>
          <strong>PROJEKTIONSKONSOLE</strong>
        </div>
        <button
          className="close-panel"
          onClick={onClose}
          aria-label="Konsole schließen"
        >
          ×
        </button>
      </div>
      <div className="panel-scroll">
        <section className="panel-section">
          <span className="panel-label">BETRIEBSANSICHT</span>
          <div className="mode-tabs">
            <button
              className={mode === "bridge" ? "active" : ""}
              onClick={() => setMode("bridge")}
            >
              BRÜCKE
            </button>
            <button
              className={mode === "systems" ? "active" : ""}
              onClick={() => setMode("systems")}
            >
              SYSTEME
            </button>
            <button
              className={mode === "standby" ? "active" : ""}
              onClick={() => setMode("standby")}
            >
              RUHE
            </button>
          </div>
        </section>
        <section className="panel-section two-col">
          <RangeControl
            label="HELLIGKEIT"
            value={brightness}
            min={20}
            max={100}
            onChange={setBrightness}
          />
          <label className="color-control">
            <span>AKZENT</span>
            <input
              type="color"
              value={accent}
              onChange={(event) => setAccent(event.target.value)}
            />
          </label>
        </section>
        <section className="panel-section">
          <span className="panel-label">ARBEITSAUFLÖSUNG</span>
          <div className="resolution-row">
            <label>
              <span>BREITE</span>
              <input
                type="number"
                value={resolution.w}
                onChange={(event) =>
                  setResolution({
                    ...resolution,
                    w: Number(event.target.value),
                  })
                }
              />
            </label>
            <span>×</span>
            <label>
              <span>HÖHE</span>
              <input
                type="number"
                value={resolution.h}
                onChange={(event) =>
                  setResolution({
                    ...resolution,
                    h: Number(event.target.value),
                  })
                }
              />
            </label>
          </div>
        </section>
        <section className="panel-section">
          <span className="panel-label">INSTRUMENTENFELDER</span>
          <div className="zone-tabs">
            {zones.map((item) => (
              <button
                key={item.id}
                className={activeZone === item.id ? "active" : ""}
                onClick={() => setActiveZone(item.id)}
              >
                {item.id}
              </button>
            ))}
          </div>
          <div className="zone-name">
            {zone.id} / {zone.name}
          </div>
          <div className="control-grid">
            <RangeControl
              label="X"
              value={zone.x}
              min={0}
              max={90}
              onChange={(value) => updateZone("x", value)}
            />
            <RangeControl
              label="Y"
              value={zone.y}
              min={0}
              max={90}
              onChange={(value) => updateZone("y", value)}
            />
            <RangeControl
              label="BREITE"
              value={zone.w}
              min={15}
              max={100}
              onChange={(value) => updateZone("w", value)}
            />
            <RangeControl
              label="HÖHE"
              value={zone.h}
              min={6}
              max={90}
              onChange={(value) => updateZone("h", value)}
            />
          </div>
          <RangeControl
            label="INNENABSTAND"
            value={zone.pad}
            min={1}
            max={14}
            onChange={(value) => updateZone("pad", value)}
          />
        </section>
        <section className="panel-section">
          <span className="panel-label">MODULE</span>
          <div className="toggle-list">
            {Object.entries(moduleNames).map(([key, name]) => (
              <label key={key}>
                <span>{name}</span>
                <input
                  type="checkbox"
                  checked={modules[key]}
                  onChange={() =>
                    setModules({ ...modules, [key]: !modules[key] })
                  }
                />
                <i />
              </label>
            ))}
          </div>
        </section>
        <section className="panel-section action-list">
          <label>
            <span>
              <b>KALIBRIERUNG</b>
              <small>Raster, Umrisse und Flächennummern</small>
            </span>
            <input
              type="checkbox"
              checked={calibration}
              onChange={() => setCalibration(!calibration)}
            />
            <i />
          </label>
          <label className="danger-toggle">
            <span>
              <b>TESTWARNUNG</b>
              <small>Simuliert einen kritischen Zustand</small>
            </span>
            <input
              type="checkbox"
              checked={testWarning}
              onChange={() => setTestWarning(!testWarning)}
            />
            <i />
          </label>
        </section>
        <button className="projection-button" onClick={onClose}>
          PROJEKTIONSMODUS STARTEN <span>→</span>
        </button>
        <p className="panel-hint">
          Konsole mit Taste <kbd>C</kbd> einblenden · Alle Werte sind
          Demo-Daten.
        </p>
      </div>
    </aside>
  )
}

export default function App() {
  const [mode, setMode] = useState<ViewMode>("bridge")
  const [panelOpen, setPanelOpen] = useState(true)
  const [brightness, setBrightness] = useState(84)
  const [accent, setAccent] = useState("#ff9d1c")
  const [zones, setZones] = useState(initialZones)
  const [calibration, setCalibration] = useState(false)
  const [testWarning, setTestWarning] = useState(false)
  const [modules, setModules] = useState({
    primary: true,
    metrics: true,
    navigation: true,
    warning: true,
  })
  const [resolution, setResolution] = useState({ w: 1920, h: 1080 })
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "c") setPanelOpen((open) => !open)
      if (event.key === "Escape") setPanelOpen(false)
      if (event.key === "1") setMode("bridge")
      if (event.key === "2") setMode("systems")
      if (event.key === "3") setMode("standby")
    }
    window.addEventListener("keydown", onKeyDown)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [])

  const zoneStyles = useMemo(
    () =>
      Object.fromEntries(
        zones.map((zone) => [
          zone.id,
          {
            "--zone-x": `${zone.x}%`,
            "--zone-y": `${zone.y}%`,
            "--zone-w": `${zone.w}%`,
            "--zone-h": `${zone.h}%`,
            "--zone-pad": `${zone.pad}%`,
          } as CSSProperties,
        ]),
      ),
    [zones],
  )

  const appStyle = {
    "--accent": accent,
    "--brightness": brightness / 100,
    "--canvas-ratio": `${resolution.w} / ${resolution.h}`,
  } as CSSProperties

  return (
    <main
      className={`app mode-${mode} ${
        panelOpen ? "panel-is-open" : "projection-only"
      }`}
      style={appStyle}
    >
      <div
        className={`projection-stage ${calibration ? "is-calibrating" : ""}`}
      >
        <div className="projector-canvas">
          <div className="ambient-glow" />
          <div className="canvas-meta">
            <span>HUGIN PRIME / KOMMANDO DECK 01</span>
            <span>
              {resolution.w} × {resolution.h} · SIMULATION
            </span>
          </div>
          {zones.map((zone) => (
            <div
              className={`projection-zone projection-zone-${zone.id}`}
              style={zoneStyles[zone.id]}
              key={zone.id}
            >
              <div className="zone-inner">
                {calibration && (
                  <div className="calibration-label">
                    <strong>{zone.id}</strong>
                    <span>{zone.name}</span>
                  </div>
                )}
                {zone.id === "A" &&
                  (mode === "bridge" ? (
                    <BridgeView
                      slot="A"
                      modules={modules}
                      testWarning={testWarning}
                    />
                  ) : mode === "systems" ? (
                    <SystemsView
                      slot="A"
                      modules={modules}
                      testWarning={testWarning}
                    />
                  ) : (
                    <StandbyView slot="A" now={now} modules={modules} />
                  ))}
                {zone.id === "B" &&
                  (mode === "bridge" ? (
                    <BridgeView
                      slot="B"
                      modules={modules}
                      testWarning={testWarning}
                    />
                  ) : mode === "systems" ? (
                    <SystemsView
                      slot="B"
                      modules={modules}
                      testWarning={testWarning}
                    />
                  ) : (
                    <StandbyView slot="B" now={now} modules={modules} />
                  ))}
                {zone.id === "C" &&
                  (mode === "bridge" ? (
                    <BridgeView
                      slot="C"
                      modules={modules}
                      testWarning={testWarning}
                    />
                  ) : mode === "systems" ? (
                    <SystemsView
                      slot="C"
                      modules={modules}
                      testWarning={testWarning}
                    />
                  ) : (
                    <StandbyView slot="C" now={now} modules={modules} />
                  ))}
              </div>
            </div>
          ))}
          {calibration && (
            <div className="calibration-overlay">
              <span>PROJEKTIONSRASTER · 5%</span>
            </div>
          )}
          {!panelOpen && testWarning && <div className="edge-warning" />}
        </div>
      </div>
      {panelOpen && (
        <ControlPanel
          mode={mode}
          setMode={setMode}
          brightness={brightness}
          setBrightness={setBrightness}
          accent={accent}
          setAccent={setAccent}
          zones={zones}
          setZones={setZones}
          modules={modules}
          setModules={setModules}
          calibration={calibration}
          setCalibration={setCalibration}
          testWarning={testWarning}
          setTestWarning={setTestWarning}
          resolution={resolution}
          setResolution={setResolution}
          onClose={() => {
            setPanelOpen(false)
            setCalibration(false)
          }}
        />
      )}
    </main>
  )
}

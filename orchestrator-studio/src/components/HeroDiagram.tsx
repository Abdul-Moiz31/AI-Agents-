/** Inline schematic — one visual for the Home tab (no external asset). */
export function HeroDiagram() {
  return (
    <figure className="hero-diagram" aria-label="Orchestrator diagram">
      <svg viewBox="0 0 480 220" className="hero-diagram__svg" role="img">
        <title>Orchestrator coordinates specialist agents</title>
        <defs>
          <linearGradient id="hero-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.35" />
          </linearGradient>
        </defs>
        <rect x="8" y="8" width="464" height="204" rx="2" fill="none" stroke="var(--rule-strong)" strokeWidth="1" />
        {/* hub */}
        <circle cx="240" cy="110" r="36" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1.5" />
        <text x="240" y="104" textAnchor="middle" className="hero-diagram__text hero-diagram__text--strong" fontSize="11" fontWeight="600" fill="var(--ink)">
          ORCH
        </text>
        <text x="240" y="118" textAnchor="middle" className="hero-diagram__text" fontSize="8" fill="var(--ink-muted)">
          delegates
        </text>
        {/* satellites */}
        <g stroke="var(--rule-strong)" strokeWidth="1" fill="none">
          <line x1="240" y1="74" x2="240" y2="38" />
          <line x1="276" y1="88" x2="340" y2="55" />
          <line x1="288" y1="110" x2="380" y2="110" />
          <line x1="276" y1="132" x2="340" y2="165" />
          <line x1="240" y1="146" x2="240" y2="182" />
          <line x1="204" y1="132" x2="140" y2="165" />
          <line x1="192" y1="110" x2="100" y2="110" />
          <line x1="204" y1="88" x2="140" y2="55" />
        </g>
        <circle cx="240" cy="28" r="14" fill="var(--paper-field)" stroke="url(#hero-grad)" strokeWidth="1" />
        <circle cx="352" cy="48" r="14" fill="var(--paper-field)" stroke="var(--accent)" strokeWidth="1" opacity="0.85" />
        <circle cx="392" cy="110" r="14" fill="var(--paper-field)" stroke="var(--accent)" strokeWidth="1" opacity="0.85" />
        <circle cx="352" cy="172" r="14" fill="var(--paper-field)" stroke="var(--accent)" strokeWidth="1" opacity="0.85" />
        <circle cx="240" cy="192" r="14" fill="var(--paper-field)" stroke="var(--accent)" strokeWidth="1" opacity="0.85" />
        <circle cx="128" cy="172" r="14" fill="var(--paper-field)" stroke="var(--accent)" strokeWidth="1" opacity="0.85" />
        <circle cx="88" cy="110" r="14" fill="var(--paper-field)" stroke="var(--accent)" strokeWidth="1" opacity="0.85" />
        <circle cx="128" cy="48" r="14" fill="var(--paper-field)" stroke="var(--accent)" strokeWidth="1" opacity="0.85" />
      </svg>
    </figure>
  );
}

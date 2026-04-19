import { Link } from 'react-router-dom';
import { HeroDiagram } from '../components/HeroDiagram.js';
import {
  HOME_CAPABILITY_GROUPS,
  HOME_FEATURES,
  HOME_STEPS,
} from '../constants/homeContent.js';
import { useAppState } from '../context/AppStateContext.js';

export function HomePage() {
  const { meta, bootstrapError, specialists } = useAppState();
  const ready = meta?.openaiConfigured ?? false;

  return (
    <main className="page home">
      {bootstrapError && (
        <div className="home__banner home__banner--error" role="alert">
          {bootstrapError}
        </div>
      )}

      <section className="home__hero" aria-labelledby="home-hero-title">
        <div className="home__hero-copy">
          <p className="home__eyebrow">Agents platform</p>
          <h2 id="home-hero-title" className="home__title">
            One console. Many capabilities.
          </h2>
          <p className="home__lede">
            The <strong>Console</strong> runs a single orchestrator that delegates to PR review, research,
            support, incidents, and more. The <strong>RAG</strong> tab is for knowledge-base Q&A with citations.
            The <strong>Tools</strong> tab exposes each specialist directly for focused, repeatable tasks.
          </p>
          <div className="home__cta">
            <Link to="/console" className="home__btn home__btn--primary">
              Open console
            </Link>
            <Link to="/rag" className="home__btn home__btn--ghost">
              Knowledge RAG
            </Link>
            <Link to="/tools" className="home__btn home__btn--ghost">
              Browse tools
            </Link>
          </div>
          <dl className="home__stats">
            <div>
              <dt>Model API</dt>
              <dd>{ready ? 'Ready' : 'Not configured'}</dd>
            </div>
            <div>
              <dt>Specialists</dt>
              <dd>{specialists.length}</dd>
            </div>
            {meta && (
              <div>
                <dt>Environment</dt>
                <dd className="type-mono">{meta.environment}</dd>
              </div>
            )}
          </dl>
        </div>
        <HeroDiagram />
      </section>

      <section className="home__section" aria-labelledby="home-features-title">
        <header className="home__section-head">
          <p className="home__section-kicker">Product</p>
          <h2 id="home-features-title" className="home__section-title">
            What you get
          </h2>
          <p className="home__section-lede">
            A deliberate split between orchestrated workflows and single-purpose agents—plus an API that matches
            how you would ship this behind your own product.
          </p>
        </header>
        <ul className="home__features">
          {HOME_FEATURES.map((f) => (
            <li key={f.title} className="home__feature">
              <span className="home__feature-tag">{f.tag}</span>
              <h3 className="home__feature-title">{f.title}</h3>
              <p className="home__feature-summary">{f.summary}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="home__section home__section--band" aria-labelledby="home-steps-title">
        <header className="home__section-head">
          <p className="home__section-kicker">Workflow</p>
          <h2 id="home-steps-title" className="home__section-title">
            How teams use it
          </h2>
          <p className="home__section-lede">
            Three moves from intent to transcript—whether you are demoing internally or wiring the same agents into
            a service.
          </p>
        </header>
        <ol className="home__steps">
          {HOME_STEPS.map((s) => (
            <li key={s.step} className="home__step">
              <span className="home__step-ix" aria-hidden>
                {s.step}
              </span>
              <div className="home__step-body">
                <h3 className="home__step-title">{s.title}</h3>
                <p className="home__step-text">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="home__section" aria-labelledby="home-cap-title">
        <header className="home__section-head">
          <p className="home__section-kicker">Coverage</p>
          <h2 id="home-cap-title" className="home__section-title">
            Capability map
          </h2>
          <p className="home__section-lede">
            Specialists span delivery, reliability, and governance—exposed together in this studio and available
            individually under Tools.
          </p>
        </header>
        <div className="home__cap-grid">
          {HOME_CAPABILITY_GROUPS.map((g) => (
            <div key={g.title} className="home__cap-block">
              <h3 className="home__cap-title">{g.title}</h3>
              <ul className="home__cap-list">
                {g.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="home__closing" aria-labelledby="home-closing-title">
        <div className="home__closing-inner">
          <h2 id="home-closing-title" className="home__closing-title">
            Ready when your API key is
          </h2>
          <p className="home__closing-text">
            Configure <span className="type-mono">OPENAI_API_KEY</span>, run <span className="type-mono">npm run dev</span>{' '}
            in this package, then open the Console for multi-agent work or Tools for a specific job.
          </p>
          <div className="home__closing-actions">
            <Link to="/console" className="home__btn home__btn--primary">
              Console
            </Link>
            <Link to="/tools" className="home__btn home__btn--ghost">
              Tools
            </Link>
          </div>
          {meta && (
            <p className="home__closing-meta">
              <span className="type-mono">{meta.service}</span> · v{meta.version} · uptime {meta.uptimeSeconds}s
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

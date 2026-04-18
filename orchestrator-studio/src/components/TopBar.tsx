import { Link } from 'react-router-dom';
import type { MetaResponse } from '../api/types.js';
import { ThemeToggle } from './ThemeToggle.js';

type Props = {
  meta: MetaResponse | null;
};

export function TopBar({ meta }: Props) {
  const ready = meta?.openaiConfigured ?? false;

  return (
    <header className="masthead">
      <Link to="/" className="masthead__brand masthead__brand--link">
        <span className="masthead__mark" aria-hidden />
        <div>
          <h1 className="masthead__title">
            <em>Orchestrator</em>
          </h1>
          <p className="masthead__kicker">Agent control surface</p>
        </div>
      </Link>
      <div className="masthead__tools">
        {meta && (
          <>
            <span className={`masthead__signal ${ready ? 'is-live' : 'is-idle'}`}>
              <span className="masthead__signal-dot" aria-hidden />
              {ready ? 'Model key present' : 'Awaiting credentials'}
            </span>
            <span className="masthead__sep" aria-hidden>
              /
            </span>
            <span className="masthead__env">{meta.environment}</span>
          </>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}

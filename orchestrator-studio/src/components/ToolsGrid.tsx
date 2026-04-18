import type { AgentSummary } from '../api/types.js';

type Props = {
  agents: AgentSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function ToolsGrid({ agents, selectedId, onSelect }: Props) {
  return (
    <div className="tools-grid-wrap">
      <p className="tools-grid__label">Choose a specialist</p>
      <ul className="tools-grid" role="list">
        {agents.map((a) => {
          const active = a.id === selectedId;
          return (
            <li key={a.id}>
              <button
                type="button"
                className={`tool-tile${active ? ' is-active' : ''}`}
                onClick={() => onSelect(a.id)}
              >
                <span className="tool-tile__title">{a.title}</span>
                <span className="tool-tile__desc">{a.description}</span>
                <span className="tool-tile__id type-mono">{a.id}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

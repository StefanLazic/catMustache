import { MUSTACHES } from '../mustaches';

interface Props {
  selectedId: string;
  onSelect: (id: string) => void;
}

export function MustachePicker({ selectedId, onSelect }: Props) {
  return (
    <div className="panel">
      <h3>Mustache style</h3>
      <div className="mustache-grid">
        {MUSTACHES.map((m) => (
          <button
            key={m.id}
            type="button"
            className={m.id === selectedId ? 'selected' : ''}
            onClick={() => onSelect(m.id)}
            aria-label={m.name}
            title={m.name}
          >
            <img src={m.src} alt={m.name} />
          </button>
        ))}
      </div>
    </div>
  );
}

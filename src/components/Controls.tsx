import type { PlacementOptions } from '../ml/placement';

interface Props {
  placement: PlacementOptions;
  onChange: (next: PlacementOptions) => void;
  showDebug: boolean;
  onToggleDebug: (next: boolean) => void;
}

export function Controls({ placement, onChange, showDebug, onToggleDebug }: Props) {
  const update = (patch: Partial<PlacementOptions>) => onChange({ ...placement, ...patch });
  const rotationDeg = Math.round(((placement.rotation ?? 0) * 180) / Math.PI);
  return (
    <div className="panel">
      <h3>Adjust</h3>

      <div className="control-row">
        <label>
          <span>Size</span>
          <span>{Math.round(placement.widthRatio * 100)}%</span>
        </label>
        <input
          type="range"
          min={20}
          max={120}
          value={Math.round(placement.widthRatio * 100)}
          onChange={(e) => update({ widthRatio: Number(e.target.value) / 100 })}
        />
      </div>

      <div className="control-row">
        <label>
          <span>Vertical position</span>
          <span>{Math.round(placement.verticalAnchor * 100)}%</span>
        </label>
        <input
          type="range"
          min={20}
          max={80}
          value={Math.round(placement.verticalAnchor * 100)}
          onChange={(e) => update({ verticalAnchor: Number(e.target.value) / 100 })}
        />
      </div>

      <div className="control-row">
        <label>
          <span>Horizontal offset</span>
          <span>{placement.offsetX ?? 0}px</span>
        </label>
        <input
          type="range"
          min={-200}
          max={200}
          value={placement.offsetX ?? 0}
          onChange={(e) => update({ offsetX: Number(e.target.value) })}
        />
      </div>

      <div className="control-row">
        <label>
          <span>Vertical offset</span>
          <span>{placement.offsetY ?? 0}px</span>
        </label>
        <input
          type="range"
          min={-200}
          max={200}
          value={placement.offsetY ?? 0}
          onChange={(e) => update({ offsetY: Number(e.target.value) })}
        />
      </div>

      <div className="control-row">
        <label>
          <span>Rotation</span>
          <span>{rotationDeg}°</span>
        </label>
        <input
          type="range"
          min={-45}
          max={45}
          value={rotationDeg}
          onChange={(e) => update({ rotation: (Number(e.target.value) * Math.PI) / 180 })}
        />
      </div>

      <label className="toggle-row">
        <input
          type="checkbox"
          checked={showDebug}
          onChange={(e) => onToggleDebug(e.target.checked)}
        />
        Show detection box
      </label>
    </div>
  );
}

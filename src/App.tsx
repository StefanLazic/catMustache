import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Uploader } from './components/Uploader';
import { MustachePicker } from './components/MustachePicker';
import { Controls } from './components/Controls';
import { EditorCanvas, type EditorCanvasHandle } from './components/EditorCanvas';
import { MUSTACHES } from './mustaches';
import { detectCats, loadModel } from './ml/modelLoader';
import { DEFAULT_PLACEMENT, type BoundingBox, type PlacementOptions } from './ml/placement';
import {
  loadHTMLImage,
  loadImageFromFile,
  resizeForInference,
  type LoadedImage,
} from './utils/image';
import { downloadCanvas } from './utils/download';

type Status =
  | { kind: 'idle' }
  | { kind: 'loadingModel' }
  | { kind: 'detecting' }
  | { kind: 'ready' }
  | { kind: 'noDetection' }
  | { kind: 'error'; message: string };

function App() {
  const [loaded, setLoaded] = useState<LoadedImage | null>(null);
  const [boxes, setBoxes] = useState<BoundingBox[]>([]);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [placement, setPlacement] = useState<PlacementOptions>(DEFAULT_PLACEMENT);
  const [showDebug, setShowDebug] = useState(false);
  const [selectedMustacheId, setSelectedMustacheId] = useState(MUSTACHES[0].id);
  const [mustacheImg, setMustacheImg] = useState<HTMLImageElement | null>(null);

  const canvasRef = useRef<EditorCanvasHandle>(null);

  // Load the currently selected mustache image whenever the selection changes.
  useEffect(() => {
    const asset = MUSTACHES.find((m) => m.id === selectedMustacheId);
    if (!asset) return;
    let cancelled = false;
    loadHTMLImage(asset.src)
      .then((img) => {
        if (!cancelled) setMustacheImg(img);
      })
      .catch((err: Error) => setStatus({ kind: 'error', message: err.message }));
    return () => {
      cancelled = true;
    };
  }, [selectedMustacheId]);

  // Release object URLs when the image changes or the component unmounts.
  useEffect(() => {
    return () => {
      if (loaded) URL.revokeObjectURL(loaded.objectUrl);
    };
  }, [loaded]);

  const runDetection = useCallback(async (image: HTMLImageElement) => {
    setStatus({ kind: 'loadingModel' });
    try {
      const model = await loadModel();
      setStatus({ kind: 'detecting' });
      const { canvas, scale } = resizeForInference(image);
      const detections = await detectCats(model, canvas);
      const mapped: BoundingBox[] = detections.map((d) => ({
        x: d.bbox[0] * scale,
        y: d.bbox[1] * scale,
        width: d.bbox[2] * scale,
        height: d.bbox[3] * scale,
      }));
      setBoxes(mapped);
      setStatus(mapped.length === 0 ? { kind: 'noDetection' } : { kind: 'ready' });
    } catch (err) {
      setStatus({
        kind: 'error',
        message: err instanceof Error ? err.message : 'Detection failed.',
      });
    }
  }, []);

  const handleFile = useCallback(
    async (file: File) => {
      // Revoke any previous object URL before swapping.
      if (loaded) URL.revokeObjectURL(loaded.objectUrl);
      setBoxes([]);
      setPlacement(DEFAULT_PLACEMENT);
      try {
        const next = await loadImageFromFile(file);
        setLoaded(next);
        await runDetection(next.image);
      } catch (err) {
        setStatus({
          kind: 'error',
          message: err instanceof Error ? err.message : 'Failed to load image.',
        });
      }
    },
    [loaded, runDetection],
  );

  const reset = () => {
    if (loaded) URL.revokeObjectURL(loaded.objectUrl);
    setLoaded(null);
    setBoxes([]);
    setPlacement(DEFAULT_PLACEMENT);
    setStatus({ kind: 'idle' });
  };

  const handleDownload = async () => {
    const canvas = canvasRef.current?.getCanvas();
    if (!canvas) return;
    try {
      await downloadCanvas(canvas, 'cat-mustache.png');
    } catch (err) {
      setStatus({
        kind: 'error',
        message: err instanceof Error ? err.message : 'Download failed.',
      });
    }
  };

  const banner = useMemo(() => {
    switch (status.kind) {
      case 'loadingModel':
        return { type: 'info' as const, text: 'Loading detection model…' };
      case 'detecting':
        return { type: 'info' as const, text: 'Looking for cats…' };
      case 'noDetection':
        return {
          type: 'warn' as const,
          text: "No cat detected — you can still place a mustache manually using the controls.",
        };
      case 'error':
        return { type: 'error' as const, text: status.message };
      default:
        return null;
    }
  }, [status]);

  const busy = status.kind === 'loadingModel' || status.kind === 'detecting';

  return (
    <div className="app">
      <header>
        <h1>🐱 Cat Mustache</h1>
        <p className="tagline">Upload a cat photo, get a dapper feline. All in your browser.</p>
      </header>

      {!loaded && <Uploader onFileSelected={handleFile} onError={(m) => setStatus({ kind: 'error', message: m })} />}

      {banner && <div className={`banner ${banner.type}`}>{banner.text}</div>}

      {loaded && (
        <div className="workspace">
          <EditorCanvas
            ref={canvasRef}
            image={loaded.image}
            mustache={mustacheImg}
            boxes={boxes}
            placement={placement}
            showDebug={showDebug}
          />
          <aside className="sidebar">
            <MustachePicker selectedId={selectedMustacheId} onSelect={setSelectedMustacheId} />
            <Controls
              placement={placement}
              onChange={setPlacement}
              showDebug={showDebug}
              onToggleDebug={setShowDebug}
            />
            <div className="panel">
              <div className="button-row">
                <button
                  className="primary"
                  type="button"
                  onClick={handleDownload}
                  disabled={busy}
                >
                  Download PNG
                </button>
                <button
                  className="secondary"
                  type="button"
                  onClick={() => loaded && runDetection(loaded.image)}
                  disabled={busy}
                >
                  Re-detect
                </button>
                <button className="secondary" type="button" onClick={reset}>
                  Start over
                </button>
              </div>
            </div>
          </aside>
          {busy && <div className="spinner" role="status">Working…</div>}
        </div>
      )}

      <footer className="note">
        Detection runs locally via TensorFlow.js + COCO-SSD. Placement is heuristic — use the
        sliders if it lands off-center.
      </footer>
    </div>
  );
}

export default App;

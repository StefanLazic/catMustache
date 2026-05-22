import { useCallback, useRef, useState } from 'react';
import { ACCEPTED_TYPES, validateFile } from '../utils/image';

interface Props {
  onFileSelected: (file: File) => void;
  onError: (message: string) => void;
}

export function Uploader({ onFileSelected, onError }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    (file: File | undefined | null) => {
      if (!file) return;
      const error = validateFile(file);
      if (error) {
        onError(error);
        return;
      }
      onFileSelected(file);
    },
    [onFileSelected, onError],
  );

  return (
    <div
      className={`uploader${dragOver ? ' dragover' : ''}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFile(e.dataTransfer.files?.[0]);
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
    >
      <p>
        <strong>Click to upload</strong> or drag a cat photo here
      </p>
      <p>JPEG, PNG, or WebP — up to 15 MB</p>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}

export interface MustacheAsset {
  id: string;
  name: string;
  src: string;
}

// `import.meta.env.BASE_URL` ensures paths work whether the app is hosted at
// the site root or under a sub-path (e.g. GitHub Pages project sites).
const base = import.meta.env.BASE_URL ?? '/';

function asset(file: string): string {
  return `${base.replace(/\/$/, '')}/mustaches/${file}`;
}

export const MUSTACHES: MustacheAsset[] = [
  { id: 'classic', name: 'Classic', src: asset('classic.svg') },
  { id: 'handlebar', name: 'Handlebar', src: asset('handlebar.svg') },
  { id: 'chevron', name: 'Chevron', src: asset('chevron.svg') },
  { id: 'imperial', name: 'Imperial', src: asset('imperial.svg') },
  { id: 'pencil', name: 'Pencil', src: asset('pencil.svg') },
];

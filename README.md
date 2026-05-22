# 🐱 catMustache

A fully client-side web app that detects cats in a photo and adds a mustache,
then lets you download the result. Detection runs locally in the browser via
[TensorFlow.js](https://www.tensorflow.org/js) using the pretrained
[COCO-SSD](https://github.com/tensorflow/tfjs-models/tree/master/coco-ssd)
object-detection model — no server, no uploads.

## Features

- Drag-and-drop or click-to-upload (JPEG / PNG / WebP, up to 15 MB).
- Local in-browser cat detection (WebGL with WASM/CPU fallback).
- 5 mustache styles, plus sliders for size, position, and rotation.
- Works for multi-cat photos.
- Graceful fallback when no cat is detected: you can still place a mustache
  manually using the sliders.
- Export the composed image as PNG at the original resolution.

## Tech stack

- [Vite](https://vitejs.dev/) + React + TypeScript
- `@tensorflow/tfjs` and `@tensorflow-models/coco-ssd`
- Vitest for unit tests, ESLint + Prettier for code quality

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check + production build into dist/
npm run preview  # serve the production build locally
npm run test     # run unit tests
npm run lint     # run ESLint
```

The first time you upload a photo, the COCO-SSD weights (~6 MB) are fetched
from the TF Hub CDN and cached by the browser. Subsequent detections are fast.

## Project structure

```
catMustache/
├── public/mustaches/   # mustache SVG assets shipped with the app
├── src/
│   ├── components/     # React UI components
│   ├── ml/
│   │   ├── modelLoader.ts   # COCO-SSD loader + cat-only filter
│   │   └── placement.ts     # pure: bbox → mustache transform
│   ├── utils/          # image loading, resize, download helpers
│   ├── mustaches.ts    # mustache asset registry
│   ├── App.tsx
│   └── main.tsx
└── tests/              # vitest unit tests
```

## How placement works

COCO-SSD only gives a bounding box around the whole cat, not face landmarks.
The app uses a simple, tunable heuristic: the mustache is centered horizontally
on the bounding box and placed at a configurable fraction of its height (the
"vertical anchor", default ~0.45 — roughly where a cat's nose sits in a frontal
photo). The size, offset, and rotation are also exposed as sliders so you can
fine-tune the result. See [`src/ml/placement.ts`](src/ml/placement.ts).

The heuristic isn't perfect on side profiles or unusual poses — that's what
the sliders are for. A future enhancement could swap in a cat-face landmark
model and keep the `placement.ts` interface stable as a drop-in upgrade.

## Privacy

Images never leave your device. Everything — model inference, mustache
compositing, and PNG export — happens locally in the browser.

## Deployment

The build output in `dist/` is a fully static site that can be hosted on
GitHub Pages, Netlify, Vercel, or any static file host. The build uses a
relative `base` so it works at the site root or under a sub-path.

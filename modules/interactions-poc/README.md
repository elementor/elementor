# Interactions POC

Dev-only bridge between the Elementor editor and an external Interactions app running locally.

## How it works

1. Click the **Interactions Editor** button in the top bar
2. Editor opens a fullscreen iframe → `http://localhost:5173/`
3. App and editor talk via `postMessage`
4. On save, editor acknowledges and closes the iframe (document write is not implemented yet)

## Setup

### Elementor

Module is registered in `core/modules-manager.php` as `interactions-poc`. No experiment flag.

Hard-refresh the editor after pulling changes.

### Interactions app (Vite)

Run your app on port **5173**:

```bash
npm run dev
```

Allow iframe embedding in `vite.config.js`:

```js
export default defineConfig({
  server: {
    headers: {
      'Content-Security-Policy': 'frame-ancestors *',
    },
  },
});
```

Change the app URL in `assets/js/editor.js` if needed:

```js
const APP_URL = 'http://localhost:5173/';
```

## Message contract

Transport: `window.postMessage` with `'*'` target origin (POC only).

### Flow

```
Iframe load →  Editor sends { type: 'init', page: { html, elementIds } }
App loads   →  { type: 'ready' } (optional) → Editor may send init again
User saves  →  { type: 'save', ... }
Editor      →  { type: 'saved', ok: true }  + closes iframe (no document write yet)
User cancel →  { type: 'close' } or Close button / Escape → closes iframe (no save)
```

The editor sends `init` as soon as the iframe fires `load`, so the app does not need to send `ready` first. Sending `ready` is still supported and triggers another `init` (your app should handle duplicate inits).

Press **Close** (top-right), **Escape**, or post `{ type: 'close' }` to dismiss the overlay.

### Troubleshooting white screen

1. **Vite must allow embedding** — add `Content-Security-Policy: frame-ancestors *` in `vite.config.js` (see Setup below). Without it the iframe stays blank.
2. **Mixed content** — if the editor is HTTPS (`https://test.local`) but the app is `http://localhost:5173`, the browser may block the iframe. Use HTTP for local WP or serve the Vite app over HTTPS.
3. **App must listen for `init`** — on `message`, read `event.data.page.html` and `event.data.page.elementIds`. If the app only waits for the old `element` shape, update it.
4. **Large HTML** — `page.html` is the full preview document; very large pages can slow the app. Trim or parse incrementally in the app if needed.

### App → Editor

#### `ready`

Sent once when the app is mounted.

```json
{ "type": "ready" }
```

#### `save`

Sent when the user confirms changes. Payload shape is TBD (multi-element write contract).

```json
{
  "type": "save"
}
```

#### `close`

Sent when the user cancels. Editor closes the iframe without writing.

```json
{ "type": "close" }
```

### Editor → App

#### `init`

Sent in response to `ready`.

```json
{
  "type": "init",
  "page": {
    "html": "<html>...</html>",
    "elementIds": ["a1b2c3d", "e4f5g6h"]
  }
}
```

| Field | Description |
|---|---|
| `html` | Full rendered HTML from the preview iframe (`document.documentElement.outerHTML`) |
| `elementIds` | Flat array of all Elementor element ids on the page (`[data-id]` in DOM order) |

#### `saved`

Sent after the editor acknowledges save (currently closes iframe only; no settings write).

```json
{ "type": "saved", "ok": true }
```

## Editor: applying the save response

Save is currently a no-op on the Elementor side: the editor posts `{ type: 'saved', ok: true }` and closes the iframe. A follow-up is needed to define whether the app returns per-element `interactions` keyed by id (batched `document/elements/settings`) or a page-level bulk payload.

## App-side minimal example

```js
window.parent.postMessage({ type: 'ready' }, '*');

window.addEventListener('message', (event) => {
  if (event.data?.type === 'init') {
    window.__page = event.data.page;
    // render UI with event.data.page.html and event.data.page.elementIds
  }
});

function saveInteractions() {
  window.parent.postMessage({ type: 'save' }, '*');
}

function closeEditor() {
  window.parent.postMessage({ type: 'close' }, '*');
}
```

## Files

| File | Role |
|---|---|
| `module.php` | Enqueues editor script |
| `assets/js/editor.js` | Top bar button, iframe, postMessage handler |

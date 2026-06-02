# Interactions POC

Dev-only bridge between the Elementor editor and an external Interactions app running locally.

## How it works

1. Right-click an element (canvas or structure panel) → **Open Interactions Editor**
2. Editor opens a fullscreen iframe → `http://localhost:5173/`
3. App and editor talk via `postMessage`
4. On save, editor writes `interactions` onto the element settings and closes the iframe

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
App loads  →  { type: 'ready' }
Editor     →  { type: 'init', element: { ... } }
User saves →  { type: 'save', elementId, interactions }
Editor     →  { type: 'saved', ok: true }  + closes iframe
User cancel→  { type: 'close' }            + closes iframe (no save)
```

### App → Editor

#### `ready`

Sent once when the app is mounted.

```json
{ "type": "ready" }
```

#### `save`

Sent when the user confirms changes.

```json
{
  "type": "save",
  "elementId": "a1b2c3d",
  "interactions": {}
}
```

- `interactions` — opaque JSON; the app owns the schema
- `elementId` — must match the element from `init`

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
  "element": {
    "id": "a1b2c3d",
    "widgetType": "heading",
    "interactions": null
  }
}
```

| Field | Description |
|---|---|
| `id` | Elementor element ID |
| `widgetType` | Widget type or `elType` for non-widgets |
| `interactions` | Previously saved data, or `null` |

#### `saved`

Sent after the editor successfully applies settings.

```json
{ "type": "saved", "ok": true }
```

## Editor: applying the save response

On `save`, the editor runs:

```js
$e.run( 'document/elements/settings', {
  container,
  settings: { interactions: event.data.interactions },
} );
```

Data is stored under the **`interactions`** setting key on the element. Re-opening the editor for the same element returns it in `init.element.interactions`.

## App-side minimal example

```js
window.parent.postMessage({ type: 'ready' }, '*');

window.addEventListener('message', (event) => {
  if (event.data?.type === 'init') {
    window.__element = event.data.element;
    // render UI with event.data.element.interactions
  }
});

function saveInteractions(interactions) {
  window.parent.postMessage({
    type: 'save',
    elementId: window.__element.id,
    interactions,
  }, '*');
}

function closeEditor() {
  window.parent.postMessage({ type: 'close' }, '*');
}
```

## Files

| File | Role |
|---|---|
| `module.php` | Enqueues editor script |
| `assets/js/editor.js` | Context menu, iframe, postMessage handler, settings write |

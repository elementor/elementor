# Adding a guided tour

Guided tours are defined in the private `elementor/editor-assets` repository and rendered by Elementor Core (`modules/guided-tours`).

Prefer **editor-assets-only** changes. Touch Core only when you need a new screen type or new runtime behavior.

## Add a tour in editor-assets

1. Create `src/tours/<tour-name>.json` (lowercase, hyphens; e.g. `editor-form-widget.json`).
2. Register it in `src/tours/index.json`.
3. Import the JSON in the repo root `index.js` and add it to the `processTours()` map (same pattern as `admin-navigation`).
4. Run `npm run test:schema`.

The deployed index is at `https://assets.elementor.com/tours/index.json`. Each `file` path is relative to that host.

### Index registration

```json
{
  "tours": {
    "example-tour": {
      "file": "tours/example-tour.json",
      "is_active": true
    }
  }
}
```

### Tour JSON

```json
{
  "id": "example-tour",
  "version": 1,
  "is_active": true,
  "screens": ["dashboard"],
  "roles": ["administrator"],
  "steps": [
    {
      "id": "example-step",
      "screen": "dashboard",
      "selector": "#example-target",
      "title": "Example",
      "description": "Describe the highlighted UI.",
      "side": "right"
    }
  ]
}
```

Both `is_active` values must be `true` to run the tour. Set either to `false` to disable it remotely.

| Field | Notes |
| --- | --- |
| `id` | Must match the key in `index.json`. |
| `version` | Integer. Increment to show the tour again after `completed` or `dismissed`. |
| `screens` | Where Core enqueues tour assets. |
| `roles` | WordPress roles (e.g. `administrator`). |
| `steps` | Ordered steps; see below. |

### Steps

Required on each step: `id`, `screen`, `selector`, `title`, `description`, `side` (`top`, `right`, `bottom`, `left`; horizontal sides flip in RTL).

Optional: `next_url` — admin-relative path (e.g. `options-general.php`). On **Next**, progress is saved and the browser navigates to that URL. Use for multi-page admin flows (see `admin-navigation`).

Use stable selectors. The runtime waits up to five seconds per target and skips missing elements.

**Elementor editor widgets** in the panel:

```text
#elementor-panel-elements-wrapper .elementor-element[data-library-element-type="<widget-name>"]
```

Example: `form` (Elementor Pro Form widget). Category headers use selectors such as `#elementor-panel-category-pro-elements`.

## Screen IDs

| Context | `screen` value |
| --- | --- |
| wp-admin | WordPress `get_current_screen()->id` (e.g. `dashboard`, `options-general`, `options-reading`) |
| Elementor editor | `elementor-editor` (constant in Core; all editor steps usually share this screen) |

The tour-level `screens` list must include every screen where the tour should load. Runtime resume logic only shows steps whose `screen` matches the current screen and saved progress.

## One tour per screen (current limitation)

`get_eligible_tour()` returns the **first** active tour in `index.json` that matches the current screen and role.

On `elementor-editor`, only one tour runs at a time. To ship a new editor tour, either:

- set `is_active: false` on the other editor tour(s), or
- order entries in `index.json` so the intended tour is first.

Multiple concurrent tours on the same screen will need a Core change.

## Examples in editor-assets

| Tour | Purpose |
| --- | --- |
| `admin-navigation` | Multi-screen wp-admin flow with `next_url` |
| `editor-ui` | Editor panel, Heading, top bar |
| `editor-form-widget` | Form category and Form widget in the panel |

## Local development

Core can load JSON from `wp-content/plugins/editor-assets` when local assets are enabled (`ELEMENTOR_GUIDED_TOURS_USE_LOCAL_ASSETS` or the `elementor/guided-tours/use_local_assets` filter). This is for dev only, not production.

Reset user progress via user meta `elementor_guided_tours`, or bump the tour `version`, before re-testing. Closing the tour with **X** saves `dismissed` so it does not reopen on every load until the version changes.

For editor tours, Core waits for preview load and a visible panel before starting Driver (`modules/guided-tours/assets/js/guided-tours.js`).

## When Core changes are required

| Need | Location |
| --- | --- |
| New screen / enqueue context | `modules/guided-tours/module.php` |
| New JS behavior (navigation, timing, UI) | `modules/guided-tours/assets/js/guided-tours.js` |
| JSON on supported screens | No Core change |

Driver assets live under `assets/lib/driver/`. Enqueue version is `DRIVER_ASSET_VERSION` in `module.php`, not a separate `version.json` file.

## Further reading

Agent workflow: the `elementor-guided-tours` skill in the `cursor-editor` plugin of `elementor/elementor-cursor-marketplace`.

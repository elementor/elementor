# Adding a guided tour

Guided tours are defined in the private `elementor/editor-assets` repository and rendered by Elementor Core.

## Add the flow

1. Add the tour to `src/tours/index.json`.
2. Add its flow file under `src/tours/`.
3. Import the flow in the root `index.js` tours map.
4. Run `npm run test:schema`.

The deployed index is available at `https://assets.elementor.com/tours/index.json`. Each `file` entry is relative to that host.

```json
{
  "version": 1,
  "tours": {
    "example-tour": {
      "file": "tours/example-tour.json",
      "is_active": true
    }
  }
}
```

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

Both `is_active` values must be `true`. Set either one to `false` to disable the tour remotely.

Increment the flow `version` to show a completed tour again. Supported sides are `top`, `right`, `bottom`, and `left`; horizontal sides are mirrored in RTL.

Each step requires a `screen` id (WordPress `get_current_screen()->id` in wp-admin, or `elementor-editor` for steps inside the Elementor editor). The tour-level `screens` list controls where scripts are loaded; the runtime only highlights steps whose `screen` matches the current screen and the saved progress step. Optional `next_url` (admin-relative, e.g. `options-general.php`) saves the next step to user meta and navigates when the user clicks Next.

Use stable selectors. The runtime waits up to five seconds for each target and skips targets that remain unavailable.

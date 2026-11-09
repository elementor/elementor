
---
name: elementor-guided-tours
description: Create, modify, debug and validate Elementor Guided Tours. Use when working on guided tours, tour JSON files, editor-assets tour registration, or Core guided tour loading and behavior.
---

# Elementor Guided Tours

## Overview

Elementor Guided Tours are defined primarily in the `editor-assets` repository and executed by Elementor Core.

The default approach is to implement tours using JSON in `editor-assets` and submit a PR there.

Only modify Elementor Core when the requested functionality requires changes to tour loading, screen support, or JavaScript behavior.

## 1. Before Making Changes

1. Inspect the existing Guided Tours implementation.
2. Check existing tours in `editor-assets/src/tours/`.
3. Inspect `editor-assets/src/tours/index.json`.
4. Inspect the root `index.js` and understand how `processTours()` registers tours.
5. Review existing examples such as `admin-navigation` and `editor-ui`.
6. Reuse existing patterns instead of introducing new architecture.

Do not assume that the documentation fully describes the current implementation. Verify actual code before making changes.

## 2. Creating a New Tour

### Step 1: Create the JSON file

Create:

`editor-assets/src/tours/<tour-name>.json`

Naming conventions:
- Lowercase letters.
- Hyphens between words.
- Example: `editor-ui.json`.

### Step 2: Define the tour

The tour JSON must contain:

- `id`: Stable identifier matching the registration in `index.json`.
- `version`: Integer. Increment to show the tour again to users who completed it.
- `is_active`: Boolean.
- `screens`: Screens where the tour should load.
- `roles`: WordPress roles allowed to see the tour.
- `steps`: Ordered list of tour steps.

### Step 3: Define steps

Each step must include:

- `id`
- `screen`
- `selector`
- `title`
- `description`
- `side`: `top`, `right`, `bottom`, or `left`.

Optional:
- `next_url`: Relative path inside `wp-admin`. Navigating to the next step can automatically navigate to this URL.

Use stable selectors. Avoid selectors that depend on dynamic content or fragile DOM structures.

For Elementor Editor steps, ensure the relevant panel is visible before targeting its elements.

### Step 4: Register the tour

Add an entry to:

`editor-assets/src/tours/index.json`

Example:

```json
{
  "my-tour": {
    "file": "tours/my-tour.json",
    "is_active": true
  }
}
```

### Step 5: Register in root index.js

Import the new JSON file and add it to the map used by `processTours()`.

Follow the existing registration pattern used by `admin-navigation` and `editor-ui`.

Do not introduce a new registration mechanism.

## 3. Screen Identification

### WordPress Admin

Use `get_current_screen()->id`.

Examples:
- `dashboard`
- `options-general`

### Elementor Editor

Use the constant:

`elementor-editor`

Usually, all steps in an Editor tour belong to the same screen.

Only include screens where the tour actually needs to run.

## 4. When Elementor Core Changes Are Required

Prefer an `editor-assets`-only implementation.

Modify Elementor Core only in these cases:

| Requirement | Core location |
|---|---|
| Support a new screen type | `modules/guided-tours/module.php` |
| Add new JS behavior | `modules/guided-tours/assets/js/guided-tours.js` |
| Existing supported screens and selectors | No Core changes needed |

Before changing Core, verify that the requested behavior cannot be achieved using the existing JSON configuration.

## 5. Local Development and Testing

### Local assets

Local JSON loading can use:

- MU-plugin configuration.
- `ELEMENTOR_GUIDED_TOURS_USE_LOCAL_ASSETS`.

Local assets are loaded from `wp-content/plugins/editor-assets`.

This is for local development only, not production.

### Validation checklist

1. Make sure the JSON is valid.
2. Ensure `is_active` is `true` in both the tour JSON and the registration index.
3. Run schema validation:

```bash
cd editor-assets
npm run test:schema
```

4. Test with a WordPress user whose role matches the tour.
5. Ensure the user is on the correct screen.
6. Reset tour progress if the tour was already completed, or increment its version.
7. Verify all selectors resolve to the intended elements.
8. For Editor tours, ensure the relevant panel is visible.

Pay special attention to Editor initialization:
- Wait for `preview:loaded` when required.
- Ensure the relevant panel is open before displaying its steps.

## 6. Updating and Disabling Tours

- Disable a tour by setting `is_active: false` in either the registration index or the tour JSON.
- Update content without showing the tour again by keeping the same version.
- Increment `version` to show the tour again to users who completed it.

## 7. Important Implementation Rules

- Prefer changes in `editor-assets` over Core changes.
- Follow existing tour registration patterns.
- Do not modify Core without a concrete technical reason.
- Do not invent unsupported JSON properties.
- Verify selectors against the actual DOM.
- Keep changes minimal and scoped to the requested task.
- Do not refactor unrelated code.
- Run schema validation after modifying tour JSON.
- Check both tour-level and registration-level activation flags.

## 8. Pull Request Guidelines

Before submitting a PR:

1. Identify which repository needs changes.
2. Prefer an `editor-assets` PR when JSON changes are sufficient.
3. Include Core changes only when necessary.
4. Run schema validation.
5. Summarize which tour was added or modified.
6. Explain whether Core changes were required and why.
7. Mention any manual testing that still needs to be performed.

Remember: after deploying `editor-assets`, tour files are served through the Elementor CDN:

`assets.elementor.com/tours/...`

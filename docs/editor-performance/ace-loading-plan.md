# ACE Editor Lazy Loading

**User story:** As a user, I want the ACE Editor (~500KB) to load only when I actually use the Code control.

## Experiment

A hidden experiment called **"Editor Loading Optimization"** (`editor_loading_optimization`) gates this feature. When active, ACE is removed from the eager `elementor-editor` script dependencies and loaded on demand.

## Acceptance Criteria

- [ ] Remove `ace` and `ace-language-tools` from `elementor-editor` dependencies when experiment is active
- [ ] Lazy load ACE in the Code control's `onReady()` when the library is not already available
- [ ] Code control renders as a plain `<textarea>` while ACE is loading (no crash)
- [ ] ACE initialises correctly once loaded — syntax highlighting, autocomplete, theme all work as before
- [ ] Graceful error handling if ACE fails to load (plain textarea remains functional)

## What happens before ACE loads

The PHP `content_template()` outputs a plain `<textarea class="elementor-code-editor">`. When `onReady()` fires (panel open), the control checks whether `ace` is defined:

- **Experiment OFF** — ACE was pre-loaded as a dependency → `ace` is defined → initialises immediately (no change from current behaviour).
- **Experiment ON** — ACE was not pre-loaded → control dynamically injects the two CDN `<script>` tags → plain textarea is visible while scripts load → ACE initialises once both scripts are ready.

No loading spinner is shown during the load; the plain textarea is functional enough for the brief load time.

## Files Modified

| File | Change |
|---|---|
| `core/editor/editor.php` | Add `EXPERIMENT_EDITOR_LOADING_OPTIMIZATION` constant + `register_experiments()` |
| `core/editor/loader/editor-base-loader.php` | Conditionally exclude `ace` / `ace-language-tools` from `elementor-editor` deps |
| `assets/dev/js/editor/controls/code.js` | Lazy-load ACE via dynamic `<script>` injection before initialising editor |

## Verification

1. Enable the experiment via WP Admin → Elementor → Settings → Experiments → (show hidden) → activate *Editor Loading Optimization*.
2. Open the Elementor editor on a page that uses a widget with a **Code** control (e.g. HTML widget).
3. Network tab: `ace.min.js` and `ext-language_tools.js` must **not** appear in the initial load waterfall.
4. Open the widget panel → network tab shows both ACE scripts loading on demand.
5. Code editor renders with syntax highlighting, autocomplete, and correct dark/light theme.
6. Disable experiment → ACE loads eagerly again (verify via network tab).

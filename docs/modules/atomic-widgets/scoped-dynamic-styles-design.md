# Scoped dynamic styles (atomic widgets)

## CSS custom properties and `url()`

**Issue:** The legacy CSS `url()` function does not reliably accept a `var()` substitution as its argument. Patterns such as:

```css
background-image: url(var(--e-dyn-xxxxxxxxxxxx));
```

with the custom property holding only the raw URL string are fragile: parsers and devtools often treat the declaration as invalid, and computed values can fail when the variable is missing or when the URL needs quoting.

**Status:** Open. The custom property currently holds the raw resolved tag value (e.g. a bare URL), and the cached rule references it via `var()`. For `background-image` specifically this is not valid in all engines because `url()` cannot reliably wrap a `var()` substitution, and a bare URL is not a valid `<image>`.

The intended direction is to emit a complete CSS token (e.g. `url("…")`) into the custom property and use `background-image: var(--e-dyn-…)`, but that wrapping is intentionally not implemented yet — we want a clean baseline before deciding where the URL/image shape should be produced (resolver, transformer, or here).

Tracking item: revisit `Dynamic_Styles_Manager::resolve_for_post` and `Background_Image_Overlay_Transformer::format_image_src` together.

## Related code

- `modules/atomic-widgets/styles/dynamic-styles-manager.php` — registry, hydration, inline `--e-dyn-*` values
- `modules/atomic-widgets/props-resolver/transformers/styles/background-image-overlay-transformer.php` — `background-image` fragment for overlays
- `modules/atomic-widgets/dynamic-tags/styles-dynamic-transformer.php` — registers dynamic nodes for style context

## Pull request (when opening or updating)

There is no GitHub pull request linked to branch `poc/scoped-dynamic-global-classes` in the current fork. When you open or edit the PR for scoped dynamic global classes, consider noting:

- Instrumentation removed from `Dynamic_Styles_Manager`, style enqueue/render paths, collection loop, component transformer, and global/widget style registration.
- Open follow-up: `url()` / `var()` interaction for dynamic image-bearing properties (see “CSS custom properties and `url()`” above).
- Design reference: this file (`docs/modules/atomic-widgets/scoped-dynamic-styles-design.md`).

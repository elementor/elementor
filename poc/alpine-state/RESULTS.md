# Alpine state POC results (ED-26112, 2026-11-15)

Throwaway. Branch `chore/ED-26112-alpine-state-poc`, not for merge.

## How to run

- The loader `wp-content/mu-plugins/e-state-poc-loader.php` (outside the repo) requires `poc/alpine-state/e-state-poc.php` when it exists.
- Open `http://environment.local/?e-state-poc=1` (local environment only). Add `&cache=1` to simulate a request served from the element cache.
- The self-test prints PASS or FAIL under the tree and in the console.

## Real and simulated

| Part | Real or simulated |
| --- | --- |
| Element render (`create_element_instance`, `print_element`, Twig, `Render_Context`) | Real |
| Hooks (`elementor/frontend/before_render`, `after_render`, `wp_footer`) | Real |
| State resolution (`Dynamic_Prop_Types_Mapping`, `Render_Props_Resolver`, a dynamic tag as an initial value) | Real |
| Alpine (`elementor-v2-alpinejs`, `@alpinejs/csp` 3.15.0) | Real |
| Storage of `state` and `on` | Simulated: a PHP map keyed by element id (`state-map.php`), because the `Has_State` trait does not exist yet |
| Element cache | Simulated by forcing `elementor/element/should_render_shortcode`, then running `do_shortcode` on the cached HTML |

## Results (headless Chrome, normal and `&cache=1`)

| Check | Result | Note |
| --- | --- | --- |
| 1 Hooks deliver the state | Pass | 12 entries; `before_render` of the root fires first and `after_render` last, children in between |
| 2 Server-rendered first paint | Pass | `qty` shows 2, the dynamic `title` shows the site name, the nested root shows its own 0, all from `Render_Context` with no JavaScript |
| 3 Marking before start | Pass | 12 of 12 marked by `data-id` before `Alpine.start()` |
| 4 Element cache | Pass | Atomic elements inherit `is_dynamic_content() === true`, so the cache stores them as shortcodes and renders them live; the hooks fire |
| 5 Global `Alpine.bind` under CSP | Pass | `x-bind="eStateText"` resolves; `this` reaches `read()` and `$el` |
| 6 Compute on init in one pass | Pass | Derived `total` = 20, size class, CSS variable all correct at `alpine:initialized`; no mutation afterwards without a dispatch |
| 7 `x-effect="syncRoot"` | Pass | Method name works under CSP; once per root at init, re-runs on a dependency, skips an unrelated key, drives a root class from a derived key |
| 8 Init lands in one task | Pass | All 6 init mutations arrive in one batch between `alpine:init` and `alpine:initialized`, so no intermediate state can paint |
| 9 Patch and event contract | Pass | 0 events at init; one non-bubbling `e-state:change` with `{ changed, state }`; invalid patch rejected; `structuredClone( Alpine.raw() )` keeps arrays |
| 10 Events and scope | Pass | Both `eStateOn` (`@click` in a binding object) and `x-on:click="dispatchFromEl"` work; the nested root is isolated |
| 11 Server span marker | **Fail** | `Render_Props_Resolver::sanitize_html_prop_value()` runs `wp_kses` with no attributes on the final string of every HTML prop, after the dynamic tag. `data-e-state-key` and `data-e-state-pending` are stripped on both the static and the dynamic path. Fallback in use: PHP finds the state tag in the element settings and sends `{ dataId, text }`; the runtime binds by `data-id` |

## Findings that change the docs

- **Question 15 (Core seam):** not needed for delivery. Existing hooks plus a footer JSON keyed by `data-id` work, cached path included.
- **Question 16 (marker):** the span marker is not possible without a Core change. Options: bind by `data-id` (works today, but binds the whole text of the element, so mixed static and bound text in one paragraph is not supported), or a Core change that allows `data-e-state-key` on `span` in `Html_Prop_Type::get_base_allowed_tags()`.
- **Question 14 (pending values):** a `data-e-state-pending` attribute cannot come through the tag either. The runtime knows the derived keys, so it can mark pending parts itself.
- **Risk to record:** the approach depends on atomic elements staying `is_dynamic_content() === true`. If Core makes them cacheable, collect from `elementor/frontend/builder_content_data` as Interactions does.

## Still manual

- Flash duration: real Chrome, CPU throttle 6x, compare First Contentful Paint with `alpine:initialized` (headless reports no paint entries). The derived fallback (`...`) is visible in that window.
- Editor canvas: the root keeps `x-ignore="true"`, so the runtime does not start in the canvas.
- Load cost with and without a Tabs widget on the page.

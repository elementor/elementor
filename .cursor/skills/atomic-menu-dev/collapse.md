# Menu collapse

## Settings on `e-menu`

- `collapse-breakpoint`: an active max-width breakpoint key, plus `desktop` (collapse at every width) and `none` (never collapse). Default from `resolve_default_collapse_breakpoint()`: tablet, else the first collapsible breakpoint. Stored on creation through `define_base_settings()`.
- `collapsed-position`: `overlay` (items absolute under the toggle) or `in-flow` (items push the page).
- `collapsed-submenus`: `one-per-level` or `multiple`. Read by the Pro Submenu handler only.

The element carries `data-e-collapse`, `data-e-collapsed-position` and `data-e-open`. The twig render context passes `default_collapse_breakpoint`.

## Where the CSS lives

- Core `Atomic_Menu::get_collapse_css()`: one block per condition, scope `.e-menu[data-e-collapse="<key>"]:has(> .e-menu-toggle-base)`. Injected globally by `add_inline_styles()` in `module.php`, so it does not depend on cached per-page CSS. `none` has no block: the toggle stays `display:none`.
- Pro `Module::get_collapsed_css()`: Submenu accordion rules (in-flow, `position:static`) inside the same scopes and conditions. It loops `get_collapsible_breakpoints()` and adds a Desktop block without `max-width`. Any new collapse value or condition needs a matching Pro block.
- `get_collapsible_breakpoints()` returns active breakpoints with direction `max`. `desktop` and `none` are not in it; they are added by the option list and the CSS builder.

## Rules

- Toggle rules are forced (`order:-1`, `flex:0 0 auto`, `width:auto`) so themes and authors cannot stretch or move it.
- Items layout defaults sit in `:where(<scope> > items)` (column, `flex-basis:100%`, `width:100%`). Zero specificity: anything the author sets on `e-menu-items` wins, including a desktop value without a breakpoint; the author sets a smaller-breakpoint value to change it. The items' base style has no `flex-direction`.
- Overlay: outside click closes. In-flow: it does not. Escape closes and focuses the toggle in both.
- `@media(scripting:enabled)`: with scripts off the items stay visible.

## Toggle handler (`atomic-menu-handler.js`)

Alpine `eMenu<id>`: `:data-e-open`, `:aria-expanded`, `:aria-controls`, `:aria-label` (closed and open labels), `@click` toggles and focuses the first focusable item after opening, `@click.outside` (overlay only), Escape. Shared helpers in `utils.js`.

Update this file when a collapse value, setting or CSS scope changes, and mirror the change in Pro.

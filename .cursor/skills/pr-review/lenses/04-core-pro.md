# Core/Pro boundary and license integrity

Reference patterns (Pro extending Core): V4 `elementor-pro/modules/variables/hooks.php`, `atomic-carousel/module.php` (active + license gating), `atomic-widgets/module.php` (server-side license-based output); V3 `Module_Base` + `elementor/element/{widget}/section_*` hooks; promotions via Core `modules/promotions` + `Filtered_Promotions_Manager` + `Widget_Base` `upsale_data`. License state lives in Pro `license/`. Inferred from code, say "inferred" when relying on that.

A. Placement
- Free/shared infrastructure -> Core; gated feature -> Pro. Report Pro logic in Core and generic code trapped in Pro.
- Atomic Pro features: if recommending a different shape than today (e.g. Core placeholder + Pro real impl), state why and verify both states: Pro off shows promotion, Pro on replaces with no double registration.
- Compare against ticket placement (free vs Pro).

B. Coupling and BC
- Is coupling needed, or can Core expose a hook? Core must not call Pro symbols unguarded; Pro must not use non-public Core internals.
- Matrix: old Core + new Pro (min Core version check or feature-detect) and new Core + old Pro (safe degradation). Honor the "2 versions back" support rule.
- New hooks: naming, documented, stable signature; deprecated via deprecation path.

C. Promotions
- Keep the current mechanism unless there is a stated reason. Visibility must depend on real server-side license state, not a client flag.

D. Bypass hunting
- Server must refuse unlicensed use (REST, ajax, MCP tools, import/export, kit import, saved settings), not just hide UI.
- New filters/actions that can alter license, tier or gating; default-true gates; any filter any plugin can use to flip a guard.
- Trusting client input (option, query param, JSON field) for license state.
- Gated data writable while unlicensed; behavior after license expiry/deactivation (content degrades as designed, no crash).
- No shortcut around `license/api.php` validation or caching.
- Pre-existing hooks are not automatically safe or unsafe; judge behavior.

Cross-repo: Core PR -> grep Pro for callers of changed code. Pro PR -> verify used Core APIs exist in the min supported Core.

Lens name `core-pro`. Follow common.md.

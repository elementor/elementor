# Skill scope: External vs Internal

Every atomic-builder extension skill is classified by **who can ship the full documented outcome**. Read this before starting — it tells you whether your change is possible from your own plugin, or whether it requires a pull request against Elementor Core.

## Scope vocabulary

| Badge | Meaning | Who can ship it |
|-------|---------|-----------------|
| **External** | The full documented outcome can be shipped from a 3rd-party plugin using public WordPress hooks/filters and your own editor package. No Elementor Core changes. | Any developer |
| **Internal** | The full documented outcome requires a PR against Elementor Core (or a private, non-integrated workaround). Partial external APIs do not change this classification. | Elementor Core/Pro maintainers, or an accepted community Core PR |

> **Disclaimer:** "External" means the documented extension path uses public hooks and the **complete** skill outcome ships without modifying Core. Individual skills still call out **technical caveats** (limitations inside an otherwise-external skill). "Internal" means the **full** outcome needs Core — calling editor-only public APIs externally is a partial integration and does **not** satisfy an Internal skill when published-page runtime is part of the outcome. Always read the skill's "Scope" banner and "Implementation location" section.

## Classification

| Skill | Scope | Implementation location | Public surface / caveats |
|-------|-------|-------------------------|--------------------------|
| [create-atomic-widget](../../.cursor/skills/create-atomic-widget/SKILL.md) | External | **PHP:** existing or new third-party plugin repo; plugin-owned namespace/module (e.g. `MyPlugin\AtomicWidgets`). **Do not modify Elementor Core.** | `elementor/widgets/register`, `elementor/elements/elements_registered`. Built-in element catalog changes are Core-only. |
| [extend-prop-types](../../.cursor/skills/extend-prop-types/SKILL.md) | External | **PHP:** third-party plugin repo; plugin-owned prop types and transformers. **Editor TS:** plugin-owned package/bundle registered via `elementor/editor/v2/packages`. **Do not modify Elementor Core.** | `elementor/atomic-widgets/*` schema + `{context}/transformers/register` hooks; own TS prop utils. Changing the *global* prop vocabulary (core `prop-types/`) is Core-only. |
| [add-dynamic-tag](../../.cursor/skills/add-dynamic-tag/SKILL.md) | External | **PHP:** third-party plugin repo; plugin-owned `Tag` subclasses and registration. **Do not modify Elementor Core.** | `elementor/dynamic_tags/register`; `elementor/atomic/dynamic-tags/select_control_*` filters. No public filter for category→schema auto-mapping; custom mapping needs manual prop unions. |
| [extend-editor](../../.cursor/skills/extend-editor/SKILL.md) | External | **Editor TS:** existing or new third-party plugin repo; plugin-owned `@elementor/my-editor-feature` package registered via `elementor/editor/v2/packages`. **Do not modify Elementor Core.** | `elementor/editor/v2/packages` + your own package `init()`. Editing core packages is Core-only. |
| [extend-variables](../../.cursor/skills/extend-variables/SKILL.md) | External | **PHP:** third-party plugin repo; plugin-owned variable prop types and transformers. **Editor TS:** plugin-owned package `init()` with `registerVariableType`. **Do not modify Elementor Core.** | `elementor/variables/register` + style-schema + transformer hooks + own package `init()`. Modifying Elementor's built-in size types or Pro gating is outside this skill and requires Core/Pro changes. |
| [extend-css-converter](../../.cursor/skills/extend-css-converter/SKILL.md) | Internal | **Fork/clone** [elementor/elementor](https://github.com/elementor/elementor). Implement in `modules/atomic-widgets/css-converter/` (`converter-registry-factory.php`, `expander-registry-factory.php`, `expanders/`, `converters/`). Submit PR against Core. | No public discovery hook. Converters/expanders register only via factory classes in Core; import UI runs Core-registered ones only. Alternative: private `Css_Converter` not wired into core import. |
| [extend-interactions](../../.cursor/skills/extend-interactions/SKILL.md) | Internal | **Fork/clone** [elementor/elementor](https://github.com/elementor/elementor). **PHP + frontend runtime:** `modules/interactions/` (`interactions.js`, `interactions-utils.js`, `props/`, `Validation`, `Presets`). **Editor:** `packages/packages/core/editor-interactions/`. **Pro companion only** (Pro-gated fields): elementor-pro repo — full core runtime belongs in Core. Submit PR against Core. Editor APIs (`registerInteractionsControl`, etc.) can be called from a third-party plugin, but that is editor-only partial integration and does **not** satisfy this skill. | No public frontend registration hook. New triggers/effects require Core changes. |

### Router

[atomic-builder-extend](../../.cursor/skills/atomic-builder-extend/SKILL.md) routes to the skills above. It is **not** a scoped implementation capability — it has no implementation location and defines no shippable outcome.

## How to use this

1. Find your intent's skill in the table above.
2. If it's **Internal**, plan a Core PR — a plugin-only approach will not ship the full outcome.
3. If it's **External**, follow the skill and its example under [examples/](examples/README.md); no Core changes needed.
4. Re-check the skill's own "Scope" banner, "Implementation location", and caveats before implementing.

# Skill scope: External vs Internal

Every atomic-builder extension skill is classified by **who can ship it**. Read this before starting — it tells you whether your change is possible from your own plugin, or whether it requires a pull request against Elementor Core.

## Scope vocabulary

| Badge | Meaning | Who can ship it |
|-------|---------|-----------------|
| **External** | Fully achievable from a 3rd-party plugin using public WordPress hooks/filters and your own editor package. No Elementor Core changes. | Any developer |
| **Internal** | No public registration surface exists. Requires a PR against Elementor Core (or a private, non-integrated workaround). | Elementor Core/Pro maintainers, or an accepted community Core PR |
| **Hybrid** | One side is External (usually the editor), the other side requires a Core PR (usually the published-page frontend). | Mixed — see per-skill notes |

> Disclaimer: "External" means the documented extension path uses public hooks. Individual skills still call out **Core-only caveats** (things inside an otherwise-external skill that need a Core PR). Always read the skill's own "Scope" banner and "Public path" / "Internal path" sections.

## Classification

### External — 3rd-party plugin, no Core changes

| Skill | Public surface | Core-only caveats |
|-------|----------------|-------------------|
| [author-atomic-widget](../../.cursor/skills/author-atomic-widget/SKILL.md) | `elementor/widgets/register`, `elementor/elements/elements_registered` | Built-in element catalog changes are Core |
| [extend-prop-types-transformers](../../.cursor/skills/extend-prop-types-transformers/SKILL.md) | `elementor/atomic-widgets/*` schema + `{context}/transformers/register` hooks; own TS prop utils | Changing the *global* prop vocabulary (core `prop-types/`) is Internal |
| [extend-dynamic-tags](../../.cursor/skills/extend-dynamic-tags/SKILL.md) | `elementor/dynamic_tags/register`; `elementor/atomic/dynamic-tags/select_control_*` filters | No public filter for category→schema auto-mapping; custom mapping needs manual prop unions |
| [extend-editor-v2](../../.cursor/skills/extend-editor-v2/SKILL.md) | `elementor/editor/v2/packages` + your own package `init()` | Editing core packages is Internal |
| [extend-variables](../../.cursor/skills/extend-variables/SKILL.md) | `elementor/variables/register` + style-schema + transformer hooks + own package `init()` | PHP render parity for non color/font types (e.g. size) is Core; size types are Pro-gated |

### Internal — requires a PR against Core

| Skill | Why | Path |
|-------|-----|------|
| [extend-css-converter](../../.cursor/skills/extend-css-converter/SKILL.md) | No public discovery hook. Converters/expanders register only via factory classes in Core, and the import UI only runs Core-registered ones. | Core PR to `Converter_Registry_Factory` / `Expander_Registry_Factory`, or a private `Css_Converter` not wired into core import |

### Hybrid — editor External, frontend needs a Core PR

| Skill | External side | Internal side |
|-------|---------------|---------------|
| [extend-interactions](../../.cursor/skills/extend-interactions/SKILL.md) | Editor: own package + `registerInteractionsControl`, `interactionsRepository.register`, `elementor/atomic-widgets/interactions/schema` | Frontend: no public registration hook. New triggers/effects require Core changes to `interactions.js` / `interactions-utils.js` |

### Router

[atomic-builder-extend](../../.cursor/skills/atomic-builder-extend/SKILL.md) routes to the skills above; it is not a scoped capability itself.

## How to use this

1. Find your intent's skill in the tables above.
2. If it's **Internal** (or the Internal side of a **Hybrid**), plan a Core PR — a plugin-only approach will not work.
3. If it's **External**, follow the skill and its example under [examples/](examples/README.md); no Core changes needed.
4. Re-check the skill's own "Scope" banner for caveats before implementing.

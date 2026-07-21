# Plan: Developer Coverage for Extending the Atomic (V4) System

## Why

The atomic (V4) system — widgets, prop types, controls, styles, variables, global
classes, interactions, dynamic tags, components — already exposes every extension seam
it needs, and uses them internally. But there is no developer-facing documentation, no
official API reference, and no discoverable entry point. A developer who wants to
extend any part of it must reverse-engineer the code. This plan defines the full
coverage to close that gap: documentation, AI scaffolding skills, and the seams to
document, with a clear "how to do what" for every extension task.

**Scope decisions:**

- Audience: external third-party developers and AI coding agents.
- AI tooling: Claude Code skills (scaffolding). Cursor rules / Copilot instructions are
  out of scope for this round.
- MCP: document the existing ability-registration pattern only; no new abilities.
- Facades: document today's hooks and registries as-is; recommend facades as follow-up.
- No product code changes. No pull request; work lands on a feature branch for review.

---

## The unifying model the docs teach

> **A prop type's `key` is the contract between PHP and JS.**

The same string is `get_key()` in PHP and the `createPropUtils(key, …)` key in JS.
Values travel enveloped as `{ "$$type": key, "value": … }`. That one key ties together
a value's schema, its editor control, its PHP transformer (server render), and its JS
transformer (canvas render).

Every extension task is a subset of one universal pattern:

1. **PHP prop type** — subclass `Plain_/Object_/Array_Prop_Type` (`modules/atomic-widgets/prop-types/`).
2. **Schema placement** — a widget's `define_props_schema()`, or inject into all schemas
   via a `Prop_Types_Schema_Extender` on the `elementor/atomic-widgets/props-schema` /
   `…/styles/schema` filters.
3. **PHP transformer** — `Transformer_Base` registered on
   `elementor/atomic-widgets/{settings|styles|import|export}/transformers/register`.
4. **JS prop type** — `createPropUtils(key, zodSchema)` (`@elementor/editor-props`).
5. **JS control** — `createControl` + `controlsRegistry.register(type, component, layout, propTypeUtil)`.
6. **JS transformer** — `createTransformer` + `styleTransformersRegistry` / `settingsTransformersRegistry` (`@elementor/editor-canvas`).

The higher-level systems are specializations:

| System | Specialization | Primary seam |
|---|---|---|
| Variables | prop-type family + dedicated registry; schema augmentation via unions | PHP `elementor/variables/register`; JS `registerVariableType` (`@elementor/editor-variables`) |
| Global classes | a styles provider feeding the shared style pipeline | JS `createStylesProvider` + `stylesRepository.register`; PHP `Global_Classes_Repository` + `elementor/global_classes/update` |
| Interactions | a per-element data channel (sibling to settings/styles) | filter `elementor/atomic-widgets/interactions/schema`; JS `registerInteractionsControl` |
| Dynamic tags | schema extender letting any prop accept a `dynamic` value | V1 tag registration (`elementor/dynamic_tags/register`) + auto conversion |
| Components | schema extender making any prop overridable | `Overridable_Schema_Extender`; JS extensible slice (`registerComponentsReducer`) |

---

## Deliverable 1 — Developer guides under `docs/v4/atomic/`

Plain markdown guides (`*.md`). Format: narrative + tables, each ending with an
**Extension Points** table listing the exact hooks/registries and the reference file to
copy. Every symbol, hook string, and path cited must exist in the codebase.

| Guide | Covers | Grounded in |
|---|---|---|
| `README.md` | Hub: ecosystem map, the key-as-contract model, an "I want to… → go here" matrix, experiment flags (`e_atomic_elements`, `e_classes`, `e_variables`, `e_interactions`, `e_components`), facades note | — |
| `widget-anatomy.md` | The spine: identity → schema → controls → structure → Twig → base styles → registration; leaf (`Atomic_Widget_Base`) vs nested (`Atomic_Element_Base`) | `elements/atomic-heading/`, `elements/div-block/`, `elements/base/` |
| `structure-and-nesting.md` | Containers: `Has_Element_Template`, `is_container`, `define_default_children()`, `define_allowed_child_types()`, `define_children_dependencies()` (`Child_Dependency`), multi-part composition | the `atomic-tabs/` family |
| `twig-and-rendering.md` | `Has_Template` vs `Has_Element_Template`, `get_templates()`, render context (`settings`, `base_styles`, `interaction_id`), `_macros.html.twig`, frontend handlers | `elements/base/has-template.php`, `template-renderer/` |
| `prop-types.md` | PHP base classes + fluent API, `Union_Prop_Type`, `Prop_Types_Schema_Extender`, the two schema filters; JS `createPropUtils` mirror | `prop-types/`, `editor-props` |
| `controls.md` | PHP `Atomic_Control_Base::bind_to()` + `Section`; JS `createControl`/`useBoundProp`/`controlsRegistry`; control replacements; the bind-must-exist-in-schema rule | `controls/`, `editor-controls`, `editor-editing-panel` |
| `transformers-and-styles.md` | The four transformer contexts, `Style_Schema`, `Styles_Renderer`, `Atomic_Styles_Manager`, `Multi_Props`; the JS canvas registries | `props-resolver/`, `styles/`, `editor-canvas` |
| `variables.md` | Registering a new variable type end-to-end (PHP + JS with matching keys), schema augmentation, `var(--label)` rendering | `modules/variables/`, `editor-variables` |
| `global-classes.md` | Storage (CPT + repository), the shared style schema tie, reacting to `elementor/global_classes/update`, adding a styles provider | `modules/global-classes/`, `editor-global-classes`, `editor-styles-repository` |
| `interactions.md` | The interaction data flow (author → validate → emit → animate), triggers/effects, adding a control, the schema filter | `modules/interactions/`, `editor-interactions` |
| `dynamic-tags.md` | How props opt in to dynamic values; registering a V1 tag that auto-converts to atomic (`atomic_group`, `atomic_label`, `force_convert_to_atomic`) | `atomic-widgets/dynamic-tags/` |
| `components.md` | Overridable props, opting out (`Overridable_Prop_Type::ignore()`), the extensible slice | `modules/components/`, `editor-components` |
| `mcp-abilities.md` | Adding an ability: subclass `Abstract_Ability`, register in `register_abilities()`, **and list the id in `create_server()`'s tools/resources arrays** | `modules/mcp/` |
| `editor-ui-extension-points.md` | UI seams: `@elementor/locations`, `@elementor/menus`, editor/panel injections, `@elementor/store`, `@elementor/editor-v1-adapters`; the `__`-prefix = private rule | `packages/packages/libs/`, `core/` |

## Deliverable 2 — Claude Code skills under `.claude/skills/`

One skill per scaffolding task; each links its guide, names the exact files to
create/edit, and ends with verification steps. Note: `.claude/` is currently in
`.gitignore` — tracking the skills requires either a gitignore exception
(`!.claude/skills/`) or relocating them; decide at review.

| Skill | Scaffolds |
|---|---|
| `atomic-widget` | a complete widget/element (leaf vs nested branch) |
| `atomic-prop-type` | the universal pattern: PHP type + transformer + JS mirror |
| `atomic-control` | a panel control (PHP declaration + JS component + registration) |
| `atomic-variable-type` | a design-token type end-to-end |
| `atomic-interaction` | an interaction option or new control/field |
| `atomic-mcp-ability` | an MCP ability incl. the server tools/resources listing |

## Deliverable 3 — Discoverability

- Link the hub from `docs/README.md`.
- One-line pointer in `AGENTS.md` so agents find the guides.

## Follow-up (recommended, not in this round)

- **Facades:** a thin PHP registration helper wrapping the hook strings behind named
  methods, and a single JS aggregator package re-exporting the key `register*`
  functions — one stable, discoverable surface per side.
- Skills for global classes / dynamic tags / components.
- Publishing the guides to developers.elementor.com.

---

## Execution & verification

1. Write the hub first (fixes shared vocabulary), then the guides in four batches
   (widget spine → building blocks → higher-level systems → tooling), then skills,
   then a consistency pass.
2. Verify before merge: every cited class/method/hook/export greps in the codebase;
   examples match the reference implementations verbatim; all intra-doc links resolve;
   each skill's steps dry-run against a real reference file set.
3. Docs-only change — no runtime surface; PHP checks via
   `tests/phpunit/run-unit.sh tests/phpunit/elementor/modules/atomic-widgets/…` where cited.

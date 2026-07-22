# Plan: Developer Coverage for Extending the Atomic (V4) System

## Why

The atomic (V4) system — widgets, prop types, controls, styles, variables, global
classes, interactions, dynamic tags, components — already exposes every extension seam
it needs, and uses them internally. But there is no developer-facing documentation, no
official API reference, and no discoverable entry point. A developer who wants to
extend any part of it must reverse-engineer the code. This plan closes that gap in
phases, ordered from what can be done now (fastest) to the longest approach.

**Scope decisions:**

- Audience: external third-party developers and AI coding agents.
- Skills in this repo are a **must** (Phase 1).
- MCP exposure of the docs prefers the product's **existing MCP server** — no external
  package/infrastructure required; the standalone indexer is an optional last phase.
- Facades: document today's hooks and registries as-is; facades are follow-up.
- No pull request; work lands on a feature branch for review.

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

## Phase 1 — Now (this repo only, no external dependencies)

Everything ships in `elementor/elementor`; nothing depends on other repos or infra.

**1a. Developer guides — `docs/v4/atomic/`** (plain markdown, narrative + tables, each
ending in an **Extension Points** table; every cited symbol/hook/path must exist):

| Guide | Covers |
|---|---|
| `README.md` | Hub: ecosystem map, the key-as-contract model, "I want to… → go here" matrix, experiment flags, facades note |
| `widget-anatomy.md` | The spine: identity → schema → controls → structure → Twig → base styles → registration; leaf vs nested |
| `structure-and-nesting.md` | Containers, children hooks, `Child_Dependency`, the Tabs multi-part pattern |
| `twig-and-rendering.md` | Template traits, `get_templates()`, render context, macros, frontend handlers |
| `prop-types.md` | PHP base classes + fluent API, unions, schema extenders, JS `createPropUtils` mirror |
| `controls.md` | PHP declaration + JS component + `controlsRegistry`; bind-must-exist rule |
| `transformers-and-styles.md` | The four transformer contexts, style schema/renderer/manager, JS canvas registries |
| `variables.md` | New variable type end-to-end (matching keys), schema augmentation |
| `global-classes.md` | Storage, shared style schema, styles providers, update action |
| `interactions.md` | Data flow author→validate→emit→animate; controls registry; schema filter |
| `dynamic-tags.md` | Opting props in; V1 tag auto-conversion (`atomic_group`, `atomic_label`, `force_convert_to_atomic`) |
| `components.md` | Overridable props, `ignore()` opt-out, extensible slice |
| `mcp-abilities.md` | Adding an ability: subclass, register, **and list in `create_server()` tools/resources** |
| `editor-ui-extension-points.md` | UI seams: locations, menus, panel injections, store, v1-adapters; `__` = private |

**1b. Skills — `.claude/skills/` (must-keep):** `atomic-widget`, `atomic-prop-type`,
`atomic-control`, `atomic-variable-type`, `atomic-interaction`, `atomic-mcp-ability`.
Each links its guide, names exact files to create/edit, ends with verification steps.
`.claude/` is gitignored — track them with a `!.claude/skills/` exception (or `git add
-f`, precedent: `packages/.claude/general.md` is tracked).

**1c. Discoverability:** link the hub from `docs/README.md`; pointer in `AGENTS.md`.

**Verification:** every cited class/method/hook/export greps in the codebase; examples
match reference implementations verbatim; intra-doc links resolve; skills dry-run
against real reference files.

## Phase 2 — Fast follow (MCP + llms.txt with zero new infrastructure)

Expose the docs to AI agents using only what already exists.

**2a. Docs over the product's own MCP (preferred — no external package).** Reuse the
existing pattern: `Style_Best_Practices_Ability` serves a markdown file as a public MCP
resource (`elementor://style/best-practices`, `mimeType: text/markdown`). Add one
ability (e.g. `Atomic_Extension_Docs_Ability`) that serves the Phase 1 guides as MCP
resources — an index resource (llms.txt-style, `elementor://docs/extending-atomic`)
plus per-guide URIs — registered in `register_abilities()` **and** in the
`create_server()` resources array. Any MCP client connected to a site then gets the
docs with no extra setup. This is the only Phase that touches product code, and it is
one small, additive ability class.

**2b. llms.txt in this repo.** Ship a hand-curated `docs/v4/atomic/llms.txt` (index of
the guides with one-line descriptions) so any agent cloning the repo — and the MCP
ability above — has a canonical AI index. Zero build tooling.

## Phase 3 — Publish to developers.elementor.com (existing docs repo)

Work in [elementor/elementor-developers-docs](https://github.com/elementor/elementor-developers-docs)
(VuePress 1.9.7, markdown in `src/`, GitHub Actions deploy — separate session/access):

- **3a.** Publish the guides as a new V4/atomic section in `src/` (adapted from Phase 1;
  hand-edited, PR-reviewed — full manual control; the site has no V4 coverage today).
- **3b.** Add a small pre-build script generating `llms.txt` + `llms-full.txt` from
  `src/**/*.md` and copying raw `.md` files into the build output (the site serves no
  llms.txt today, and VuePress 1.x has no plugin for it — the script is
  framework-independent). With this, agents can consume the site directly, still with
  no hosted package.

## Phase 4 — Optional, longest: standalone aggregation layer

Only if cross-source aggregation and semantic search prove necessary (private repos,
`@elementor/*` npm, multiple sites in one index):

- Host [docs-mcp-server](https://github.com/arabold/docs-mcp-server) (open source) as a
  read-only MCP endpoint. Validated: manual control (`file://` sources + allowlist, CLI
  `scrape/refresh/list/remove`, `--version`, web UI), private GitHub via
  `GITHUB_TOKEN`/`GH_TOKEN`, llms.txt-first crawling, one-config client setup
  (`http://<host>:6280/sse`), `--read-only` + OAuth2/OIDC, embeddings optional
  (incl. local Ollama).
- First run indexes from scratch; CI `refresh` + aggregation jobs afterwards.
- **De-risk first:** a short spike indexing one private repo and one `file://` folder
  end-to-end (per-source syntax is thinner in its docs than the config reference).

## Follow-up (outside these phases)

- **Facades:** a thin PHP registration helper wrapping the hook strings, and a JS
  aggregator re-exporting the key `register*` functions.
- Skills for global classes / dynamic tags / components.
- Docs-site modernization (VitePress/Docusaurus with native llms.txt plugins);
  auto-generated API reference (`@wordpress/docgen` / TypeDoc) into package READMEs.

---

## Phase summary

| Phase | Where | Effort | Depends on | Delivers |
|---|---|---|---|---|
| 1 | this repo | days | nothing | guides + skills (must) + discoverability |
| 2 | this repo | ~a day | Phase 1 | docs over product MCP + llms.txt, no new infra |
| 3 | developers-docs repo | days | Phase 1 | public site section + site llms.txt |
| 4 | new infra (optional) | weeks | Phase 3 | aggregated cross-source index + hosted MCP |

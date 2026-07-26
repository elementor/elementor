# Elementor v4 Documentation — Full Plan (Revised)

> **Location:** `docs/v4/`
> **Format:** Markdown only (`.md`)
> **Current state:** Not started — see §11
> **Global index:** `docs/v4/README.md`
> **This file:** planning document only, lives at repo root (same convention as
> `elementor-developers-docs/docs-plan-v4-atomic-widgets.md` on `feature/vitepress-migration`).
> It is not itself part of `docs/v4/` and should not be copied into it.

---

## 0. Relationship to other docs efforts (new)

Two other doc efforts touch the same ground. This plan does not duplicate them; it links out instead.

| Effort | Location | Scope | How this plan relates |
|--------|----------|-------|------------------------|
| `docs-plan-v4-atomic-widgets.md` | `elementor-developers-docs` repo, `feature/vitepress-migration` branch | Published, external-facing addon-developer tutorial track (18 pages: props schema, controls, Twig, styles, transformers, etc.) for `developers.elementor.com` | This plan (`docs/v4/`) is **not** a substitute. `elementor/docs/README.md` states the repo's own developer docs "moved" to `developers.elementor.com` — nothing under `elementor/docs/` is published today. Treat `docs/v4/` primarily as an **internal + LLM/agent-integrator + power-user reference**, cross-linking to the published site for the addon-authoring tutorial path rather than re-teaching it. See Open Decision #1. |
| General MCP / WP Abilities API host-connectivity docs | Not yet started, no folder exists | How external hosts (Claude Desktop, Cursor, etc.) connect via the WP Abilities API in general; abilities that are not v4-specific (`get-structure`, `create-page`, `update-settings`, `list-resources`, `read-resource`, `list-dynamic-tags`) | Out of scope for `docs/v4/` — this mechanism runs regardless of any v4 experiment (confirmed: `modules/mcp/module.php` has no experiment gate; only the JS `editor-mcp` package's *inclusion* is gated by `editor_mcp`, per `modules/atomic-widgets/module.php:147`). Deferred to a future, separate top-level docs folder (e.g. `docs/mcp/`), not part of this 74-file count. |

---

## 1. Mission

Document every v4 surface — atomic widgets, global classes, variables, interactions, components, dynamic tags, CSS converter, editor packages, MCP (v4-specific surface only), migration, and opt-in — for **external extenders**, **power users**, **LLM/agent integrators**, and **internal contributors**.

Goals:
- Small, focused files (target 80–150 lines when filled; scaffold stays under 60)
- One topic per file; split rather than grow monoliths
- `docs/v4/` holds **only** v4 reference docs — no code, configs, or non-markdown artifacts
- Stable folder boundaries for future Cursor skills (1 folder ≈ 1 skill)
- Do not duplicate live schemas (MCP `get-widget-schema` remains source of truth for widget JSON)
- **Registration over enumeration** (new): where a registry, filter, or hook exists for adding new instances of something (variable types, transformers, MCP tools, editor packages, elements), document *how to register a new one* as the primary content. Static catalogs of today's instances are a secondary, clearly-labeled-as-a-snapshot table, not the file's main purpose — catalogs go stale (renamed tools, added widgets) while registration mechanics don't.

---

## 2. Governance

### Status lifecycle

| Status | Meaning |
|--------|---------|
| `concept` | Structure and scope only; TBD placeholders |
| `draft` | Partial content; not API-stable |
| `stable` | Reviewed; safe for external use |

Every file carries `> Status: concept` until explicitly promoted.

### Audience tags

| Tag | Who |
|-----|-----|
| `external` | Theme/plugin authors, MCP integrators, community extenders |
| `internal` | Elementor R&D; PHP/JS internals |
| `both` | Shared concepts; Extension vs Internals sections split by audience |

**Note on `external` in this tree:** `docs/v4/` is not published anywhere today (see §0). "External" here means "written so an extender *could* use it," not "currently reachable by one." Do not assume audience tag implies a distribution channel — that is Open Decision #1.

### File templates

**Folder `README.md`**
1. `#` Section title
2. `> Status: concept`
3. `## Purpose` — 1–2 sentences
4. `## Files` — table: File | Covers
5. `## Reading order` — numbered links
6. `## Related` — sibling/parent links

**Topic file**
1. `#` Title
2. `> Audience:` / `> Module:` / `> Status:` / `> Related:`
3. `## What it is`
4. `## When to use it`
5. `## Key concepts`
6. `## Extension` (external; or "N/A") — **for registry/hook-backed topics, this section leads with "how to register a new one," not a list of existing ones**
7. `## Internals` (internal; or "N/A")
8. `## See also`

### Principles

- Cross-link with relative paths; no orphan pages
- Use **labels** not internal ids in all author-facing examples (`wc26-gold`, not `e-gv-wc26-gold`)
- Hooks and filter names must be exact strings
- Link to `developers.elementor.com` for legacy v3 APIs; `docs/v4/` is additive for atomic/v4
- MCP `modules/mcp/static-resources/` is runtime prompt source; `docs/v4/mcp/` is the human-readable canonical reference **for v4-specific MCP surface only** (see §0)
- Prefer documenting the registry/filter/hook that adds new instances of a thing over an exhaustive list of current instances (see Mission, "Registration over enumeration")

---

## 3. Folder tree (74 files)

```
docs/v4/
├── README.md                          ← GLOBAL INDEX
├── getting-started/                   (4 files)
├── architecture/                      (4 files)
├── fundamentals/                      (6 files)
├── atomic-widgets/                    (6 files)
├── global-classes/                    (5 files)
├── variables/                         (6 files)
├── interactions/                      (5 files)
├── components/                        (5 files)
├── dynamic-tags/                      (5 files)
├── css-converter/                     (4 files)
├── editor-packages/                   (5 files)
├── mcp/                               (6 + abilities/)
│   └── abilities/                     (7 files)
├── migration/                         (3 files)
└── opt-in/                            (2 files)
```

74 files total (60 top-level topic files across getting-started…editor-packages, 13 under `mcp/`, 3 under `migration/`, 2 under `opt-in/`, 1 global `README.md`; was 77 in the original draft — net −3 from the MCP rescoping in §5.12).

---

## 4. Global index — `docs/v4/README.md`

**Will contain when filled:**
- What v4 is and how this tree relates to the codebase
- Explicit scope note: relationship to `developers.elementor.com` / `elementor-developers-docs` (§0) and to the future general MCP/abilities docs (§0)
- Principles (above), including "registration over enumeration"
- Full folder map with one-line descriptions
- Per-file template reference
- Audience tag legend (with the "not currently published" caveat)
- Status policy
- Future skills map (folder → planned skill name)
- Four reading paths (external dev, power user, LLM integrator, internal contributor)
- Link to `developers.elementor.com` for legacy docs

---

## 5. Section-by-section content plan

### 5.1 `getting-started/` (4 files)

| File | Audience | Will document |
|------|----------|---------------|
| `README.md` | both | Index; start-here orientation |
| `what-is-v4.md` | both | V4 vs legacy editor; atomic model; who it's for; what changes for end users |
| `experiments.md` | both | Full experiment matrix: `e_opt_in_v4`, `e_atomic_elements`, `e_classes`, `e_variables`, `e_variables_manager`, `e_components`, `e_interactions`, `editor_mcp`; dependencies; defaults; new-site auto-enable rules. Note explicitly that `editor_mcp` only gates the JS `editor-mcp` package (in-editor tool UI), not the PHP `modules/mcp/` abilities registration, which is unconditional |
| `glossary.md` | both | PropValue, `$$type`, label vs id, atomic element vs legacy widget, kit, style variant, overridable, configuration-id (MCP), customCss vs rejected |

**Source material:** `modules/atomic-widgets/opt-in/`, `modules/atomic-opt-in/`, experiment registrations in each module's `get_experimental_data()`.

---

### 5.2 `architecture/` (4 files)

| File | Audience | Will document |
|------|----------|---------------|
| `README.md` | both | Index |
| `overview.md` | both | PHP modules ↔ JS packages ↔ frontend render; experiment gates; high-level diagram |
| `data-flow.md` | internal | Edit → save → prop resolution → CSS generation → frontend; REST/MCP mutation paths |
| `packages-map.md` | internal | Table: docs area → PHP path → JS package → tests location |

**Key mapping to document:**

| Docs area | PHP module | JS package |
|-----------|------------|------------|
| Atomic widgets | `modules/atomic-widgets/` | `editor-canvas`, `editor-editing-panel`, `editor-styles-repository`, `editor-templates`, `editor-design-system` |
| Global classes | `modules/global-classes/` | `editor-global-classes` |
| Variables | `modules/variables/` | `editor-variables` |
| Interactions | `modules/interactions/` | `editor-interactions` |
| Components | `modules/components/` | `editor-components` |
| Dynamic tags | `modules/atomic-widgets/dynamic-tags/` + `modules/dynamic-tags/` | (bridge in atomic-widgets) |
| MCP (v4-specific) | `modules/mcp/abilities/*` (subset, see §5.12) | `editor-mcp`, `elementor-mcp-common` |
| Fundamentals libs | — | `editor-props`, `editor-styles`, `editor-controls`, `editor-elements`, `editor-responsive`, `schema` |

---

### 5.3 `fundamentals/` (6 files)

| File | Audience | Will document |
|------|----------|---------------|
| `README.md` | both | Index; "read before any module" |
| `prop-value.md` | both | `{ $$type, value }` shape; plain vs transformable; `disabled`; null/reset semantics; overridable wrapping |
| `prop-types.md` | both | Taxonomy: plain, object, array, union; domain types (size, color, link, image, etc.); PHP `prop-types/` ↔ TS `@elementor/editor-props`; `elementor/atomic-widgets/props-schema` hook |
| `style-schema.md` | both | Canonical keys in `Style_Schema`; dependencies (`object-position` vs `object-fit`); breakpoint variants; variable unions; `elementor/atomic-widgets/styles/schema` filter |
| `transformers.md` | both | Registry contexts: settings, styles, import, export; registration hooks; when transformer vs prop type; `Render_Props_Resolver` depth |
| `validation.md` | both | PHP `Props_Parser`; JS `validatePropValue`; partial-null bypass; LLM JSON schema export |

**Source material:** `modules/atomic-widgets/prop-types/`, `props-resolver/`, `styles/style-schema.php`, `packages/packages/libs/editor-props/`.

---

### 5.4 `atomic-widgets/` (6 files)

| File | Audience | Will document |
|------|----------|---------------|
| `README.md` | both | Index |
| `overview.md` | both | Module role; experiment `e_atomic_elements`; widget vs element; built-in catalog summary |
| `elements-catalog.md` | both | Light reference table of atomic types (`e-flexbox`, `e-div-block`, `e-grid`, `e-heading`, `e-button`, `e-image`, `e-tabs`, etc.); nesting (`allowed_child_types`, `allowed_parents`, `required_direct_children`); `llm_guidance` fields. Secondary to `authoring-widgets.md` — explicitly labeled as a snapshot, not the section's teaching content |
| `authoring-widgets.md` | **both** (was `external`) | Extend `Atomic_Widget_Base` / `Atomic_Element_Base`; `define_atomic_controls()`; `define_props_schema()`; control types; widget registration. Primary file in this folder — core contributors register built-in atomic widgets through the identical API, so this isn't external-only |
| `rendering.md` | internal | Twig templates; `Render_Props_Resolver`; `Atomic_Styles_Manager`; frontend handlers package; CSS file output |
| `hooks.md` | external | All `elementor/atomic-widgets/*` filters and actions (props-schema, styles/schema, transformers/register, llm-json-schema) |

**Source material:** `modules/atomic-widgets/elements/`, `controls/types/`, `module.php` PACKAGES array.

---

### 5.5 `global-classes/` (5 files)

| File | Audience | Will document |
|------|----------|---------------|
| `README.md` | both | Index |
| `overview.md` | both | Kit-scoped reusable classes; experiment `e_classes`; relationship to `classes` prop |
| `data-model.md` | both | CPT storage; items + order; **label** is public id; internal `g-*` ids; kit binding |
| `applying-classes.md` | both | `classes` prop on elements; prepend order; local styles win on conflict; MCP `classes` map |
| `api.md` | external | REST CRUD; import/export with kits; usage tracking; MCP `manage-classes` |

**Source material:** `modules/global-classes/`, `packages/packages/core/editor-global-classes/`.

---

### 5.6 `variables/` (6 files)

| File | Audience | Will document |
|------|----------|---------------|
| `README.md` | both | Index |
| `overview.md` | both | Design tokens; experiments `e_variables`, `e_variables_manager` |
| `types.md` | both | **Registration-first:** `Variable_Types_Registry` (`modules/variables/classes/variable-types-registry.php`) and the `elementor/variables/register` hook as the primary content — "how to add a new variable type." Built-in color/font/size types documented as the worked examples of that registry, not a closed catalog |
| `usage-in-styles.md` | both | `var(--label)` in raw CSS; longhand preference; Pro 3.35+ `custom_css` stripping caveat |
| `usage-in-props.md` | both | PropValue binding: `global-color-variable`, `global-font-variable`, `global-size-variable` |
| `api.md` | external | REST; kit `global-variables.json`; MCP `manage-global-variable` |

**Source material:** `modules/variables/`, `packages/packages/core/editor-variables/`.

---

### 5.7 `interactions/` (5 files)

| File | Audience | Will document |
|------|----------|---------------|
| `README.md` | both | Index |
| `overview.md` | both | Element motion/interactions; experiment `e_interactions` |
| `schema.md` | both | `Interactions_Schema`; triggers, effects, presets, timing, breakpoints; `elementor/atomic-widgets/interactions/schema` filter as the extension point |
| `editor.md` | internal | `editor-interactions` package; interactions tab; controls registry; how the package registers its own MCP/Angie tools via `getMCPByDomain` (see `mcp/registering-editor-tools.md`) |
| `frontend.md` | internal | Motion.js; `Interactions_Frontend_Handler`; postmeta cache; collector |

**Source material:** `modules/interactions/`, `packages/packages/core/editor-interactions/`.

---

### 5.8 `components/` (5 files)

| File | Audience | Will document |
|------|----------|---------------|
| `README.md` | both | Index |
| `overview.md` | both | Reusable component documents; experiment `e_components` |
| `document-model.md` | both | Component CPT; document type; repository (verify exact CPT slug against `modules/components/` before publishing — not yet confirmed) |
| `instances-and-overrides.md` | both | `component-instance`, `overridable`, `override` prop types; transformers; override UI |
| `nesting-rules.md` | internal | Circular dependency validator; lock manager; nested element ID formatting; global classes on component docs |

**Source material:** `modules/components/`, `packages/packages/core/editor-components/`.

---

### 5.9 `dynamic-tags/` (5 files)

| File | Audience | Will document |
|------|----------|---------------|
| `README.md` | both | Index |
| `overview.md` | both | v3 `modules/dynamic-tags/` vs v4 bridge `atomic-widgets/dynamic-tags/` |
| `binding-propvalues.md` | both | `{ $$type: dynamic }` at root or nested field (e.g. image `src`); `name` + `settings`; no `group` field |
| `discovery.md` | external | MCP `list-dynamic-tags`; resource `elementor://dynamic-tags`. Note: this ability is general-purpose (works for v3 and v4 tags alike), documented here rather than under `mcp/abilities/` because dynamic-tags is where a reader looks for it |
| `extending.md` | external | New legacy tag + atomic mapping via `dynamic-prop-types-mapping` |

**Source material:** `modules/atomic-widgets/dynamic-tags/`, MCP static-resources.

---

### 5.10 `css-converter/` (4 files)

Migrates the content of `docs/v4/css-converter.kb.md` (still present in the repo today, 208 lines — see §11) into 4 standard files, then removes the `.kb.md` file. Do not delete it before the migration is done.

| File | Audience | Will document |
|------|----------|---------------|
| `README.md` | both | Index |
| `overview.md` | both | `Css_Converter::convert()` entry; return shape `{ props, customCss, rejected }`; REST endpoint; MCP style applier usage |
| `pipeline.md` | internal | parse → expand_shorthands → dedupe → converter loop → variable_transformer → validate_props → cleanup_props |
| `extension.md` | external | Expanders (`Shorthand_Expander_Base`); converters (`Property_Converter_Base`); null/reset semantics; `covered_properties()` alignment with Style_Schema |

**Source material:** `modules/atomic-widgets/css-converter/` (current `css-converter.kb.md` content).

---

### 5.11 `editor-packages/` (5 files)

| File | Audience | Will document |
|------|----------|---------------|
| `README.md` | both | Index |
| `overview.md` | both | Micro-frontend architecture; `elementor/editor/v2/packages` filter; init order |
| `core-packages.md` | internal | Snapshot table of the currently registered v4 packages (canvas, editing-panel, styles-repository, interactions, templates, design-system, global-classes, variables, components). Labeled explicitly as a snapshot — the registration mechanism in `extending-editor.md` is the durable content |
| `libs.md` | both | Foundation libs: `editor-props` (primary extension surface), `editor-styles`, `editor-controls`, `editor-elements`, `editor-responsive`, `editor-mcp` (cross-link `mcp/registering-editor-tools.md`), `editor-v1-adapters`, `schema` |
| `extending-editor.md` | **both** (was `external`) | `elementor/editor/v2/packages` filter + package init pattern; `@elementor/locations` injection; panel/app-bar extension; v1 adapter patterns. Core contributors add packages through the same filter, so this isn't external-only |

**Source material:** `packages/docs/architecture.md`, atomic-widgets `PACKAGES`, each package's `src/init.ts`.

---

### 5.12 `mcp/` (6 files + `abilities/`, revised)

Two distinct systems live under the "MCP" umbrella; `README.md` and `overview.md` must disambiguate them clearly so readers don't conflate them:

1. **PHP abilities** (`modules/mcp/abilities/*.php`) — server-side, registered via the WordPress Abilities API, exposed to **external** MCP hosts (Claude Desktop, Cursor, etc.) through `McpAdapter` / `Mcp_Proxy_REST_API`. Runs unconditionally — not gated by any v4 experiment. Only the **v4-specific subset** of these abilities belongs in this docs tree (see abilities table below); the general, non-v4 abilities (`get-structure`, `create-page`, `update-settings`, `list-resources`, `read-resource`) are deferred to a future general MCP docs folder outside `docs/v4/` (§0).
2. **JS in-editor tool registry** (`packages/packages/libs/editor-mcp/src/mcp-registry.ts`, `getMCPByDomain()` / `addTool()` / `resource()`) — used internally by v4 packages (`editor-global-classes`, `editor-variables`, `editor-interactions`, `editor-canvas`) to expose tools to Elementor's in-editor AI assistant (Angie) and WebMCP. This layer changes frequently as those tools evolve. Document the **registration API only** (`registering-editor-tools.md`), not a snapshot of which tools each package currently registers.

| File | Audience | Will document |
|------|----------|---------------|
| `README.md` | both | Index; explicit "two systems" disambiguation (above) |
| `overview.md` | both | `editor_mcp` experiment scope (gates the JS package inclusion only, not PHP abilities, confirmed `modules/atomic-widgets/module.php:147`); WordPress Abilities API; abilities vs resources; v4-only scope of this folder |
| `resources.md` | external | URI catalog for v4-specific resources: `elementor://global-classes`, `elementor://global-variables`, `elementor://dynamic-tags`, `elementor://style/best-practices` |
| `composition-workflow.md` | external | End-to-end: variables → classes → XML composition → element_config + style + classes; configuration-id rules; dry_run; append vs replace_children |
| `design-guidance.md` | external | Short design principles for agents; link to full `elementor://style/best-practices` resource (not duplicate the full prompt) |
| `registering-editor-tools.md` | both | JS side: `getMCPByDomain(namespace, options)`, `addTool()`, `resource()`, `setMCPDescription()`; when to open a new namespace vs. add a tool to an existing one; `requiredResources`/`isDestructive` conventions; adapter pattern (`IMcpRegistrationAdapter`, `registerMcpAdapter()`) for how `WebMCPAdapter`/`AngieMcpAdapter` plug in, as reference for a new host adapter. Explicitly not a tool catalog |

**Abilities** (`mcp/abilities/`, v4-specific subset only — 7 files):

| File | Will document |
|------|----------------|
| `README.md` | Index; recommended call order; note that this is a subset — general abilities live in the future non-v4 MCP docs |
| `build-composition.md` | XML structure, nesting, globals, dynamics, mode, parameters, examples |
| `get-widget-schema.md` | Single widget schema; `llm_guidance` fields |
| `list-widget-schemas.md` | Discovery; summary mode |
| `manage-classes.md` | CRUD; label-based references |
| `manage-global-variable.md` | CRUD; type constraints; folds in `manage-variable-guide-ability`'s resource (`elementor://variables/tools/manage-global-variable-guide`) |
| `manage-elements.md` | update/delete/move/duplicate on existing elements; note this ability depends on the AtomicWidgets CSS converter (`Css_Converter`, `Converter_Registry_Factory`) so it is genuinely v4-specific despite operating on "elements" generically |

Moved out of `docs/v4/` (general, not v4-specific — confirmed against `modules/mcp/module.php:59` registrations): `get-structure`, `create-page`, `update-settings`, `list-resources`, `read-resource`. `list-dynamic-tags` stays but is documented under `dynamic-tags/discovery.md` (§5.9) instead of here, since it isn't v4-exclusive either but readers will look for it there.

**Source material:** `modules/mcp/abilities/`, `modules/mcp/module.php`, `packages/packages/libs/editor-mcp/src/mcp-registry.ts`, `adapters/`.

---

### 5.13 `migration/` (3 files)

| File | Audience | Will document |
|------|----------|---------------|
| `README.md` | internal | Index |
| `prop-type-migrations.md` | internal | `Migrations_Orchestrator`; manifest format; examples (html-v2→v3, border migrations, global classes) |
| `backward-compatibility.md` | both | `e_bc_migrations`; feature-affecting flags; document migration hooks |

**Source material:** `modules/atomic-widgets/prop-type-migrations/`.

---

### 5.14 `opt-in/` (2 files)

| File | Audience | Will document |
|------|----------|---------------|
| `README.md` | both | Index |
| `activation.md` | both | `atomic-opt-in` UX; settings page; welcome screen; what toggles together when enabling v4; data impact |

**Source material:** `modules/atomic-opt-in/`, `modules/atomic-widgets/opt-in/`.

---

## 6. Reading paths

### External addon developer
1. `getting-started/what-is-v4.md`
2. `architecture/overview.md`
3. `fundamentals/prop-value.md` → `prop-types.md` → `style-schema.md`
4. `atomic-widgets/authoring-widgets.md` → `hooks.md`
5. `editor-packages/extending-editor.md`
6. `opt-in/activation.md`
7. For the full addon tutorial track, continue on `developers.elementor.com` (`docs-plan-v4-atomic-widgets.md`) — this tree is a reference companion, not a replacement

### Power user / designer
1. `getting-started/what-is-v4.md`
2. `global-classes/applying-classes.md`
3. `variables/usage-in-styles.md`
4. `components/overview.md`
5. `interactions/overview.md`

### LLM / agent integrator
1. `mcp/overview.md` (read the "two systems" disambiguation first)
2. `mcp/composition-workflow.md`
3. `fundamentals/prop-value.md`
4. `dynamic-tags/binding-propvalues.md`
5. `mcp/abilities/README.md` → per-ability files
6. `atomic-widgets/elements-catalog.md`

### Internal contributor
1. `architecture/data-flow.md`
2. `architecture/packages-map.md`
3. `editor-packages/core-packages.md`
4. `mcp/registering-editor-tools.md` (if adding Angie/WebMCP tools to a package)
5. Module-specific internals sections
6. `migration/README.md`

---

## 7. Future skills layering

Planned 1:1 folder → skill mapping:

| Skill | Reads |
|-------|-------|
| `v4-fundamentals` | `fundamentals/**` |
| `v4-atomic-widgets` | `atomic-widgets/**` + `fundamentals/prop-value.md` |
| `v4-global-classes` | `global-classes/**` |
| `v4-variables` | `variables/**` |
| `v4-interactions` | `interactions/**` |
| `v4-components` | `components/**` |
| `v4-dynamic-tags` | `dynamic-tags/**` |
| `v4-css-converter` | `css-converter/**` |
| `v4-mcp` | `mcp/**` |
| `v4-editor-packages` | `editor-packages/**` |

Each skill embeds: folder `README.md` as entry, audience filter, and deep links. Stable paths — do not rename folders after skills ship.

---

## 8. What NOT to write in `docs/v4/`

- Full widget schema dumps (live via MCP)
- Duplicate of `developers.elementor.com` legacy widget/control API
- Duplicate of the addon-authoring tutorial track already planned in `elementor-developers-docs/docs-plan-v4-atomic-widgets.md` — link to it instead of re-teaching it (see §0)
- General, non-v4 MCP/Abilities host-connectivity docs (`get-structure`, `create-page`, `update-settings`, `list-resources`, `read-resource`) — deferred to a future separate docs folder (§0)
- Package README stubs (link here instead)
- Full `style/best-practices.md` copy (summarize in `mcp/design-guidance.md`)
- Snapshot catalogs as primary content where a registry/hook exists — document the registration mechanism first, the catalog second and clearly labeled as a snapshot (see Mission, "Registration over enumeration")
- Code samples longer than ~30 lines (link to source/tests instead)
- Non-markdown files of any kind

---

## 9. Write order (when moving concept → stable)

| Phase | Scope | Rationale |
|-------|-------|-----------|
| **1** | `README.md`, `getting-started/`, `architecture/` | Orientation and map |
| **2** | `fundamentals/` | Shared contract for all modules |
| **3** | `atomic-widgets/`, `global-classes/`, `variables/` | Core authoring surfaces |
| **4** | `dynamic-tags/`, `components/`, `interactions/` | Composition features |
| **5** | `css-converter/` | Migrate `css-converter.kb.md` content into 4 files, then delete the `.kb.md` file |
| **6** | `editor-packages/`, `mcp/` | Editor + agent integration |
| **7** | `migration/`, `opt-in/` | BC and activation |

Within each phase: folder `README.md` first, then files in reading order.

---

## 10. Open decisions

1. **Publish location** (was: "public hosting") — `elementor/docs/v4/` is not published anywhere; `elementor/docs/README.md` says developer docs moved to `developers.elementor.com`. Decide: keep `docs/v4/` in-repo as internal/agent/power-user reference only (current default assumption in this plan), or promote select `external`-tagged files into `elementor-developers-docs` alongside the existing atomic-widgets plan?
2. **MCP sync** — keep `static-resources/` as runtime prompts and maintain `docs/v4/mcp/` separately, or generate one from the other?
3. **Stable promotion** — who reviews and flips `Status: concept` → `stable`?
4. **General MCP/abilities docs folder** (new) — who owns scoping the deferred non-v4 abilities documentation (§0), and where does it live relative to `docs/v4/`?
5. **Component CPT slug** (new) — `components/document-model.md` needs the exact CPT name confirmed against `modules/components/` before it can be written accurately.

---

## 11. Current state (corrected)

- `docs/v4/css-converter.kb.md` — **present**, 208 lines, not yet migrated or removed. This plan replaces it with `css-converter/{README,overview,pipeline,extension}.md` in Phase 5, then deletes it (§9, §5.10).
- `docs/v4/` contains **no other files**. The 77-file scaffold described in earlier drafts of this plan does not exist in the repository — that was aspirational, not actual.
- No PR opened.
- Content fill not started.
- This document (`docs-plan-v4-documentation.md`) supersedes the earlier draft plan; the file count is now **74**, not 77 (net −3 from the MCP rescoping in §5.12).

Next action when approved: **Phase 1** — create the folder scaffold (`README.md` + all folder `README.md` stubs + this phase's files) and fill `getting-started/` and `architecture/` from codebase sources.

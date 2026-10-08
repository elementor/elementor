# Data Flow & Custom Elements — High Level Design

Status: **Draft for discussion**. Branch: `cursor/data-flow-reactivity-poc-d1f3` (POC).

## 1. Intro

This document describes how we turn the data-flow POC (page state, per-element handlers, `{{state.key}}` bindings) into a production-grade capability for Elementor v4: **custom elements** — compositions of atomic elements that own data, expose simple high-level controls, and carry interactivity.

It lists the requirements, the constraints coming from the existing v4 architecture, the implementation options we evaluated, and a recommended direction to follow while refactoring the POC. Decisions marked as open are listed in [Open questions](#9-open-questions) and need an owner before implementation starts.

## 2. Motivation and overview

Unlike v3 widgets, v4 widgets are **atomic**: each one does one thing (heading, button, image, flexbox). That makes them flexible and consistent, but:

- they **lack interactivity** — a composition (e.g. a counter, a filterable list, a pricing toggle) cannot react to user input without custom code;
- they are **harder to use** — a user who wants "a pricing card" must understand and edit ten atomic elements instead of a handful of meaningful controls.

We want to let users build **simplified compositions controlled by high-level controls**: a custom element exposes a small data contract ("Plan name", "Monthly price", "Yearly price", "Highlight") in the regular General tab, its inner atomic elements read from that data, and an (admin-authored) behavior makes it interactive (e.g. toggle monthly/yearly).

What exists today in the POC:

| Piece | POC implementation | Production gap |
|---|---|---|
| Page state | Page settings JSON + WP sources (`Page_State`) | Page-only, no caching, no extensibility |
| Element data | `state_params` on containers, `state` on component instances (`State_Params`, `State_Scopes`) | Separate from props schema — not regular controls, not overridables |
| Bindings | `{{state.path}}` in any text, rendered server-side via Twig, hydrated by text-node matching | Fragile matching, text-only, no attributes/visibility/lists |
| Behavior | `handlers: [{event, code}]` per element, compiled with `new Function` | Editable in the editor, not CSP-safe, per-element (not per-composition) |
| Runtime | Custom store + listeners (`data-flow-store.js`) | Duplicates what Alpine already gives us |
| MCP | `manage-elements` / `build-composition` accept `handlers`; guide resource | Needs to author definitions, not raw handlers |

## 3. Terms

| Term | Meaning |
|---|---|
| **Custom element** | A reusable element definition = composition (atomic tree) + data contract + bindings + optional behavior. Exposed in the panel like any widget; saved/reused as a component. |
| **Definition** | The stored description of a custom element (schema-versioned JSON). Authored by an admin or by MCP. |
| **Instance** | A usage of a custom element on a page. Holds only data values (overrides), never code. |
| **Data contract** | The list of typed props a custom element exposes. Rendered as regular controls in the General tab. Reuses the atomic props schema. |
| **State** | Runtime values of an instance: initialized from the data contract (and data sources), mutated by behavior. |
| **Scope** | The boundary that owns a state object. One scope per custom-element instance; scopes nest. |
| **Binding** | A declarative link from state to an inner element's setting / attribute / text / visibility. Resolved on the server for first paint, updated on the client. |
| **Behavior** | Admin-authored JS module that mutates state in response to events. Referenced by name, never inlined, never editable from the editor UI. |
| **Data source** | A server-side provider of values (post title, latest posts, site name…). Similar to a dynamic tag. |
| **Runtime** | The client library that owns scopes, applies bindings and runs behaviors (custom store, Alpine CSP, or WP Interactivity API — see options). |

## 4. Product requirements

1. **General tab editing** — users edit a custom element's data in its General tab.
2. **Native controls** — each control looks and behaves exactly like our regular controls (same control types, responsive/dynamic/global support where applicable).
3. **Component parity** — custom elements support component save and can be exposed in the panel like any other widget.
4. **User-JS standards** — all JS follows our existing standards for user-input JS (only what we already allow, e.g. HTML widget / Custom Code) and is authored only by admins.
5. **Preview** — users can preview the interactivity of an element in the editor.
6. **JS is hidden** — the JS part is not exposed to, or editable by, regular users through the editor.
7. **Data access** — users can access the data used by the interactivity layer, e.g. bind it inside their controls similar to a dynamic tag.
8. **Self-declared** — each element declares its own interactivity and data.
9. **Nesting** — custom elements can be nested; each instance works on its own scoped data.

## 5. Technical assumptions

- Elementor Core requires **WP 6.8 / PHP 7.4** — WP Interactivity API (6.5+) is available everywhere.
- Atomic elements render through **Twig** on the server (`Template_Renderer`) and **Twing** in the editor canvas; the same template must produce the same markup in both.
- User text is **never compiled as Twig** (`bin/check-twig-safety.sh` forbids the sandbox); Twig only renders our own registered templates with user data as variables.
- **Alpine CSP build** (`@alpinejs/csp` 3.15) is already shipped (`elementor-v2-alpinejs`) and used by atomic tabs, background video and form via named `x-data="eX{{ id }}"` + `Alpine.data()`. Its expression parser supports member access, calls, ternaries, assignment, `++/--`, object/array literals; it does **not** support arrow functions or multi-statement code — logic must live in registered `Alpine.data` functions.
- Components already provide: definition storage (`elementor_component` CPT), overridable props (`$$type: overridable/override`), instance panel, circular-dependency checks.
- v4 dynamic tags already provide a prop-level substitution mechanism (`$$type: dynamic` + `Dynamic_Transformer` on server, JS transformer in canvas).
- Today there is no CSP header in Elementor output, but sites/hosts may add one; new runtime code must work under `script-src 'self'` without `unsafe-eval`.
- The feature ships behind an experiment and can change shape; stored data must be versioned and migratable.

## 6. Technical considerations

### 6.1 API flexibility (follow settings/styles)

Settings and styles are flexible because they are **schema-driven and filterable**:

- `define_props_schema()` + `elementor/atomic-widgets/props-schema` filter;
- `define_atomic_controls()` + `elementor/atomic-widgets/controls` filter;
- typed values `{ $$type, value }` + transformers registered via `elementor/atomic-widgets/transformers/register`;
- prop-type migrations for stored data.

Data flow should reuse this model rather than invent a parallel one: the data contract **is** a props schema, bindings **are** a prop type (`$$type: state`), and the runtime is reached through a small registry (`register_behavior`, `register_data_source`) with filters. The definition JSON carries a `version` so we can migrate it like prop types.

### 6.2 Performance

Custom elements must match regular widgets in Lighthouse and editor performance:

- **First paint is server-rendered** — bindings resolve on the server (Twig + transformers), so there is no layout shift and no content flashing.
- **Zero cost when unused** — runtime and behavior scripts are enqueued only through `get_script_depends()` of elements present on the page (same as tabs/form). No global footer JSON for pages without custom elements.
- **No extra DOM** — no wrapper spans; bindings are attributes on existing elements.
- **Static assets** — behaviors are files (cacheable, deferrable, minifiable), not inline scripts.
- **Data sources** — resolved once per request, memoized per page, and cacheable (object cache) for expensive queries.
- **Editor** — no re-render of the whole tree on state change; canvas only re-inits the changed element's scope.

### 6.3 Alpine reuse

Alpine is already a dependency, already CSP-safe, already integrated with the canvas lifecycle (`initTree` / `refreshTree` in `_initAlpine`), and already scoped (nested `x-data`). It is also well known to LLMs (large training corpus, simple directive vocabulary), which matters for MCP authoring. The CSP build restriction (no inline functions) is actually aligned with requirement 6: logic can only come from registered modules.

### 6.4 User-input JS standards

Current precedent:

| Feature | Gate | Output |
|---|---|---|
| HTML widget | `manage_options` or role-manager `custom-html` | raw HTML/JS in content |
| Pro Custom Code | `manage_options` + `unfiltered_html` | raw code in locations |
| Document save | `kses_post_deep` without `unfiltered_html` | scripts stripped |

Rules for this feature:

- Only users with `unfiltered_html` (super admin on multisite) can create or change behavior code. Saves from other users drop code silently (as the POC already does for `handlers`).
- Behavior code is **never** part of element/instance data — instances only store data values. Editors without the capability can use custom elements but cannot see or change code.
- No `eval` / `new Function` / inline `<script>` with user code. Code ships as a static file referenced by `src`.
- MCP abilities that write code require the same capability check as the UI.

### 6.5 Security

- Bindings only reference state paths (`state.price.monthly`), never expressions with user code.
- Server output is escaped by Twig autoescape; attribute bindings go through existing attribute transformers.
- Data sources are server allow-listed and respect post visibility / user capabilities.

## 7. Implementation options

All options share the problem split below; they differ in **where the contract lives** and **which runtime** we use.

```
Definition (admin/MCP) ──► Data contract (props) ──► General tab controls / overridables
                       ├─► Bindings (state → inner props) ──► SSR via Twig + client updates
                       └─► Behavior (JS module ref) ──► Runtime (scopes, events)
```

### Option A — Harden the current POC

**Overview.** Keep the POC model: `state_params` / `state` on elements, `handlers: [{event, code}]` per element, `{{state.path}}` text bindings, custom store. Add capability checks, caching, attribute bindings and a stable hydration marker.

**Example.**

```json
{
  "id": "card1",
  "elType": "e-flexbox",
  "state_params": [ { "key": "count", "type": "number", "default": 0 } ],
  "elements": [
    { "id": "btn", "widgetType": "e-button",
      "settings": { "text": { "$$type": "string", "value": "Clicked {{state.count}}" } },
      "handlers": [ { "event": "click", "code": "setState('count', c => c + 1)" } ] }
  ]
}
```

**Pros**

- Already works end-to-end; smallest diff.
- Very flexible for prototyping; easy for LLMs.

**Cons**

- Violates req. 6 — code lives in element data and is visible/editable in the editor.
- `new Function` is not CSP-safe; fails "only what we already allow".
- `state_params` are a parallel schema — not regular controls (req. 2), not overridables (req. 3).
- Text-node matching is fragile (identical texts, translations, whitespace) and text-only.
- Behavior is spread across inner elements instead of declared once per composition (req. 8).
- Custom runtime duplicates Alpine.

### Option B — Declarative contract + Alpine CSP runtime

**Overview.**

- A custom element definition declares a **props schema** (data contract), an **atomic tree**, **bindings** and a **behavior** name.
- The data contract is rendered by the existing controls system and becomes component overridables automatically.
- Inner element props can be bound to state with a new prop type `$$type: state` (dynamic-tag-like). The server transformer resolves the initial value; Twig additionally emits Alpine directives (`x-text`, `:href`, `x-show`) on the **existing** element markup.
- The instance root renders `x-data="eCustom{{ id }}"` with the initial state serialized as an attribute; nested instances create nested Alpine scopes.
- Behaviors are registered `Alpine.data` factories, stored as static JS files and enqueued via `get_script_depends()`.

**Example — definition (stored by admin/MCP).**

```json
{
  "version": 1,
  "name": "pricing-card",
  "title": "Pricing card",
  "props": {
    "plan":    { "type": "string",  "default": "Pro",  "label": "Plan" },
    "monthly": { "type": "number",  "default": 19,     "label": "Monthly price" },
    "yearly":  { "type": "number",  "default": 190,    "label": "Yearly price" }
  },
  "state": { "period": "monthly" },
  "behavior": "pricing-card",
  "elements": [
    { "widgetType": "e-heading",
      "settings": { "title": { "$$type": "state", "value": { "path": "plan" } } } },
    { "widgetType": "e-paragraph",
      "settings": { "paragraph": { "$$type": "state", "value": { "path": "price" } } } },
    { "widgetType": "e-button",
      "settings": { "text": { "$$type": "string", "value": "Toggle" } },
      "events": { "click": "toggle" } }
  ]
}
```

**Example — server output (no extra HTML, initial values rendered).**

```html
<div class="e-con" data-id="a1b2" x-data="eCustomPricingCard"
     data-e-state='{"plan":"Pro","monthly":19,"yearly":190,"period":"monthly"}'>
  <h2 class="e-heading" x-text="plan">Pro</h2>
  <p class="e-paragraph" x-text="price">19</p>
  <button class="e-button" @click="toggle">Toggle</button>
</div>
```

**Example — behavior file (admin only, not in editor).**

```js
Alpine.data( 'eCustomPricingCard', () => ( {
	plan: '',
	monthly: 0,
	yearly: 0,
	period: 'monthly',
	init() {
		Object.assign( this, JSON.parse( this.$el.dataset.eState ) );
	},
	get price() {
		return 'monthly' === this.period ? this.monthly : this.yearly;
	},
	toggle() {
		this.period = 'monthly' === this.period ? 'yearly' : 'monthly';
	},
} ) );
```

**Pros**

- Req. 1–3: contract is a props schema → regular controls, regular overridables, component save for free.
- Req. 4/6: code is a file referenced by name; CSP build forbids inline logic; capability-gated authoring.
- Req. 5: canvas already calls `Alpine.initTree` on render; preview = run the behavior in canvas (optionally behind a "Preview interactivity" toggle like interactions' play).
- Req. 7: `$$type: state` sits next to `$$type: dynamic` in the prop picker.
- Req. 9: Alpine nests `x-data` scopes natively; child instances get their own state; parent → child via props.
- Performance: SSR first paint, Alpine already shipped, per-element enqueue.
- LLM-friendly: Alpine vocabulary is widely known; MCP writes a definition + a behavior file.

**Cons**

- CSP build limits expressions in directives (no arrow functions/statements) → logic must be in behavior methods. Acceptable, but behaviors are mandatory for anything non-trivial.
- Twig templates of each atomic widget need a hook to emit binding directives (`x-text`, `:attr`) — touches the base render path for every widget.
- Ties the public contract to Alpine; changing runtimes later means migrating directives (mitigated by emitting directives from bindings, not storing them).
- Need to design how state from data sources (lists, posts) is rendered for loops (`x-for` on `<template>` → needs SSR fallback).

### Option C — Declarative contract + WordPress Interactivity API

**Overview.** Same contract and bindings as option B, but the runtime is `@wordpress/interactivity`. Twig emits `data-wp-interactive`, `data-wp-context`, `data-wp-text`, `data-wp-on--click`; WordPress' server-side directive processor (`wp_interactivity_process_directives`) renders initial values; behaviors are script modules registering `store( 'elementor/pricing-card', { actions, state } )`.

**Example.**

```html
<div data-wp-interactive="elementor/pricing-card"
     data-wp-context='{"monthly":19,"yearly":190,"period":"monthly"}'>
  <p data-wp-text="state.price">19</p>
  <button data-wp-on--click="actions.toggle">Toggle</button>
</div>
```

```js
import { store, getContext } from '@wordpress/interactivity';

store( 'elementor/pricing-card', {
	state: {
		get price() {
			const ctx = getContext();
			return 'monthly' === ctx.period ? ctx.monthly : ctx.yearly;
		},
	},
	actions: {
		toggle() {
			const ctx = getContext();
			ctx.period = 'monthly' === ctx.period ? 'yearly' : 'monthly';
		},
	},
} );
```

**Pros**

- WP-native, CSP-safe (no expression evaluation at all — only store references), server-side directive processing built in.
- First-class nested contexts, namespaces, derived state, client navigation.
- Script modules (`wp_register_script_module`) give clean static loading.

**Cons**

- New runtime (Preact signals) on top of Alpine which we already ship → extra bytes when mixed with tabs/form.
- Server directive processing runs on the whole output (`WP_Interactivity_API` HTML processor) → extra server cost we don't control; mixing with our Twig/cache layers needs validation.
- Canvas integration unknown — the editor re-renders elements via Backbone/Twing; Interactivity API hydration on re-render is not designed for that.
- Less LLM familiarity than Alpine; ESM-only modules complicate our Vite/Babel ES5 pipeline.

### Option D — Elementor-native runtime (signals + frontend-handlers)

**Overview.** Same contract and `$$type: state` bindings, but bindings are emitted as data attributes (`data-e-bind="text:price"`) and a small Elementor runtime (evolution of the POC store, ~2–3 KB) applies them. Behaviors register through `@elementor/frontend-handlers` (`register({ elementType, callback })`) and receive a scoped store.

**Example.**

```html
<p class="e-paragraph" data-e-bind="text:price">19</p>
```

```js
register( {
	elementType: 'custom/pricing-card',
	id: 'pricing-card',
	callback: ( { element, store } ) => {
		store.derive( 'price', ( s ) => ( 'monthly' === s.period ? s.monthly : s.yearly ) );
		element.querySelector( '.e-button' ).addEventListener( 'click', () =>
			store.set( 'period', ( p ) => ( 'monthly' === p ? 'yearly' : 'monthly' ) ) );
	},
} );
```

**Pros**

- Full control of API shape, size and editor integration; no third-party semantics to migrate away from.
- Reuses existing frontend-handlers lifecycle (already wired to `elementor/element/render` in canvas).

**Cons**

- We build and maintain a reactive runtime (scoping, derived values, lists, cleanup) that Alpine/WP already provide.
- Imperative DOM code in behaviors is more error-prone and less LLM-friendly than declarative directives.
- More code to ship and test; risk of re-inventing Alpine poorly.

### Option E — Client-side re-render (Twing on the frontend)

**Overview.** Ship Twing + element templates to the frontend and re-render an instance's subtree whenever state changes (like the editor canvas does).

**Pros**

- Bindings work everywhere a template can render (lists, conditions) with one mechanism.

**Cons**

- Large bundle (Twing + templates) on every page with a custom element — fails the performance requirement.
- Re-render destroys focus/inner handlers; heavy for frequent updates.
- Not recommended; listed for completeness.

### Comparison

| Requirement / concern | A. POC | B. Alpine | C. WP Interactivity | D. Native | E. Re-render |
|---|---|---|---|---|---|
| General tab / native controls | ✗ | ✓ | ✓ | ✓ | ✓ |
| Component save / overridables | partial | ✓ | ✓ | ✓ | ✓ |
| User-JS standards / CSP | ✗ | ✓ | ✓ | ✓ | ✓ |
| JS hidden from editor | ✗ | ✓ | ✓ | ✓ | ✓ |
| Nesting / scoping | partial | ✓ native | ✓ native | build it | build it |
| Editor preview | ✓ | ✓ (initTree exists) | unknown | ✓ | ✓ |
| Lighthouse cost | low | low (already shipped) | medium (new runtime) | low | high |
| LLM authoring | easy | easy | medium | medium | n/a |
| Build/maintain effort | low | medium | medium-high | high | high |

## 8. Conclusion

Recommended direction: **Option B — declarative contract with Alpine CSP as the runtime**, with the contract designed runtime-agnostic so option C or D stays possible later.

Concretely, the refactor of the POC would be:

1. **Data contract = props schema.** Replace `state_params` with a props schema on the custom element definition; reuse `Props_Parser`, controls and component overridables. Page state becomes a page-level data source, not a separate mechanism.
2. **Bindings = prop type.** Add `$$type: state` (path into the instance scope), surfaced in the same picker as dynamic tags. Server transformer resolves the initial value; the Twig render path emits the matching Alpine directive on the existing element markup. Remove `{{state.x}}` text matching.
3. **Behavior = registered static module.** Replace inline `handlers` with a behavior name; code is stored as a static file (generated like `Post_CSS` files, or registered by plugins), authored only with `unfiltered_html`, enqueued through `get_script_depends()`. No `new Function`.
4. **Scopes = Alpine scopes.** One `x-data` per instance with serialized initial state; nested instances nest naturally; parent → child communication through props bindings, child → parent through dispatched events.
5. **Preview = canvas Alpine init.** Default editor view shows SSR state; a preview toggle runs behaviors in the canvas (same pattern as interactions' play).
6. **Data sources = registry.** Keep the POC sources behind a `register_data_source` registry with caching; evaluate reusing v4 dynamic tags as sources.
7. **MCP** writes definitions (contract + tree + bindings) and, for capable users only, behavior files; the existing `build-composition` / `manage-elements` abilities keep working on instance data.
8. **Versioning.** Definitions carry `version`; migrations follow the prop-type migration pattern.

This keeps every user-facing surface on existing infrastructure (controls, components, dynamic-like props, Alpine) and confines new code to the contract, the `state` prop type and the behavior registry.

## 9. Open questions

1. **Where do definitions live?** Extend components (`elementor_component` + contract + behavior), or a new CPT / code-only registration (PHP class or JSON in a plugin)? Can a custom element be created by non-admins if it has no behavior?
2. **Behavior authoring UX.** If JS is not editable in the editor, where do admins edit it — a dedicated admin screen (like Custom Code), MCP only, or plugin files only?
3. **Core vs Pro.** Which parts ship in Core (contract, bindings, runtime) and which in Pro (behavior authoring, data sources)?
4. **Runtime choice.** Confirm Alpine CSP over WP Interactivity API. Are we fine with Alpine semantics becoming part of a (semi-)public API?
5. **Binding surface.** Which targets are in scope for v1 — text only, attributes (`href`, `src`), visibility, classes, lists/loops? Lists need an SSR story.
6. **Data in controls.** Should `$$type: state` be implemented as a new v4 dynamic tag group ("Element data") reusing `DynamicSelection`, or a separate prop type with its own picker?
7. **Scoping rules.** Can a child read parent state implicitly (lexical scope like Alpine), or only through explicit props (component-like isolation)? Explicit is safer for reuse; implicit is easier.
8. **Data sources.** Which sources for v1, caching policy, and should third parties register sources (filter/registry)? Reuse dynamic tags as sources?
9. **Two-way binding.** Do form inputs write back to state (`x-model`) in v1?
10. **Preview mode.** Always-on interactivity in the canvas, or explicit preview toggle? How do we avoid behaviors fighting with editor selection/clicks?
11. **Multisite / capabilities.** Is `unfiltered_html` the right gate, or a role-manager capability like `custom-html`?
12. **Migration from the POC.** Do we need to migrate POC data (`handlers`, `state_params`, page state) or drop it since it is experiment-only?
13. **Performance budget.** What is the measurable budget (KB, TBT, editor render time) and where do we measure it in CI?
14. **Security review.** When do we involve security for the behavior storage/enqueue flow?

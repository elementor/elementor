# Data Flow Guide

Data Flow makes a page stateful using only Elementor elements. State lives in nested **scopes**: the page is the outermost scope, any container can open its own scope, and every component instance gets one. Text reads state with `{{state.key}}` bindings, styles read it as CSS variables, and per-element **actions** write it. Actions are data, not code: each one names a built-in or custom action and passes typed arguments. It requires the `e_data_flow` experiment.

## The model

| Piece | Where it lives | How to set it |
|---|---|---|
| Page scope | Document settings | `elementor/update-page-settings` |
| Container scope | `state_params` on a container | `state_params` in `elementor/build-composition`, or on `action=update` in `elementor/manage-elements` |
| Component params | `state_params` on the component's root container | `state_params` in `elementor/manage-component` (the root `configuration-id`) |
| Component instance values | `state` on an `<e-component>` | `state` in `elementor/build-composition`, or on `action=update` in `elementor/manage-elements` |
| Text bindings | Any text setting (heading title, paragraph, button text, ...) | `element_config` |
| Style from state | Any style prop, e.g. `transform` or `opacity` | `var(--e-state-<key>)` as a custom value |
| Actions | Per element | `actions` in `elementor/build-composition` / `elementor/manage-component`, or on `action=update` in `elementor/manage-elements` |
| Custom actions | Site-wide, by name | `custom_actions` in `elementor/build-composition`, `elementor/manage-component` or `elementor/manage-elements` (administrators only) |

Actions run on the published or previewed frontend page only. The editor canvas renders bindings and CSS variables with their initial values but does not run actions.

## Choosing a scope

- **Page scope**: values the whole page shares, or WordPress data (post title, latest posts, the visitor).
- **Container scope**: a self-contained widget on the page (a calculator, a tab set, a counter). Keys stay local, so two sections can both use `count` without clashing.
- **Component params**: a reusable stateful block. Declare its params on the component's root container, then give each instance its own values.

## Reading and writing (lexical, nearest wins)

- **Read**: `{{state.key}}`, `on: "state"` actions and custom actions' `store.getState()` see a merged view. The nearest scope that defines the key wins, and the page is the outermost.
- **Write**: actions write to the nearest scope that defines `key`. If none defines it, they write to the element's own nearest scope.
- **CSS variables**: each scope publishes the keys it defines as `--e-state-<key>` on its root element (the page scope on `:root`), so descendants inherit the nearest value like any CSS variable.

So a button inside a counter section increments the section's `count`, and a page-level `site_name` is still readable from inside it.

## 1. Page state

Two document settings, merged in this order (sources win on key collisions):

- `e_data_flow_static_state`: a JSON **string** with the initial state, e.g. `"{\"count\":0,\"amount\":4169}"`.
- `e_data_flow_sources`: an array of `{ "key": "<state key>", "source": "<source>", "count": <int, latest_posts only> }`, resolved on the server at render time.

Available sources:

- `post_title`, `post_excerpt`, `post_date`, `post_author`: the current post.
- `site_name`, `site_description`: the site.
- `user_logged_in` (boolean), `user_display_name`: the visitor.
- `latest_posts`: an array of `{ id, title, link }`. `count` sets how many (default 3, maximum 20).

## 2. Container scopes: `state_params`

`state_params` maps a container `configuration-id` to a list of params. The declared params, with their defaults, are the scope's initial state.

```json
"state_params": {
  "counter": [
    { "key": "count", "label": "Count", "type": "number", "default": 0 },
    { "key": "step", "label": "Step", "type": "number", "default": "{{state.default_step}}" }
  ]
}
```

- `key`: letters, digits and underscores, starting with a letter or underscore. Unique per container.
- `type`: `string`, `number`, `boolean` or `json`. Defaults and values are coerced to the type (`"5"` becomes `5` for `number`, `"true"` becomes `true` for `boolean`, and a JSON string is decoded for `json`).
- `default`: a value of that type, or a `{{state.key}}` string. A bound default is resolved **once**, when the scope is created, from params declared earlier in the same list and then the enclosing scopes ("props down"). After that the value is independent.
- At most 20 params per container. Invalid params are dropped with a `state_params_invalid` warning. Send `[]` (or `null` on `manage-elements`) to remove the scope.

## 3. Component params and instance values

A component's params are the `state_params` on its root container. Declare them in `elementor/manage-component` with the root's `configuration-id`. `elementor/list-components` with `component_ids` returns them as `state_params`.

Each `<e-component>` instance can override them with a `state` map keyed by the instance's `configuration-id`:

```json
"state": {
  "first-counter": { "start": 10 },
  "second-counter": { "start": "{{state.page_start}}" }
}
```

- Only declared keys are kept. Unknown keys produce `state_unknown_key`, values that do not match the type produce `state_type_mismatch` (the default is kept), and a `state` map on anything other than an `<e-component>` produces `state_target_not_component`.
- A value may be a `{{state.key}}` string, resolved once from the scope that contains the instance.
- Instances of the same component never share state.

## 4. Text bindings

Write `{{state.key}}` anywhere inside a text setting. Dot paths reach into objects and arrays: `{{state.model.name}}`, `{{state.latest_posts.0.title}}`.

- The server renders the initial value from the element's scope chain, and the text updates automatically whenever that state changes.
- `null` or missing values render as an empty string. Objects and arrays render as JSON, so bind a leaf value instead.
- Bindings work in **text content only**. They do not work in attributes (link URLs, image sources, input values or placeholders) or inside `<script>`, `<style>`, or `<textarea>`.
- To show a formatted value, store the formatted string in its own key, such as `amount_label` (a custom action can compute it).

## 5. Actions

`actions` maps each `configuration-id` (or each element on `manage-elements`) to a list of actions. There are two kinds: **event actions** run an action when something happens, and **input actions** continuously write state from the pointer, scroll, drag or time. At most 20 actions per element. Invalid actions are dropped with an `action_invalid` warning that says why. Sending `[]` clears an element's actions.

Actions are stored as typed props, so every argument is validated and sanitized on save. They never contain code, and any editor can configure them.

### Event actions: `{ "on", "key"?, "do", "args"? }`

- `on`: `load` (once on page load), `state` (once with the current value, then whenever `key` changes), or a DOM event on the element's rendered root: `click`, `dblclick`, `pointerenter`, `pointerleave`, `pointerdown`, `pointerup`, `focus`, `blur`, `input`, `change`, `submit`. `input`, `change` and `submit` bubble, so a container can listen for its descendants.
- `key`: required with `on: "state"`.
- `do`: the action name. `args`: the action's arguments; unknown arguments make the action invalid.

Built-in actions:

| `do` | `args` | What it does |
|---|---|---|
| `state/set` | `key`, `value` | Sets `key` to `value` (string, number or boolean). |
| `state/toggle` | `key` | Flips a boolean. |
| `state/increment` | `key`, `by`?, `min`?, `max`?, `wrap`? | Adds `by` (default 1, negative to decrement), clamped to `min`/`max`, or wrapped around when `wrap` is `true`. |
| `state/cycle` | `key`, `values` | Moves to the next value in `values` (tabs, palettes, modes). |
| `state/random` | `key`, `values` | Picks a different random value from `values` (shuffle). |
| `state/from-input` | `key` | Writes the value of the field that fired the event: `checked` for checkboxes, a number when the key holds a number. Use with `input` or `change`. |
| `class/toggle` | `class_name`, `selector`?, `equals`? | Toggles a class. With `on: "state"`, the class is on while the value is truthy, or equals `equals`. |
| `element/visible` | `selector`?, `equals`? | Use with `on: "state"`. Shows the target while the value is truthy, or equals `equals`. |
| `attribute/set` | `name`, `value`?, `selector`? | Sets a `data-*` or `aria-*` attribute to `value`, or to the state value with `on: "state"`. |
| `animation/playback-rate` | `rate`?, `selector`? | Sets the playback rate of the target's CSS animations to `rate`, or to the state value with `on: "state"`. |

`selector` is a CSS selector inside the closest scope root; without it, the target is the element itself.

### Input actions: `{ "input", "space"?, "inertia"?, "reducedMotion"?, "write" }`

| `input` | Values (`from`) | Notes |
|---|---|---|
| `pointer` | `x`, `y` (-1..1), `px`, `py` (pixels), `inside` (1 or 0) | `space: "global"` (default) tracks the viewport. `space: "local"` tracks the element and returns to 0 when the pointer leaves. |
| `scroll` | `y` (pixels), `progress` (0..1), `velocity` (px/s, signed), `speed` (px/s) | Global progress is through the page. Local progress is the element passing through the viewport (0 entering at the bottom, 1 leaving at the top). |
| `drag` | `x`, `y` (pixels), `angle` (degrees around the element center), `velocity` (deg/s), `dragging` (1 or 0) | Values keep accumulating. `inertia` (0..1, default 0.95) keeps them moving after release. |
| `time` | `t` (seconds) | Advances only while the element is on screen. |

`write` maps a state key to how it follows an input value:

```json
"write": {
  "tilt_x": { "from": "y", "map": [ -1, 1, 12, -12 ], "spring": { "stiffness": 170, "damping": 20 } }
}
```

- `from`: one of the input's values.
- `map`: `[inMin, inMax, outMin, outMax]`, a linear remap. It is clamped to the output range unless `clamp` is `false`.
- `smooth` (0..1): eases toward the target; higher is smoother. `spring`: physical easing with `stiffness` (default 170), `damping` (default 26) and `mass` (default 1). Use one of them or neither.
- `decay` (0..1): holds peaks and releases them slowly, e.g. to keep a scroll `speed` from dropping to 0 between frames.
- `round`: decimals to keep.

Input actions run in one shared animation frame loop that stops while nothing moves. When the visitor prefers reduced motion they are skipped, so the keys keep their initial values; set `"reducedMotion": "run"` only for input that is not motion, such as a drag-to-scrub control.

## 6. Styling from state: CSS variables

Every number, boolean (`1` or `0`) and short plain string key is published as `--e-state-<key>`. Use it in any style prop as a custom value, and combine it with `calc()`:

- `transform`: `rotateX(calc(var(--e-state-tilt_x) * 1deg)) rotateY(calc(var(--e-state-tilt_y) * 1deg))`
- `opacity`: `var(--e-state-reveal)`
- `filter`: `blur(calc(var(--e-state-speed) * 0.01px))`

Inside `transform`, use `translate*`, `scale*` and `rotate`/`rotateX`/`rotateY`/`rotateZ`; other functions such as `perspective()` or `skew()` move the whole declaration to custom CSS. For depth, give the **parent** `perspective: 800px`.

The server prints the initial values, so the first paint is already correct. Prefer CSS variables over class toggles for anything continuous. Useful style props for motion: `transform`, `transform-style` (`preserve-3d`), `backface-visibility`, `filter`, `backdrop-filter`, `mask-image`, `clip-path`, `pointer-events`, `will-change` and `isolation`. Add `will-change: transform` only on elements that move continuously.

## 7. Custom actions: `custom_actions`

Use a custom action only when the built-ins and input actions cannot express the behavior (fetching data, formatting numbers, a canvas). Send it in `custom_actions` on `elementor/build-composition`, `elementor/manage-component` or `elementor/manage-elements`. It is saved once for the whole site, before that call applies element actions, so the same call can already use it: `{ "on": "state", "key": "price", "do": "acme/format-price", "args": { "to": "price_label" } }`. Editors pick it from the action list and fill its arguments; they never see or edit the code.

```json
"custom_actions": [
  {
    "name": "acme/format-price",
    "label": "Format price",
    "args": { "to": { "type": "string", "label": "Write to key" }, "currency": { "type": "string" } },
    "code": "( { args, store, value } ) => { store.setState( args.to, new Intl.NumberFormat( undefined, { style: 'currency', currency: args.currency || 'USD' } ).format( Number( value ) || 0 ) ); }"
  }
]
```

- `name`: `namespace/action` in lowercase letters, numbers and dashes. The `state`, `class`, `element`, `attribute` and `animation` namespaces are reserved. Saving an existing name replaces it; `{ "name": "...", "delete": true }` deletes it.
- `args`: `{ argName: { type, label? } }` with `type` one of `string`, `number`, `boolean`, `string-array` or `value` (string, number or boolean). Element arguments are validated against these types.
- `code`: a JavaScript function expression that receives `{ args, element, store, event, value }`:
  - `store.getState()`, `store.setState( key, valueOrUpdater )`, `store.setState( { a, b } )` and `store.subscribe( key, listener )` work on the element's scope chain.
  - `event` is the DOM event for DOM events; `value` is the new value for `on: "state"`.
  - State is replaced, never mutated: `store.setState( 'items', ( items ) => [ ...items, item ] )`.
- Only administrators with `unfiltered_html` can save custom actions. For anyone else they are skipped with a `custom_actions_forbidden` warning; an invalid one produces `custom_action_invalid`. With `dry_run`, they are validated but not saved.
- The code is published as a static script and loaded only on pages that use the action. Errors are caught and logged per action.
- Every action available on this site (built-in, plugin and custom) is listed with its argument schema in the `elementor://data-flow/actions` resource. Custom actions include their code there for administrators, so read it before updating one.

## User input

Use the form field elements (`e-form-input`, `e-form-select`, `e-form-checkbox`, `e-form-radio-button`, ...) for input. `build-composition` requires every form field to be nested inside an `<e-form>`, and every `<e-form>` to contain exactly one `<e-form-submit-button>`.

- Use `{ "on": "input", "do": "state/from-input", "args": { "key": "amount" } }` on each field so results update live without submitting.
- Buttons outside a form (`e-button`) are the simplest triggers for actions like increment, reset, or presets.

## Example: a reusable Counter component

1. Create the component with `elementor/manage-component` (`action=create`). Its root container declares the params `start` and `label`, plus `count`, which starts from `start`:

```xml
<e-flexbox configuration-id="counter-root">
  <e-heading configuration-id="value"/>
  <e-button configuration-id="increment"/>
  <e-button configuration-id="reset"/>
</e-flexbox>
```

```json
{
  "element_config": {
    "value": { "title": "{{state.label}}: {{state.count}}" },
    "increment": { "text": "+1" },
    "reset": { "text": "Reset" }
  },
  "state_params": {
    "counter-root": [
      { "key": "start", "label": "Start", "type": "number", "default": 0 },
      { "key": "label", "label": "Label", "type": "string", "default": "Count" },
      { "key": "count", "label": "Count", "type": "number", "default": "{{state.start}}" }
    ]
  },
  "actions": {
    "increment": [ { "on": "click", "do": "state/increment", "args": { "key": "count" } } ],
    "reset": [ { "on": "click", "do": "state/set", "args": { "key": "count", "value": 0 } } ]
  }
}
```

2. Place it twice with `elementor/build-composition`, giving each instance its own values:

```xml
<e-flexbox configuration-id="counters">
  <e-component configuration-id="likes"/>
  <e-component configuration-id="visits"/>
</e-flexbox>
```

```json
{
  "element_config": {
    "likes": { "component_id": 123 },
    "visits": { "component_id": 123 }
  },
  "state": {
    "likes": { "label": "Likes", "start": 10 },
    "visits": { "label": "Visits", "start": 100 }
  }
}
```

Each instance renders and counts independently, starting at "Likes: 10" and "Visits: 100".

## Example: a 3D tilt card

The card opens a scope with two keys, a local pointer input springs them toward the pointer, and the card's `transform` reads them as CSS variables:

```json
{
  "state_params": {
    "card": [
      { "key": "tilt_x", "label": "Tilt X", "type": "number", "default": 0 },
      { "key": "tilt_y", "label": "Tilt Y", "type": "number", "default": 0 }
    ]
  },
  "actions": {
    "card": [ {
      "input": "pointer",
      "space": "local",
      "write": {
        "tilt_x": { "from": "y", "map": [ -1, 1, 12, -12 ], "spring": { "damping": 18 } },
        "tilt_y": { "from": "x", "map": [ -1, 1, -12, 12 ], "spring": { "damping": 18 } }
      }
    } ]
  }
}
```

Then style `card` with `transform: rotateX(calc(var(--e-state-tilt_x) * 1deg)) rotateY(calc(var(--e-state-tilt_y) * 1deg)); will-change: transform;` and its parent with `perspective: 800px;`. When the pointer leaves, the keys spring back to 0.

Form elements come from Elementor Pro. Check every setting name against `elementor://widgets/schema/{type}` before use.

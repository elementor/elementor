# Data Flow Guide

Data Flow makes a page stateful using only Elementor elements. State lives in nested **scopes**: the page is the outermost scope, any container can open its own scope, and every component instance gets one. Text reads state with `{{state.key}}` bindings, and per-element JavaScript handlers read and write it. It requires the `e_data_flow` experiment.

## The model

| Piece | Where it lives | How to set it |
|---|---|---|
| Page scope | Document settings | `elementor/update-page-settings` |
| Container scope | `state_params` on a container | `state_params` in `elementor/build-composition`, or on `action=update` in `elementor/manage-elements` |
| Component params | `state_params` on the component's root container | `state_params` in `elementor/manage-component` (the root `configuration-id`) |
| Component instance values | `state` on an `<e-component>` | `state` in `elementor/build-composition`, or on `action=update` in `elementor/manage-elements` |
| Text bindings | Any text setting (heading title, paragraph, button text, ...) | `element_config` |
| Handlers | Per element | `handlers` in `elementor/build-composition` / `elementor/manage-component`, or on `action=update` in `elementor/manage-elements` |

Handlers run on the published or previewed frontend page only. The editor canvas renders bindings with their initial values but does not run handlers.

## Choosing a scope

- **Page scope**: values the whole page shares, or WordPress data (post title, latest posts, the visitor).
- **Container scope**: a self-contained widget on the page (a calculator, a tab set, a counter). Keys stay local, so two sections can both use `count` without clashing.
- **Component params**: a reusable stateful block. Declare its params on the component's root container, then give each instance its own values.

## Reading and writing (lexical, nearest wins)

- **Read**: `{{state.key}}`, `state` and `getState()` see a merged view. The nearest scope that defines the key wins, and the page is the outermost.
- **Write**: `setState('key', ...)` writes to the nearest scope that defines `key`. If none defines it, it writes to the element's own nearest scope.
- **Subscribe**: `subscribe('key', listener)` fires when the scope that provides `key` changes.

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
- Format values in a handler (for example with `toLocaleString()`) and store the formatted string in its own key, such as `amount_label`.

## 5. Handlers

`handlers` maps each `configuration-id` (or each element on `manage-elements`) to a list of `{ "event": "<event>", "code": "<JavaScript>" }`. A handler reads and writes the scope its element sits in.

Events:

- `init`: runs once when the page loads, with `event` set to `null`. Use it for subscriptions, derived values, and initial DOM setup.
- `click`, `input`, `change`, `submit`, `mouseenter`, `mouseleave`: DOM events on the element's rendered root. `input`, `change`, and `submit` bubble, so a container can listen for its descendants.

Limits: at most 10 handlers per element, and `code` must be a non-empty string. Invalid handlers are dropped with a `handler_invalid` warning. Sending `[]` clears an element's handlers.

`code` is the body of a function. These names are in scope:

| Name | Meaning |
|---|---|
| `element` | The element's rendered root DOM node. |
| `event` | The DOM event, or `null` for `init`. |
| `state` | The merged state of the element's scope chain (read-only; always fresh). |
| `getState()` | Returns the merged state. |
| `setState(key, valueOrUpdater)` | Sets one key in the scope that defines it. Pass a function to compute from the previous value: `setState('count', (c) => c + 1)`. |
| `setState({ a: 1, b: 2 })` | Sets several keys at once, each in its own defining scope. |
| `subscribe(key, listener)` | Calls `listener(value, key, state)` after `key` changes. Use `'*'` for any key. Returns an unsubscribe function. |

Rules:

- State is replaced, never mutated. Build new objects and arrays: `setState('items', (items) => [...items, item])`.
- Setting a value that is identical (`Object.is`) to the current one does not notify listeners.
- Declare every key a scope writes in its `state_params`. Otherwise the first write creates it in the nearest scope, which may not be the one you meant.
- Read form values from the event: `event.target.value`. Number inputs return strings, so convert them with `Number(...)`.
- Compute derived values (totals, labels, flags) in one place: an `init` handler that subscribes to the inputs and writes the derived keys.
- Conditional visibility: in `init`, subscribe and toggle `element.hidden` or `element.style.display`.
- Errors are caught and logged per handler, so one broken handler does not stop the others.

Saving handlers requires the `unfiltered_html` capability. For other users they are removed on save, and the response includes a `handlers_stripped_on_save` warning. `state_params` and `state` are plain data and need no special capability.

## User input

Use the form field elements (`e-form-input`, `e-form-select`, `e-form-checkbox`, `e-form-radio-button`, ...) for input. `build-composition` requires every form field to be nested inside an `<e-form>`, and every `<e-form>` to contain exactly one `<e-form-submit-button>`.

- Drive state from `input` or `change` handlers, so results update live without submitting.
- If a submit should only update state, add a `submit` handler that calls `event.preventDefault()`, and verify the result with `elementor/create-preview-link`.
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
  "handlers": {
    "increment": [ { "event": "click", "code": "setState('count', (count) => count + 1);" } ],
    "reset": [ { "event": "click", "code": "setState('count', getState().start);" } ]
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

Form elements come from Elementor Pro. Check every setting name against `elementor://widgets/schema/{type}` before use.

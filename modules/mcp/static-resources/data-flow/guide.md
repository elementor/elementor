# Data Flow Guide

Data Flow makes a page stateful using only Elementor elements: one page-level state object, `{{state.key}}` bindings in any text, and per-element JavaScript handlers that read and write that state. It requires the `e_data_flow` experiment.

## The model

| Piece | Where it lives | How to set it |
|---|---|---|
| Page state | Document settings | `elementor/update-page-settings` |
| Text bindings | Any text setting (heading title, paragraph, button text, ...) | `element_config` in `elementor/build-composition` |
| Handlers | Per element | `handlers` in `elementor/build-composition`, or `handlers` on `action=update` in `elementor/manage-elements` |

State, bindings, and handlers run on the published or previewed frontend page only. The editor canvas shows the raw `{{state.key}}` text and does not run handlers.

## Workflow

1. Set the initial state with `elementor/update-page-settings`.
2. Build the layout with `elementor/build-composition`. Put `{{state.key}}` in text settings, and attach handlers by `configuration-id` in the same call.
3. Adjust later with `elementor/manage-elements` (`action=update`, `handlers`), using element IDs from the `resolved_xml` response.
4. Validate with `elementor/create-preview-link`.

## 1. Page state

Two document settings, merged in this order (sources win on key collisions):

- `e_data_flow_static_state`: a JSON **string** with the initial state, e.g. `"{\"count\":0,\"amount\":4169}"`.
- `e_data_flow_sources`: an array of `{ "key": "<state key>", "source": "<source>", "count": <int, latest_posts only> }`, resolved on the server at render time.

Available sources:

- `post_title`, `post_excerpt`, `post_date`, `post_author`: the current post.
- `site_name`, `site_description`: the site.
- `user_logged_in` (boolean), `user_display_name`: the visitor.
- `latest_posts`: an array of `{ id, title, link }`. `count` sets how many (default 3, maximum 20).

Use `snake_case` keys. Bindings only match letters, digits, and underscores, so a key like `total-price` cannot be bound.

## 2. Text bindings

Write `{{state.key}}` anywhere inside a text setting. Dot paths reach into objects and arrays: `{{state.model.name}}`, `{{state.latest_posts.0.title}}`.

- The server renders the initial value, and the text updates automatically whenever the state changes.
- `null` or missing values render as an empty string. Objects and arrays render as JSON, so bind a leaf value instead.
- Bindings work in **text content only**. They do not work in attributes (link URLs, image sources, input values or placeholders) or inside `<script>`, `<style>`, or `<textarea>`.
- Format values in a handler (for example with `toLocaleString()`) and store the formatted string in its own key, such as `amount_label`.

```json
"element_config": {
  "count-label": { "paragraph": "Clicked {{state.count}} times" }
}
```

## 3. Handlers

`handlers` maps each `configuration-id` (or each element on `manage-elements`) to a list of `{ "event": "<event>", "code": "<JavaScript>" }`.

Events:

- `init`: runs once when the page loads, with `event` set to `null`. Use it for subscriptions, derived values, and initial DOM setup.
- `click`, `input`, `change`, `submit`, `mouseenter`, `mouseleave`: DOM events on the element's rendered root. `input`, `change`, and `submit` bubble, so a container can listen for its descendants.

Limits: at most 10 handlers per element, and `code` must be a non-empty string. Invalid handlers are dropped with a `handler_invalid` warning. Sending `[]` clears an element's handlers.

`code` is the body of a function. These names are in scope:

| Name | Meaning |
|---|---|
| `element` | The element's rendered root DOM node. |
| `event` | The DOM event, or `null` for `init`. |
| `state` | The current state snapshot (read-only; always fresh). |
| `getState()` | Returns the current state. |
| `setState(key, valueOrUpdater)` | Sets one key. Pass a function to compute from the previous value: `setState('count', (c) => c + 1)`. |
| `setState({ a: 1, b: 2 })` | Merges several keys at once. |
| `subscribe(key, listener)` | Calls `listener(value, key, state)` after `key` changes. Use `'*'` for any key. Returns an unsubscribe function. |

Rules:

- State is replaced, never mutated. Build new objects and arrays: `setState('items', (items) => [...items, item])`.
- Setting a value that is identical (`Object.is`) to the current one does not notify listeners.
- Read form values from the event: `event.target.value`. Number inputs return strings, so convert them with `Number(...)`.
- Compute derived values (totals, labels, flags) in one place: an `init` handler that subscribes to the inputs and writes the derived keys.
- Conditional visibility: in `init`, subscribe and toggle `element.hidden` or `element.style.display`.
- Errors are caught and logged per handler, so one broken handler does not stop the others.

Saving handlers requires the `unfiltered_html` capability. For other users they are removed on save, and the response includes a `handlers_stripped_on_save` warning.

## User input

Use the form field elements (`e-form-input`, `e-form-select`, `e-form-checkbox`, `e-form-radio-button`, ...) for input. `build-composition` requires every form field to be nested inside an `<e-form>`, and every `<e-form>` to contain exactly one `<e-form-submit-button>`.

- Drive state from `input` or `change` handlers, so results update live without submitting.
- The form keeps its own submit behavior. If a submit should only update state, add a `submit` handler that calls `event.preventDefault()`, and verify the result with `elementor/create-preview-link`.
- Buttons outside a form (`e-button`) are the simplest triggers for actions like increment, reset, or presets.

## Example: budget calculator

Page settings:

```json
{ "e_data_flow_static_state": "{\"amount\":4169,\"price\":4169,\"equivalent\":\"1.00\"}" }
```

Composition:

```xml
<e-flexbox configuration-id="calculator">
  <e-form configuration-id="budget-form">
    <e-form-input configuration-id="amount-input"/>
    <e-form-submit-button configuration-id="calculate"/>
  </e-form>
  <e-heading configuration-id="result"/>
  <e-button configuration-id="reset"/>
</e-flexbox>
```

```json
{
  "element_config": {
    "amount-input": { "type": "number", "value": "4169" },
    "calculate": { "text": "Calculate" },
    "result": { "title": "{{state.equivalent}} iPhones" },
    "reset": { "text": "Reset" }
  },
  "handlers": {
    "calculator": [
      { "event": "init", "code": "const update = () => setState('equivalent', (getState().amount / getState().price).toFixed(2)); subscribe('amount', update); update();" }
    ],
    "budget-form": [
      { "event": "submit", "code": "event.preventDefault();" }
    ],
    "amount-input": [
      { "event": "input", "code": "setState('amount', Number(event.target.value) || 0);" },
      { "event": "init", "code": "const input = element.matches('input') ? element : element.querySelector('input'); subscribe('amount', (amount) => { if (input && Number(input.value) !== amount) input.value = String(amount); });" }
    ],
    "reset": [
      { "event": "click", "code": "setState('amount', 4169);" }
    ]
  }
}
```

Form elements come from Elementor Pro. Check every setting name against `elementor://widgets/schema/{type}` before use.

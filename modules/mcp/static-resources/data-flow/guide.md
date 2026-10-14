# Data Flow Guide

Data Flow makes a page stateful using only Elementor elements. Containers declare **typed state**, elements **bind** to it, and an administrator-approved **snippet** changes it in response to events. It requires the `e_data_flow` experiment.

State is read only through bindings. A snippet never touches the DOM or CSS: it changes state, and bindings, state CSS variables and boolean states turn that into what the visitor sees.

## The model

| Piece | Where it lives | How to set it |
|---|---|---|
| Page state | Document settings | `elementor/update-page-settings` (`e_data_flow_static_state` JSON string, `e_data_flow_sources`) |
| Container state | `state_params` on a container | `state_params` in `elementor/build-composition`, or `action=update` in `elementor/manage-elements` |
| Component params | `state_params` on a component's root container | `state_params` in `elementor/manage-component` |
| Component instance values | `state` on an `<e-component>` | `state` in `elementor/build-composition` or `elementor/manage-elements` |
| Bindings | Any prop that accepts a dynamic tag: text, number, url, color, image, and attributes such as `aria-*` and `hidden` | The `e-state` dynamic tag (`e-state-image` for image props) in `element_config` |
| Snippets | A hidden library, attached per element | `elementor/manage-snippets`, then `snippets` references |

Scopes are lexical and the nearest wins: a container's keys shadow the page's keys. A snippet writes to the nearest scope that defines the key.

## 1. Declare state: `state_params`

```json
"state_params": {
  "counter": [
    { "key": "count", "label": "Count", "prop_type": "number", "default": 0, "exposed": { "control": "number", "label": "Start at" } },
    { "key": "tone", "label": "Tone", "prop_type": "enum", "options": ["calm", "bold"], "default": "calm" },
    { "key": "open", "label": "Open", "prop_type": "boolean", "default": false }
  ]
}
```

- `prop_type`: `string`, `number`, `boolean`, `json`, `enum` (needs `options`, at most 50), `color`, `size` (`{ "size": 4, "unit": "px" }`), `image` (`{ "src": { "id": 12, "url": "..." } }`). Values are validated and sanitized with the same prop types the widgets use. Invalid defaults fall back to the empty value of the type.
- `key`: letters, digits and underscores, unique per container. At most 20 keys per container.
- `exposed`: shows the key as a control in the container's General tab, so editors can change the default without touching code. Allowed controls: `text`, `number`, `switch`, `select`, `size`, `image`. **At most 5 exposed keys per container.** Expose only what an editor realistically tweaks (a start value, a label, a theme), not every internal key.
- Defaults may be `"{{state.key}}"` to seed once from the enclosing scope.
- Invalid params are dropped with a `state_params_invalid` warning. Send `[]` to remove the scope.

Component params and instance `state` values work the same way: declare params on the component root, then give each `<e-component>` its own values.

## 2. Bind state: the `e-state` dynamic tag

Bind any prop that accepts a dynamic tag with the dynamic tag `e-state` (use `e-state-image` for image props, with a state key of type `image`):

```json
"title": { "$$type": "dynamic", "value": { "name": "e-state", "group": "element-state", "settings": { "key": { "$$type": "string", "value": "count" }, "prefix": { "$$type": "string", "value": "Total: " }, "format": { "$$type": "string", "value": "number" } } } }
```

- Settings: `key` (dot paths reach into json state), `format` (`raw`, `number`, `percent`), `prefix`, `suffix`.
- The server renders the initial value, and the page updates the text whenever the state changes. Missing and null values render as an empty string, and prefix and suffix are dropped with them.
- Bindings work on every widget and prop type that accepts a dynamic tag, including attributes (`href`, `src`, `aria-*`). Boolean attributes (`hidden`, `disabled`, `inert`) are toggled by the truthiness of the value. Url attributes never accept `javascript:` values. A prop whose value a transformer casts (for example a number) renders the initial value but is not updated live.

### State in styles

- **Numbers, sizes and colors** are mirrored to CSS variables `--e-state-<key>` on the scope element. Use them in custom CSS, for example `transform: rotate(calc(var(--e-state-angle) * 1deg))`. Pointer-driven values (a dial, a slider) should go through these variables rather than through re-rendered text.
- **Boolean keys** toggle the class `e--state-<key>` on the scope element. In the style tab they appear as states of every element inside that container (the state selector matches the element and its descendants). Use them for open/closed, selected, error and similar looks.
- Size, number and color state keys appear in the style tab variables picker as `State: <label>`, and can be used as variable values with the id `e-state-<key>`.
- Variables and classes are rendered on the server, so the first paint is already correct. A value that is not safe for CSS (a string with other characters than letters, digits, spaces, `_`, `.`, `-`) is not mirrored.
- Writes are validated against the declared `prop_type`: invalid values are rejected and the previous state is kept.

## 3. Snippets: `elementor/manage-snippets`

Only an administrator with `unfiltered_html` can save snippets and attach them. For anyone else the references are removed on save.

```json
{
  "action": "save",
  "name": "counter",
  "handlers": [
    { "event": "click", "description": "Adds one to the count.", "code": "({ state }) => { state.count += 1; }" },
    { "event": "init", "description": "Starts the count at the exposed start value.", "code": "({ state }) => { state.count = state.start; }" }
  ]
}
```

Attach it with `snippets` (build-composition, manage-component, or `action=update` in manage-elements):

```json
"snippets": { "increment": [ { "snippet": "counter", "event": "click" } ] }
```

Each handler needs an `event`, a short human `description` (editors see it in the Interactions tab), and `code`: **a single function**. Write one handler per event.

Events: `init`, `click`, `input`, `change`, `submit`, `keydown`, `mouseenter`, `mouseleave`, `pointerdown`, `pointermove`, `pointerup`.

The function receives one object:

| Name | Meaning |
|---|---|
| `state` | Read and write the nearest scope: `state.count += 1`. Writes are batched into one update per animation frame, and you can read your own pending writes. |
| `page` | The same, for page state. |
| `event.value` | `target.value` (or `checked` for checkboxes) for input events. |
| `event.local` | `{ x, y, angle, size: { width, height } }` of the pointer relative to the element. `angle` is degrees clockwise from the top. |
| `event.key` | The key of a `keydown`. |
| `event.preventDefault()` | Prevents the default action, for example a form submit. |
| `emit(name, detail)` | Dispatches a bubbling `e-state:<name>` custom event from the element. |

There is no element, no `document` and no `window`. Convert string inputs yourself (`Number(event.value)`). Replace objects and arrays instead of mutating them.

### Guidelines

**Security.** Code is capped at 20 KB per snippet and the following are rejected: `document`, `window`, `innerHTML`/`outerHTML`, `.style`, `querySelector*`/`getElementBy*`, `eval(`, `Function(`, `import(`, `fetch(`, `XMLHttpRequest`. The list is advisory, not a sandbox: only administrators can write code, and the code is published to a static file that is loaded only on pages that use it.

**Performance.** Do not listen to scroll or resize (they are not available). Keep handlers short. For pointer-driven visuals, write numbers to state in `pointermove` and let the `--e-state-<key>` CSS variables do the visual work, not text bindings. Do not store large arrays in state.

**Accessibility.** Attach events only to interactive elements (buttons, links, form fields), and pair every pointer interaction with a keyboard alternative (`click` on a button, or `keydown` for arrow keys). Show state changes in text bindings so assistive technology can read them, and respect `prefers-reduced-motion` in any CSS that uses state variables.

### Error codes

`elementor/manage-snippets` returns an error with one of these codes (all validation errors are listed in `data.errors`): `snippet_invalid_name`, `snippet_no_handlers`, `snippet_too_many_handlers`, `snippet_invalid_event`, `snippet_empty_code`, `snippet_missing_description`, `snippet_not_a_function`, `snippet_forbidden_api`, `snippet_duplicate_event`, `snippet_code_too_large`, `snippet_not_found`, `snippet_forbidden`, `snippet_storage_unavailable`.

Attaching snippets can produce these warnings: `snippet_not_found`, `snippet_event_not_defined`, `snippet_reference_invalid`, `snippets_unknown_configuration_id`, `snippets_stripped_on_save`, `snippets_experiment_off`.

## Page state

- `e_data_flow_static_state`: a JSON **string**, e.g. `"{\"count\":0,\"amount\":4169}"`.
- `e_data_flow_sources`: `[{ "key": "<state key>", "source": "<source>", "count": <int> }]`, resolved on the server. Sources: `post_title`, `post_excerpt`, `post_date`, `post_author`, `site_name`, `site_description`, `user_logged_in` (boolean), `user_display_name`, `latest_posts` (an array of `{ id, title, link }`, `count` up to 20).

Snippets run on the frontend and in the editor canvas. In the canvas they write to a throwaway copy of the state, never to the saved document, and are re-attached whenever an element re-renders. A handler that takes more than 4 ms logs a warning in the preview console.

## User input

Use the form field elements (`e-form-input`, `e-form-select`, `e-form-checkbox`, ...) nested inside an `<e-form>` that contains exactly one `<e-form-submit-button>`. Drive state from `input` or `change` snippets so results update live. If a submit should only update state, add a `submit` handler that calls `event.preventDefault()`.

## Example: a counter

1. Save the snippet shown above with `elementor/manage-snippets`.
2. Build it:

```xml
<e-flexbox configuration-id="counter">
  <e-heading configuration-id="value"/>
  <e-button configuration-id="increment"/>
</e-flexbox>
```

with `state_params` for `counter`, a heading `title` bound to `count` with the `e-state` tag, `increment` text `+1`, and `"snippets": { "increment": [ { "snippet": "counter", "event": "click" } ], "counter": [ { "snippet": "counter", "event": "init" } ] }`.

Check every setting name against `elementor://widgets/schema/{type}` before use. Form elements come from Elementor Pro.

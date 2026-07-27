Returns all components available on this site.

Each component is a user-defined reusable composition of widgets stored as a post. Components can be embedded in any document via the `<e-component>` XML tag in `elementor/build-composition`.

- `id`: numeric post ID used to reference the component
- `name`: the human-readable title the user gave the component
- `uid`: stable string identifier
- `is_archived`: archived components should not be placed in new compositions

Call `elementor/list-component-schemas` with the component `id`s you plan to place (as a `component_ids` array — even for a single one) to discover their overridable props and the value shape for each override.

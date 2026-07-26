Returns all components available on this site.

Each component is a user-defined reusable composition of widgets stored as a post. Components can be embedded in any document via the `<e-component>` XML tag in `elementor/build-composition`.

- `id`: numeric post ID used to reference the component
- `name`: the human-readable title the user gave the component
- `uid`: stable string identifier
- `is_archived`: archived components should not be placed in new compositions

Call `elementor/get-component-schema` with the component `id` before placing it to discover its overridable props and the shorthand format for `element_config`.

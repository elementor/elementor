# COMPOSITE WIDGETS
A composite widget is a ready-made structure of atomic elements (its parts) that is inserted as a whole. Find widget ids in the `composite_widgets` list of `elementor/list-widget-schemas` with `summary=true`, then read a widget's parts and fields with `elementor/get-widget-schemas` and its id (e.g. `["elementor/icon-button"]`).

Place a widget as the self-closing leaf tag `<e-widget configuration-id="buy-button"/>`, and name the widget in `element_config` with `{ "widget_id": "<widget id>" }` only. `<e-widget>` takes no children.

Configure each part under the key `<configuration-id>.<part>` in `element_config`, `style`, `classes` and `interactions`, using the part element's own schema. The widget's `configuration-id` alone styles its root.

```json
{
  "xml_structure": "<e-flexbox configuration-id=\"row\"><e-widget configuration-id=\"buy-button\"/></e-flexbox>",
  "element_config": { "buy-button": { "widget_id": "elementor/icon-button" }, "buy-button.label": { "paragraph": "Buy now" } },
  "style": { "buy-button": "padding: 12px 20px;", "buy-button.label": "color: #111111;" }
}
```

- A key that matches no part is skipped with a `widget_part_not_found` warning. Never reuse a `<configuration-id>.<part>` key as another element's configuration-id.
- The structure is closed: after insertion, settings and styles of its parts can be updated through `elementor/manage-elements`, but parts can't be added, moved, duplicated or deleted. Only a part marked `slot: true` takes new children: pass its element id as `parent_id`.
- Widget ids starting with `site/` are saved site widgets. Adding them needs an active Elementor Pro license; otherwise the call fails with `pro_license_required`. Archived widgets fail with `elementor_widget_archived`, unknown ids with `elementor_widget_not_found`.

Finds icons for the `svg` property of an `e-svg` element, across Font Awesome and any icon packs uploaded to this site. Returns the exact `value` and `library` pair to write - never assemble those strings yourself, and never guess an icon name.

Call this before placing an `e-svg`. Nothing has to be uploaded to the Media Library for an icon to work; `elementor/list-assets` is only for custom SVG artwork such as a client logo.

# WHEN TO CALL

- The user names an icon ("use the cart-shopping icon") - pass that name as the query and take the first exact `name` match.
- The user describes a page and you decide icons belong in it ("create a product page") - pass one query per icon you intend to place, in a single call.

# QUERIES

`queries` takes up to 10 phrases and is answered in one round trip, so batch every icon a page needs instead of calling once per icon:

`{ "queries": ["add to cart", "free shipping", "secure payment", "instagram"] }`

Write queries the way a person would describe the icon ("shopping cart", "credit card", "phone"). Icons are matched on their name, aliases, label, Font Awesome search terms and category, so plain language works better than guessed icon names. Words like "icon", "button" and "page" are ignored because they match almost everything.

An empty `matches` array with `total: 0` means the site genuinely has no such icon. Try a broader phrase ("cart" instead of "shopping trolley"); do not invent a value.

# READING THE RESULTS

Each match is one icon in one style:

```json
{
  "value": "fa-solid fa-cart-shopping",
  "library": "fa-solid",
  "name": "cart-shopping",
  "label": "Cart Shopping",
  "matched_on": "name",
  "license": "free"
}
```

- `value` and `library` are what you write on the element. Copy both verbatim.
- Results are ordered best first. `matched_on: "name"` is a stronger signal than `matched_on: "term"`.
- `license: "pro"` icons are not installed on this site and will render nothing. Only place `license: "free"` icons.
- The same icon often ships in several styles (`fa-solid`, `fa-regular`, `fa-brands`). Prefer `fa-solid` for UI iconography and keep one style across a page. Brand marks only exist in `fa-brands`.
- `libraries` and `categories` in the response list what this site actually has, including uploaded icon packs. Pass `library` or `category` to narrow a search, or `category` alone to browse.
- Paginate with `page` / `per_page` when `truncated` is `true`.

# WRITING THE ICON

With `elementor/build-composition`, the `svg` prop takes plain values:

```json
{ "svg": { "value": "fa-solid fa-cart-shopping", "library": "fa-solid" } }
```

With `configure-element` in the editor, the same icon is a `PropValue`:

```json
{
  "$$type": "icon",
  "value": {
    "value": { "$$type": "string", "value": "fa-solid fa-cart-shopping" },
    "library": { "$$type": "string", "value": "fa-solid" }
  }
}
```

An `e-svg` has no colour or size of its own - it inherits them. Style the element's `width`, `height` and `color` as part of the same composition.

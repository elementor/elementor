# WORDPRESS BEST PRACTICES

Opinionated guidance for building WordPress sites with Elementor via MCP. Load before making structural decisions about pages, posts, and theme templates.

## Repeating layouts / detail pages
When the user describes a design that repeats across posts or pages ("each project", "the product detail page", "make every blog post look like this", "each item links to a page like this"), that is ONE `single` / `single-<cpt>` template driven by dynamic data — NOT N duplicated pages. Never loop `elementor/manage-site-parts` `action: create` to make one page per item.

### Condition scoping — include-all + exclude exceptions
Real sites have one repeating design for a post type plus a few one-off exceptions (bespoke Home, a landing page). Default to a broad include with explicit exclusions:
- Posts of a CPT: `include/singular/<cpt>` + `exclude/singular/<cpt>/<id>` per exception. Built-in posts use `post`; a `project` CPT uses `project`.
- Pages: `include/singular/page` + `exclude/singular/page/<id>` for each page with its own design (Home, About, …).
- Ask the user which items are the exceptions when it is not obvious, and call `elementor/list-site-parts` before creating a new single to avoid duplicates.
- Fall back to `include/singular/<cpt>/<id>` only when the user is explicitly designing for one specific post.

### Post Content slot pattern
Every single template has one optional editorial slot: a `theme-post-content` widget wrapped in a full-width `e-div-block`, placed between the fixed hero and the fixed bottom section. Posts with no body render nothing in that slot; posts with body content render it there.

```xml
<e-div-block configuration-id="Post Hero">...</e-div-block>
<e-div-block configuration-id="Post Body">
  <e-post-content configuration-id="Post Content"></e-post-content>
</e-div-block>
<e-div-block configuration-id="Post Bottom">...</e-div-block>
```

- Wrap with `e-div-block`, NOT `e-flexbox` — a row-direction default would squeeze the article body. Style the wrapper's `max-width` / `padding`.
- Exactly one `theme-post-content` per single template.

### Dynamic tags for the rest
Title, featured image, excerpt, meta, price, CTA link all use dynamic tags on regular widgets (`e-heading` title, `e-image` src, `e-button` link). Read [elementor://dynamic-tags] for allowed tag names. Do NOT hard-code per-post values — the same template renders every post.

### Loop → detail flow
For a listing (loop) whose items link to a detail page: build the loop with a dynamic link on the item wrapper, then create ONE single template as above with `include/singular/<cpt>` + any exclusions. Permalinks come from the dynamic tag; no per-item page.

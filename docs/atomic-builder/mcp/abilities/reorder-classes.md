# reorder-classes

> Audience: external  
> Module: `modules/mcp/abilities/reorder-classes-ability.php`  
> Related: [manage-classes.md](manage-classes.md), [../resources.md](../resources.md), [../../global-classes/api.md](../../global-classes/api.md)

## What it is

Ability ID: **`elementor/reorder-classes`**

Changes global class priority on the active kit without changing class definitions. The first class in the order has the highest priority: when two applied classes set the same CSS property, the earlier class overrides the later one.

## When to use it

Read `elementor://global-classes` first. Use this ability when conflicting declarations between applied global classes produce an incorrect style.

## Input

Provide exactly one of `moves` or `order`.

### Relative moves

Apply up to 50 moves sequentially:

```json
{
  "moves": [
    { "id": "g-accent", "position": "before", "ref": "g-base" },
    { "id": "g-heading", "position": "start" }
  ]
}
```

`position` can be `before`, `after`, `start`, or `end`. `ref` is required for `before` and `after`.

### Explicit order

Use `order` to specify a complete or partial priority sequence:

```json
{
  "order": ["g-heading", "g-accent", "g-base"]
}
```

Every supplied ID must exist and occur only once. Existing IDs omitted from the request are appended in their current relative order and returned in `appended_ids`.

## Output

```json
{
  "changed": true,
  "order": ["g-heading", "g-accent", "g-base"],
  "appended_ids": [],
  "moves": [{ "id": "g-heading", "from": 2, "to": 0 }]
}
```

No-op requests return `changed: false` and do not invalidate generated CSS.

## Internals

The ability writes through `Global_Classes_Repository::apply_changes()` with an order-only change. That updates frontend and preview order metadata, and triggers global CSS cache invalidation.

# Editor Packages

> Status: draft

## Purpose

Reference for the Editor V2 micro-frontend: how PHP modules register JS packages, how packages initialize and inject UI, and which foundation libraries v4 features build on.

## Files

| File | Covers |
|------|--------|
| [overview.md](overview.md) | Micro-frontend architecture, `elementor/editor/v2/packages` filter, package init lifecycle |
| [extending-editor.md](extending-editor.md) | **Primary** — register a package, `init()` pattern, `@elementor/locations`, panel/app-bar extension, v1 adapters |
| [core-packages.md](core-packages.md) | **Snapshot** — currently registered v4 core packages and their PHP owners |
| [libs.md](libs.md) | Foundation libraries (`editor-props`, `editor-styles`, `editor-controls`, etc.) |

## Reading order

1. [overview.md](overview.md) — architecture and lifecycle context
2. [extending-editor.md](extending-editor.md) — how to add or extend a package (registration-first)
3. [libs.md](libs.md) — shared libraries your package will depend on
4. [core-packages.md](core-packages.md) — snapshot of what is registered today (secondary reference)

## Related

- [../architecture/overview.md](../architecture/overview.md) — PHP modules ↔ JS packages high-level map
- [../architecture/packages-map.md](../architecture/packages-map.md) — docs area → PHP path → JS package → tests
- [../mcp/registering-editor-tools.md](../mcp/registering-editor-tools.md) — in-editor MCP tool registration (`editor-mcp`)
- [../../packages/docs/architecture.md](../../packages/docs/architecture.md) — official monorepo architecture doc

# Performance

Only measurable or structural cost; no style.
- PHP: queries or option reads in loops, repeated disk/filesystem work per request, missing caching/transients, autoloaded options, work on every page load that belongs to editor/admin only.
- Frontend: assets loaded on pages that do not use the widget, blocking scripts, layout thrash, large inline CSS, CSS output size.
- Editor/React: unnecessary re-renders, missing memoization on hot paths, state in wrong place, listeners not cleaned up, large lists unvirtualized.
- Bundle: new dependencies and their size, duplicate libs, non-tree-shakeable imports.
- Batched/MCP calls: per-item recomputation of shared data.

State the cost driver (what scales with what). Lens name `performance`. Follow common.md.

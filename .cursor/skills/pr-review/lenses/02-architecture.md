# Architecture

Check boundaries and contracts between modules, not code inside a function.
- Fits V4/atomic and package layering (`docs/atomic-builder/`, `packages/packages/{core,libs,tools}`); no circular or upward imports.
- Uses extension points (registries, hooks, filters) rather than direct coupling or edits to unrelated modules.
- Public API / hook / schema changes: stable signatures, naming per convention, deprecation path instead of removal.
- Single source of truth: no duplicated data models across PHP and TS without a shared schema.
- Feature flags/experiments: defined default, cleanup plan.
- New abstractions need a current second use (YAGNI). Flag over-engineering and also missing seams that force future edits to Core internals.

Lens name `architecture`. Follow common.md.

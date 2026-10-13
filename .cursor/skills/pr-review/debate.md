# Debate protocol

Goal: resolve genuine conflicts between lenses, cheaply. Most findings never enter it.

1. Orchestrator groups findings that touch the same file/line or propose incompatible fixes (e.g. perf wants a cache, architecture rejects global state). Dedupe same-issue findings; keep the owning lens.
2. **Round 1**: send each conflicting lens only the opposing finding(s). Reply per common.md debate format.
3. **Round 2** (only if still unresolved): one final counter each.
4. Stop. If still unresolved: report as `disagreement` with both positions and the orchestrator's recommendation. Do not force consensus.
5. Resolved issues are merged into one finding with options, pros/cons and a pick, listing agreeing and dissenting lenses.

Ownership to avoid duplicates:
- Architecture = boundaries/contracts between modules. Quality = inside a function/class.
- Security = escaping, input, caps, REST/MCP permission. Core-Pro = license semantics and bypass paths. MCP = schema/prompt consistency.
- Performance = measurable/structural cost only. Accessibility = WCAG-grounded only; preferences go to product.
- Reuse = existing code that could replace or be shared. Quality = style.

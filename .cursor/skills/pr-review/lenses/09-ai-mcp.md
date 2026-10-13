# AI / MCP

- Tool input/output schemas: PHP ability schemas and TS/zod schemas agree (enums, required fields, no `z.any()` where PHP constrains).
- Aliases/canonicalizers: PHP and editor-side resolvers consistent; remember aliases are agent-input conveniences (see contracts.md).
- Prompts/docs given to agents: accurate vs schema and behavior; no contradictory examples; license/tier notes correct.
- Agent misuse: can a tool create invalid, unlicensed or destructive state; are failures returned as actionable errors; idempotency; size limits on batched calls.
- Elements catalog / markdown render for AI/export: stays in sync with new elements, no markup injection.
- Permissions and license gates on tools: note `-> security` / `-> core-pro`.

Lens name `ai-mcp`. Follow common.md.

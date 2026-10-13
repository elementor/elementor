# Common lens rules (every lens reads this)

Read-only. Be brief: your reply is parsed by an orchestrator and costs tokens.

## Output (exact schema, no prose)

If nothing to report: `none`.

Otherwise one block per finding, max 8 findings, most severe first:

```
#<n> [blocker|fix|nit] <file>:<line>
issue: <one line>
why: <one line, grounded in code/AC>
fix A: <one line> | pros: <..> | cons: <..>
fix B: <optional, only if materially different>
pick: A|B  (reason, <=10 words)
```

## Rules

- Every finding needs `file:line` evidence you actually read. No evidence, no finding.
- Check `contracts.md` first; by-design behavior is not a finding.
- Only your lens. If it belongs to another lens, add `-> <lens>` and one line.
- Nits: group into a single `nits:` line.
- Follow the look-for list from the ticket pass; say `unverified: <item>` if you could not check one.
- Never suggest abstraction without a real second use (YAGNI). Prefer fewer changes.
- Do not paste code back. Do not restate the diff.

## Debate replies

When asked to respond to a conflicting finding: `accept|counter` + 1-2 lines with reason. "Agree" alone is invalid.

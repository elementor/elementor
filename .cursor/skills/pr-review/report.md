# Report format

Terse. Order matters. Omit empty sections.

```
PR <repo>#<n> <title> | model=<m> effort=<e> | size: <files>/<+->  | ticket: <ED-xxx|none>

SPEC: <only if AC conflict/ambiguity/missing edge cases; one line each>
SCOPE: <too big? mixed concerns? test bloat? one line each>

BLOCKERS
| # | lens | where | issue | recommended fix |
FIX
| # | lens | where | issue | recommended fix |
NITS: <one line>

OPTIONS (only items with real alternatives)
#n  A: <..> +<pro> -<con> | B: <..> +<pro> -<con> | pick: <X> (<why>)

DISAGREEMENTS: #n <lensA> vs <lensB>: <positions> | lean: <..>
REUSE: <existing code that should be used/shared: path>
UNVERIFIED: <look-for items not checked>

SKIPPED: <lens> (<short reason>), ...
OVERRIDE: /review <id> +<lens> +<lens>
```

Default is this table view. Full detail (all fix options, pros/cons) only on "expand #n" or `expand`.

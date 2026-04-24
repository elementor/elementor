# Phase 0 notes — source of truth + decisions before Phase 1

Created: 2026-04-24
Status: all decisions resolved — ready for Phase 1

---

## 1. Source of truth (confirmed)

The nestjs MCP source lives at:

```
/Users/heinvv/Local Sites/elementor-prod/app/public/wp-content/repos/elementor-nest-mcp/src/
```

Key files and verified line anchors (line numbers as of 2026-04-24):

| Symbol | File | Line |
|---|---|---|
| `parseSize` | `mcp.server.ts` | 146 |
| `parseDimensions` | `mcp.server.ts` | 154 |
| `cssToProps` | `mcp.server.ts` | 191 |
| `varRef` | `mcp.server.ts` | 241 |
| `parseBoxShadow` | `mcp.server.ts` | 279 |
| `buildEl` (make-page) | `mcp.server.ts` | 1591 |
| `make-section` dispatch | `mcp.server.ts` | 1264 (hero), 1272 (two-column), 1305 (card-grid), 1318+ (centered) |
| `CONTAINER_TYPE_MAP` | `validation.ts` | 17 |
| `KNOWN_WIDGET_TYPES` | `validation.ts` | 30 |
| `VALID_HEADING_TAGS` | `validation.ts` | 45 |
| `ID_RE` (7-hex) | `validation.ts` | 47 |
| `levenshtein` | `validation.ts` | 58 |
| `validateFriendlySpec` | `validation.ts` | (later in file) |

No first-party tests/fixtures in the nestjs repo — parity will be driven by the TS source as spec + hand-crafted PHPUnit cases. That's fine; the TS is short and well-structured.

## 2. Decisions

### 2a. ID length — **RESOLVED: 7-hex via `Utils::generate_id()`**

Authoritative source is `plugins/elementor/modules/atomic-widgets/utils/utils.php:20-32`:

```php
public static function generate_id( string $prefix = '', $existing_ids = [] ): string {
    do {
        $generated = substr( bin2hex( random_bytes( 4 ) ), 0, 7 );
        $id = "$prefix{$generated}";
    } while ( in_array( $id, $existing_ids, true ) );
    return $id;
}
```

- Atomic-widgets emits **7-hex** — matches nestjs `ID_RE = /^[0-9a-f]{7}$/` (`validation.ts:47`).
- The 8-hex helpers in `Make_Widget_Ability::generate_id()` (`make-widget-ability.php:173-179`) and `Make_Layout_Ability::gen_id()` (`make-layout-ability.php:239-245`) are local divergences from this canon — out of scope for this port, but worth flagging as a follow-up cleanup.

**Applied decision:**
- All four new ported abilities call `\Elementor\Modules\AtomicWidgets\Utils\Utils::generate_id()` directly — no local helpers.
- Validators in the ported `validateIdFormat` accept exactly 7-hex, matching nestjs.
- Fixtures compare byte-identical between nestjs and the PHP port.

### 2b. `var(--x)` resolution (resolved — port nestjs behavior as-is)

Per `varRef` at `mcp.server.ts:241` — confirmed by direct read:

- `var(--x)` on a **color prop** → `{$$type:"color", value:{$$type:"global-color-variable", id:"x"}}`
- `var(--x)` on a **size/side/border-side/corner prop** → `{$$type:"size", value:{$$type:"global-size-variable", id:"x"}}`
- `var(--x)` on a **dimensions prop** (padding/margin/border-radius/…) → wraps the size-var in all 4 side-keys (`border-radius` uses corner keys)
- `var(--x)` on anything else → string fallback `{$$type:"string", value:"var(--x)"}`

**No `global-font-variable` handling.** Font family vars fall through to string fallback — port the same behavior.

This closes §11 open-question #5 in the PRD.

## 3. Parity fixtures (to be authored during Phase 1)

Target coverage for `tests/phpunit/abilities/css-shorthand-parser-test.php`:

| # | Input CSS | Assertion target |
|---|---|---|
| 1 | `padding:12px 16px` | dimensions TRBL with 2-value shorthand |
| 2 | `padding:12px 16px 8px` | dimensions TRBL with 3-value shorthand |
| 3 | `padding:12px 16px 8px 4px` | dimensions TRBL with 4-value shorthand |
| 4 | `margin-right:10px; padding-top:4px; top:0` | side-specific props keep physical names; each → single size |
| 5 | `border-radius:8px` | corner-keys uniform |
| 6 | `border-radius:8px 16px` | corner-keys 2-value shorthand |
| 7 | `border-radius:1000px` | pill shape (no unit conversion) |
| 8 | `border-top-left-radius:8px` | corner prop keeps physical name → single size |
| 9 | `box-shadow:0 4px 12px rgba(0,0,0,.1)` | single shadow, inset=false |
| 10 | `box-shadow:inset 0 0 0 1px #000, 0 4px 12px rgba(0,0,0,.1)` | multi-shadow + paren-aware split |
| 11 | `background:#ffffff` | color hex |
| 12 | `color:var(--brand-primary)` | color global-color-variable |
| 13 | `padding:var(--space-4)` | dimensions wrapping global-size-variable |
| 14 | `gap:var(--space-3)` | size global-size-variable on size-prop |
| 15 | `font-weight:700` | number prop |
| 16 | `line-height:1.4` | unitless → number |
| 17 | `line-height:24px` | unit → size |
| 18 | `flex:1 0 auto` | string fallback (parseSize rejects multi-token, flex is in SIZE_PROPS) |
| 19 | `display:grid` | string fallback |
| 20 | `transform:translateY(-10%)` | string fallback (CSS function) |
| 21 | `font-family:var(--font-heading)` | string fallback (no font-var support) |

If the user approves, Phase 1 writes the PHP port + these 21 PHPUnit cases.

## 4. Open for Phase 4 (not blocking Phase 1)

- `make-page → Build_Page_Ability` direct call vs extract-pipeline-to-trait. Deferred.
- `did-you-mean` wording: port nestjs strings verbatim or restyle to Elementor house style. Revisit when porting `validateFriendlySpec`.

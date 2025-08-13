# Follow-up Questions (Post-MVP)

## 1) Global Variables
- Type handling: keep raw string values in MVP; do we coerce types (color/length) later?
- Naming collisions: stable IDs vs labels update policy?

## 2) Global Classes (Phase 2)
- Minimum property set for first iteration (color, background, spacing, typography)?
- Strategy for merging duplicates across multiple CSS inputs?

## 3) Widget Styling (Phase 3)
- Map directly to Atomic Style Schema or introduce intermediate mapping?
- Conflict policy between variables and direct props?

## 4) Widget Creation (Phase 4)
- Default tag→widget mapping (e.g., div→e-flexbox, p→e-paragraph)?
- Handling unsupported selectors: HTML widget fallback or discard?

## 5) API & Security
- Authentication preference: capability checks + nonces vs application tokens?
- Rate limiting/size limits for large CSS payloads?


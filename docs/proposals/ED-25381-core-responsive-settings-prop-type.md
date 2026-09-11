# Core story — Per-breakpoint settings via `settings_variants` (ED-25381 dependency)

> **Story:** [ED-25538](https://elementor.atlassian.net/browse/ED-25538)  
> **Blocks Pro:** ED-25381  
> **Scope:** Core-only generic infrastructure — no carousel references  
> **Target core release:** 4.4  
> **Owner:** Maksim Zubau

## Summary

Store per-breakpoint **settings** the same way styles store variants: desktop stays in `settings[propKey]`; other breakpoints live in element `settings_variants[]` with `{ meta: { breakpoint }, props }`.

Opt-in is a schema marker (`Responsive_Settings::enable()`), not a `$$type: responsive` envelope. Controls stay breakpoint-agnostic. `SettingsField` writes desktop vs variants from the app-bar breakpoint.

Pro ED-25381 binds carousel `slides_per_view` / `slides_to_scroll` on top of this release.

## Acceptance

- Sparse per-breakpoint values validate when optional breakpoints are unset
- Saved values survive a breakpoint being disabled in Site Settings
- `Overridable_Prop_Type` wrapping keeps working (component exposure)
- Panel controls do not register a per-type responsive control
- Editor writes only the active breakpoint (desktop → `settings`, else → `settings_variants`)

## Migration (Pro)

No `number-to-responsive` migration while `e_pro_atomic_carousel` remains hidden and default-inactive.
If Pro responsive schema ships before GA, migration is unnecessary.

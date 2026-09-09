# Core story — Generic responsive settings props (ED-25381 dependency)

> **Story:** [ED-25538](https://elementor.atlassian.net/browse/ED-25538)  
> **Blocks Pro:** ED-25381  
> **Scope:** Core-only generic infrastructure — no carousel references  
> **Target core release:** 4.4  
> **Owner:** Maksim Zubau

## Summary

Deliver `Responsive_Prop_Type` (`extends Object_Prop_Type`), `Responsive_Number_Control`, editor
primitives (`responsivePropTypeUtil`, `resolveResponsiveValue`, `ResponsiveNumberControl`), and tests.
Pro ED-25381 binds carousel `slides_per_view` / `slides_to_scroll` on top of this release.

## Acceptance

- Sparse per-breakpoint values validate when optional breakpoints are unset
- Saved values survive a breakpoint being disabled in Site Settings
- `Overridable_Prop_Type` wrapping keeps working (component exposure)
- `Props_Resolver` returns a breakpoint map without new resolver branches
- Editor control writes only the active breakpoint key

## Migration (Pro)

No `number-to-responsive` migration while `e_pro_atomic_carousel` remains hidden and default-inactive.
If Pro responsive schema ships before GA, migration is unnecessary.

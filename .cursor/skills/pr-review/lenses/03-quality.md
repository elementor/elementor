# Code quality

Inside functions/classes/components.
- SOLID where it earns its keep: single responsibility, no god classes, depend on abstractions only when more than one implementation exists.
- KISS / YAGNI: unused options, speculative params, single-impl interfaces, config nobody asked for, code beyond the AC, dead code, commented-out code.
- Clean code: naming, function size and nesting, duplication, magic values, boolean flag params, error handling that swallows.
- Elementor standards: match the conventions of neighboring files first, then WordPress/PHPCS and ESLint rules, `docs/atomic-builder/`. Report a mismatch only when surrounding code does it differently.
- PHP: snake_case, `Utils` helpers, i18n, `defined( 'ABSPATH' )`. TS: types not `any`, hooks rules, named exports as used nearby.
- Comments only for non-obvious intent; flag narrating comments.

Lens name `quality`. Follow common.md.

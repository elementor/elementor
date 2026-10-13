# Scope and tests (inline, runs first)

Size/shape:
- Files/lines vs ticket scope. Over ~400 changed non-test lines or >15 files: suggest a split and where.
- Mixed concerns (refactor + feature, unrelated cleanup, drive-by formatting).
- Generated/lock/snapshot noise vs real change.

Tests (read before code):
- Each AC and each ticket edge case maps to a test, or is listed as a gap.
- Bloat: duplicate cases, tautologies (asserting mocks), over-mocking, snapshot churn without reason, tests larger than the code they cover without justification.
- Right level: PHPUnit/Jest for logic, Playwright only for editor/E2E behavior. Flaky patterns (blind waits, force clicks).
- AAA structure and descriptive names per `.cursor/rules/testing.mdc`.

Output per common.md schema, lens name `scope`.

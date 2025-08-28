# Agent Rules - Testing and Project Management

## Project Policy (verbatim, enforce):
- Run tests with: `npm run test:playwright <path-to-spec>`
- Two phases:
  Phase 1 (Plan only): write `tests/docs/test-plans/<widget>.<feature>.md` from TEMPLATE.md using bullet TC cards (no tables).
  Phase 2 (Code only for approved TC-IDs): generate tests in `tests/playwright/sanity/modules/<widget>/<feature>.test.ts`.

## Testing Strategy:
- E2E-first; include persistence & undo/redo when relevant; precedence; network-aware; no catalog tests.
- Coding rules: no new POMs; helpers only in `tests/playwright/pages/editor-page.ts`; reuse first.
- Conditional controls: systematically probe switchers; check `.elementor-hidden-control`; delete discovery tests after.

## Explicit Test Cases:
Design comprehensive test scenarios leveraging QA expertise for maximum coverage. Include:
- Core functionality and happy path scenarios
- Edge cases and boundary value testing
- Error conditions and validation testing
- Business logic flows and user workflows
- Accessibility and performance considerations
- Cross-browser and responsive design scenarios
- Security and input validation testing

## Code Quality Rules:
- Selectors: getByRole/getByTestId; waits: condition-based; no magic timeouts.
- Experiments: reset in afterAll; dialogs: page.once('dialog', …); no env mutation; no auto snapshot updates.
- Screenshots: ≤5/widget, targeted, expect.soft, widget-only, RTL only on FE.
- DoD: tied to approved TC-IDs; headless green locally/CI; no console errors.
- On product-like failures produce BUG REPORT block (Title/Steps/Expected/Actual/TC-IDs/Notes).

## Definition of Done:
- Tied to approved TC-IDs; asserts real acceptance criteria.
- Passes headless locally and in CI; no console errors.
- Verified locally by running: `npm run test:playwright <path-to-spec>`
- Persistence and (when relevant) undo/redo verified.
- Plan's Mapping to code updated; then: `npm run mark -- --plan tests/docs/test-plans/<widget>.<feature>.md --done <TC-IDs>`

## File Paths:
- Plans: `tests/docs/test-plans/<widget>.<feature>.md`
- Template: `tests/docs/test-plans/TEMPLATE.md`
- Specs: `tests/playwright/sanity/modules/<widget>/<feature>.test.ts`
- Helpers: `tests/playwright/pages/editor-page.ts`

## Additional Rules:
- Elementor-specific rules: `elementor-specific.md`
- **MCP Usage**: Use Playwright MCP when analyzing app behavior or debugging (see `mcp-rules.md`)
- When ready to finish and say it's done - run created test one more time.
- Most likely, you'll need to do additional fixes.

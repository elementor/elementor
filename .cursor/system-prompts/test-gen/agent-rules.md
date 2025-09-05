# Agent Rules - Testing Process & Strategy

## Project Workflow (Two-Phase Process):
- **Phase 1 (Planning)**: Create test plan `tests/docs/test-plans/<widget>.<feature>.md` from TEMPLATE.md using bullet TC cards
- **Phase 2 (Implementation)**: Generate tests in `tests/playwright/sanity/modules/<widget>/<feature>.test.ts` for approved TC-IDs only
- **Test Execution**: Run tests with `npm run test:playwright <path-to-spec>`

## Testing Strategy & Coverage:
- **Primary Focus**: E2E scenarios with persistence & undo/redo validation when relevant
- **Test Scope**: Core functionality, edge cases, error conditions, business logic flows, accessibility, responsive design
- **Architecture**: No new Page Object Models; helpers only in `tests/playwright/pages/editor-page.ts`; reuse existing helpers first
- **Conditional Controls**: Systematically probe switchers; check `.elementor-hidden-control`; delete discovery tests after validation

## Test Case Design Principles:
Design comprehensive scenarios leveraging QA expertise:
- Core functionality and happy path scenarios
- Edge cases and boundary value testing  
- Error conditions and validation testing
- Business logic flows and user workflows
- Accessibility and performance considerations
- Cross-browser and responsive design scenarios
- Security and input validation testing

## Screenshot Guidelines:
- Maximum 5 screenshots per widget, targeted and specific
- Use `expect.soft` for non-critical visual validations
- Widget-only screenshots preferred
- RTL testing only on frontend when applicable

## Definition of Done:
- All tests tied to approved TC-IDs and assert real acceptance criteria
- Tests pass headless locally and in CI with no console errors
- Persistence and undo/redo functionality verified (when relevant)
- Test plan's "Mapping to code" section updated
- Mark completion: `npm run mark -- --plan tests/docs/test-plans/<widget>.<feature>.md --done <TC-IDs>`

## File Structure:
- **Test Plans**: `tests/docs/test-plans/<widget>.<feature>.md`
- **Template**: `tests/docs/test-plans/TEMPLATE.md`
- **Test Specs**: `tests/playwright/sanity/modules/<widget>/<feature>.test.ts`
- **Helpers**: `tests/playwright/pages/editor-page.ts`

## Error Handling:
- On product-like failures, produce BUG REPORT block with: Title/Steps/Expected/Actual/TC-IDs/Notes
- Always run created tests one final time before declaring completion
- Expect additional fixes will likely be needed

## Integration Points:
- Elementor-specific implementation details: see `elementor-specific.md`
- MCP usage for app behavior analysis: see `mcp-rules.md`

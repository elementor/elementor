# Playwright Agents Quick Reference

## Quick Start Commands

### 1. Create Test Plan
```
@playwright-test-planner Create a test plan for [feature description]
```

### 2. Generate Tests
```
@playwright-test-generator Generate tests from tests/playwright/plans/[plan-file].md
```

### 3. Fix Failing Tests
```
@playwright-test-healer Fix failing test [test-file-path]
```

## Common Workflows

### New Feature Testing
```bash
# 1. Plan
@playwright-test-planner Create test plan for button widget configuration

# 2. Generate
@playwright-test-generator Generate tests from the button widget plan

# 3. Run
npm run test:playwright -- button-widget.test.ts

# 4. Fix (if needed)
@playwright-test-healer Fix button widget test failures
```

### Test Maintenance
```bash
# Run all tests
npm run test:playwright

# Fix all failures
@playwright-test-healer Analyze and fix all failing tests from the latest run
```

## File Locations

| Type | Location | Purpose |
|------|----------|---------|
| Test Plans | `tests/playwright/plans/` | Planner agent output |
| Generated Tests | `tests/playwright/sanity/` | Generator agent output |
| Page Objects | `tests/playwright/pages/` | Reusable page interactions |
| Seed Test | `tests/playwright/sanity/seed.spec.ts` | Base test setup |

## Agent Capabilities

### Planner Agent
- ✅ Explore Elementor interface
- ✅ Create detailed test scenarios
- ✅ Save structured test plans
- ✅ Include Elementor-specific context

### Generator Agent  
- ✅ Read test plan files
- ✅ Generate TypeScript test code
- ✅ Use existing page objects
- ✅ Follow project patterns

### Healer Agent
- ✅ Run and analyze failing tests
- ✅ Debug with browser tools
- ✅ Fix selector and timing issues
- ✅ Validate fixes automatically

## Useful Scripts

```bash
# Test seed file
npm run test:playwright:seed

# Start MCP server
npm run test:playwright:mcp-server

# Run specific test
npm run test:playwright -- [test-file]

# Debug mode
npm run test:playwright:debug -- [test-file]
```

## Tips

1. **Be Specific**: Provide detailed requirements to planner agent
2. **Use Page Objects**: Generated tests should use `WpAdminPage` and `EditorPage`
3. **Test Incrementally**: Fix one issue at a time with healer agent
4. **Follow Patterns**: Check existing tests for structure examples
# Test Generation System Prompts

This directory contains AI agent prompts specifically for automated test generation and QA workflows.

## Files Overview

### Core Process & Strategy
- **`agent-rules.md`** - High-level testing process and workflow strategy
  - Two-phase workflow (Planning → Implementation)
  - File structure and naming conventions
  - Test setup patterns (DriverFactory, experiments)
  - Data-driven and widget iteration patterns
  - Definition of Done and error handling

### Platform Implementation
- **`elementor-specific.md`** - Elementor platform implementation details
  - DriverFactory usage (preferred for new tests)
  - V4 Panel API (`editor.v4Panel.*` methods)
  - Editor API and helper functions reference
  - Common selectors and screenshot patterns
  - Widget types and experiment requirements

### Tool Integration
- **`mcp-rules.md`** - Model Context Protocol integration rules
  - When and how to use Playwright MCP for app behavior analysis
  - Debugging workflows and tool usage guidelines

## Usage Context

These prompts are designed to work together for comprehensive test generation:

1. **Planning Phase**: Use `agent-rules.md` for test plan creation and file structure
2. **Implementation Phase**: Apply `elementor-specific.md` for DriverFactory, API, and patterns
3. **Debugging Phase**: Follow `mcp-rules.md` for interactive analysis

## Quick Reference

### V4/Atomic Widget Test Setup
```typescript
import { DriverFactory } from '../../../drivers/driver-factory';

test.beforeAll(async () => {
  await DriverFactory.activateExperimentsCli(['e_atomic_elements']);
});

test.afterAll(async () => {
  await DriverFactory.deactivateExperimentsCli(['e_atomic_elements']);
});
```

### File Locations
| Test Type | Location |
|-----------|----------|
| V4/Atomic tests | `tests/playwright/sanity/modules/v4-tests/` |
| Legacy widget tests | `tests/playwright/sanity/modules/<widget>/` |
| Regression tests | `tests/elements-regression/tests/` |

## Integration with Technical Rules

These system prompts work in conjunction with:
- `/.cursor/rules/tests-code-style.mdc` - Technical testing standards (AAA pattern, selectors, reliability)
- `/.cursor/rules/testing.mdc` - General testing rules for main repo and turbo-repo

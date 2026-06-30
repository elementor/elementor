# Test Generation System Prompts

This directory contains AI agent prompts specifically for automated test generation and QA workflows.

## Files Overview

### Core Process & Strategy
- **`agent-rules.md`** - High-level testing process and workflow strategy
  - Two-phase workflow (Planning → Implementation)
  - Testing coverage and quality standards
  - Definition of Done and file structure

### Platform Implementation
- **`elementor-specific.md`** - Elementor platform implementation details
  - Editor API usage and widget interactions
  - Helper functions and responsive testing patterns
  - Elementor-specific constants and best practices

### Tool Integration  
- **`mcp-rules.md`** - Model Context Protocol integration rules
  - When and how to use Playwright MCP for app behavior analysis
  - Debugging workflows and tool usage guidelines

## Usage Context

These prompts are designed to work together for comprehensive test generation:

1. **Planning Phase**: Use `agent-rules.md` for test plan creation
2. **Implementation Phase**: Apply `elementor-specific.md` for platform details
3. **Debugging Phase**: Follow `mcp-rules.md` for interactive analysis

## Integration with Technical Rules

These system prompts work in conjunction with:
- `/.cursor/rules/tests-code-style.mdc` - Technical testing standards
- `/.cursor/rules/general-code-style.mdc` - General code quality rules

# Cursor AI Configuration

This directory contains AI agent configuration for test generation and code assistance.

## File Structure

### Rules (`/rules/`)
- **`tests-code-style.mdc`** - Technical testing rules and code quality standards
  - Code quality, test reliability, browser/environment rules
  - Applies only to test files (`globs: *test*`)

### System Prompts (`/system-prompts/`)
- **`test-gen/`** - Test generation specific prompts
  - `agent-rules.md` - High-level testing process and strategy
  - `elementor-specific.md` - Elementor platform implementation details  
  - `mcp-rules.md` - Model Context Protocol integration rules
  - See `/test-gen/README.md` for detailed documentation

## Rule Hierarchy

1. **General code style** (workspace-wide rules) - applies to all files
2. **Technical testing rules** (tests-code-style.mdc) - applies to test files only  
3. **Test generation prompts** (system-prompts/test-gen/) - AI agent guidance
   - Process & strategy (agent-rules.md) - high-level workflow guidance
   - Platform specifics (elementor-specific.md) - implementation details
   - Tool integration (mcp-rules.md) - MCP usage patterns

This hierarchy prevents rule duplication and ensures clear separation of concerns.


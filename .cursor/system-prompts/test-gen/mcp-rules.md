# MCP-Specific Rules

You are a QA agent. Use **Playwright MCP** when you need to understand app behavior.

## MCP Usage Rules:

1) Use MCP when you need to understand app behavior:
   - Phase 1 analysis: exploring widgets/features to create test plans
   - Debugging: inspecting actual DOM, iframe, logs, network, styles
   - Understanding interactions: seeing how controls work, element selectors, timing

2) You can use other tools when MCP is not needed:
   - Writing test code based on existing knowledge
   - File operations and project management
   - Code review and refactoring
   - General project workflow tasks

3) If MCP is required but unavailable → reply:
   `MCP_UNAVAILABLE: <reason>` and explain what you need MCP for.

## Execution Contract:
- Start by launching Playwright MCP against the app (Editor is inside an iframe).
- Gather observations (DOM, styles, network, console).
- Only after at least one successful MCP observation, you may reference existing helpers.
- If MCP errors or cannot attach, reply `MCP_UNAVAILABLE: <reason>` and stop immediately.

## MCP Debugging Workflows:

### Pre-Code Testing Workflow:
Before generating test code for approved TC-IDs:
- Use Playwright MCP to manually perform the test scenario
- Observe actual behavior, selectors, and interactions
- Document findings: element selectors, timing, validation messages
- Understand the real user workflow and system responses
- Only proceed to code generation after successful manual testing

### Post-Code Debugging Workflow:
After generating test code:
- Run the generated test with Playwright MCP
- If test fails, use MCP to debug: inspect DOM, iframe, logs, network, styles
- Identify root cause through MCP observations
- Fix the test code based on MCP findings
- Re-run until test passes successfully
- Never skip failing tests or mask product bugs

## Run & Debug:
- After generating tests: run them with Playwright MCP.
- Always debug failing tests with MCP: inspect DOM, iframe, logs, network, styles.
- Never "guess" a fix without reproducing via MCP.
- Never skip failing tests just to make the suite green.
- If the failure looks like a product bug, report it (BUG REPORT), do not mask it.
- Before declaring "done": run the test again locally headless and ensure it passes without console errors.

## Emergency Stop:
If you are about to output any text before an MCP call, STOP and output:
`MCP_UNAVAILABLE: First message must be an MCP call.`

## MCP Usage Guidelines:
Use Playwright MCP when you need to understand the app behavior:

### When MCP is REQUIRED:
- **Phase 1 (Analysis)**: When creating test plans, use MCP to manually explore the widget/feature
- **Debugging**: When tests are failing, use MCP to inspect actual DOM, iframe, logs, network, styles
- **Understanding Interactions**: When you need to see how controls work, element selectors, timing
- **Validation**: When you need to verify actual behavior vs. assumptions

### When MCP is NOT needed:
- Writing test code based on existing knowledge
- File operations and project management
- Code review and refactoring
- General project workflow tasks

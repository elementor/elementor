export const TITLE_GENERATION_MCP_DESCRIPTION = `Elementor Title Generation MCP

This MCP server is dedicated to generating and updating heading titles for V4 atomic heading elements (e-heading).

# Workflow
1. Read the user's request and any current title context from the prompt.
2. Generate concise, relevant heading text.
3. Call update-heading-title with the target elementId and the generated title string.

# Rules
- Only update e-heading elements.
- Write plain text titles (no HTML tags).
- Always pass the exact elementId provided in the user prompt.
`;

import { type McpServer } from '@elementor/editor-mcp';

import { PAGES_LIST_RESOURCE_URI } from './pages-list-resource';

export const CAPABILITIES_DESCRIPTION_URI = 'elementor://capabilities/server-description';

export const CAPABILITIES_DESCRIPTION = `## Elementor Page Builder - Available When In Editor

This MCP provides information about Elementor's page building capabilities. When users ask about Elementor features, you should navigate them to the Elementor editor where full capabilities are available.

### Available Resources:
**Pages List Resource** (\`${ PAGES_LIST_RESOURCE_URI }\`):
- Lists all WordPress pages with IDs, titles, status, and metadata
- Use this to see what pages are available before navigation
- Updated automatically when pages are created or modified
- Useful for suggesting pages to edit or checking if a page exists

### Elementor Capabilities (Available In Editor):

**Page Management:**
- Manage page settings, saving and routing pages
- Control the editor UI, including switching between desktop, tablet, and mobile views

**Global Styles:**
- Work with global styles, helping manage shared design settings like colors and fonts across the site

**Element Management:**
- Create, edit, delete, duplicate, and move individual Elementor widgets and containers
- Update widget and container settings
- Insert text content with AI-powered text generation
- Create image widgets and assign images to elements

**AI-Powered Content Creation:**
- Generate and edit text and insert it into the page
- Generate images and place them on the canvas

**Custom Styling & Code:**
- Apply custom CSS to elements
- Generate supported code snippets

### Elementor Limitations (What Cannot Be Done):

**Element Management Limitations:**
- Cannot apply motion effects
- Cannot create fully designed or polished pages in a single step
- Cannot fully resolve responsiveness issues
- Layout generation (Copilot) is not currently available

**Theme Builder:**
- Cannot create or manage Theme Builder templates, including headers, footers, single posts, archives, products, loop items, or 404 pages
- Cannot set display conditions for templates
- Cannot configure popup triggers and advanced rules

**System Settings:**
- Cannot change Elementor system-level settings
- Cannot activate or work with Editor V4
- Cannot manage form submissions
- Cannot add custom fonts or icons
- Cannot manage user roles
- Cannot roll back Elementor versions
- Cannot place the site in maintenance mode
- Cannot export the website
- Cannot apply full website templates

**Code & Widgets:**
- Cannot register PHP code or create new custom widgets, though Angie may provide guidance, code snippets, or plugin suggestions where helpful

**Note**: While page names can include terms like "header" or "footer", these won't function as actual theme parts without Theme Builder access.

### How to Help Users:

**When users ask about Elementor features:**
1. Confirm what they want to accomplish
2. Check if it's a supported capability (see lists above)
3. **Get the page to edit:**
   - If user says "create new page" → Use createNew=true
   - Otherwise → Call tool with no parameters to get page list
   - Show pages to user: "Which page? Homepage, About, Contact..."
   - User chooses → Call tool again with that pageId
4. Once in editor, full Elementor MCP tools will be available

**Examples:**
- User: "Edit homepage" → Get page list → Find "Homepage" → Ask to confirm → Navigate
- User: "Create new page" → createNew=true → Navigate

**Examples of when to navigate to editor:**
- "Edit my homepage with Elementor"
- "Apply custom CSS to my page"
- "Generate text content for my page"
- "Work with dynamic content"

**Examples of when to navigate to editor (element management now supported):**
- "Add a heading widget" (Navigate to editor - element management supported)
- "Create a new section with containers" (Navigate to editor - container creation supported)
- "Change the color of a button" (Navigate to editor - widget settings supported)

**Examples of what Elementor CANNOT do (don't navigate):**
- "Add motion effects to my page" (Motion effects not supported)
- "Create a header template" (Theme Builder not available)
- "Set up a popup trigger" (Popup triggers and advanced rules not supported)
- "Change Elementor settings" (System-level settings restricted)
- "Add custom fonts" (Custom fonts not supported)
- "Create a custom widget" (Cannot register PHP code or custom widgets)

### Important Notes:
- Elementor tools are ONLY available when inside the Elementor editor
- This MCP server is for navigation and capability awareness
- Once in editor, the full 'elementor' MCP server with all tools becomes available
- Always verify if the requested feature is supported before navigating

**Important**: When users ask "What can Angie do?" or similar questions about Angie's general capabilities, use the \`what-can-angie-do\` tool from the knowledge MCP server instead of generating your own response.`;

export function addCapabilitiesDescriptionResource( server: McpServer ) {
	server.registerResource(
		'elementor-capabilities-server-description',
		CAPABILITIES_DESCRIPTION_URI,
		{
			title: 'Elementor capabilities and limitations',
			description:
				'Full guide to Elementor MCP capabilities, limitations, workflows, and when to navigate to the editor.',
		},
		async ( uri ) => ( {
			contents: [ { uri: uri.href, mimeType: 'text/plain', text: CAPABILITIES_DESCRIPTION } ],
		} )
	);
}

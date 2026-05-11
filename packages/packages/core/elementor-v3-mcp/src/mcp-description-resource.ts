import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export const V3_DESCRIPTION_URI = 'elementor://elementor/server-description';

export const V3_DESCRIPTION = `## Elementor Page Builder

### Capabilities:
**Page Management:**
- Manage page settings, saving and routing pages
- Control the editor UI, including switching between desktop, tablet, and mobile views

**Global Styles:**
- Work with global styles, helping manage shared design settings like colors and fonts across the site

**AI-Powered Content Creation:**
- Generate and edit text and insert it into the page
- Generate images and place them on the canvas

**Custom Styling & Code:**
- Apply custom CSS to elements
- Generate supported code snippets

### Limitations:
**Element Management (Not Supported):**
- Cannot create or edit individual Elementor elements such as widgets or containers
- Cannot build page layouts or create containers
- Cannot modify widget-level settings
- Cannot apply motion effects
- Cannot reorder sections or perform detailed canvas-level edits
- Cannot create fully designed or polished pages
- Cannot fully resolve responsiveness issues
- Support for these editor-level capabilities is planned for Editor V4

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

**Important**: When users ask "What can Angie do?" or similar questions about Angie's general capabilities, use the \`what-can-angie-do\` tool from the knowledge MCP server instead of generating your own response.`;

export function addV3DescriptionResource( server: McpServer ) {
	server.registerResource(
		'elementor-v3-server-description',
		V3_DESCRIPTION_URI,
		{
			title: 'Elementor V3 Server Description',
			description: 'Elementor V3 MCP capabilities and limitations',
			mimeType: 'text/plain',
		},
		async ( uri ) => ( {
			contents: [ { uri: uri.href, mimeType: 'text/plain', text: V3_DESCRIPTION } ],
		} )
	);
}

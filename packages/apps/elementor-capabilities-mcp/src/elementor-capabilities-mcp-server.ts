import { AngieMessageEvenetType as MessageEventType, getAngieIframe } from '@elementor/editor-mcp';
import { callWpApi } from '@elementor/elementor-mcp-common';
import { z } from '@elementor/schema';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { addPagesListResource, PAGES_LIST_RESOURCE_URI } from './pages-list-resource';

type McpToolResult = {
	content: {
		type: 'text';
		text: string;
	}[];
};
// Constants
const ANGIE_REQUIRED_RESOURCES = 'angie/requiredResources';
const WP_PAGES_ENDPOINT = '/wp/v2/pages';
const ELEMENTOR_EDIT_MODE = 'builder';
const DEFAULT_PAGE_TITLE = 'New Page';
const ELEMENTOR_EDIT_ACTION = 'elementor';

type WPPost = {
	id: number;
	title: { rendered: string };
	link: string;
	type: string;
	status: string;
};

export const getSafeOrigin = () => {
	if ( typeof window === 'undefined' ) {
		return '';
	}
	const url = new URL( window.location.href );
	const originParam = `${ url.protocol }://${ url.host }`;
	return originParam || '';
};

export function safeNavigateAfterResponse( url: string ) {
	try {
		const angieIframe = getAngieIframe();

		// @ts-ignore: It's not null
		angieIframe.contentWindow.postMessage(
			{
				type: MessageEventType.ANGIE_NAVIGATE_AFTER_RESPONSE,
				payload: { url },
			},
			getSafeOrigin()
		);
	} finally {
		setTimeout( () => {
			window.location.replace( url );
		}, 50 );
	}
}

/**
 * Creates an MCP server that exposes Elementor capabilities when NOT in the editor
 * This helps Angie understand what Elementor can do and navigate users to the editor
 */
export function createElementorCapabilitiesServer() {
	const server = new McpServer(
		{
			name: 'elementor-capabilities-server',
			version: '1.0.0',
			title: 'Elementor Capabilities',
		},
		{
			instructions: `## Elementor Page Builder - Available When In Editor

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

**Important**: When users ask "What can Angie do?" or similar questions about Angie's general capabilities, use the \`what-can-angie-do\` tool from the knowledge MCP server instead of generating your own response.`,
			capabilities: {
				resources: {
					subscribe: true,
				},
			},
		}
	);

	addPagesListResource( server );

	server.registerTool(
		'navigate-to-elementor-editor',
		{
			description:
				'Navigate the user to the Elementor editor to use Elementor page building capabilities. ' +
				'WORKFLOW: ' +
				'1. Check the wp-pages-list resource (automatically loaded) to see available pages. ' +
				'2. If user asks to create new → set createNew=true with confirmationMessage. ' +
				'3. If editing existing page → set pageId (from resource) with confirmationMessage. ' +
				'Once in editor, full Elementor MCP capabilities become available.',
			inputSchema: {
				pageId: z
					.number()
					.optional()
					.describe(
						'The ID of the page to navigate to. Only provide after user has explicitly selected a page from the available pages list. When provided, confirmationMessage is REQUIRED.'
					),
				createNew: z
					.boolean()
					.optional()
					.describe(
						'Set to true ONLY when user explicitly requests to create a new page. When true, confirmationMessage is REQUIRED. Default is false.'
					),
				newPageTitle: z
					.string()
					.optional()
					.describe(
						'Title for the new page when createNew is true. Use what the user specified or default to "New Page".'
					),
				confirmationMessage: z
					.string()
					.optional()
					.describe(
						"REQUIRED when pageId or createNew is provided. A clear message shown to user before navigation. Example: \"I'll open the 'Homepage' in Elementor editor so you can add a form widget. Ready to proceed?\" Omit when just fetching available pages."
					),
			},
			annotations: {
				title: 'Navigate to Elementor Editor',
				destructiveHint: true,
			},
			_meta: {
				[ ANGIE_REQUIRED_RESOURCES ]: [
					{
						uri: PAGES_LIST_RESOURCE_URI,
						whenToUse:
							'Always use this resource first to understand what pages are available before asking the user which page to edit',
					},
				],
			},
		},
		async ( params ) => {
			try {
				if ( ( params.pageId || params.createNew ) && ! params.confirmationMessage ) {
					throw new Error(
						'confirmationMessage is required when navigating to a page (pageId or createNew provided)'
					);
				}

				if ( params.createNew ) {
					return await handleCreateAndNavigate( params );
				}

				if ( params.pageId ) {
					return await handleNavigateToPage( params.pageId );
				}

				throw new Error(
					'Either pageId or createNew must be provided. The pages list is available in the wp-pages-list resource.'
				);
			} catch ( error ) {
				// eslint-disable-next-line no-console
				console.error( '[Elementor Capabilities Server] navigation error:', error );
				throw new Error( `Error navigating to Elementor editor: ${ ( error as Error ).message }` );
			}
		}
	);

	return server;
}

async function handleCreateAndNavigate( params: { newPageTitle?: string } ): Promise< McpToolResult > {
	const title = params.newPageTitle || DEFAULT_PAGE_TITLE;

	const response = await callWpApi( WP_PAGES_ENDPOINT, 'POST', {
		title,
		status: 'draft',
		meta: {
			_elementor_edit_mode: ELEMENTOR_EDIT_MODE,
		},
	} );
	const newPage = response.data;

	if ( ! newPage || typeof newPage !== 'object' || ! ( 'id' in newPage ) ) {
		throw new Error( 'Invalid response from page creation API' );
	}

	return await handleNavigateToPage( newPage.id as number );
}

async function handleNavigateToPage( pageId: number ): Promise< McpToolResult > {
	if ( ! pageId || pageId <= 0 ) {
		throw new Error( 'Invalid page ID' );
	}

	const response = await callWpApi< WPPost >( `${ WP_PAGES_ENDPOINT }/${ pageId }`, 'GET' );
	const page = response.data;
	if ( ! page || typeof page !== 'object' || ! ( 'id' in page ) || ! ( 'title' in page ) ) {
		throw new Error( `Invalid page data received for page ID ${ pageId }` );
	}

	const editUrl = generateElementorEditUrl( pageId );

	if ( ! editUrl.startsWith( window.location.origin ) ) {
		throw new Error( 'Invalid navigation URL' );
	}

	safeNavigateAfterResponse( editUrl );

	return {
		content: [
			{
				type: 'text',
				text: JSON.stringify(
					{
						success: true,
						message: `Navigating to Elementor editor for page: ${ page.title.rendered }`,
						pageId: page.id,
						pageTitle: page.title.rendered,
						editUrl,
						nextSteps:
							'Once in the Elementor editor, you can use Elementor MCP tools for page settings, UI navigation, AI content generation, custom styling, and dynamic content.',
					},
					null,
					2
				),
			},
		],
	};
}

function generateElementorEditUrl( pageId: number ): string {
	const baseUrl = window.location.origin;
	return `${ baseUrl }/wp-admin/post.php?post=${ pageId }&action=${ ELEMENTOR_EDIT_ACTION }`;
}

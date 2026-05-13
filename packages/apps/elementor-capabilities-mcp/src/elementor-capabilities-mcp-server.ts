import { AngieMessageEvenetType as MessageEventType, getAngieIframe } from '@elementor/editor-mcp';
import { callWpApi } from '@elementor/elementor-mcp-common';
import { z } from '@elementor/schema';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { addCapabilitiesDescriptionResource, CAPABILITIES_DESCRIPTION_URI } from './mcp-description-resource';
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
			instructions: `Provides Elementor page-building capabilities and navigates users to the editor.`,
			capabilities: {
				resources: {
					subscribe: true,
				},
			},
		}
	);

	addPagesListResource( server );
	addCapabilitiesDescriptionResource( server );

	server.registerTool(
		'navigate-to-elementor-editor',
		{
			description: `Navigate the user to the Elementor editor. Causes a full page reload — editor-related tools become available afterward.

Workflow: choose from the pages list resource → set pageId (edit) OR createNew=true (new page) with confirmationMessage.`,
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
						uri: CAPABILITIES_DESCRIPTION_URI,
						whenToUse: 'Read first for full capabilities and limitations guide',
					},
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

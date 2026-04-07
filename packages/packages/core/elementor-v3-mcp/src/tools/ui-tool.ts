import { z } from '@elementor/schema';
import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import type { McpToolResult, ToolParams } from '../types';
import { get$e, getElementor } from '../utils';

export function addUiTool( server: McpServer ): void {
	server.registerTool(
		'ui',
		{
			description:
				'Manage Elementor editor UI operations. This tool provides control over editor interface actions including responsive preview modes and widget favorites. Use this when you need to: switch between device preview modes (desktop/tablet/mobile), manage favorite widgets, or paste previously copied content. Note: For undo/redo operations, use the page tool instead. The tool interacts directly with the Elementor editor UI and does not modify page content itself.',
			inputSchema: {
				action: z
					.enum( [ 'change-device-mode', 'toggle-favorite', 'ui-paste' ] )
					.describe(
						'The UI operation to perform: change-device-mode (switch responsive preview), toggle-favorite (add/remove widget from favorites), ui-paste (paste clipboard content into an existing element)'
					),
				deviceMode: z
					.enum( [ 'desktop', 'tablet', 'mobile' ] )
					.optional()
					.describe( 'Required for change-device-mode. The device mode to switch to for responsive preview' ),
				widgetType: z
					.string()
					.optional()
					.describe(
						'Required for toggle-favorite. The widget type name (e.g., "heading", "button", "image") to add or remove from favorites'
					),
				elementId: z
					.string()
					.optional()
					.describe(
						'Required for ui-paste. The ID of an existing container element where clipboard content should be pasted. Note: The element must exist and content must be in clipboard first'
					),
			},
			annotations: {
				title: 'Manage UI',
			},
		},
		async ( params: ToolParams ) => {
			switch ( params.action ) {
				case 'change-device-mode':
					return await handleChangeDeviceMode( params );
				case 'toggle-favorite':
					return await handleToggleFavorite( params );
				case 'ui-paste':
					return await handleUiPaste( params );
				default:
					throw new Error( `Unknown action: ${ params.action }` );
			}
		}
	);
}

async function handleChangeDeviceMode( params: ToolParams ): Promise< McpToolResult > {
	if ( ! params.deviceMode ) {
		throw new Error( 'deviceMode is required for change-device-mode action' );
	}

	get$e()?.run( 'panel/change-device-mode', {
		device: params.deviceMode,
	} );

	return {
		content: [ { type: 'text', text: `Device mode changed to ${ params.deviceMode }.` } ],
	};
}

async function handleToggleFavorite( params: ToolParams ): Promise< McpToolResult > {
	if ( ! params.widgetType ) {
		throw new Error( 'widgetType is required for toggle-favorite action' );
	}

	get$e()?.run( 'favorites/toggle', {
		name: params.widgetType,
	} );

	return {
		content: [ { type: 'text', text: `Favorite status toggled for ${ params.widgetType }.` } ],
	};
}

async function handleUiPaste( params: ToolParams ): Promise< McpToolResult > {
	if ( ! params.elementId ) {
		throw new Error( 'elementId is required for ui-paste action' );
	}

	const container = getElementor()?.getContainer( params.elementId as string );
	if ( ! container ) {
		throw new Error( `Element with ID ${ params.elementId } not found.` );
	}

	get$e()?.run( 'document/ui/paste', {
		container,
	} );

	return {
		content: [ { type: 'text', text: `UI paste performed on element ${ params.elementId }.` } ],
	};
}

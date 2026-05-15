import { type McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';

import { loadDocumentSchema, loadDocumentSettings } from './context';
import type { ElementorControls } from './types';
import { encodeToolJson, getElementor } from './utils';

export const RESOURCE_NAME_ELEMENT_SETTINGS = 'elementor-element-settings';
export const RESOURCE_URI_ELEMENT_SETTINGS_TEMPLATE = 'elementor://editor/element-settings/{elementId}';

export const RESOURCE_NAME_WIDGET_CONFIG = 'elementor-widget-config';
export const RESOURCE_URI_WIDGET_CONFIG_TEMPLATE = 'elementor://editor/widget-config/{widgetType}';

export const RESOURCE_NAME_PAGE_SETTINGS = 'elementor-page-settings';
export const RESOURCE_URI_PAGE_SETTINGS = 'elementor://editor/page-settings';

export function decodeResourceVariable( value: string ): string {
	try {
		let decoded = decodeURIComponent( value ).replace( /[·]/g, '' );
		decoded = decoded.replace( /^{|}$/g, '' );
		return decoded;
	} catch {
		return value;
	}
}

async function handleGetWidgetSettings( params: { elementId: string; action: string } ): Promise< {
	content: [ { type: 'text'; text: string } ];
} > {
	const elementor = getElementor();
	const container = elementor?.getContainer( params.elementId );
	if ( ! container ) {
		throw new Error( `Element with ID ${ params.elementId } not found.` );
	}

	const settings = container.settings.attributes || {};
	return {
		content: [ { type: 'text', text: encodeToolJson( settings ) } ],
	};
}

async function handleGetWidgetSchema( params: { widgetType: string; action: string } ): Promise< {
	content: [ { type: 'text'; text: string } ];
} > {
	const elementor = getElementor();
	const controls = elementor?.widgetsCache[ params.widgetType ]?.controls as ElementorControls | undefined;
	if ( ! controls ) {
		throw new Error( `Widget type ${ params.widgetType } not found.` );
	}

	return {
		content: [ { type: 'text', text: encodeToolJson( controls ) } ],
	};
}

export function addElementorResources( server: McpServer ): void {
	server.resource(
		RESOURCE_NAME_PAGE_SETTINGS,
		RESOURCE_URI_PAGE_SETTINGS,
		{
			description:
				'Page/document settings schema and current values including title, template, margins, padding, and backgrounds',
		},
		async ( uri ) => {
			const elementor = getElementor();
			const currentDocument = elementor?.documents?.getCurrent();
			if ( ! currentDocument ) {
				throw new Error( 'No active document found' );
			}

			const documentSchema = loadDocumentSchema( currentDocument.id );
			const documentSettings = loadDocumentSettings( currentDocument.id );

			if ( ! documentSchema || ! documentSettings ) {
				throw new Error( 'Failed to retrieve page settings' );
			}

			const result = {
				schema: documentSchema,
				currentSettings: documentSettings,
			};

			return {
				contents: [
					{
						uri: uri.toString(),
						mimeType: 'application/json',
						text: encodeToolJson( result ),
					},
				],
			};
		}
	);

	server.resource(
		RESOURCE_NAME_ELEMENT_SETTINGS,
		new ResourceTemplate( RESOURCE_URI_ELEMENT_SETTINGS_TEMPLATE, {
			list: undefined,
		} ),
		{
			description:
				'Complete settings schema and current values for a specific element, including all available configuration options and their current state',
		},
		async ( uri, variables ) => {
			let elementId = Array.isArray( variables.elementId ) ? variables.elementId[ 0 ] : variables.elementId;

			if ( ! elementId ) {
				throw new Error( 'Element ID is required' );
			}

			elementId = decodeResourceVariable( elementId );

			const result = await handleGetWidgetSettings( { elementId, action: 'get-widget-settings' } );

			return {
				contents: [
					{
						uri: uri.toString(),
						mimeType: 'text/plain',
						text: result.content[ 0 ].text,
					},
				],
			};
		}
	);

	server.resource(
		RESOURCE_NAME_WIDGET_CONFIG,
		new ResourceTemplate( RESOURCE_URI_WIDGET_CONFIG_TEMPLATE, {
			list: undefined,
		} ),
		{
			description:
				'Complete configuration schema for a specific widget type, showing all available settings, properties, and their expected formats',
		},
		async ( uri, variables ) => {
			let widgetType = Array.isArray( variables.widgetType ) ? variables.widgetType[ 0 ] : variables.widgetType;

			if ( ! widgetType ) {
				throw new Error( 'Widget type is required' );
			}

			widgetType = decodeResourceVariable( widgetType );

			const result = await handleGetWidgetSchema( { widgetType, action: 'get-widget-schema' } );

			return {
				contents: [
					{
						uri: uri.toString(),
						mimeType: 'text/plain',
						text: result.content[ 0 ].text,
					},
				],
			};
		}
	);
}

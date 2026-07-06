import { type McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';

import { loadDocumentSchema, loadDocumentSettings } from './context';
import { getCurrentEditorSelection } from './get-current-editor-selection';
import type { ElementorControls } from './types';
import { encodeToolJson, getElementor } from './utils';

export const RESOURCE_NAME_ELEMENT_SETTINGS = 'elementor-element-settings';
export const RESOURCE_URI_ELEMENT_SETTINGS_TEMPLATE = 'elementor://editor/element-settings/{elementId}';

export const RESOURCE_NAME_WIDGET_CONFIG = 'elementor-widget-config';
export const RESOURCE_URI_WIDGET_CONFIG_TEMPLATE = 'elementor://editor/widget-config/{widgetType}';

export const RESOURCE_NAME_PAGE_SETTINGS = 'elementor-page-settings';
export const RESOURCE_URI_PAGE_SETTINGS = 'elementor://editor/page-settings';

export const RESOURCE_NAME_CURRENT_CONTEXT = 'elementor-current-context';
export const RESOURCE_URI_CURRENT_CONTEXT = 'elementor://context/current-page';

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
	const widgetType = ( container.model.get?.( 'widgetType' ) ?? container.model.widgetType ) as string | undefined;
	const propSchema = widgetType ? elementor?.widgetsCache?.[ widgetType ]?.atomic_props_schema : null;

	if ( ! widgetType || ! propSchema ) {
		return { content: [ { type: 'text', text: encodeToolJson( settings ) } ] };
	}

	const dialectSettings = await convertToDialect( widgetType, settings as Record< string, unknown > );
	return { content: [ { type: 'text', text: encodeToolJson( dialectSettings ) } ] };
}

async function convertToDialect(
	widgetType: string,
	props: Record< string, unknown >
): Promise< Record< string, unknown > > {
	type ElementorV2 = { httpClient?: { post: ( url: string, data: unknown ) => Promise< { data: { data: Record< string, unknown > } } > } };
	const httpClient = ( ( window as unknown as { elementorV2?: ElementorV2 } ).elementorV2 )?.httpClient;

	if ( ! httpClient ) {
		return props;
	}

	try {
		const response = await httpClient.post( 'elementor/v1/mcp-proxy', {
			tool: 'to-dialect',
			input: { widget_type: widgetType, props, dialect: 'llm' },
		} );
		return response?.data?.data ?? props;
	} catch {
		return props;
	}
}

async function handleGetWidgetSchema( params: { widgetType: string; action: string } ): Promise< {
	content: [ { type: 'text'; text: string } ];
} > {
	const elementor = getElementor();
	const widgetCache = elementor?.widgetsCache[ params.widgetType ];

	if ( ! widgetCache ) {
		throw new Error( `Widget type ${ params.widgetType } not found.` );
	}

	if ( widgetCache.atomic_props_schema ) {
		const schema = await fetchV4WidgetSchema( params.widgetType );
		return { content: [ { type: 'text', text: encodeToolJson( schema ) } ] };
	}

	const controls = widgetCache.controls as ElementorControls | undefined;
	return {
		content: [ { type: 'text', text: encodeToolJson( controls ) } ],
	};
}

async function fetchV4WidgetSchema( widgetType: string ): Promise< unknown > {
	type ElementorV2 = { httpClient?: { get: ( url: string, config: unknown ) => Promise< { data: { data: unknown } } > } };
	const httpClient = ( ( window as unknown as { elementorV2?: ElementorV2 } ).elementorV2 )?.httpClient;

	if ( ! httpClient ) {
		return {};
	}

	try {
		const response = await httpClient.get( 'elementor/v1/mcp-proxy', {
			params: { uri: `elementor://widgets/schema/${ widgetType }` },
		} );
		return response?.data?.data ?? {};
	} catch {
		return {};
	}
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

	server.resource(
		RESOURCE_NAME_CURRENT_CONTEXT,
		RESOURCE_URI_CURRENT_CONTEXT,
		{
			description:
				'Current Elementor editor focus: which page the user is working on and which element (if any) is ' +
				'selected. Returns displayName formatted as "<PageTitle>" or "<PageTitle> > <ElementName>", plus ' +
				'documentId, selectedElementId, selectedParentId, selectedWidgetType, and selectedElementType.',
		},
		async ( uri ) => {
			const snapshot = getCurrentEditorSelection();

			if ( 'error' in snapshot ) {
				throw new Error( snapshot.error );
			}

			return {
				contents: [
					{
						uri: uri.toString(),
						mimeType: 'application/json',
						text: JSON.stringify( snapshot ),
					},
				],
			};
		}
	);
}

import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import { __privateListenTo as listenTo, commandEndEvent } from '@elementor/editor-v1-adapters';

type ExtendedWindow = Window & {
	elementor?: {
		documents?: {
			getCurrent?: () => {
				id: number;
				config: {
					type: string;
					settings?: {
						post_title?: string;
					};
				};
				container: {
					children?: ElementorContainer[];
				};
			};
		};
	};
};

type ElementorContainer = {
	id: string;
	model: {
		attributes: {
			id: string;
			elType: string;
			widgetType?: string;
			title?: string;
		};
		editor_settings?: {
			title?: string;
		};
	};
	children?: ElementorContainer[];
};

export const DOCUMENT_STRUCTURE_URI = 'elementor://document/structure';

export const initDocumentStructureResource = ( reg: MCPRegistryEntry ) => {
	const { mcpServer, sendResourceUpdated } = reg;

	let currentDocumentStructure: string | null = null;

	const updateDocumentStructure = () => {
		const structure = getDocumentStructure();
		const newStructure = JSON.stringify( structure, null, 2 );

		if ( newStructure !== currentDocumentStructure ) {
			currentDocumentStructure = newStructure;
			sendResourceUpdated( { uri: DOCUMENT_STRUCTURE_URI } );
		}
	};

	// Listen to document changes
	listenTo(
		[
			commandEndEvent( 'document/elements/create' ),
			commandEndEvent( 'document/elements/delete' ),
			commandEndEvent( 'document/elements/move' ),
			commandEndEvent( 'document/elements/copy' ),
			commandEndEvent( 'document/elements/paste' ),
			commandEndEvent( 'editor/documents/attach-preview' ),
		],
		updateDocumentStructure
	);

	// Initialize on load
	updateDocumentStructure();

	mcpServer.resource( 'document-structure', DOCUMENT_STRUCTURE_URI, async () => {
		const structure = getDocumentStructure();

		return {
			contents: [
				{
					uri: DOCUMENT_STRUCTURE_URI,
					text: JSON.stringify( structure, null, 2 ),
				},
			],
		};
	} );
};

function getDocumentStructure() {
	const extendedWindow = window as ExtendedWindow;
	const document = extendedWindow.elementor?.documents?.getCurrent?.();

	if ( ! document ) {
		return { error: 'No active document found' };
	}

	const containers = document.container?.children || [];
	const elements = ( containers as ElementorContainer[] ).map( ( container: ElementorContainer ) =>
		extractElementData( container )
	);

	return {
		documentId: document.id,
		documentType: document.config.type,
		title: document.config.settings?.post_title || 'Untitled',
		elements: elements.filter( ( el: Record< string, unknown > | null ) => el !== null ),
	};
}

function extractElementData( element: ElementorContainer ): Record< string, unknown > | null {
	if ( ! element || ! element.model ) {
		return null;
	}

	const model = element.model.attributes;
	const result: Record< string, unknown > = {
		id: model.id,
		elType: model.elType,
		widgetType: model.widgetType || undefined,
	};

	const title = model.title || element.model?.editor_settings?.title;

	if ( title ) {
		result.title = title;
	}

	if ( element.children && element.children.length > 0 ) {
		result.children = element.children
			.map( ( child: ElementorContainer ) => extractElementData( child ) )
			.filter( ( child: Record< string, unknown > | null ) => child !== null );
	}

	return result;
}

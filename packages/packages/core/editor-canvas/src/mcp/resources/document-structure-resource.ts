import {
	type ExtendedWindow as BaseExtendedWindow,
	type V1Document,
	type V1DocumentsManager,
} from '@elementor/editor-documents';
import {
	getWidgetsCache,
	type V1Element,
	type V1ElementEditorSettingsProps,
	type V1ElementModelProps,
} from '@elementor/editor-elements';
import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import { __privateListenTo as listenTo, commandEndEvent } from '@elementor/editor-v1-adapters';

type UnknownVersionElementInstanceData = V1Element & {
	model: V1Element[ 'model' ] & {
		attributes: V1ElementModelProps;
		config?: { atomic?: boolean };
		editor_settings?: V1ElementEditorSettingsProps;
	};
	children?: V1Element[];
};

type ContainerWithStructure = V1Document & {
	config: V1Document[ 'config' ] & {
		settings?: { post_title?: string };
	};
	container: V1Document[ 'container' ] & {
		children?: UnknownVersionElementInstanceData[];
	};
};

interface ExtendedWindow extends BaseExtendedWindow {
	elementor: Omit< BaseExtendedWindow[ 'elementor' ], 'documents' > & {
		documents: Omit< V1DocumentsManager, 'getCurrent' > & {
			getCurrent: () => ContainerWithStructure;
		};
	};
}

export const DOCUMENT_STRUCTURE_URI = 'elementor://document/structure';

export const initDocumentStructureResource = ( reg: MCPRegistryEntry ) => {
	const { resource, sendResourceUpdated } = reg;

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
			commandEndEvent( 'editor/documents/switch' ),
		],
		updateDocumentStructure
	);

	// Initialize on load
	updateDocumentStructure();

	resource(
		'document-structure',
		DOCUMENT_STRUCTURE_URI,
		{
			description: 'Document structure.',
		},
		async () => {
			return {
				contents: [
					{
						uri: DOCUMENT_STRUCTURE_URI,
						text: JSON.stringify( getDocumentStructure(), null, 2 ),
					},
				],
			};
		}
	);
};

function getDocumentStructure() {
	const extendedWindow = window as unknown as ExtendedWindow;
	const document = extendedWindow.elementor?.documents?.getCurrent?.();

	if ( ! document ) {
		return { error: 'No active document found' };
	}

	const containers = document.container?.children || [];
	const elements = containers.map( ( container ) => extractElementData( container ) );

	return {
		documentId: document.id,
		documentType: document.config.type,
		title: document.config.settings?.post_title || 'Untitled',
		elements: elements.filter( ( el: Record< string, unknown > | null ) => el !== null ),
	};
}

function resolveElementVersion( element: UnknownVersionElementInstanceData ): 'v3' | 'v4' {
	if ( element.model?.config?.atomic ) {
		return 'v4';
	}

	const widgetType = element.model?.attributes?.widgetType;
	if ( widgetType && getWidgetsCache()?.[ widgetType ]?.atomic_props_schema ) {
		return 'v4';
	}

	return 'v3';
}

function extractElementData( element: UnknownVersionElementInstanceData ): Record< string, unknown > | null {
	if ( ! element || ! element.model ) {
		return null;
	}

	const model = element.model.attributes;
	const result: Record< string, unknown > = {
		id: model.id,
		elType: model.elType,
		widgetType: model.widgetType || undefined,
		version: resolveElementVersion( element ),
	};

	const title = model.title || element.model?.editor_settings?.title;

	if ( title ) {
		result.title = title;
	}

	if ( element.children && element.children.length > 0 ) {
		result.children = element.children
			.map( ( child ) => extractElementData( child as UnknownVersionElementInstanceData ) )
			.filter( ( child ) => child !== null );
	}

	return result;
}

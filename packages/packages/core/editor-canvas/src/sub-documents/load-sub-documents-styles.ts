import { type Document, getV1CurrentDocument, getV1DocumentsManager } from '@elementor/editor-documents';
import { type V1ElementData } from '@elementor/editor-elements';
import { type StyleDefinition } from '@elementor/editor-styles';
import { getCanvasIframeDocument } from '@elementor/editor-v1-adapters';

import { setSubDocumentStyles } from './sub-documents-styles-provider';

const DOCUMENT_WRAPPER_ATTR = 'data-elementor-id';
const DOCUMENT_TYPE_ATTR = 'data-elementor-type';
const COMPONENT_DOCUMENT_TYPE = 'elementor_component';
const COMPONENT_WIDGET_TYPE = 'e-component';

export async function loadSubDocumentsStyles() {
	const iframeDocument = getCanvasIframeDocument();

	if ( ! iframeDocument ) {
		return;
	}

	const currentDocumentId = getV1CurrentDocument()?.id;
	const subDocumentIds = getSubDocumentIds( iframeDocument, currentDocumentId );

	if ( ! subDocumentIds.length ) {
		return;
	}

	const documents = await fetchDocuments( subDocumentIds );

	const componentIds = documents.flatMap( ( doc ) => extractComponentIds( doc.elements ?? [] ) );
	const componentDocuments = componentIds.length ? await fetchDocuments( componentIds ) : [];

	const allDocuments = [ ...documents, ...componentDocuments ];
	const styles = allDocuments.flatMap( extractStylesFromDocument );

	setSubDocumentStyles( styles );
}

function getSubDocumentIds( iframeDocument: globalThis.Document, currentDocumentId?: number ): number[] {
	const elements = [ ...iframeDocument.body.querySelectorAll< HTMLElement >( `[${ DOCUMENT_WRAPPER_ATTR }]` ) ];

	const ids = elements
		.filter( ( el ) => el.getAttribute( DOCUMENT_TYPE_ATTR ) !== COMPONENT_DOCUMENT_TYPE )
		.map( ( el ) => Number( el.getAttribute( DOCUMENT_WRAPPER_ATTR ) ) )
		.filter( ( id ) => ! isNaN( id ) && id !== currentDocumentId );

	return [ ...new Set( ids ) ];
}

async function fetchDocuments( ids: number[] ): Promise< Document[] > {
	const documentsManager = getV1DocumentsManager();

	const results = await Promise.all(
		ids.map( async ( id ) => {
			try {
				return await documentsManager.request< Document >( id );
			} catch {
				return null;
			}
		} )
	);

	return results.filter( ( doc ): doc is Document => doc !== null );
}

function extractComponentIds( elements: V1ElementData[] ): number[] {
	const ids: number[] = [];

	for ( const element of elements ) {
		if ( isComponentInstance( element ) ) {
			const componentId = getComponentId( element );

			if ( componentId ) {
				ids.push( componentId );
			}
		}

		if ( element.elements?.length ) {
			ids.push( ...extractComponentIds( element.elements ) );
		}
	}

	return [ ...new Set( ids ) ];
}

function isComponentInstance( element: V1ElementData ): boolean {
	return element.widgetType === COMPONENT_WIDGET_TYPE || element.elType === COMPONENT_WIDGET_TYPE;
}

function getComponentId( element: V1ElementData ): number | null {
	const instance = element.settings?.component_instance as
		| { value?: { component_id?: { value?: number } } }
		| undefined;

	return instance?.value?.component_id?.value ?? null;
}

function extractStylesFromDocument( document: Document ): StyleDefinition[] {
	if ( ! document.elements?.length ) {
		return [];
	}

	return document.elements.flatMap( extractStylesFromElement );
}

function extractStylesFromElement( element: V1ElementData ): StyleDefinition[] {
	return [
		...Object.values( element.styles ?? {} ),
		...( element.elements ?? [] ).flatMap( extractStylesFromElement ),
	];
}

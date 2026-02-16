import { type Document, getV1CurrentDocument } from '@elementor/editor-documents';
import { type V1ElementData } from '@elementor/editor-elements';
import { type StyleDefinition } from '@elementor/editor-styles';
import { ajax, getCanvasIframeDocument } from '@elementor/editor-v1-adapters';
import { __dispatch as dispatch } from '@elementor/store';

import { slice } from './store';
import { addTemplateStyles } from './templates-styles-provider';

const TEMPLATE_ATTRIBUTE = 'data-elementor-post-type="elementor_library"';
const DOCUMENT_WRAPPER_ATTR = 'data-elementor-id';

export async function loadTemplatesStyles() {
	const iframeDocument = getCanvasIframeDocument();

	if ( ! iframeDocument ) {
		return;
	}

	const currentDocumentId = getV1CurrentDocument()?.id;
	const templateIds = getTemplateIds( iframeDocument, currentDocumentId );

	if ( ! templateIds.length ) {
		return;
	}

	const documents = await fetchDocuments( templateIds );

	dispatch( slice.actions.setTemplates( documents ) );

	const styles = documents.flatMap( extractStylesFromDocument );
	await addTemplateStyles( styles );
}

function getTemplateIds( iframeDocument: globalThis.Document, currentDocumentId?: number ): number[] {
	const elements = [ ...iframeDocument.body.querySelectorAll< HTMLElement >( `[${ TEMPLATE_ATTRIBUTE }]` ) ];

	const ids = elements
		.map( ( el ) => Number( el.getAttribute( DOCUMENT_WRAPPER_ATTR ) ) )
		.filter( ( id ) => ! isNaN( id ) && id !== currentDocumentId );

	return [ ...new Set( ids ) ];
}

async function fetchDocuments( ids: number[] ): Promise< Document[] > {
	const results = await Promise.all(
		ids.map( async ( id ) => {
			try {
				return await ajax.load< { id: number }, Document >( {
					data: { id },
					action: 'get_document_config',
					unique_id: `template-${ id }`,
				} );
			} catch {
				return null;
			}
		} )
	);

	return results.filter( ( doc ): doc is Document => doc !== null );
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

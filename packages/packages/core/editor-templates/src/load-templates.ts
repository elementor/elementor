import { type Document, getV1CurrentDocument } from '@elementor/editor-documents';
import { type V1ElementData, type V1ElementSettingsProps } from '@elementor/editor-elements';
import { ajax, getCanvasIframeDocument } from '@elementor/editor-v1-adapters';
import { __dispatch as dispatch } from '@elementor/store';

import { slice } from './store';

const TEMPLATE_ATTRIBUTE = 'data-elementor-post-type="elementor_library"';
const DOCUMENT_WRAPPER_ATTR = 'data-elementor-id';

export async function loadTemplates() {
	const iframeDocument = getCanvasIframeDocument();

	if ( ! iframeDocument ) {
		return;
	}

	const templateIds = getTemplateIds( iframeDocument );

	if ( ! templateIds.length ) {
		return;
	}

	const documents = await fetchDocuments( templateIds );

	dispatch( slice.actions.setTemplates( documents ) );
}

export function unloadTemplates() {
	dispatch( slice.actions.clearTemplates() );
}

function getTemplateIds( iframeDocument: globalThis.Document ): number[] {
	const fromDom = getTemplateIdsFromDomElements( iframeDocument );
	const fromConfig = getTemplateIdsFromConfig();

	return [ ...new Set( [ ...fromDom, ...fromConfig ] ) ];
}

function getTemplateIdsFromDomElements( iframeDocument: globalThis.Document ) {
	const { id: currentDocumentId } = getV1CurrentDocument();
	const domElements = [ ...iframeDocument.body.querySelectorAll< HTMLElement >( `[${ TEMPLATE_ATTRIBUTE }]` ) ];

	return domElements
		.map( ( el ) => Number( el.getAttribute( DOCUMENT_WRAPPER_ATTR ) ) )
		.filter( ( id ) => ! isNaN( id ) && id !== currentDocumentId );
}

function getTemplateIdsFromConfig() {
	const {
		config: { elements = [] },
	} = getV1CurrentDocument();

	const flattenElements = ( els: V1ElementData[] ): V1ElementData[] => {
		return els.flatMap( ( element ) => [ element, ...flattenElements( element.elements ?? [] ) ] );
	};

	return (
		flattenElements( elements as V1ElementData[] ).filter(
			( element ) => element.settings?.template_id
		) as ( V1ElementData & { settings: V1ElementSettingsProps & { template_id: string } } )[]
	 ).map( ( element ) => Number( element.settings.template_id ) );
}

async function fetchDocuments( ids: number[] ): Promise< Document[] > {
	const results = await Promise.all(
		ids.map( async ( id ) => {
			try {
				// using ajax.load instead of the document-manager as the latter causes an issue when trying to edit a template
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

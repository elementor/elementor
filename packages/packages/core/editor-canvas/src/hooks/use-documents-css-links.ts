import { __privateUseListenTo as useListenTo, commandEndEvent } from '@elementor/editor-v1-adapters';

import { getCanvasIframeDocument } from '../sync/get-canvas-iframe-document';

const REMOVED_ATTR = 'data-e-removed';
const DOCUMENT_WRAPPER_ATTR = 'data-elementor-id';
const CSS_LINK_ID_PREFIX = 'elementor-post-';
const CSS_LINK_ID_SUFFIX = '-css';

export function useDocumentsCssLinks() {
	return useListenTo( commandEndEvent( 'editor/documents/attach-preview' ), () => {
		const iframeDocument = getCanvasIframeDocument();

		if ( ! iframeDocument ) {
			return [];
		}

		const relevantLinkIds = getDocumentsIdsInCanvas( iframeDocument ).map(
			( id ) => `${ CSS_LINK_ID_PREFIX }${ id }${ CSS_LINK_ID_SUFFIX }`
		);

		const links = getDocumentsCssLinks( iframeDocument ).filter( ( link ) =>
			relevantLinkIds.includes( link.getAttribute( 'id' ) ?? '' )
		);

		links.forEach( ( link ) => {
			if ( ! link.hasAttribute( REMOVED_ATTR ) ) {
				link.remove();
			}
		} );

		return links.map( ( link ) => ( {
			...getLinkAttrs( link ),
			id: link.getAttribute( 'id' ) ?? '',
			[ REMOVED_ATTR ]: true,
		} ) );
	} );
}

function getDocumentsIdsInCanvas( document: Document ) {
	return [ ...( document.body.querySelectorAll< HTMLElement >( `[${ DOCUMENT_WRAPPER_ATTR }]` ) ?? [] ) ].map(
		( el ) => el.getAttribute( DOCUMENT_WRAPPER_ATTR ) || ''
	);
}

function getDocumentsCssLinks( document: Document ) {
	return [
		...( document.head.querySelectorAll< HTMLLinkElement >(
			`link[rel="stylesheet"][id^=${ CSS_LINK_ID_PREFIX }][id$=${ CSS_LINK_ID_SUFFIX }]`
		) ?? [] ),
	];
}

function getLinkAttrs( el: HTMLLinkElement ) {
	const entries = [ ...el.attributes ].map( ( attr ) => [ attr.name, attr.value ] as const );

	return Object.fromEntries( entries );
}

import { type Document } from '@elementor/editor-documents';
import { type V1ElementData } from '@elementor/editor-elements';
import { type StyleDefinition } from '@elementor/editor-styles';
import { __dispatch as dispatch, __getState as getState } from '@elementor/store';

import { type ComponentDocumentsMap } from '../../utils/get-component-documents';
import { selectStyles, slice } from '../store';

export function loadComponentsStyles( documents: ComponentDocumentsMap ) {
	if ( ! documents.size ) {
		return;
	}

	const knownComponents = selectStyles( getState() );
	const unknownDocuments = new Map( [ ...documents.entries() ].filter( ( [ id ] ) => ! knownComponents[ id ] ) );

	if ( ! unknownDocuments.size ) {
		return;
	}

	addStyles( unknownDocuments );
}

function addStyles( documents: ComponentDocumentsMap ) {
	const styles = Object.fromEntries(
		[ ...documents.entries() ].map( ( [ id, document ] ) => [ id, extractStylesFromDocument( document ) ] )
	);

	dispatch( slice.actions.addStyles( styles ) );
}

function extractStylesFromDocument( document: Document ): Array< StyleDefinition > {
	if ( ! document.elements?.length ) {
		return [];
	}

	return document.elements.flatMap( extractStylesFromElement );
}

function extractStylesFromElement( element: V1ElementData ): Array< StyleDefinition > {
	return [
		...Object.values( element.styles ?? {} ),
		...( element.elements ?? [] ).flatMap( extractStylesFromElement ),
	];
}

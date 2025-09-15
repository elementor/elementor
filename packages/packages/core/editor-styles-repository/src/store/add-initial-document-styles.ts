import { type StyleDefinition } from '@elementor/editor-styles';
import { __dispatch as dispatch, __getState as getState } from '@elementor/store';

import { type DocumentElement, load } from './document-config';
import { selectData, slice } from './initial-documents-styles-store';

type InitialDocumentId = number;

export async function addInitialDocumentStyles( ids: InitialDocumentId[] ) {
	const data = selectData( getState() );

	const entries = await Promise.all(
		ids
			.filter( ( id ) => ! data[ id ] )
			.map( async ( id ) => [ id, await fetchDocumentStyleDefinitions( id ) ] as const )
	);

	dispatch( slice.actions.add( Object.fromEntries( entries ) ) );
}

async function fetchDocumentStyleDefinitions( id: number ): Promise< StyleDefinition[] > {
	const config = await load( id );

	return extractStyles( config );
}

function extractStyles( element: DocumentElement ): Array< StyleDefinition > {
	return [ ...Object.values( element.styles ?? {} ), ...( element.elements ?? [] ).flatMap( extractStyles ) ];
}

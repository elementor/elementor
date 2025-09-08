import { type StyleDefinition, type StyleDefinitionID } from '@elementor/editor-styles';
import { __dispatch as dispatch, __getState as getState } from '@elementor/store';

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

function fetchDocumentStyleDefinitions( id: number ): Promise< StyleDefinition[] > {
	return new Promise( ( resolve, reject ) => {
		window.elementorCommon.ajax.load( {
			action: 'get_document_config',
			unique_id: `document-styles-${ id }`,
			data: { id },
			success: ( result: Element ) => {
				try {
					resolve( extractStyles( result ) );
				} catch ( error ) {
					reject( error );
				}
			},
			error: ( error: unknown ) => {
				reject( error );
			},
		} );
	} );
}

type Element = {
	elements: Array< Element >;
	styles?: Record< StyleDefinitionID, StyleDefinition >;
};

function extractStyles( element: Element ): Array< StyleDefinition > {
	return [ ...Object.values( element.styles ?? {} ), ...( element.elements ?? [] ).flatMap( extractStyles ) ];
}

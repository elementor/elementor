import { ajax } from '@elementor/editor-v1-adapters';

export async function load( id: number ) {
	return new Promise( ( success, error ) => {
		ajax.load( {
			...getParams( id ),
			success,
			error,
		} );
	} );
}

export async function invalidateCache( id: number ) {
	ajax.invalidateCache( {
		...getParams( id ),
	} );
}

function getParams( id: number ) {
	return {
		action: 'get_document_config',
		unique_id: `document-config-${ id }`,
		data: { id },
	};
}
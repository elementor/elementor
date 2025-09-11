import { ajax } from '@elementor/editor-v1-adapters';

export async function load( id: number ) {
	return ajax.load( getParams( id ) );
}

export async function invalidateCache( id: number ) {
	ajax.invalidateCache( getParams( id ) );
}

function getParams( id: number ) {
	return {
		action: 'get_document_config',
		unique_id: `document-config-${ id }`,
		data: { id },
	};
}
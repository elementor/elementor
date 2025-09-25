import { ajax } from '@elementor/editor-v1-adapters';

import { type DocumentElement } from '../types';

type ComponentParams = {
	id: number;
};

export async function load( id: number ) {
	return ajax.load< ComponentParams, DocumentElement >( getParams( id ) );
}

export async function invalidateCache( id: number ) {
	ajax.invalidateCache< ComponentParams >( getParams( id ) );
}

function getParams( id: number ) {
	return {
		action: 'get_document_config',
		unique_id: `document-config-${ id }`,
		data: { id },
	};
}

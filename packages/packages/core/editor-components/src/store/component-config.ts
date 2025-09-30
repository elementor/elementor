import { type V1ElementData } from '@elementor/editor-elements';
import { ajax } from '@elementor/editor-v1-adapters';

type ComponentParams = {
	id: number;
};

export async function load( id: number ) {
	return ajax.load< ComponentParams, V1ElementData >( getParams( id ) );
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

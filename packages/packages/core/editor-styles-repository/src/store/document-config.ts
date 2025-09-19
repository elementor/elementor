import { type StyleDefinition, type StyleDefinitionID } from '@elementor/editor-styles';
import { ajax } from '@elementor/editor-v1-adapters';

export type DocumentElement = {
	elements: Array< DocumentElement >;
	styles?: Record< StyleDefinitionID, StyleDefinition >;
};

export async function load( id: number ) {
	return ajax.load< { id: number }, DocumentElement >( getParams( id ) );
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

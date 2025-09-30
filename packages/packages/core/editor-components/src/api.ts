import { type V1ElementData, type V1ElementModelProps } from '@elementor/editor-elements';
import { ajax } from '@elementor/editor-v1-adapters';
import { type HttpResponse, httpService } from '@elementor/http-client';

import { type Component } from './types';

const BASE_URL = 'elementor/v1/components';

export type CreateComponentPayload = {
	name: string;
	content: V1ElementModelProps[];
};

type GetComponentResponse = Array< Component >;

export type CreateComponentResponse = {
	component_id: number;
};

export const apiClient = {
	get: () =>
		httpService()
			.get< HttpResponse< GetComponentResponse > >( `${ BASE_URL }` )
			.then( ( res ) => res.data.data ),
	create: ( payload: CreateComponentPayload ) =>
		httpService()
			.post< HttpResponse< CreateComponentResponse > >( `${ BASE_URL }`, payload )
			.then( ( res ) => res.data.data ),
	getConfig: ( id: number ) => {
		const test = ajax.load< { id: number }, V1ElementData >( getParams( id ) );
		console.log( 'LOG:: getConfig', test );
		return test;
	},
	invalidateCache: ( id: number ) => ajax.invalidateCache< { id: number } >( getParams( id ) ),
};

function getParams( id: number ) {
	console.log( 'LOG:: getParams', id );
	return {
		action: 'get_document_config',
		unique_id: `document-config-${ id }`,
		data: { id },
	};
}

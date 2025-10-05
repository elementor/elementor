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

export const getParams = ( id: number ) => ( {
	action: 'get_document_config',
	unique_id: `document-config-${ id }`,
	data: { id },
} );

export const apiClient = {
	get: () =>
		httpService()
			.get< HttpResponse< GetComponentResponse > >( `${ BASE_URL }` )
			.then( ( res ) => res.data.data ),
	create: ( payload: CreateComponentPayload ) =>
		httpService()
			.post< HttpResponse< CreateComponentResponse > >( `${ BASE_URL }`, payload )
			.then( ( res ) => res.data.data ),
	getConfig: ( id: number ) => ajax.load< { id: number }, V1ElementData >( getParams( id ) ),
	invalidateCache: ( id: number ) => ajax.invalidateCache< { id: number } >( getParams( id ) ),
};

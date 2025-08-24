import { type V1ElementModelProps } from '@elementor/editor-elements';
import { httpService } from '@elementor/http-client';

const RESOURCE_URL = '/components';
const BASE_URL = 'elementor/v1';

type CreateComponentPayload = {
	name: string;
	content: V1ElementModelProps[];
};

type GetComponentResponse = Array< {
	component_id: number;
	name: string;
} >;

export type CreateComponentResponse = {
	component_id: number;
};

export const apiClient = {
	get: () =>
		httpService()
			.get< GetComponentResponse >( `${ BASE_URL }${ RESOURCE_URL }` )
			.then( ( res ) => res.data ),
	create: ( payload: CreateComponentPayload ) =>
		httpService().post< CreateComponentResponse >( `${ BASE_URL }${ RESOURCE_URL }`, payload ),
};

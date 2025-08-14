import { type V1ElementModelProps } from '@elementor/editor-elements';
import { httpService } from '@elementor/http-client';

const RESOURCE_URL = '/components';
const BASE_URL = 'elementor/v1';

type ComponentCreatePayload = {
	name: string;
	content: V1ElementModelProps[];
};

export type ComponentCreateResponse = {
	component_id: number;
};

export const apiClient = {
	create: ( payload: ComponentCreatePayload ) =>
		httpService().post< ComponentCreateResponse >( `${ BASE_URL }${ RESOURCE_URL }`, payload ),
};

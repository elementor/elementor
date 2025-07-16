import { type HttpResponse, httpService } from '@elementor/http-client';

const RESOURCE_URL = '/design-system-generator';

type CurrentDataResponse = HttpResponse< any >;


export type ApiContext = 'preview' | 'frontend';

export const apiClient = {
	all: () => httpService().get< CurrentDataResponse >( 'elementor/v1' + RESOURCE_URL ),
};

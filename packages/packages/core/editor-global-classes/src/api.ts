import { type StyleDefinition, type StyleDefinitionID, type StyleDefinitionsMap } from '@elementor/editor-styles';
import { type HttpResponse, httpService } from '@elementor/http-client';

import { type CssClassUsage } from './components/css-class-usage/types';
import { type GlobalClasses } from './store';

const RESOURCE_URL = '/global-classes';
const BASE_URL = 'elementor/v1';
const RESOURCE_USAGE_URL = `${ RESOURCE_URL }/usage`;

type GlobalClassesUsageResponse = HttpResponse< CssClassUsage >;

export type GlobalClassesGetAllResponse = HttpResponse<
	StyleDefinitionsMap,
	{
		order: StyleDefinition[ 'id' ][];
	}
>;

type UpdatePayload = GlobalClasses & {
	changes: {
		added: StyleDefinitionID[];
		deleted: StyleDefinitionID[];
		modified: StyleDefinitionID[];
	};
};

export type ApiContext = 'preview' | 'frontend';

export const apiClient = {
	usage: () => httpService().get< GlobalClassesUsageResponse >( `${ BASE_URL }${ RESOURCE_USAGE_URL }` ),

	all: ( context: ApiContext = 'preview' ) =>
		httpService().get< GlobalClassesGetAllResponse >( `${ BASE_URL }${ RESOURCE_URL }`, {
			params: { context },
		} ),

	publish: ( payload: UpdatePayload ) =>
		httpService().put( 'elementor/v1' + RESOURCE_URL, payload, {
			params: {
				context: 'frontend' satisfies ApiContext,
			},
		} ),

	saveDraft: ( payload: UpdatePayload ) =>
		httpService().put( 'elementor/v1' + RESOURCE_URL, payload, {
			params: {
				context: 'preview' satisfies ApiContext,
			},
		} ),
};

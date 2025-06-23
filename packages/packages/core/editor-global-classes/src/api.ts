import { type StyleDefinition, type StyleDefinitionID, type StyleDefinitionsMap } from '@elementor/editor-styles';
import { type HttpResponse, httpService } from '@elementor/http-client';

import { type GlobalClasses } from './store';

const RESOURCE_URL = '/global-classes';

export type GlobalClassesGetAllResponse = HttpResponse< StyleDefinitionsMap, { order: StyleDefinition[ 'id' ][] } >;

type UpdatePayload = GlobalClasses & {
	changes: {
		added: StyleDefinitionID[];
		deleted: StyleDefinitionID[];
		modified: StyleDefinitionID[];
	};
};

export type ApiContext = 'preview' | 'frontend';

export const apiClient = {
	all: ( context: ApiContext = 'preview' ) =>
		httpService().get< GlobalClassesGetAllResponse >( 'elementor/v1' + RESOURCE_URL, {
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

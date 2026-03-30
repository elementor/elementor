import { type StyleDefinition, type StyleDefinitionID, type StyleDefinitionsMap } from '@elementor/editor-styles';
import { type HttpResponse, httpService } from '@elementor/http-client';

import { type CssClassUsage } from './components/css-class-usage/types';
import { type GlobalClasses } from './store';

const RESOURCE_URL = '/global-classes';
const BASE_URL = 'elementor/v1';
const RESOURCE_USAGE_URL = `${ RESOURCE_URL }/usage`;
const RESOURCE_INDEX_URL = `${ RESOURCE_URL }/index`;

type GlobalClassesUsageResponse = HttpResponse< CssClassUsage >;

export type GlobalClassesGetAllResponse = HttpResponse<
	StyleDefinitionsMap,
	{
		order: StyleDefinition[ 'id' ][];
	}
>;

export type GlobalClassesIndexItem = {
	label: string;
};

export type GlobalClassesIndexMap = Record< StyleDefinitionID, GlobalClassesIndexItem >;

export type GlobalClassesIndexResponse = HttpResponse<
	GlobalClassesIndexMap,
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

	getIndex: () => httpService().get< GlobalClassesIndexResponse >( `${ BASE_URL }${ RESOURCE_INDEX_URL }` ),

	getByIds: ( ids: StyleDefinitionID[], context: ApiContext = 'preview' ) =>
		httpService().get< GlobalClassesGetAllResponse >( `${ BASE_URL }${ RESOURCE_URL }`, {
			params: { context, ids: ids.join( ',' ) },
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

export const API_ERROR_CODES = {
	DUPLICATED_LABEL: 'DUPLICATED_LABEL',
};

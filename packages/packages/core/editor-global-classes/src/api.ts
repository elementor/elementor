import { type StyleDefinition, type StyleDefinitionID } from '@elementor/editor-styles';
import { type HttpResponse, httpService } from '@elementor/http-client';

import { type CssClassUsage } from './components/css-class-usage/types';
import { type GlobalClasses } from './store';

const RESOURCE_URL = '/global-classes';
const BASE_URL = 'elementor/v1';
const RESOURCE_USAGE_URL = `${ RESOURCE_URL }/usage`;
const RESOURCE_POST_URL = `${ RESOURCE_URL }/post`;
const RESOURCE_STYLES_URL = `${ RESOURCE_URL }/styles`;

type GlobalClassesUsageResponse = HttpResponse< CssClassUsage >;

export type GlobalClassIndexEntry = {
	id: StyleDefinitionID;
	label: string;
};

export type GlobalClassesIndexHttpResponse = HttpResponse< GlobalClassIndexEntry[], Record< string, never > >;

export type StyleDefinitionsNullableMap = Record< StyleDefinitionID, StyleDefinition | null >;

export type GlobalClassesStylesHttpResponse = HttpResponse<
	StyleDefinitionsNullableMap,
	{
		order: StyleDefinitionID[];
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
		httpService().get< GlobalClassesIndexHttpResponse >( `${ BASE_URL }${ RESOURCE_URL }`, {
			params: { context },
		} ),

	getStylesForPost: ( postId: number, context: ApiContext = 'preview' ) =>
		httpService().get< GlobalClassesStylesHttpResponse >( `${ BASE_URL }${ RESOURCE_POST_URL }`, {
			params: { context, post_id: postId },
		} ),

	getStylesByIds: ( ids: StyleDefinitionID[], context: ApiContext = 'preview' ) =>
		httpService().get< GlobalClassesStylesHttpResponse >( `${ BASE_URL }${ RESOURCE_STYLES_URL }`, {
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

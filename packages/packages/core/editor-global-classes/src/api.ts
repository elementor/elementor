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

export type GlobalClassesIndexHttpResponse = HttpResponse<
	GlobalClassIndexEntry[],
	{
		version: number;
	}
>;

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
	// Optimistic-concurrency token returned by the last index read. The server rejects
	// a save with a 409 when the stored version has advanced past this one, which means
	// this edit was based on a stale snapshot and must be retried against fresh data.
	version?: number;
};

export type ApiContext = 'preview' | 'frontend';

function saveGlobalClasses( context: ApiContext, payload: UpdatePayload ) {
	return httpService().put( `${ BASE_URL }${ RESOURCE_URL }`, payload, {
		params: { context },
	} );
}

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

	publish: ( payload: UpdatePayload ) => saveGlobalClasses( 'frontend', payload ),

	saveDraft: ( payload: UpdatePayload ) => saveGlobalClasses( 'preview', payload ),
};

export const API_ERROR_CODES = {
	DUPLICATED_LABEL: 'DUPLICATED_LABEL',
	CONFLICT: 'global_classes_conflict',
};

export function isConflictError( error: unknown ): boolean {
	return ( error as { response?: { status?: number } } )?.response?.status === 409;
}

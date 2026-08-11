import { type StyleDefinition, type StyleDefinitionID } from '@elementor/editor-styles';
import { type HttpResponse, httpService } from '@elementor/http-client';

import { type AllowedHtmlTag } from './allowed-tags';

const RESOURCE_URL = '/default-styles';
const BASE_URL = 'elementor/v1';

export type ApiContext = 'preview' | 'frontend';

export type DefaultStylesMap = Record< StyleDefinitionID, StyleDefinition >;

type DefaultStylesHttpResponse = HttpResponse< DefaultStylesMap >;

export const apiClient = {
	all: ( context: ApiContext = 'preview' ) =>
		httpService().get< DefaultStylesHttpResponse >( `${ BASE_URL }${ RESOURCE_URL }`, {
			params: { context },
		} ),

	put: ( tag: AllowedHtmlTag, variants: StyleDefinition[ 'variants' ], context: ApiContext = 'preview' ) =>
		httpService().put(
			`${ BASE_URL }${ RESOURCE_URL }/${ tag }`,
			{
				type: 'class',
				variants,
			},
			{
				params: { context },
			}
		),

	delete: ( tag: AllowedHtmlTag, context: ApiContext = 'preview' ) =>
		httpService().delete( `${ BASE_URL }${ RESOURCE_URL }/${ tag }`, {
			params: { context },
		} ),

	publish: () => httpService().post< DefaultStylesHttpResponse >( `${ BASE_URL }${ RESOURCE_URL }/publish` ),
};

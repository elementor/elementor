import { type StyleDefinition, type StyleDefinitionID, type StyleDefinitionsMap } from '@elementor/editor-styles';
import { type HttpResponse, httpService } from '@elementor/http-client';

import { type ComponentsStyles } from './store';
import { collapseTextChangeRangesAcrossMultipleVersions } from 'typescript';

const BASE_URL = 'elementor/v1';
const RESOURCE_URL = '/components';
const ALL_STYLES_URL = `${ RESOURCE_URL }/styles`;
const COMPONENT_STYLES_URL = `${ RESOURCE_URL }/styles/:styleId`;


export type ComponentsStylesGetAllResponse = HttpResponse<
	StyleDefinitionsMap
>;

export type ApiContext = 'preview' | 'frontend';

export const apiClient = {
	all: ( context: ApiContext = 'preview' ): Promise<ComponentsStylesGetAllResponse> => new Promise( async ( resolve ) => {
			resolve( {
				data: {
					'atomic-component-mock-style-123': {
						id: 'atomic-component-mock-style-123',
						label: 'Style 1',
						type: 'class',
						variants: [
							{
								meta: {
									breakpoint: 'desktop',
									state: null
								},
								props: {
									color: {
										$$type: 'color',
										value: 'red',
									},
									'font-weight': {
										$$type: 'string',
										value: '700',
									}
								},
								custom_css: null,
							}
						]
					},
				},
				meta: {},
			} );
		} ),
};

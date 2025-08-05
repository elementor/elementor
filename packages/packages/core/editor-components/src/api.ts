import { type StyleDefinitionsMap } from '@elementor/editor-styles';
import { type HttpResponse } from '@elementor/http-client';

export type ComponentsStylesGetAllResponse = HttpResponse< StyleDefinitionsMap >;

// TODO - add context to the API
/**
 * type ApiContext = 'preview' | 'frontend';
 * export const apiClient = {
 *   all: ( context: ApiContext = 'preview' ): ...
 *   ...
 * }
 */

export const apiClient = {
	all: (): Promise< ComponentsStylesGetAllResponse > =>
		new Promise( async ( resolve ) => {
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
									state: null,
								},
								props: {
									color: {
										$$type: 'color',
										value: 'red',
									},
									'font-weight': {
										$$type: 'string',
										value: '700',
									},
								},
								custom_css: null,
							},
						],
					},
				},
				meta: {},
			} );
		} ),
};

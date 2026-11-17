import { type HttpResponse, httpService } from '@elementor/http-client';

import { type CompositeWidgetDefinitions } from './types';

const BASE_URL = 'elementor/v1/composite-widgets';

export const apiClient = {
	getDefinitions: () =>
		httpService()
			.get< HttpResponse< CompositeWidgetDefinitions | [] > >( BASE_URL )
			.then( ( res ) => toDefinitionsMap( res.data.data ) ),
};

// PHP encodes an empty associative array as `[]`.
function toDefinitionsMap( data: CompositeWidgetDefinitions | [] ): CompositeWidgetDefinitions {
	return Array.isArray( data ) ? {} : data;
}

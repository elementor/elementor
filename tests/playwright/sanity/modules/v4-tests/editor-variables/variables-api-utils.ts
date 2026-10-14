import { type APIRequestContext } from '@playwright/test';
import type ApiRequests from '../../../../assets/api-requests';

const VARIABLES_LIST_ROUTE = 'index.php?rest_route=/elementor/v1/variables/list';
const VARIABLES_BATCH_ROUTE = 'index.php?rest_route=/elementor/v1/variables/batch';

interface CreateVariableOptions {
  id: string;
	label: string;
	value: string;
	type: string;
	syncToV3?: boolean;
}

async function getVariables( apiRequests: ApiRequests, request: APIRequestContext ) {
	const response = await apiRequests.customGet( request, VARIABLES_LIST_ROUTE );

	return response.data;
}

export async function createVariableWithSync(
	apiRequests: ApiRequests,
	request: APIRequestContext,
	options: CreateVariableOptions,
) {
	const { watermark } = await getVariables( apiRequests, request );

	return await apiRequests.post( request, VARIABLES_BATCH_ROUTE, {
		watermark,
		operations: [ {
			type: 'create',
			variable: {
				id: options.id,
				type: options.type,
				label: options.label,
				value: options.value,
				sync_to_v3: options.syncToV3 ?? true,
			},
		} ],
	} );
}

export async function deleteAllVariablesViaApi(
	apiRequests: ApiRequests,
	request: APIRequestContext,
) {
	const { variables, watermark } = await getVariables( apiRequests, request );
	const variableIds = variables ? Object.keys( variables ) : [];

	if ( 0 === variableIds.length ) {
		return;
	}

	const operations = variableIds.map( ( id ) => ( {
		type: 'delete',
		id,
	} ) );

	await apiRequests.post( request, VARIABLES_BATCH_ROUTE, {
		watermark,
		operations,
	} );
}

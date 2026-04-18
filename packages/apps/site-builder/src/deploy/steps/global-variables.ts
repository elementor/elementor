import apiFetch from '@wordpress/api-fetch';

import type { DeployGlobalVariables } from '../types';

export async function deployGlobalVariables( globalVariables: DeployGlobalVariables ) {
	await apiFetch( {
		path: '/elementor/v1/site-builder/deploy-design-system',
		method: 'POST',
		data: { globalVariables },
	} );
}

import apiFetch from '@wordpress/api-fetch';

import { DEPLOY_DESIGN_SYSTEM_PATH, type DeployGlobalVariables } from '../types';

export async function deployGlobalVariables( globalVariables: DeployGlobalVariables ) {
	await apiFetch( {
		path: DEPLOY_DESIGN_SYSTEM_PATH,
		method: 'POST',
		data: { globalVariables },
	} );
}

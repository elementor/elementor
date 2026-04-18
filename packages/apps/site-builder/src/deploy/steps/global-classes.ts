import apiFetch from '@wordpress/api-fetch';

import { DEPLOY_DESIGN_SYSTEM_PATH, type DeployGlobalClasses } from '../types';

export async function deployGlobalClasses( globalClasses: DeployGlobalClasses ) {
	await apiFetch( {
		path: DEPLOY_DESIGN_SYSTEM_PATH,
		method: 'POST',
		data: { globalClasses },
	} );
}

import apiFetch from '@wordpress/api-fetch';

import type { DeployGlobalClasses } from '../types';

export async function deployGlobalClasses( globalClasses: DeployGlobalClasses ) {
	await apiFetch( {
		path: '/elementor/v1/site-builder/deploy-design-system',
		method: 'POST',
		data: { globalClasses },
	} );
}

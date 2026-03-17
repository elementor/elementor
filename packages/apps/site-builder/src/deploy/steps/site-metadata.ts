import apiFetch from '@wordpress/api-fetch';

import type { DeployPayload } from '../types';

export async function setSiteMetadata( siteMeta: DeployPayload[ 'siteMeta' ] ) {
	await apiFetch( {
		path: '/wp/v2/settings',
		method: 'POST',
		data: {
			title: siteMeta.title,
			description: siteMeta.tagline,
		},
	} );
}

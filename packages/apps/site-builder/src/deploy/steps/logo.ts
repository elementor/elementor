import apiFetch from '@wordpress/api-fetch';

import type { DeployLogo, WpPost } from '../types';

export async function uploadLogo( logo: DeployLogo ) {
	const imageResponse = await fetch( logo.url );

	if ( ! imageResponse.ok ) {
		throw new Error( `Failed to download logo: ${ imageResponse.status }` );
	}

	const imageBlob = await imageResponse.blob();

	const media = await apiFetch< WpPost >( {
		path: '/wp/v2/media',
		method: 'POST',
		body: imageBlob,
		headers: {
			'Content-Disposition': `attachment; filename="${ logo.filename }"`,
			'Content-Type': imageBlob.type || 'image/png',
		},
	} );

	await apiFetch( {
		path: '/wp/v2/settings',
		method: 'POST',
		data: { site_logo: media.id },
	} );
}

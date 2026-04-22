import apiFetch from '@wordpress/api-fetch';

import type { DeployLogo, WpPost } from '../types';

export async function uploadLogo( logo: DeployLogo ) {
	if ( ! logo.url.startsWith( 'https://assets.elementor.com/' ) ) {
		throw new Error( 'Invalid logo URL: must be from assets.elementor.com over HTTPS' );
	}

	const cleanedFilename = logo.filename.replace( /["\r\n]/g, '' ).replace( /[^\w.-]/g, '_' );

	if ( ! cleanedFilename ) {
		throw new Error( 'Invalid logo filename' );
	}

	const ext = cleanedFilename.includes( '.' ) ? '.' + cleanedFilename.split( '.' ).pop() : '';
	const base = cleanedFilename.slice( 0, 255 - ext.length );
	const sanitizedFilename = base + ext;

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
			'Content-Disposition': `attachment; filename="${ sanitizedFilename }"`,
			'Content-Type': imageBlob.type || 'image/png',
		},
	} );

	await apiFetch( {
		path: '/wp/v2/settings',
		method: 'POST',
		data: { site_logo: media.id },
	} );
}

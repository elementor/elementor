import apiFetch from '@wordpress/api-fetch';

import type { DeployLogo, WpPost } from '../types';

const ALLOWED_LOGO_DOMAINS = [ 'assets.elementor.com' ];

export async function uploadLogo( logo: DeployLogo ) {
	try {
		const parsedUrl = new URL( logo.url );
		if ( parsedUrl.protocol !== 'https:' ) {
			throw new Error( 'Logo URL must use HTTPS' );
		}
		if ( ! ALLOWED_LOGO_DOMAINS.includes( parsedUrl.hostname ) ) {
			throw new Error( 'Logo URL must be from an allowed domain' );
		}
	} catch ( e ) {
		throw new Error( `Invalid logo URL: ${ ( e as Error ).message }` );
	}

	const sanitizedFilename = logo.filename
		.replace( /["\r\n]/g, '' )
		.replace( /[^\w.-]/g, '_' )
		.slice( 0, 255 );

	if ( ! sanitizedFilename ) {
		throw new Error( 'Invalid logo filename' );
	}

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

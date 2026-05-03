import { useMutation } from '@elementor/query';

import { getConfig } from '../utils/get-config';
import { withRetry } from '../utils/retry';

async function installThemeRequest( themeSlug: string ): Promise< { success: boolean; message: string } > {
	const config = getConfig();

	if ( ! config ) {
		throw new Error( 'Onboarding config not found' );
	}

	const response = await fetch( `${ config.restUrl }install-theme`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-WP-Nonce': config.nonce,
		},
		body: JSON.stringify( { theme_slug: themeSlug } ),
	} );

	if ( ! response.ok ) {
		const error = await response.json().catch( () => null );
		throw new Error( error?.message || 'Failed to install theme' );
	}

	const json = await response.json();

	return json.data;
}

export function useInstallTheme() {
	return useMutation( {
		mutationFn: ( themeSlug: string ) => withRetry( () => installThemeRequest( themeSlug ) ),
	} );
}

import { useMutation } from '@elementor/query';

import { getConfig } from '../utils/get-config';
import { withRetry } from '../utils/retry';

async function installPluginRequest( pluginSlug: string ): Promise< { success: boolean; message: string } > {
	const config = getConfig();

	if ( ! config ) {
		throw new Error( 'Onboarding config not found' );
	}

	const response = await fetch( `${ config.restUrl }install-plugin`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-WP-Nonce': config.nonce,
		},
		body: JSON.stringify( { plugin_slug: pluginSlug } ),
	} );

	if ( ! response.ok ) {
		const error = await response.json().catch( () => null );
		throw new Error( error?.message || 'Failed to install plugin' );
	}

	const json = await response.json();

	return json.data;
}

export function useInstallPlugin() {
	return useMutation( {
		mutationFn: ( pluginSlug: string ) => withRetry( () => installPluginRequest( pluginSlug ) ),
	} );
}

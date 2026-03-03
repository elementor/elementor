import { useMutation } from '@elementor/query';

import { getConfig } from '../utils/get-config';

async function installPro(): Promise< { success: boolean; message: string } > {
	const config = getConfig();

	if ( ! config ) {
		throw new Error( 'Onboarding config not found' );
	}

	const response = await fetch( `${ config.restUrl }install-pro`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-WP-Nonce': config.nonce,
		},
	} );

	if ( ! response.ok ) {
		const error = await response.json().catch( () => null );
		throw new Error( error?.message || 'Failed to install Elementor Pro' );
	}

	const json = await response.json();

	return json.data;
}

export function useInstallPro() {
	return useMutation( {
		mutationFn: installPro,
	} );
}

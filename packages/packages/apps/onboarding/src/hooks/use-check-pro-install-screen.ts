import { useCallback } from 'react';

import { getConfig } from '../utils/get-config';

interface ProInstallScreenResponse {
	data: {
		shouldShowProInstallScreen: boolean;
	};
}

export function useCheckProInstallScreen() {
	const checkProInstallScreen = useCallback( async (): Promise< { shouldShowProInstallScreen: boolean } > => {
		const config = getConfig();

		if ( ! config ) {
			return { shouldShowProInstallScreen: false };
		}

		const response = await fetch( `${ config.restUrl }pro-install-screen`, {
			method: 'GET',
			headers: {
				'X-WP-Nonce': config.nonce,
			},
		} );

		if ( ! response.ok ) {
			return { shouldShowProInstallScreen: false };
		}

		const json = ( await response.json() ) as ProInstallScreenResponse;

		return {
			shouldShowProInstallScreen: json.data?.shouldShowProInstallScreen ?? false,
		};
	}, [] );

	return checkProInstallScreen;
}

import { useCallback } from 'react';

interface ProStatusResponse {
	data: {
		shouldShowProInstallScreen: boolean;
	};
}

function getConfig() {
	return window.elementorAppConfig?.[ 'e-onboarding' ] ?? null;
}

export function useCheckProInstallScreen() {
	const checkProInstallScreen = useCallback( async (): Promise< { shouldShowProInstallScreen: boolean } > => {
		const config = getConfig();

		if ( ! config ) {
			return { shouldShowProInstallScreen: false };
		}

		const response = await fetch( `${ config.restUrl }pro-status`, {
			method: 'GET',
			headers: {
				'X-WP-Nonce': config.nonce,
			},
		} );

		if ( ! response.ok ) {
			return { shouldShowProInstallScreen: false };
		}

		const json = ( await response.json() ) as ProStatusResponse;

		return {
			shouldShowProInstallScreen: json.data?.shouldShowProInstallScreen ?? false,
		};
	}, [] );

	return checkProInstallScreen;
}

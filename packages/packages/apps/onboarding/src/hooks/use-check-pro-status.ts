import { useCallback } from 'react';

interface ProStatusResponse {
	data: {
		hasProSubscription: boolean;
	};
}

function getConfig() {
	return window.elementorAppConfig?.[ 'e-onboarding' ] ?? null;
}

/**
 * Returns a callback that fetches the user's Pro subscription status
 * from the server. Intended to be called after a successful connect flow,
 * since the subscription check requires an active connection.
 */
export function useCheckProStatus() {
	const checkProStatus = useCallback( async (): Promise< { hasProSubscription: boolean } > => {
		const config = getConfig();

		if ( ! config ) {
			return { hasProSubscription: false };
		}

		const response = await fetch( `${ config.restUrl }pro-status`, {
			method: 'GET',
			headers: {
				'X-WP-Nonce': config.nonce,
			},
		} );

		if ( ! response.ok ) {
			return { hasProSubscription: false };
		}

		const json = ( await response.json() ) as ProStatusResponse;

		return {
			hasProSubscription: json.data?.hasProSubscription ?? false,
		};
	}, [] );

	return checkProStatus;
}

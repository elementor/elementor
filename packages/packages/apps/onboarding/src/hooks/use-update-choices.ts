import { useMutation } from '@elementor/query';

import { getConfig } from '../utils/get-config';
import type { OnboardingChoices } from '../types';

type UpdateChoicesParams = Partial< OnboardingChoices >;

async function updateChoices( params: UpdateChoicesParams ): Promise< void > {
	const config = getConfig();

	if ( ! config ) {
		throw new Error( 'Onboarding config not found' );
	}

	const response = await fetch( `${ config.restUrl }user-choices`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-WP-Nonce': config.nonce,
		},
		body: JSON.stringify( params ),
	} );

	if ( ! response.ok ) {
		throw new Error( 'Failed to update choices' );
	}
}

export function useUpdateChoices() {
	return useMutation( {
		mutationFn: updateChoices,
	} );
}

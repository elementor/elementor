import { useMutation } from '@elementor/query';

interface UpdateProgressParams {
	complete_step?: string;
	skip_step?: boolean;
	step_index?: number;
	total_steps?: number;
	user_exit?: boolean;
}

function getConfig() {
	return window.elementorAppConfig?.[ 'e-onboarding' ] ?? null;
}

async function updateProgress( params: UpdateProgressParams ): Promise< void > {
	const config = getConfig();

	if ( ! config ) {
		throw new Error( 'Onboarding config not found' );
	}

	const response = await fetch( `${ config.restUrl }user-progress`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-WP-Nonce': config.nonce,
		},
		body: JSON.stringify( params ),
	} );

	if ( ! response.ok ) {
		throw new Error( 'Failed to update progress' );
	}
}

export function useUpdateProgress() {
	return useMutation( {
		mutationFn: updateProgress,
	} );
}

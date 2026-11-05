const SETUP_STATE_RETRY_ATTEMPTS = 12;
const SETUP_STATE_RETRY_DELAY_MS = 800;

function delay( ms: number ): Promise< void > {
	return new Promise( ( resolve ) => {
		setTimeout( resolve, ms );
	} );
}

type PromotionConfig = {
	state?: string;
};

export async function fetchPromotionConfigAfterConnect< T extends PromotionConfig | null >(
	fetchConfig: () => Promise< T >
): Promise< T > {
	let lastConfig: T = null as T;

	for ( let attempt = 0; attempt < SETUP_STATE_RETRY_ATTEMPTS; attempt++ ) {
		let config: T;

		try {
			config = await fetchConfig();
		} catch ( error ) {
			if ( attempt >= SETUP_STATE_RETRY_ATTEMPTS - 1 ) {
				throw error;
			}

			await delay( SETUP_STATE_RETRY_DELAY_MS );
			continue;
		}

		if ( ! config?.state ) {
			return config;
		}

		if ( 'connect' !== config.state ) {
			return config;
		}

		lastConfig = config;

		if ( attempt < SETUP_STATE_RETRY_ATTEMPTS - 1 ) {
			await delay( SETUP_STATE_RETRY_DELAY_MS );
		}
	}

	return lastConfig;
}

const SETUP_STATE_RETRY_ATTEMPTS = 12;
const SETUP_STATE_RETRY_DELAY_MS = 800;

function delay( ms ) {
	return new Promise( ( resolve ) => {
		setTimeout( resolve, ms );
	} );
}

export async function fetchPromotionConfigAfterConnect( fetchConfig ) {
	let lastConfig = null;

	for ( let attempt = 0; attempt < SETUP_STATE_RETRY_ATTEMPTS; attempt++ ) {
		const config = await fetchConfig();

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

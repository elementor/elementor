import { bootAngieSdk } from './boot-angie-sdk';

export function init(): void {
	void bootAngieSdk().catch( ( error ) => {
		// Boot can fail before the iframe exists. openAngie retries because the failed attempt is cleared.
		// eslint-disable-next-line no-console
		console.error( 'Angie SDK boot failed:', error );
	} );
}

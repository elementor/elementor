import { getConfig } from './get-config';

export function sendUserExitProgress(): void {
	const config = getConfig();

	if ( ! config ) {
		return;
	}

	const body = JSON.stringify( { user_exit: true } );

	fetch( `${ config.restUrl }user-progress`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-WP-Nonce': config.nonce,
		},
		body,
		keepalive: true,
	} ).catch( () => {} );
}

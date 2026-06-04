import { request } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { config, cfHeaders } from './config/env';
import { login } from './wp-authentication';

/**
 * Global setup runs once before all workers start.
 * Creates a base storage state file that workers copy and reuse.
 *
 * CF Access headers are injected here so every request (including
 * the login POST) carries them when ENV=stg/prod.
 */
export default async function globalSetup() {
	const storageStatePath = path.resolve( __dirname, 'storageState-0.json' );

	if ( fs.existsSync( storageStatePath ) ) {
		return;
	}

	const context = await login(
		request,
		config.wp.username,
		config.wp.password,
		config.wp.baseURL,
		cfHeaders,
	);

	await context.storageState( { path: storageStatePath } );
	await context.dispose();
}

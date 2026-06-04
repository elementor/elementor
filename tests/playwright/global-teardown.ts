import fs from 'fs';
import path from 'path';

/**
 * Global teardown: removes all per-worker storage state files
 * created during the test run so the next run starts fresh.
 */
export default async function globalTeardown() {
	const dir = path.resolve( __dirname );
	const stateFiles = fs.readdirSync( dir ).filter(
		( f ) => /^storageState-\d+\.json$/.test( f ),
	);

	for ( const file of stateFiles ) {
		try {
			fs.unlinkSync( path.join( dir, file ) );
		} catch {
			// File already removed — safe to ignore
		}
	}
}

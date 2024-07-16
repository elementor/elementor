import { execSync } from 'child_process';
import github from '@actions/core';
import path from 'path';

export const wpEnvCli = ( command: string, cwd?: string ) => {
	const port = ( 1 === Number( process.env.TEST_PARALLEL_INDEX ) ) ? '8889' : '8888';
	const cli = `npx wp-test-server cli port=${ port } command=\"${ command }\" config=tests/.test-server.config.json`;
	const cwdPath = cwd ? path.resolve( cwd, 'wp-test-server' ) : 'wp-test-server';
	const logs = execSync( `${ cli }`, { cwd: cwdPath, encoding: 'utf-8' } );
	// Print log for debuggability
	// eslint-disable-next-line no-console
	console.log( logs );

	if ( ! process.env.CI ) {
		return logs;
	}

	if ( logs.includes( 'Warning' ) ) {
		github.warning( logs );
	}

	if ( logs.includes( 'Error' ) ) {
		github.error( logs );
	}

	return logs;
};

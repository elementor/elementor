import { execSync } from 'child_process';
import github from '@actions/core';

export const wpEnvCli = ( command: string ) => {
	const port = ( 1 === Number( process.env.TEST_PARALLEL_INDEX ) ) ? '8889' : '8888';
	const cli = `npx wp-test-server cli port=${ port } command=\"${ command }\" config=tests/.test-server.config.json`;
	const logs = execSync( `${ cli }`, { encoding: 'utf-8' } );
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

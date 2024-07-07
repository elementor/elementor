import { execSync } from 'child_process';
import github from '@actions/core';

export const wpEnvCli = ( command: string ) => {
	const port = ( 1 === Number( process.env.TEST_PARALLEL_INDEX ) ) ? '8889' : '8888';
	const cli = `npm run cli ${ command } -- port=${ port }`;
	const logs = execSync( `${ cli }${ command }`, { cwd: 'test-server', encoding: 'utf-8' } );
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

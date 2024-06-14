import { execSync } from 'child_process';
import github from '@actions/core';

export const wpEnvCli = ( command: string ) => {
	const cliCommand = ( 1 === Number( process.env.TEST_PARALLEL_INDEX ) ) ? 'tests-cli' : 'cli';
	const cli = `npx wp-env run ${ cliCommand } `;
	const logs = execSync( `${ cli }${ command }`, { encoding: 'utf-8' } );
	// eslint-disable-next-line no-console
	console.log( logs );
	if ( process.env.CI ) {
		if ( logs.includes( 'Warning' ) ) {
			github.warning( logs );
		}
		if ( logs.includes( 'Error' ) ) {
			github.error( logs );
		}
	}

	return logs;
};

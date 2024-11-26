// import { execSync } from 'child_process';
// import github from '@actions/core';
// import { cli } from '@elementor/wp-lite-env';

export const wpEnvCli = async ( command: string ) => {
	const port = ( 1 === Number( process.env.TEST_PARALLEL_INDEX ) ) ? '8889' : '8888';

	const wpLiteEnv = await import('@elementor/wp-lite-env');
	await wpLiteEnv.cli( port, command );
	// const cliCommand = ( 1 === Number( process.env.TEST_PARALLEL_INDEX ) ) ? 'tests-cli' : 'cli';
	// const cli = `npx wp-env run ${ cliCommand } `;
	// const logs = execSync( `${ cli }${ command }`, { encoding: 'utf-8' } );
	// Print log for debuggability
	// eslint-disable-next-line no-console
	// console.log( logs );
	//
	// if ( ! process.env.CI ) {
	// 	return logs;
	// }
	//
	// if ( logs.includes( 'Warning' ) ) {
	// 	github.warning( logs );
	// }
	//
	// if ( logs.includes( 'Error' ) ) {
	// 	github.error( logs );
	// }
	//
	// return logs;
};

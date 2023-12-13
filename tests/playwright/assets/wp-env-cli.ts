import { execSync } from 'child_process';
import github from '@actions/core';

export default class WpEnvCli {
	cmd = ( command: string ) => {
		const logs = execSync( command, { encoding: 'utf-8' } );
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
	};
}

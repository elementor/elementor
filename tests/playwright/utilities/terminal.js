import { execSync } from 'node:child_process';
import path from 'path';

export default class Terminal {
	/*
     * Activate or Deactivate experiments
     * @param action {string} - activate | deactivate
     * @param experiments {string} - comma separated list of experiments. e.g. container,nested-elements,'grid container'
     */
	async experiments( action, experiments ) {
		const wpPath = await this.getWordpressInstallPath();

		const wpEnv = `npx wp-env run cli "bash -c 'wp elementor experiments ${ action } ${ experiments }'"`;
		const local = `bash -c "wp elementor experiments ${ action } ${ experiments } --path=${ wpPath }"`;

		const result = await this.executeTerminal( process.env.CI ? wpEnv : local );
		console.log( result );
	}

	/*
	 * Executes a command in the terminal
	 * @param {string} cmd the command to execute
	 *
	 * @return {string} the output of the command
	 */
	async executeTerminal( cmd ) {
		try {
			const stdout = execSync( cmd );
			return stdout.toString();
		} catch ( err ) {
			return 'Error' + err.toString();
		}
	}

	/*
     * Get the path to the WordPress installation from this Script Directory in the Elementor plugin
     *
     * @return {string} the path to the WordPress installation
     */
	async getWordpressInstallPath( ) {
		return path.join( __dirname, '..', '..', '..', '..', '..', '..' );
	}
}


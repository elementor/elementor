import { execSync } from 'node:child_process';
import path from 'path';

export default class Terminal {
	/*
	* Activate or Deactivate experiments
	* @param action {string} - activate | deactivate
	* @param experiments {string} - comma separated list of experiments. e.g. container,nested-elements,'grid container'
	*
	* @example experiments( 'activate', 'container,nested-elements,grid container' )
	* @example experiments( 'deactivate', 'container,nested-elements,grid container' )
	*/
	async experiments( action, experiments ) {
		if ( action !== 'activate' && action !== 'deactivate' ) {
			throw new Error( 'Error Invalid action specified while activating experiments, expecting "activate" / "deactivate" received ' + action );
		}

		const cmd = `elementor experiments ${ action } ${ experiments }'"`;
		const result = await this.executeTerminal( cmd );
		await this.logErrors( result );
	}

	/*
	 * Executes a `wp` command in the terminal
	 * @param {string} the command to execute
	 *
	 * @example executeTerminal( 'elementor experiments activate container' )
	 * @example executeTerminal( 'elementor experiments default' )
	 * @example executeTerminal( 'plugin activate woocommerce' )
	 *
	 * @return {string} the output of the command
	 */
	async executeTerminal( cmd ) {
		const wpPath = await this.getWordpressInstallPath();

		const wpEnv = `npx wp-env run cli "bash -c 'wp ${ cmd }'"`;
		const local = `bash -c "wp ${ cmd } --path=${ wpPath }"`;

		try {
			const stdout = execSync( process.env.CI ? wpEnv : local );
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

	/*
	 * Log the results of cmd execution to Playwright and CI output
	 */
	async logErrors( result ) {
		console.log( result );
	}
}


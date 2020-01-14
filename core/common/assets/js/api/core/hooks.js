import HooksData from './hooks/data.js';
import HooksUI from './hooks/ui.js';

export default class Hooks {
	constructor() {
		this.data = new HooksData();
		this.ui = new HooksUI();
	}

	getAll() {
		return {
			data: this.data.getAll(),
			ui: this.ui.getAll(),
		};
	}

	/**
	 * Function registerDataAfter().
	 *
	 * Register data hook that's run after the command.
	 *
	 * @param {HookBase} instance
	 *
	 * @returns {{}}
	 */
	registerDataAfter( instance ) {
		return this.data.registerAfter( instance );
	}

	/**
	 * Function registerDataDependency().
	 *
	 * Register data hook that's run before the command as dependency.
	 *
	 * @param {HookBase} instance
	 *
	 * @returns {{}}
	 */
	registerDataDependency( instance ) {
		return this.data.registerDependency( instance );
	}

	/**
	 * Function registerDataCatch().
	 *
	 * Register data hook that's run when the command fails.
	 *
	 * @param {HookBase} instance
	 *
	 * @returns {{}}
	 */
	registerDataCatch( instance ) {
		return this.data.registerCatch( instance );
	}

	/**
	 * Function registerUIAfter().
	 *
	 * Register UI hook that's run after the commands run.
	 *
	 * @param {HookBase} instance
	 *
	 * @returns {{}}
	 */
	registerUIAfter( instance ) {
		return this.ui.registerAfter( instance );
	}

	/**
	 * Function registerUIBefore().
	 *
	 * Register UI hook that's run before the command.
	 *
	 * @param {HookBase} instance
	 *
	 * @returns {{}}
	 */
	registerUIBefore( instance ) {
		return this.ui.registerBefore( instance );
	}

	/**
	 * Function registerUICatch().
	 *
	 * Register UI hook that's run when the command fails.
	 *
	 * @param {HookBase} instance
	 *
	 * @returns {{}}
	 */
	registerUICatch( instance ) {
		return this.ui.registerCatch( instance );
	}

	/**
	 * Function runDataAfter().
	 *
	 * @param {string} command
	 * @param {{}} args
	 * @param {*} result
	 */
	runDataAfter( command, args, result ) {
		return this.data.runAfter( command, args, result );
	}

	/**
	 * Function runDataDependency().
	 *
	 * @param {string} command
	 * @param {{}} args
	 */
	runDataDependency( command, args ) {
		this.data.runDependency( command, args );
	}

	/**
	 * Function runDataCatch().
	 *
	 * @param {string} command
	 * @param {{}} args
	 * @param {*} e
	 */
	runDataCatch( command, args, e ) {
		this.data.runCatch( command, args, e );
	}

	/**
	 * Function runUIAfter().
	 *
	 * @param {string} command
	 * @param {{}} args
	 * @param {*} result
	 */
	runUIAfter( command, args, result ) {
		this.ui.run( 'after', command, args, result );
	}

	/**
	 * Function runUIBefore().
	 *
	 * @param {string} command
	 * @param {{}} args
	 */
	runUIBefore( command, args ) {
		this.ui.run( 'before', command, args );
	}

	/**
	 * Function runUICatch().
	 *
	 * @param {string} command
	 * @param {{}} args
	 * @param {*} e
	 */
	runUICatch( command, args, e ) {
		this.ui.runCatch( command, args, e );
	}
}

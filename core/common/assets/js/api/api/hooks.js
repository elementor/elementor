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
	 *
	 * @param {HookBase} instance
	 *
	 * @returns {{}}
	 */
	registerDataAfter( instance ) {
		return this.data.registerAfter( instance );
	}

	/**
	 *
	 * @param {HookBase} instance
	 *
	 * @returns {{}}
	 */
	registerDataDependency( instance ) {
		return this.data.registerDependency( instance );
	}

	/**
	 *
	 * @param {HookBase} instance
	 *
	 * @returns {{}}
	 */
	registerUIAfter( instance ) {
		return this.ui.registerAfter( instance );
	}

	/**
	 *
	 * @param {HookBase} instance
	 *
	 * @returns {{}}
	 */
	registerUIBefore( instance ) {
		return this.ui.registerBefore( instance );
	}

	/**
	 * Function runDataAfter().
	 *
	 * @param {string} command
	 * @param {{}} args
	 * @param {*} result
	 */
	runDataAfter( command, args, result ) {
		this.data.runAfter( command, args, result );
	}

	/**
	 * Function runDependency().
	 *
	 * @param {string} command
	 * @param {{}} args
	 */
	runDataDependency( command, args ) {
		this.data.runDependency( command, args );
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
}

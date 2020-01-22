import HooksData from './hooks/data.js';
import HooksUI from './hooks/ui.js';

export default class Hooks {
	/**
	 * Function constructor().
	 *
	 * Create `$e.hooks` API.
	 */
	constructor() {
		this.hooks = {
			data: new HooksData(),
			ui: new HooksUI(),
		};
	}

	/**
	 * Function activate().
	 *
	 * Activate all hooks.
	 */
	activate() {
		Object.values( this.hooks ).forEach( ( hooksType ) => {
			hooksType.activate();
		} );
	}

	/**
	 * Function deactivate().
	 *
	 * Deactivate all hooks.
	 */
	deactivate() {
		Object.values( this.hooks ).forEach( ( hooksType ) => {
			hooksType.deactivate();
		} );
	}

	/**
	 * Function getAll().
	 *
	 * Receive all loaded hooks.
	 *
	 * @returns {[]}
	 */
	getAll() {
		return Object.values( this.hooks ).sort();
	}

	/**
	 * Function register().
	 *
	 * Register hook.
	 *
	 * @param {string} type
	 * @param {string} event
	 * @param {HookBase} instance
	 *
	 * @returns {{}} Created callback
	 */
	register( type, event, instance ) {
		const hooksType = Object.values( this.hooks ).find(
			( hooks ) => type === hooks.getType()
		);

		return hooksType.register( event, instance );
	}

	/**
	 * Function run().
	 *
	 * Run's a hook.
	 *
	 * @param {string} type
	 * @param {string} event
	 * @param {string} command
	 * @param {{}} args
	 * @param {*} result
	 *
	 * @returns {boolean}
	 */
	run( type, event, command, args, result = undefined ) {
		const hooksType = Object.values( this.hooks ).find(
			( hooks ) => type === hooks.getType()
		);

		return hooksType.run( event, command, args, result );
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
		return this.register( 'data', 'after', instance );
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
		return this.register( 'data', 'catch', instance );
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
		return this.register( 'data', 'dependency', instance );
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
		return this.register( 'ui', 'after', instance );
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
		return this.register( 'ui', 'catch', instance );
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
		return this.register( 'ui', 'before', instance );
	}

	/**
	 * Function runDataAfter().
	 *
	 * Run data hook that's run after the command.
	 *
	 * @param {string} command
	 * @param {{}} args
	 * @param {*} result
	 *
	 * @returns {boolean}
	 */
	runDataAfter( command, args, result ) {
		return this.run( 'data', 'after', command, args, result );
	}

	/**
	 * Function runDataCatch().
	 *
	 * Run data hook that's run when the command fails.
	 *
	 * @param {string} command
	 * @param {{}} args
	 * @param {*} e
	 *
	 * @returns {boolean}
	 */
	runDataCatch( command, args, e ) {
		return this.run( 'data', 'catch', command, args, e );
	}

	/**
	 * Function runDataDependency().
	 *
	 * Run data hook that's run before the command as dependency.
	 *
	 * @param {string} command
	 * @param {{}} args
	 *
	 * @returns {boolean}
	 */
	runDataDependency( command, args ) {
		return this.run( 'data', 'dependency', command, args );
	}

	/**
	 * Function runUIAfter().
	 *
	 * Run UI hook that's run after the commands run.
	 *
	 * @param {string} command
	 * @param {{}} args
	 * @param {*} result
	 *
	 * @returns {boolean}
	 */
	runUIAfter( command, args, result ) {
		return this.run( 'ui', 'after', command, args, result );
	}

	/**
	 * Function runUICatch().
	 *
	 * Run UI hook that's run when the command fails.
	 *
	 * @param {string} command
	 * @param {{}} args
	 * @param {*} e
	 *
	 * @returns {boolean}
	 */
	runUICatch( command, args, e ) {
		return this.run( 'ui', 'catch', command, args );
	}

	/**
	 * Function runUIBefore().
	 *
	 * Run UI hook that's run before the command.
	 *
	 * @param {string} command
	 * @param {{}} args
	 *
	 * @returns {boolean}
	 */
	runUIBefore( command, args ) {
		return this.run( 'ui', 'before', command, args );
	}
}

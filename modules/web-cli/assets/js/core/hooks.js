import HooksData from './hooks/data.js';
import HooksUI from './hooks/ui.js';

/**
 * @typedef {import('../modules/hook-base')} HookBase
 */

export default class Hooks {
	data = new HooksData();
	ui = new HooksUI();

	/**
	 * Function activate().
	 *
	 * Activate all hooks.
	 */
	activate() {
		this.getTypes().forEach( ( hooksType ) => {
			hooksType.activate();
		} );
	}

	/**
	 * Function deactivate().
	 *
	 * Deactivate all hooks.
	 */
	deactivate() {
		this.getTypes().forEach( ( hooksType ) => {
			hooksType.deactivate();
		} );
	}

	getAll( flat = false ) {
		const result = {};

		this.getTypes().forEach( ( hooksType ) => {
			result[ hooksType.getType() ] = hooksType.getAll( flat );
		} );

		return result;
	}

	getTypes() {
		return [
			this.data,
			this.ui,
		];
	}

	getType( type ) {
		return this.getTypes().find(
			( hooks ) => type === hooks.getType(),
		);
	}

	/**
	 * Function register().
	 *
	 * Register hook.
	 *
	 * @param {string}   type
	 * @param {string}   event
	 * @param {HookBase} instance
	 *
	 * @return {{}} Created callback
	 */
	register( type, event, instance ) {
		return this.getType( type ).register( event, instance );
	}

	/**
	 * Function run().
	 *
	 * Run's a hook.
	 *
	 * @param {string} type
	 * @param {string} event
	 * @param {string} command
	 * @param {{}}     args
	 * @param {*}      result
	 *
	 * @return {boolean} result
	 */
	run( type, event, command, args, result = undefined ) {
		return this.getType( type ).run( event, command, args, result );
	}

	/**
	 * Function registerDataAfter().
	 *
	 * Register data hook that's run after the command.
	 *
	 * @param {HookBase} instance
	 *
	 * @return {{}} callback
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
	 * @return {{}} callback
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
	 * @return {{}} callback
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
	 * @return {{}} callback
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
	 * @return {{}} callback
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
	 * @return {{}} callback
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
	 * @param {{}}     args
	 * @param {*}      result
	 *
	 * @return {boolean} result
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
	 * @param {{}}     args
	 * @param {*}      error
	 *
	 * @return {boolean} result
	 */
	runDataCatch( command, args, error ) {
		return this.run( 'data', 'catch', command, args, error );
	}

	/**
	 * Function runDataDependency().
	 *
	 * Run data hook that's run before the command as dependency.
	 *
	 * @param {string} command
	 * @param {{}}     args
	 *
	 * @return {boolean} result
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
	 * @param {{}}     args
	 * @param {*}      result
	 *
	 * @return {boolean} result
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
	 * @param {{}}     args
	 * @param {*}      e
	 *
	 * @return {boolean} result
	 */
	runUICatch( command, args, e ) {
		return this.run( 'ui', 'catch', command, args, e );
	}

	/**
	 * Function runUIBefore().
	 *
	 * Run UI hook that's run before the command.
	 *
	 * @param {string} command
	 * @param {{}}     args
	 *
	 * @return {boolean} result
	 */
	runUIBefore( command, args ) {
		return this.run( 'ui', 'before', command, args );
	}
}

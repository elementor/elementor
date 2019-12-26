import Callbacks from '../modules/callbacks.js';

export default class Hooks extends Callbacks {
	constructor( ... args ) {
		super( ... args );

		this.callbacks.dependency = {};

		this.depth.dependency = {};
	}

	getType() {
		return 'hook';
	}

	runCallback( event, callback, args, result ) {
		switch ( event ) {
			case 'dependency': {
				if ( ! callback.callback( args ) ) {
					this.depth[ event ][ callback.id ]--;

					throw new $e.modules.HookBreak;
				}
			}
			break;

			case 'after': {
				callback.callback( args, result );
			}
			break;

			default:
				return false;
		}

		return true;
	}

	shouldRun( callbacks ) {
		return super.shouldRun( callbacks ) && elementor.history.history.getActive();
	}

	onRun( command, args, event ) {
		if ( ! $e.devTools ) {
			return;
		}

		// TODO: $e.devTools.hooks.run
		$e.devTools.log.hookRun( command, args, event );
	}

	onCallback( command, args, event, id ) {
		if ( ! $e.devTools ) {
			return;
		}

		// TODO: $e.devTools.hooks.callback
		$e.devTools.log.hookCallback( command, args, event, id );
	}

	/**
	 * Function registerAfter().
	 *
	 * Register the hook in after event.
	 *
	 * @param {CallableBase} instance
	 *
	 * @returns {{}}
	 */
	registerAfter( instance ) {
		return this.register( 'after', instance );
	}

	/**
	 * Function registerDependency().
	 *
	 * Register the hook in dependency event.
	 *
	 * @param {CallableBase} instance
	 *
	 * @returns {{}}
	 */
	registerDependency( instance ) {
		return this.register( 'dependency', instance );
	}

	/**
	 * Function runAfter().
	 *
	 * Run the hook as after.
	 *
	 * @param {string} command
	 * @param {{}} args
	 * @param {*} result
	 */
	runAfter( command, args, result ) {
		this.run( 'after', command, args, result );
	}

	/**
	 * Function runDependency().
	 *
	 * Run the hook as dependency.
	 *
	 * @param {string} command
	 * @param {{}} args
	 */
	runDependency( command, args ) {
		this.run( 'dependency', command, args );
	}
}


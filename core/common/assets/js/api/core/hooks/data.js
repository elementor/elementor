import Base from './base.js';

export default class Data extends Base {
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
		return super.shouldRun( callbacks ) && elementor.documents.getCurrent().history.getActive();
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
	 * Function registerDependency().
	 *
	 * Register the hook in dependency event.
	 *
	 * @param {HookBase} instance
	 *
	 * @returns {{}}
	 */
	registerDependency( instance ) {
		return this.register( 'dependency', instance );
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


import Callbacks from './callbacks.js';

export default class Events extends Callbacks {
	constructor( ... args ) {
		super( ... args );

		this.callbacks.dependency = {};

		this.depth.dependency = {};
	}

	getType() {
		return 'hook';
	}

	registerAfter( command, id, callback ) {
		return this.register( 'after', command, id, callback );
	}

	registerDependency( command, id, callback ) {
		return this.register( 'dependency', command, id, callback );
	}

	runCallback( event, callback, args, result ) {
		switch ( event ) {
			case 'dependency': {
				if ( ! callback.callback( args ) ) {
					this.depth[ event ][ callback.id ]--;

					throw new elementorModules.common.HookBreak;
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

	runDependency( command, args ) {
		this.run( 'dependency', command, args );
	}

	runAfter( command, args, result ) {
		this.run( 'after', command, args, result );
	}

	isShouldRun( callbacks ) {
		return elementor.history.history.getActive() && callbacks && callbacks.length;
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
}


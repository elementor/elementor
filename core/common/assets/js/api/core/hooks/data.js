import HooksBase from './base.js';

export default class Data extends HooksBase {
	constructor( ... args ) {
		super( ... args );

		this.callbacks.dependency = {};

		this.depth.dependency = {};
	}

	getType() {
		return 'data';
	}

	runCallback( event, callback, args, result ) {
		switch ( event ) {
			case 'dependency': {
				// If callback returns false and its dependency, then 'Hook-Break'.
				if ( ! callback.callback( args ) ) {
					this.depth[ event ][ callback.id ]--;

					// Throw custom break to be catch by the base for 'Safe' exit.
					throw new $e.modules.HookBreak;
				}
				return true;
			}

			case 'catch':
			case 'after':
				const callbackResult = callback.callback( args, result );

				if ( ! callbackResult ) {
					return true;
				}

				return callbackResult;

			default:
				return false;
		}

		return false;
	}

	shouldRun( callbacks ) {
		return super.shouldRun( callbacks ) && elementor.documents.getCurrent().history.getActive();
	}

	onRun( command, args, event ) {
		if ( ! $e.devTools ) {
			return;
		}

		$e.devTools.log.hookRun( this.getType(), command, args, event );
	}

	onCallback( command, args, event, id ) {
		if ( ! $e.devTools ) {
			return;
		}

		$e.devTools.log.hookCallback( this.getType(), command, args, event, id );
	}
}


import Callbacks from './base/callbacks';

export default class Events extends Callbacks {
	constructor( ... args ) {
		super( ... args );

		this.callbacks.before = {};

		this.depth.before = {};
	}

	getType() {
		return 'event';
	}

	runCallback( event, callback, args, result ) {
		switch ( event ) {
			case 'before':
				callback.callback( args );
				break;

			case 'after':
				callback.callback( args, result );
				break;

			default:
				return false;
		}

		return true;
	}

	shouldRun( callbacks ) {
		return callbacks && callbacks.length;
	}

	onRun( command, args, event ) {
		if ( ! $e.devTools ) {
			return;
		}

		// TODO: $e.devTools.events.run
		$e.devTools.log.eventRun( command, args, event );
	}

	onCallback( command, args, event, id ) {
		if ( ! $e.devTools ) {
			return;
		}

		// TODO:  $e.devTools.events.callback
		$e.devTools.log.eventCallback( command, args, event, id );
	}

	/**
	 * Function registerAfter().
	 *
	 * Register the event in after event.
	 *
	 * @param {CallbackBase} instance
	 *
	 * @returns {{}}
	 */
	registerAfter( instance ) {
		return this.register( 'after', instance );
	}

	/**
	 * Function registerBefore().
	 *
	 * Register the event in before event.
	 *
	 * @param {CallbackBase} instance
	 *
	 * @returns {{}}
	 */
	registerBefore( instance ) {
		return this.register( 'before', instance );
	}

	/**
	 * Function runBefore().
	 *
	 * Run the event as before.
	 *
	 * @param {string} command
	 * @param {{}} args
	 */
	runBefore( command, args ) {
		this.run( 'before', command, args );
	}

	/**
	 * Function runAfter().
	 *
	 * Run the event as after.
	 *
	 * @param {string} command
	 * @param {{}} args
	 * @param {*} result
	 */
	runAfter( command, args, result ) {
		this.run( 'after', command, args, result );
	}
}


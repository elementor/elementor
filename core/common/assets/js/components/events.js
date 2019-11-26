import Callbacks from './callbacks';

export default class Events extends Callbacks {
	constructor( ... args ) {
		super( ... args );

		this.callbacks.before = {};

		this.depth.before = {};
	}

	getType() {
		return 'event';
	}

	registerAfter( command, id, callback ) {
		return this.register( 'after', command, id, callback );
	}

	registerBefore( command, id, callback ) {
		return this.register( 'before', command, id, callback );
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

	runBefore( command, args ) {
		this.run( 'before', command, args );
	}

	runAfter( command, args, result ) {
		this.run( 'after', command, args, result );
	}

	isShouldRun( callbacks ) {
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
}


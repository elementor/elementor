import Base from './base';

export default class Ui extends Base {
	constructor( ... args ) {
		super( ... args );

		this.callbacks.before = {};

		this.depth.before = {};
	}

	getType() {
		return 'ui';
	}

	runCallback( event, callback, args, result ) {
		switch ( event ) {
			case 'before':
				callback.callback( args );
				break;

			case 'catch':
			case 'after':
				callback.callback( args, result );
				break;

			default:
				return false;
		}

		return true;
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


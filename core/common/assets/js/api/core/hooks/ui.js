import HooksBase from './base';

export default class Ui extends HooksBase {
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

		$e.devTools.log.hookRun( this.getType(), command, args, event );
	}

	onCallback( command, args, event, id ) {
		if ( ! $e.devTools ) {
			return;
		}

		$e.devTools.log.hookCallback( this.getType(), command, args, event, id );
	}
}


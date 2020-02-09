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
				if ( ! callback.callback( args ) ) {
					this.depth[ event ][ callback.id ]--;

					throw new $e.modules.HookBreak;
				}
			}
			break;

			case 'catch':
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

		$e.devTools.log.hookRun( this.getType(), command, args, event );
	}

	onCallback( command, args, event, id ) {
		if ( ! $e.devTools ) {
			return;
		}

		$e.devTools.log.hookCallback( this.getType(), command, args, event, id );
	}
}


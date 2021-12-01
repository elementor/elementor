import HooksBase from './base.js';
import { Agreement } from 'elementor-api/modules/hooks/data';

export default class Data extends HooksBase {
	constructor( ... args ) {
		super( ... args );

		this.callbacks.dependency = {};
		this.callbacks.agreement = {};

		this.depth.dependency = {};
		this.depth.agreement = {};
	}

	getType() {
		return 'data';
	}

	runCallback( event, callback, args, result ) {
		switch ( event ) {
			case 'agreement': {
				const agreement = callback.callback( args, result );

				if ( agreement?.newAgreement ) {
					args.agreementResult = agreement.newAgreement( args );
				}

				return agreement;
			}

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
			case 'after': {
				/**
				 * When handling HOOK which is data after (not breakable),
				 * even the result of the callback is negative, it is required to return positive,
				 * since result of runCallback determine if the callback succeeded.
				 */
				return callback.callback( args, result ) || 'after' === event;
			}
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

		$e.devTools.log.callbacks().run( this.getType(), command, args, event );
	}

	onCallback( command, args, event, id ) {
		if ( ! $e.devTools ) {
			return;
		}

		$e.devTools.log.callbacks().callback( this.getType(), command, args, event, id );
	}
}

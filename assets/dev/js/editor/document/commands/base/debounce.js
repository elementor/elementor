import Base from './base';
import History from './history';

export const DEFAULT_DEBOUNCE_DELAY = 800;

/**
 * TODO: maybe file should be under history/debounce.js
 * TODO: Check if instance does not stuck in debounce memory and cause memory leaks.
 */
export default class Debounce extends History {
	/**
	 * Function debounce().
	 *
	 * Will debounce every function you pass in, at the same debounce flow.
	 *
	 * @param {function()}
	 */
	static debounce = _.debounce( ( fn ) => fn(), DEFAULT_DEBOUNCE_DELAY );

	// TODO: test
	onBeforeRun( args ) {
		Base.prototype.onBeforeRun.call( this, args );

		if ( this.history && this.isHistoryActive() ) {
			$e.run( 'document/history/start-transaction', this.history );
		}
	}

	// TODO: test
	onAfterRun( args, result ) {
		Base.prototype.onAfterRun.call( this, args, result );

		if ( this.isHistoryActive() ) {
			this.constructor.debounce( () => {
				$e.run( 'document/history/end-transaction' );
			} );
		}
	}

	// TODO: test
	onCatchApply( e ) {
		Base.prototype.onCatchApply.call( this, e );

		// Rollback history on failure.
		if ( e instanceof elementorModules.common.HookBreak && this.history ) {
			$e.run( 'document/history/delete-transaction' );
		}
	}
}

/**
 * TODO: maybe file should be under history/debounce.js
 * TODO: Check if instance does not stuck in debounce memory and cause memory leaks.
 */
import Base from './base';
import History from './history';

export const getDefaultDebounceDelay = () => {
	let result = 800;

	if ( ElementorConfig.document && undefined !== ElementorConfig.document.debounceDelay ) {
		result = ElementorConfig.document.debounceDelay;
	}

	return result;
}

export const DEFAULT_DEBOUNCE_DELAY = getDefaultDebounceDelay();

export default class Debounce extends History {
	/**
	 * Function debounce().
	 *
	 * Will debounce every function you pass in, at the same debounce flow.
	 *
	 * @param {function()}
	 */
	static debounce = _.debounce( ( fn ) => fn(), DEFAULT_DEBOUNCE_DELAY );

	initialize( args ) {
		super.initialize( args );

		// If its head command, and not called within another command.
		if ( 1 === $e.commands.currentTrace.length ) {
			this.isDebounceRequired = true;
		}
	}

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
			if ( this.isDebounceRequired ) {
				Debounce.debounce( () => {
					$e.run( 'document/history/end-transaction' );
				} );
			} else {
				$e.run( 'document/history/end-transaction' );
			}
		}
	}

	// TODO: test
	onCatchApply( e ) {
		Base.prototype.onCatchApply.call( this, e );

		// Rollback history on failure.
		if ( e instanceof elementorModules.common.HookBreak && this.history ) {
			if ( this.isDebounceRequired ) {
				// `delete-transaction` is under debounce, because it should `delete-transaction` after `end-transaction`.
				Debounce.debounce( () => {
					$e.run( 'document/history/delete-transaction' );
				} );
			} else {
				$e.run( 'document/history/delete-transaction' );
			}
		}
	}
}

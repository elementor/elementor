import CommandBase from 'elementor-api/modules/command-base';
import History from '../history';

export const DEFAULT_DEBOUNCE_DELAY = 800;

/**
 * Function getDefaultDebounceDelay().
 *
 * Returns default debounce delay time, if exists in config override.
 *
 * @returns {number}
 */
export const getDefaultDebounceDelay = () => {
	let result = DEFAULT_DEBOUNCE_DELAY;

	if ( elementor.config.document && undefined !== elementor.config.document.debounceDelay ) {
		result = elementor.config.document.debounceDelay;
	}

	return result;
};

export default class Debounce extends History {
	static isTransactionStarted = false;

	/**
	 * Function debounce().
	 *
	 * Will debounce every function you pass in, at the same debounce flow.
	 *
	 * @param {(function())}
	 */
	static debounce = undefined;

	initialize( args ) {
		const { options = {} } = args;

		super.initialize( args );

		if ( ! this.constructor.debounce ) {
			this.constructor.debounce = _.debounce( ( fn ) => fn(), getDefaultDebounceDelay() );
		}

		// If its head command, and not called within another command.
		if ( 1 === $e.commands.currentTrace.length || options.debounce ) {
			this.isDebounceRequired = true;
		}
	}

	addTransaction() {
		if ( Debounce.isTransactionStarted ) {
			delete this.history.title;
			delete this.history.subTitle;
		}

		$e.internal( 'document/history/add-transaction', this.history );

		if ( ! Debounce.isTransactionStarted ) {
			Debounce.isTransactionStarted = true;
		}
	}

	deleteTransaction() {
		$e.internal( 'document/history/delete-transaction' );

		Debounce.isTransactionStarted = false;
	}

	endTransaction() {
		if ( Debounce.isTransactionStarted ) {
			$e.internal( 'document/history/end-transaction' );
		}

		Debounce.isTransactionStarted = false;
	}

	onBeforeRun( args ) {
		CommandBase.prototype.onBeforeRun.call( this, args );

		if ( this.history && this.isHistoryActive() ) {
			this.addTransaction();
		}
	}

	onAfterRun( args, result ) {
		CommandBase.prototype.onAfterRun.call( this, args, result );

		if ( this.isHistoryActive() ) {
			if ( this.isDebounceRequired ) {
				this.constructor.debounce( this.endTransaction.bind( this ) );
			} else {
				this.endTransaction();
			}
		}
	}

	onCatchApply( e ) {
		CommandBase.prototype.onCatchApply.call( this, e );

		// Rollback history on failure.
		if ( e instanceof $e.modules.HookBreak && this.history ) {
			if ( this.isDebounceRequired ) {
				// `delete-transaction` is under debounce, because it should `delete-transaction` after `end-transaction`.
				this.constructor.debounce( this.deleteTransaction.bind( this ) );
			} else {
				this.deleteTransaction();
			}
		}
	}
}

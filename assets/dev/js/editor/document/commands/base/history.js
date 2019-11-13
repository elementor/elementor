import Base from './base';

export default class History extends Base {
	constructor( args ) {
		super( args );

		/**
		 * Get History from child command.
		 *
		 * @type {{}|boolean}
		 */
		this.history = this.getHistory( args );
	}

	static endLog() {
		$e.run( 'document/history/end-log' );
	}

	/**
	 * Function getHistory().
	 *
	 * Get history object from child, do nothing if it false.
	 *
	 * @param {{}} args
	 *
	 * @returns {{}|boolean}
	 *
	 * @throws {Error}
	 */
	getHistory( args ) {
		elementorModules.ForceMethodImplementation();
	}

	/**
	 * Function isHistoryActive().
	 *
	 * Return `elementor.history.history.getActive()`.
	 *
	 * @returns {boolean}
	 */
	isHistoryActive() {
		return elementor.history.history.getActive();
	}

	onBeforeRun( args ) {
		super.onBeforeRun( args );

		if ( this.history && this.isHistoryActive() ) {
			$e.run( 'document/history/start-log', this.history );
		}
	}

	onAfterRun( args, result ) {
		super.onAfterRun( args, result );

		if ( this.isHistoryActive() ) {
			this.constructor.endLog();
		}
	}

	onCatchApply( e ) {
		super.onCatchApply( e );

		// Rollback history on failure.
		if ( this.history ) {
			$e.run( 'document/history/delete-log' );
		}
	}
}

History.endLog = _.debounce( History.endLog, 800 );

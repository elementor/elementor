import Base from './base';

export default class History extends Base {
	constructor( args ) {
		super( args );

		// Get History from child command.
		this.history = this.getHistory( args );

		this.historyId = null;
	}

	/**
	 * Function getHistory().
	 *
	 * Gets specify history behavior.
	 *
	 * @param {{}} args
	 *
	 * @returns {{}|Boolean}
	 *
	 * @throws Error
	 */
	getHistory( args ) {
		throw Error( 'getHistory() should be implemented, please provide getHistory functionality.' );
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

	run() {
		let result;

		if ( this.history && this.isHistoryActive() ) {
			/**
			 * If `historyId` was passed, assuming that is sub history item.
			 * If so, pass `id` to `document/history/startLog` to apply history sub item.
			 */
			if ( this.args.histroyId ) {
				this.history.id = this.args.histroyId;

				delete this.args.histroyId;
			}

			this.historyId = $e.run( 'document/history/startLog', this.history );
		}

		result = super.run();

		if ( this.historyId ) {
			$e.run( 'document/history/endLog', { id: this.historyId } );
		}

		return result;
	}

	onCatchApply( e ) {
		super.onCatchApply( e );

		// Rollback history on failure.
		if ( this.historyId ) {
			$e.run( 'document/history/deleteLog', { id: this.historyId } );
		}
	}
}

import CommandContainerBase from 'elementor-editor/command-bases/command-container-base';

/**
 * @name $e.modules.editor.document.CommandHistoryBase
 */
export default class CommandHistoryBase extends CommandContainerBase {
	static getInstanceType() {
		return 'CommandHistoryBase';
	}

	initialize( args = {} ) {
		const { options = {} } = args,
			{ useHistory = true } = options;

		if ( useHistory ) {
			/**
			 * Get History from child command.
			 *
			 * @type {{}|boolean}
			 */
			this.history = this.getHistory( args );

			/**
			 * @type {number|boolean}
			 */
			this.historyId = false;
		}
	}

	// eslint-disable-next-line jsdoc/require-returns-check
	/**
	 * Function getHistory().
	 *
	 * Get history object from child, do nothing if it false.
	 *
	 * @param {*} [args={}]
	 *
	 * @return {({}|boolean)} history object
	 */
	getHistory( args = {} ) { // eslint-disable-line no-unused-vars
		elementorModules.ForceMethodImplementation();
	}

	/**
	 * Function isHistoryActive().
	 *
	 * Return `elementor.documents.getCurrent().history.getActive()`.
	 *
	 * @return {boolean} is history active
	 */
	isHistoryActive() {
		return elementor.documents.getCurrent().history.getActive();
	}

	onBeforeRun( args ) {
		super.onBeforeRun( args );

		if ( this.history && this.isHistoryActive() ) {
			this.historyId = $e.internal( 'document/history/start-log', this.history );
		}
	}

	onAfterRun( args, result ) {
		super.onAfterRun( args, result );

		if ( this.history && this.isHistoryActive() ) {
			$e.internal( 'document/history/end-log', { id: this.historyId } );
		}
	}

	onAfterApply( args = {}, result ) {
		super.onAfterApply( args, result );

		if ( this.isDataChanged() ) {
			$e.internal( 'document/save/set-is-modified', { status: true } );
		}
	}

	onCatchApply( e ) {
		// Rollback history on failure.
		if ( e instanceof $e.modules.HookBreak && this.historyId ) {
			$e.internal( 'document/history/delete-log', { id: this.historyId } );
		}

		super.onCatchApply( e );
	}

	isDataChanged() {
		// All the commands who use history are commands that changing the data.
		return true;
	}
}

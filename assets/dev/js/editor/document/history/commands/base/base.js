import CommandInternalBase from 'elementor-api/modules/command-internal-base';

export default class Base extends CommandInternalBase {
	initialize( args ) {
		super.initialize( args );

		/**
		 * @type {HistoryManager}
		 */
		this.history = elementor.documents.getCurrent().history;
	}

	onBeforeApply( args = {} ) {
		super.onBeforeApply( args );

		if ( ! this.useHistory() ) {
			throw new $e.modules.HookBreak;
		}
	}

	onCatchApply( e ) {
		if ( ! ( e instanceof $e.modules.HookBreak ) ) {
			super.onCatchApply( e );
		}
	}

	/**
	 * Check whether to push the log into history.
	 *
	 * @returns {boolean}
	 */
	useHistory() {
		// If there's no currently running command or the first command didn't choose not to use history.
		return ! $e.commands.getCurrentFirst() ||
			false !== $e.commands.getCurrentFirstTraceArgs().options?.useHistory;
	}
}

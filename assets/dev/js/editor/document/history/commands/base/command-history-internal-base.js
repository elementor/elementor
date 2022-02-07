import CommandContainerInternalBase from 'elementor-editor/command-bases/command-container-internal-base';

export default class CommandHistoryInternalBase extends CommandContainerInternalBase {
	initialize( args ) {
		super.initialize( args );

		/**
		 * @type {HistoryManager}
		 */
		this.history = elementor.documents.getCurrent().history;
	}
}

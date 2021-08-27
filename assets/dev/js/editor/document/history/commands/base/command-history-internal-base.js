import CommandContainerInternal from 'elementor-editor/command-bases/command-container-internal';

export default class CommandHistoryInternalBase extends CommandContainerInternal {
	initialize( args ) {
		super.initialize( args );

		/**
		 * @type {HistoryManager}
		 */
		this.history = elementor.documents.getCurrent().history;
	}
}

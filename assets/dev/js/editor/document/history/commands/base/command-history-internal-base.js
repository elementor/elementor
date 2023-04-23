/**
 * @typedef {import ('elementor/modules/history/assets/js/module')} HistoryManager
 */

export default class CommandHistoryInternalBase extends $e.modules.editor.CommandContainerInternalBase {
	initialize( args ) {
		super.initialize( args );

		/**
		 * @type {HistoryManager}
		 */
		this.history = elementor.documents.getCurrent().history;
	}
}

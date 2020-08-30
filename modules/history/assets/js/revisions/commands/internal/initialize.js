import CommandInternal from 'elementor-api/modules/command-internal-base';
import Document from 'elementor-editor/../../../../assets/dev/js/editor/document'; // TODO: Fix conflict between 'document/index.js and document.js'.
import RevisionsTabView from '../../view/tab';

/**
 * @property {RevisionsComponent} component
 */
export class Initialize extends CommandInternal {
	validateArgs( args = {} ) {
		this.requireArgumentConstructor( 'tab', RevisionsTabView, args );
		this.requireArgumentConstructor( 'document', Document, args );
	}

	/**
	 * @inheritDoc
	 * @param {Object} args
	 * @param {RevisionsTab} args.tab
	 * @param {Document} args.document
	 */
	apply( args = {} ) {
		const { tab, document } = args;

		this.component.currentTab = tab;
		this.component.currentDocument = document;
		this.component.currentPreviewId = elementor.config.document.revisions.current_id;

		tab.collection = document.revisions.getItems();
	}
}

export default Initialize;

import CommandBase from 'elementor-api/modules/command-base';
import Document from 'elementor-editor/document.js'; // TODO: Fix conflict between 'document/index.js and document.js'.
import RevisionsTab from '../panel/tab';

/**
 * @property {RevisionsComponent} component
 */
export class Initialize extends CommandBase {
	validateArgs( args = {} ) {
		this.requireArgumentConstructor( 'tab', RevisionsTab, args );
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

		tab.collection = document.revisions.getItems();

		// TODO: next code should be part of RevisionsComponent.
		tab.document = document;
		tab.currentPreviewId = elementor.config.document.revisions.current_id;
	}
}

export default Initialize;

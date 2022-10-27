import { setQueryParam } from 'elementor-editor-utils/query-params';

export class SetActiveDocumentQueryParam extends $e.modules.hookUI.After {
	getCommand() {
		return 'editor/documents/open';
	}

	getId() {
		return 'set-active-document-query-param';
	}

	getConditions( args ) {
		// Don't run for the main document.
		return elementor.documents.getCurrentId() !== elementor.config.initial_document.id;
	}

	apply( args ) {
		setQueryParam( 'active-document', args.id );
	}
}

export default SetActiveDocumentQueryParam;

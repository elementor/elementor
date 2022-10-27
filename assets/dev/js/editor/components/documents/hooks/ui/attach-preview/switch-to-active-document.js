import { getQueryParam } from 'elementor-editor-utils/query-params';

export class SwitchToActiveDocument extends $e.modules.hookUI.After {
	getCommand() {
		return 'editor/documents/attach-preview';
	}

	getId() {
		return 'switch-to-active-document';
	}

	getConditions( args ) {
		// Run only on initial document attach.
		return elementor.documents.getCurrentId() === elementor.config.initial_document.id;
	}

	apply() {
		const activeDocumentId = parseInt( getQueryParam( 'active-document' ) );

		if ( activeDocumentId && activeDocumentId !== elementor.documents.getCurrentId() ) {
			$e.run( 'editor/documents/switch', {
				id: activeDocumentId,
				mode: 'autosave',
			} );
		}
	}
}

export default SwitchToActiveDocument;

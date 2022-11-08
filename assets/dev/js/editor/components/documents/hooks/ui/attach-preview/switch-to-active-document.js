import { getQueryParam, removeQueryParam } from 'elementor-editor-utils/query-params';

/**
 * Switch to the document in the `active-document` query param on initial Editor load.
 * This hook runs only once, when the initial document has been attached.
 */
export class SwitchToActiveDocument extends $e.modules.hookUI.After {
	static calledOnce = false;

	getCommand() {
		return 'editor/documents/attach-preview';
	}

	getId() {
		return 'switch-to-active-document';
	}

	getConditions() {
		if ( this.constructor.calledOnce ) {
			return false;
		}

		return elementor.documents.getCurrentId() === elementor.config.initial_document.id;
	}

	async apply() {
		this.constructor.calledOnce = true;

		const activeDocumentId = parseInt( getQueryParam( 'active-document' ) ),
			isLoadedAlready = activeDocumentId === elementor.documents.getCurrentId();

		if ( isNaN( activeDocumentId ) || isLoadedAlready ) {
			return;
		}

		// Try to load the document, and fallback to the main document on error.
		try {
			await $e.run( 'editor/documents/switch', {
				id: activeDocumentId,
				mode: 'autosave',
			} );
		} catch ( e ) {
			$e.run( 'editor/documents/switch', {
				id: elementor.config.initial_document.id,
				mode: 'autosave',
			} );

			removeQueryParam( 'active-document' );
		}
	}
}

export default SwitchToActiveDocument;

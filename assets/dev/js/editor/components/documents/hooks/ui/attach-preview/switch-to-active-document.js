import { getQueryParam } from 'elementor-editor-utils/query-params';

export class SwitchToActiveDocument extends $e.modules.hookUI.After {
	getCommand() {
		return 'editor/documents/attach-preview';
	}

	getId() {
		return 'switch-to-active-document';
	}

	getValidDocumentIDs() {
		// TODO: Fix this!
		const elements = elementor.$previewContents[ 0 ].querySelectorAll( '[data-elementor-id]' ),
			IDs = [ ...elements ].map( ( el ) => parseInt( el.dataset.elementorId ) );

		return new Set( IDs );
	}

	getActiveDocument() {
		return parseInt( getQueryParam( 'active-document' ) );
	}

	getConditions( args ) {
		const isInitialDocument = ( elementor.documents.getCurrentId() === elementor.config.initial_document.id ),
			isValidDocument = this.getValidDocumentIDs().has( this.getActiveDocument() );

		return isInitialDocument;
	}

	apply() {
		const activeDocumentId = this.getActiveDocument();

		if ( activeDocumentId && activeDocumentId !== elementor.documents.getCurrentId() ) {
			$e.run( 'editor/documents/switch', {
				id: activeDocumentId,
				mode: 'autosave',
			} );
		}
	}
}

export default SwitchToActiveDocument;

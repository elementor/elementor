import { removeQueryParam, setQueryParam } from 'elementor-editor-utils/query-params';

export class Replace extends $e.modules.CommandBase {
	validateArgs( args ) {
		this.requireArgument( 'id', args );
	}

	apply( args ) {
		const { id } = args;

		return Promise.resolve()
			.then( () => this.showLoader() )
			.then( () => this.closeCurrentDocument() )
			.then( () => this.clearDocumentsCache( id ) )
			.then( () => this.openDocument( id ) )
			.then( () => this.attachDocument( id ) )
			.then( () => this.hideLoader() );
	}

	closeCurrentDocument() {
		return $e.run( 'editor/documents/close', {
			id: elementor.documents.getCurrentId(),
		} );
	}

	clearDocumentsCache( currentDocumentId ) {
		const exclude = [
			currentDocumentId,
			elementor.config.kit_id,
		];

		// Clear the documents cache to prevent memory leaks.
		for ( const id in elementor.documents.documents ) {
			const isExcluded = exclude.includes( parseInt( id ) );

			if ( isExcluded ) {
				continue;
			}

			elementor.documents.invalidateCache( id );
			delete elementor.documents.documents[ id ];
		}
	}

	openDocument( id ) {
		return $e.run( 'editor/documents/open', { id, attach: false } );
	}

	attachDocument( id ) {
		return new Promise( ( resolve ) => {
			setQueryParam( 'post', id );
			removeQueryParam( 'active-document' );

			const newDocument = elementor.documents.documents[ id ];
			elementor.config.initial_document = newDocument;

			elementor.$preview.one( 'load', resolve );

			// Will trigger attach-preview (see editor-base).
			elementor.$preview[ 0 ].src = newDocument.config.urls.preview;
		} );
	}

	showLoader() {
		$e.internal( 'panel/state-loading' );
		elementor.panel.$el.find( '#elementor-panel-state-loading i' ).hide();
		jQuery( '#elementor-preview-loading' ).show();
	}

	hideLoader() {
		$e.internal( 'panel/state-ready' );
		elementor.panel.$el.find( '#elementor-panel-state-loading i' ).show();
		jQuery( '#elementor-preview-loading' ).hide();
	}
}

export default Replace;

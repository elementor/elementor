export class Open extends $e.modules.CommandBase {
	validateArgs( args ) {
		this.requireArgument( 'id', args );
	}

	apply( args ) {
		const { id, selector, shouldScroll = true, setAsInitial = false } = args,
			currentDocument = elementor.documents.getCurrent();

		// Already opened.
		if ( currentDocument && id === currentDocument.id ) {
			return jQuery.Deferred().resolve();
		}

		// TODO: move to $e.hooks.ui.
		if ( elementor.loaded ) {
			elementor.$previewContents.find( `.elementor-${ id }` ).addClass( 'loading' );
		}

		if ( setAsInitial ) {
			// Set the new initial document id to be sent with all requests.
			// The next request needs to have the new initial document id in order to have the correct preview URL.
			elementorCommon.ajax.addRequestConstant( 'initial_document_id', id );

			// Because the initial document has changed, we need to clear cached values (e.g. header wp_preview URL),
			elementor.documents.invalidateCache();
		}

		return elementor.documents.request( id )
			.then( ( config ) => {
				elementorCommon.elements.$body.addClass( `elementor-editor-${ config.type }` );

				// Tell the editor to load the document.
				return $e.internal( 'editor/documents/load', { config, selector, setAsInitial, shouldScroll } );
			} )
			.always( () => {
				// TODO: move to $e.hooks.ui.
				if ( elementor.loaded ) {
					elementor.$previewContents.find( `.elementor-${ id }` ).removeClass( 'loading' );
				}
			} );
	}
}

export default Open;

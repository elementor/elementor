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

		// Because the initial document has changed, we need to clear cached values (e.g. header wp_preview URL).
		if ( setAsInitial ) {
			elementorCommon.ajax.addRequestConstant( 'initial_document_id', id );
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

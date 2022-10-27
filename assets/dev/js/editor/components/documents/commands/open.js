export class Open extends $e.modules.CommandBase {
	validateArgs( args ) {
		this.requireArgument( 'id', args );
	}

	apply( args ) {
		const { id, selector, shouldScroll = true } = args,
			currentDocument = elementor.documents.getCurrent();

		// Already opened.
		if ( currentDocument && id === currentDocument.id ) {
			return jQuery.Deferred().resolve();
		}

		// TODO: move to $e.hooks.ui.
		const isFirstLoad = ! elementor.loaded;

		if ( ! isFirstLoad ) {
			elementor.$previewContents.find( `.elementor-${ id }` ).addClass( 'loading' );

			this.setQueryParam( 'active-document', id );
		}

		return elementor.documents.request( id )
			.then( ( config ) => {
				elementorCommon.elements.$body.addClass( `elementor-editor-${ config.type }` );

				// Tell the editor to load the document.
				return $e.internal( 'editor/documents/load', { config, selector, shouldScroll } );
			} )
			.always( () => {
				// TODO: move to $e.hooks.ui.
				if ( elementor.loaded ) {
					elementor.$previewContents.find( `.elementor-${ id }` ).removeClass( 'loading' );
				}
			} );
	}

	setQueryParam( param, value ) {
		const url = new URL( window.location.href );

		if ( value ) {
			url.searchParams.set( param, value );
		} else {
			url.searchParams.delete( param );
		}

		history.replaceState( {}, '', url );
	}
}

export default Open;

( function( $ ) {
	'use strict';

	$( window ).on( 'elementor/frontend/init', function() {
		if ( ! window.elementorProPreview ) {
			return;
		}

		const originalCreateDocumentsHandles = window.elementorProPreview.createDocumentsHandles.bind( window.elementorProPreview );

		window.elementorProPreview.createDocumentsHandles = function() {
			if ( ! elementorFrontend || ! elementorFrontend.documentsManager || ! elementorFrontend.documentsManager.documents ) {
				return;
			}

			const validDocuments = Object.values( elementorFrontend.documentsManager.documents ).filter( ( document ) => {
				if ( ! document || ! document.$element ) {
					return false;
				}

				const element = document.$element.get( 0 );
				if ( ! element ) {
					return false;
				}

				const { customEditHandle: hasCustomEditHandle } = element.dataset || {};
				if ( hasCustomEditHandle ) {
					return false;
				}

				const id = document.getSettings ? document.getSettings( 'id' ) : null;
				return !! id;
			} );

			if ( validDocuments.length === 0 ) {
				return;
			}

			const tempDocuments = elementorFrontend.documentsManager.documents;
			elementorFrontend.documentsManager.documents = {};
			validDocuments.forEach( ( document ) => {
				const id = document.getSettings( 'id' );
				elementorFrontend.documentsManager.documents[ id ] = document;
			} );

			try {
				originalCreateDocumentsHandles.call( this );
			} finally {
				elementorFrontend.documentsManager.documents = tempDocuments;
			}
		};
	} );
}( jQuery ) );


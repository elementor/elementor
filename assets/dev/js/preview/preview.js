export default class Preview extends elementorModules.ViewModule {
	constructor() {
		super();

		elementorFrontend.on( 'components:init', () => this.onFrontendComponentsInit() );
	}

	createDocumentsHandles() {
		jQuery.each( elementorFrontend.documentsManager.documents, ( index, document ) => {
			const $documentElement = document.$element;

			if ( $documentElement.hasClass( 'elementor-edit-mode' ) ) {
				return;
			}

			const $existingHandle = document.$element.children( '.elementor-document-handle' );

			if ( $existingHandle.length ) {
				return;
			}

			const $handle = jQuery( '<div>', { class: 'elementor-document-handle' } ),
				$handleIcon = jQuery( '<i>', { class: 'eicon-edit' } ),
				documentTitle = $documentElement.data( 'elementor-title' ),
				$handleTitle = jQuery( '<div>', { class: 'elementor-document-handle__title' } ).text( elementor.translate( 'edit_element', [ documentTitle ] ) );

			$handle.append( $handleIcon, $handleTitle );

			$handle.on( 'click', () => this.onDocumentHandleClick( document ) );

			$documentElement.prepend( $handle );
		} );
	}

	onDocumentHandleClick( document ) {
		elementorCommon.api.run( 'editor/documents/switch', {
			id: document.getSettings( 'id' ),
			mode: 'autosave',
		} );
	}

	onFrontendComponentsInit() {
		this.createDocumentsHandles();

		elementor.on( 'document:loaded', () => this.createDocumentsHandles() );
	}
}

window.elementorPreview = new Preview();

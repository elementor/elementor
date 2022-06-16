export class AttachPreview extends $e.modules.CommandInternalBase {
	validateArgs( args = {} ) {
		if ( args.selector ) {
			this.requireArgumentType( 'selector', 'string' );

			if ( 0 === elementor.$previewContents.find( args.selector ).length ) {
				throw new Error( 'Invalid argument. The `selector` argument must be existed selector.' );
			}
		}
	}

	apply( args ) {
		const document = elementor.documents.getCurrent();

		return $e.data.get( 'globals/index' )
			.then( () => {
				elementor.trigger( 'globals:loaded' );

				return this.attachDocumentToPreview( document, args );
			} )
			.then( () => {
				elementor.toggleDocumentCssFiles( document, false );

				elementor.onEditModeSwitched();

				elementor.checkPageStatus();

				elementor.trigger( 'document:loaded', document );

				return $e.internal( 'panel/open-default', {
					refresh: true,
				} );
		} );
	}

	attachDocumentToPreview( document, args ) {
		const { selector = '.elementor-' + document.id } = args;

		return new Promise( ( resolve, reject ) => {
			// Not yet loaded.
			if ( ! document ) {
				return reject();
			}

			if ( ! document.config.elements ) {
				return resolve();
			}

			document.$element = elementor.$previewContents.find( selector );

			if ( ! document.$element.length ) {
				elementor.onPreviewElNotFound();

				return reject();
			}

			document.$element.addClass( 'elementor-edit-area elementor-edit-mode' );

			// If not the same document.
			if ( document.id !== elementor.config.initial_document.id ) {
				elementor.$previewElementorEl.addClass( 'elementor-embedded-editor' );
			}

			$e.internal( 'document/elements/populate', {
				document,
				elements: JSON.parse( JSON.stringify( document.config.elements ) ),
			} );

			elementor.initPreviewView( document );

			document.container.view = elementor.getPreviewView();
			document.container.model.attributes.elements = elementor.elements;

			elementor.helpers.scrollToView( document.$element );

			document.$element
				.addClass( 'elementor-edit-area-active' )
				.removeClass( 'elementor-editor-preview' );

			resolve();
		} );
	}
}

export default AttachPreview;

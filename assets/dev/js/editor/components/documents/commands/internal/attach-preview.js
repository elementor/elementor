import CommandInternalBaseBase from 'elementor-api/modules/command-internal-base';
import ElementsCollection from 'elementor-elements/collections/elements';

export class AttachPreview extends CommandInternalBaseBase {
	apply() {
		const document = elementor.documents.getCurrent();

		return $e.data.get( 'globals/index' )
			.then( () => {
				elementor.trigger( 'globals:loaded' );

				return this.attachDocumentToPreview( document );
			} )
			.then( () => {
				elementor.toggleDocumentCssFiles( document, false );

				elementor.onEditModeSwitched();

				elementor.checkPageStatus();

				elementor.trigger( 'document:loaded', document );

				$e.store.dispatch(
					$e.store.get( 'document/elements' ).actions.reset()
				);

				$e.store.dispatch(
					$e.store.get( 'document/elements/selection' ).actions.reset()
				);

				$e.store.dispatch(
					$e.store.get( 'navigator/folding' ).actions.reset()
				);

				$e.store.dispatch(
					$e.store.get( 'document/elements' ).actions.add( {
						models: new ElementsCollection( [
							{ id: 'document', elements: elementor.elementsModel.get( 'elements' ).toJSON() },
						] ).toJSON(),
					} )
				);

				return $e.internal( 'panel/open-default', {
					refresh: true,
				} );
		} );
	}

	attachDocumentToPreview( document ) {
		return new Promise( ( resolve, reject ) => {
			// Not yet loaded.
			if ( ! document ) {
				return reject();
			}

			if ( ! document.config.elements ) {
				return resolve();
			}

			document.$element = elementor.$previewContents.find( '.elementor-' + document.id );

			if ( ! document.$element.length ) {
				elementor.onPreviewElNotFound();

				return reject();
			}

			document.$element.addClass( 'elementor-edit-area elementor-edit-mode' );

			// If not the same document.
			if ( document.id !== elementor.config.initial_document.id ) {
				elementor.$previewElementorEl.addClass( 'elementor-embedded-editor' );
			}

			elementor.initElements();

			elementor.initPreviewView( document );

			document.container.view = elementor.getPreviewView();
			document.container.model.attributes.elements = elementor.elements;

			$e.internal( 'document/elements/scroll-to-view', { container: document.container } );

			document.$element
				.addClass( 'elementor-edit-area-active' )
				.removeClass( 'elementor-editor-preview' );

			resolve();
		} );
	}
}

export default AttachPreview;

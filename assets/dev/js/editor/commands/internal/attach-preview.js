import CommandInternalBaseBase from 'elementor-api/modules/command-internal-base';

export class AttachPreview extends CommandInternalBaseBase {
	apply() {
		const document = elementor.documents.getCurrent();

		return this.attachDocumentToPreview( document )
			.then( () => {
				elementor.toggleDocumentCssFiles( document, false );

				elementor.onEditModeSwitched();

				elementor.checkPageStatus();

				elementor.trigger( 'document:loaded', document );

				$e.internal( 'panel/open-default', {
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

			const iframeRegion = new Marionette.Region( {
				// Make sure you get the DOM object out of the jQuery object
				el: document.$element[ 0 ],
			} );

			elementor.addRegions( {
				sections: iframeRegion,
			} );

			const Preview = require( 'elementor-views/preview' );

			elementor.sections.show( new Preview( { model: elementor.elementsModel } ) );

			document.container.view = elementor.getPreviewView();
			document.container.model.attributes.elements = elementor.elements;

			elementor.helpers.scrollToView( document.$element );

			document.$element
				.addClass( 'elementor-edit-area-active' )
				.removeClass( 'elementor-edit-area-preview elementor-editor-preview' );

			resolve();
		} );
	}
}

export default AttachPreview;

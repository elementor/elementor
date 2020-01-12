import CommandsBase from 'elementor-api/modules/command-base';

export class Open extends CommandsBase {
	validateArgs( args ) {
		this.requireArgument( 'id', args );
	}

	apply( args ) {
		const { id } = args,
			currentDocument = elementor.documents.getCurrent();

		// Already opened.
		if ( currentDocument && id === currentDocument.id ) {
			return;
		}

		// TODO: move to $e.hooks.ui.
		if ( elementor.loaded ) {
			elementor.$previewContents.find( `.elementor-${ id }` ).addClass( 'loading' );
		}

		elementor.documents.request( id ).then( ( config ) => {
			elementorCommon.elements.$body.addClass( `elementor-editor-${ config.type }` );

			// Tell the editor to load the document.
			const document = elementor.loadDocument( config );

			this.component.startAutoSave( document );

			// TODO: move to $e.hooks.ui.
			if ( elementor.loaded ) {
				elementor.$previewContents.find( `.elementor-${ id }` ).removeClass( 'loading' );
			}
		} );
	}
}

export default Open;

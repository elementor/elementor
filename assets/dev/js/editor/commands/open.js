import CommandBase from 'elementor-api/modules/command-base';

export class Open extends CommandBase {
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

		const startAutoSave = this.component.startAutoSave;

		elementor.documents.request( id ).then( ( config ) => {
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

import Base from '../document/commands/base/base';

export class Open extends Base {
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
			// Tell the editor to load the document.
			elementor.loadDocument( config );

			// TODO: move to $e.hooks.ui.
			if ( elementor.loaded ) {
				elementor.$previewContents.find( `.elementor-${ id }` ).removeClass( 'loading' );
			}
		} );
	}
}

export default Open;

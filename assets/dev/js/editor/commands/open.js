import Base from '../document/commands/base/base';

export class Open extends Base {
	validateArgs( args ) {
		this.requireArgument( 'id', args );
	}

	apply( args ) {
		const { id } = args;

		// Already opened.
		if ( elementor.documents[ id ] && 'open' === elementor.documents[ id ].editorStatus ) {
			return;
		}

		// TODO: move to an event.
		if ( elementor.loaded ) {
			elementor.$previewContents.find( `.elementor-${ id }` ).addClass( 'loading' );
		}

		elementor.initDocument( id ).then( () => {
			elementor.config.document.editorStatus = 'open';

			if ( elementor.loaded ) {
				elementor.$previewElementorEl
				.addClass( 'elementor-edit-area-active' )
				.removeClass( 'elementor-edit-area-preview elementor-editor-preview' );

				elementor.$previewContents.find( `.elementor-${ id }` ).removeClass( 'loading' );

				$e.route( 'panel/elements/categories', {
					refresh: true,
				} );
			}
		} );
	}
}

export default Open;

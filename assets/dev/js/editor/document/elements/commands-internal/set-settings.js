export class SetSettings extends $e.modules.editor.CommandContainerInternalBase {
	validateArgs( args = {} ) {
		this.requireContainer( args );
		this.requireArgumentType( 'settings', 'object', args );

		if ( 'undefined' !== typeof args.render && 'undefined' !== typeof args.renderUI ) {
			throw new Error( 'Args: `render` and `renderUI` cannot be applied together.' );
		}
	}

	apply( args = {} ) {
		const { containers = [ args.container ], settings, options = {} } = args,
			{ external, render = true, renderUI = false } = options;

		containers.forEach( ( container ) => {
			if ( external ) {
				container.settings.setExternalChange( settings );
			} else {
				container.settings.set( settings );
			}

			if ( renderUI ) {
				container.renderUI();
			} else if ( render ) {
				container.render();
			}

			$e.store.dispatch(
				this.component.store.actions.settings( {
					documentId: elementor.documents.getCurrentId(),
					elementId: container.id,
					// Deep copy in order to avoid making container setting properties immutable.
					settings: JSON.parse( JSON.stringify( settings ) ),
				} ),
			);
		} );
	}

	static reducer( state, { payload } ) {
		const { documentId, elementId, settings } = payload;

		if ( state[ documentId ]?.[ elementId ] ) {
			state[ documentId ][ elementId ].settings = {
				...state[ documentId ][ elementId ].settings,
				...settings,
			};
		}
	}
}

export default SetSettings;

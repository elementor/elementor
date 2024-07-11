export class SetStyles extends $e.modules.editor.CommandContainerInternalBase {
	validateArgs( args = {} ) {
		this.requireContainer( args );
		this.requireArgumentType( 'styles', 'object', args );

		if ( 'undefined' !== typeof args.render && 'undefined' !== typeof args.renderUI ) {
			throw new Error( 'Args: `render` and `renderUI` cannot be applied together.' );
		}
	}

	apply( args = {} ) {
		const { containers = [ args.container ], styles, options = {} } = args,
			{ render = true, renderUI = false } = options;

		containers.forEach( ( container ) => {
			container.model.set( 'styles', styles );

			if ( renderUI ) {
				container.renderUI();
			} else if ( render ) {
				container.render();
			}
		} );
	}
}

export default SetStyles;

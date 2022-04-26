export class Drop extends $e.modules.CommandBase {
	validateArgs( args = {} ) {
		this.requireContainer( args );

		this.requireArgumentType( 'model', 'object', args );
	}

	apply( args = {} ) {
		const { containers = [ args.container ], options = {} } = args;

		// Do not pass `args.options` to `createElementFromModel`.
		if ( args.options ) {
			delete args.options;
		}

		containers.forEach( ( container ) => {
			container.view.createElementFromModel( args.model, options );
		} );
	}
}

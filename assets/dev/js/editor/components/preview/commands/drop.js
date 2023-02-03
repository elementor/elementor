export class Drop extends $e.modules.CommandBase {
	validateArgs( args = {} ) {
		this.requireContainer( args );

		this.requireArgumentType( 'model', 'object', args );
	}

	apply( args = {} ) {
		const { containers = [ args.container ], options = {} } = args,
			result = [];

		containers.forEach( ( container ) => {
			result.push( container.view.createElementFromModel( args.model, options ) );
		} );

		if ( 1 === containers.length ) {
			return result[ 0 ];
		}

		return result;
	}
}

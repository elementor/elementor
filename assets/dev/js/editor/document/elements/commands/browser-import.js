import CommandBase from 'elementor-api/modules/command-base';

export class BrowserImport extends CommandBase {
	/**
	 * @inheritDoc
	 */
	validateArgs( args ) {
		this.requireContainer( args );
	}

	/**
	 * @inheritDoc
	 */
	apply( args ) {
		const { containers = [ args.container ], input, options = {} } = args;

		containers.map( ( container ) => {
			elementor.browserImport
				.createSession()
				.normalizeInput( input )
				.setContainer( container, options.container )
				.setOptions( options )
				.build()
				.then( ( session ) => {
					if ( session.validate() ) {
						session.apply();
					}
				} );
		} );
	}
}

export default BrowserImport;

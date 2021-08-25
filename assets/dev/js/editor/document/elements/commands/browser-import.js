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

		containers.forEach( ( container ) => {
			elementor.browserImport
				.createSession( input, container, options )
				.then( async ( session ) => {
					if ( await session.validate() ) {
						session.apply();
					}
				} );
		} );
	}
}

export default BrowserImport;

import CommandBase from 'elementor-api/modules/command-base';

export class Import extends CommandBase {
	/**
	 * @inheritDoc
	 */
	validateArgs( args ) {
		this.requireArgumentInstance( 'target', elementorModules.editor.Container );
	}

	/**
	 * @inheritDoc
	 */
	apply( args ) {
		const { targets = [ args.target ], input, options = {} } = args;

		targets.forEach( ( target ) => {
			this.component.manager
				.createSession( input, target, options )
				.then( async ( session ) => {
					if ( await session.validate() ) {
						session.apply();
					}
				} );
		} );
	}
}

export default Import;

import CommandBase from 'elementor-api/modules/command-base';

export class Import extends CommandBase {
	/**
	 * @inheritDoc
	 */
	validateArgs() {
		this.requireArgumentInstance( 'target', elementorModules.editor.Container );
	}

	/**
	 * @inheritDoc
	 */
	apply( args ) {
		const { targets = [ args.target ], input, options = {} } = args,
			result = [];

		targets.forEach( ( target ) => {
			result.push(
				this.component.manager
				.createSession( input, target, options )
				.then( async ( session ) => {
					if ( await session.validate() ) {
						session.apply();
					}
				} ),
			);
		} );

		return Promise.all( result );
	}
}

export default Import;

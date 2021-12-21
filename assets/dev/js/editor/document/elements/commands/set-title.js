import CommandBase from 'elementor-api/modules/command-base';

export class SetTitle extends CommandBase {
	validateArgs( args ) {
		this.requireContainer( args );
	}

	apply( args ) {
		const { containers = [ args.container ], titles = [ args.title ] } = args;

		for ( const [ index, container ] of containers ) {
			const settings = container.model.get( 'settings' );

			settings.set( '_title', titles[ index ].trim() );
		}

		$e.internal( 'document/save/set-is-modified', {
			status: true,
		} );
	}
}

export default SetTitle;

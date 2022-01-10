import CommandBase from 'elementor-api/modules/command-base';

export class SetTitle extends CommandBase {
	validateArgs( args ) {
		this.requireContainer( args );
	}

	apply( args ) {
		const { containers = [ args.container ], titles = [ args.title ] } = args;

		for ( const [ index, container ] of containers.entries() ) {
			$e.internal( 'document/elements/set-settings', {
				container,
				settings: {
					_title: titles[ index ].trim(),
				},
			} );
		}
	}
}

export default SetTitle;

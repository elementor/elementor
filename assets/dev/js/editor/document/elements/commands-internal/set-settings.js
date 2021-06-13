import CommandInternal from 'elementor-api/modules/command-internal-base';

export class SetSettings extends CommandInternal {
	validateArgs( args = {} ) {
		this.requireContainer( args );
		this.requireArgumentType( 'settings', 'object', args );
	}

	apply( args = {} ) {
		const { containers = [ args.container ], settings, options = {} } = args,
			{ external, render = true } = options;

		containers.forEach( ( container ) => {
			if ( external ) {
				container.settings.setExternalChange( settings );
			} else {
				container.settings.set( settings );
			}

			if ( render ) {
				container.render();
			}
		} );
	}
}

export default SetSettings;

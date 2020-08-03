import CommandBase from 'elementor-api/modules/command-base';

export class ToggleVisibility extends CommandBase {
	validateArgs( args ) {
		this.requireContainer( args );
	}

	apply( args ) {
		const { containers = [ args.container ] } = args;

		containers.forEach( ( container ) => {
			if ( container.navView.model.get( 'hidden' ) ) {
				$e.run( 'navigator/elements/show', { container } );
			} else {
				$e.run( 'navigator/elements/hide', { container } );
			}
		} );
	}
}

export default ToggleVisibility;

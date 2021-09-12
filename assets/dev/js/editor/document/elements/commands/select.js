import CommandBase from 'elementor-api/modules/command-base';

export class Select extends CommandBase {
	validateArgs( args ) {
		this.requireContainer( args );
	}

	apply( args ) {
		const { containers = [ args.container ], multiple = false } = args;

		containers.forEach( ( container ) => {
			// If command/ctrl+click not clicked, clear selected elements.
			if ( ! multiple ) {
				$e.run( 'document/elements/deselect', { all: true } );
			}

			elementor.selectedElements[ container.id ] = container;

			container.view.select();
		} );
	}
}

export default Select;

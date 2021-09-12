import CommandBase from 'elementor-api/modules/command-base';

export class ToggleSelection extends CommandBase {
	validateArgs( args ) {
		this.requireContainer( args );
	}

	apply( args ) {
		const { containers = [ args.container ] } = args;

		containers.forEach( ( container ) => {
			$e.run(
				elementor.getSelectedElements().includes( container ) ?
					'document/elements/deselect' :
					'document/elements/select',
				args
			);
		} );
	}
}

export default ToggleSelection;

import CommandBase from 'elementor-api/modules/command-base';

export class Deselect extends CommandBase {
	apply( args ) {
		const { containers = [], all = false } = args;

		if ( args.container ) {
			containers.push( args.container );
		}

		( all ? elementor.getSelectedElements() : containers )
			.forEach( ( container ) => {
				delete elementor.selectedElements[ container.id ];

				container.view.deselect();
			} );
	}
}

export default Deselect;

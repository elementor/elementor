import CommandBase from 'elementor-api/modules/command-base';

export class Deselect extends CommandBase {
	apply( args ) {
		const { containers = [], all = false } = args;

		if ( args.container ) {
			containers.push( args.container );
		}

		elementor.selection.remove( containers, all );
	}
}

export default Deselect;

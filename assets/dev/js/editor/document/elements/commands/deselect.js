import CommandBase from 'elementor-api/modules/command-base';

export class Deselect extends CommandBase {
	validateArgs( args = {} ) {
		if ( ! args.all ) {
			this.requireContainer( args );
		}
	}

	apply( args ) {
		const { containers = [ args.container ], all = false } = args;

		elementor.selection.remove( containers, all );
	}
}

export default Deselect;

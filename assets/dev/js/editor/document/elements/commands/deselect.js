import CommandBase from 'elementor-api/modules/command-base';

export class Deselect extends CommandBase {
	validateArgs( args = {} ) {
		if ( ! args.all ) {
			this.requireContainer( args );
		}
	}

	apply( args ) {
		const { containers = [ args.container ], options = {} } = args;

		elementor.selection.remove( containers, options );
	}
}

export default Deselect;

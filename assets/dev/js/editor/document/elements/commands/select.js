import CommandBase from 'elementor-api/modules/command-base';

export class Select extends CommandBase {
	validateArgs( args ) {
		this.requireContainer( args );
	}

	apply( args ) {
		const { containers = [ args.container ], options = {} } = args;

		elementor.selection.add( containers, options );
	}
}

export default Select;

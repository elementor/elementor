import CommandBase from 'elementor-api/modules/command-base';

export class Select extends CommandBase {
	validateArgs( args ) {
		this.requireContainer( args );
	}

	apply( args ) {
		const { containers = [ args.container ], multiple = false } = args;

		elementor.selection.add( containers, multiple );
	}
}

export default Select;

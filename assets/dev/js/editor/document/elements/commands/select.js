import CommandContainerBase from 'elementor-editor/command-bases/command-container-base';

export class Select extends CommandContainerBase {
	validateArgs( args ) {
		this.requireContainer( args );
	}

	apply( args ) {
		const { containers = [ args.container ], append = false } = args;

		elementor.selection.add( containers, append );
	}
}

export default Select;

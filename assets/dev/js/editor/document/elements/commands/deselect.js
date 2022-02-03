import CommandContainerBase from 'elementor-editor/command-bases/command-container-base';

export class Deselect extends CommandContainerBase {
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

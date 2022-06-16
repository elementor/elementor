export class Deselect extends $e.modules.editor.CommandContainerBase {
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

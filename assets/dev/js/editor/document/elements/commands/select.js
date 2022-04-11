export class Select extends $e.modules.editor.CommandContainerBase {
	validateArgs( args ) {
		this.requireContainer( args );
	}

	apply( args ) {
		const { containers = [ args.container ], options = {} } = args;

		elementor.selection.add( containers, options );
	}
}

export default Select;

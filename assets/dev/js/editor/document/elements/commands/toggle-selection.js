export class ToggleSelection extends $e.modules.editor.CommandContainerBase {
	validateArgs( args ) {
		this.requireContainer( args );
	}

	apply( args ) {
		const { containers = [ args.container ], options = {} } = args,
			{ append = false } = options;

		containers.forEach( ( container ) => {
			$e.run(
				elementor.selection.has( container ) && append ?
					'document/elements/deselect' :
					'document/elements/select',
				args
			);
		} );
	}
}

export default ToggleSelection;

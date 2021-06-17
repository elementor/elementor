export class Link extends $e.modules.CommandBase {
	validateArgs( args ) {
		this.requireArgument( 'presetId', args );
		this.requireArgument( 'elementId', args );
	}

	async apply( args ) {
		const container = elementor.getContainer( args.elementId );

		// Update the element preset
		container.model.set( 'presetId', args.presetId );

		// replace all the defaults with the preset defaults
	}
}

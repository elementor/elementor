export class Create extends $e.modules.CommandBase {
	validateArgs( args ) {
		this.requireArgument( 'element_id', args );
	}

	async apply( args ) {
		const container = elementor.getContainer( args.element_id );

		// Get all the "styled" settings that differently from the hardcoded defaults.
		const settings = this.getSettingsForSave( container );

		// Save those settings into preset
		const { data } = await $e.data.create( 'presets', {
			element_type: container.settings.attributes.elType,
			widget_type: container.settings.attributes.widgetType,
			default: this.shouldBeDefault(),
			settings,
		} );

		// Link the preset to the container
		$e.run( 'presets/link', { preset_id: data.id, element_id: args.id } );

		// Clear the values of the container that already declared in the preset
	}

	getSettingsForSave( container ) {
		const controls = container.settings.controls;

		const settings = Object.entries( container.settings.toJSON( { remove: 'default' } ) )
			.filter( ( [ controlName ] ) => container.view.isStyleTransferControl( controls[ controlName ] ) );

		return Object.fromEntries( settings );
	}

	shouldBeDefault() {
		// Get all the preset for the specific widget or element if there is no presets, make the current one the default.

		return false;
	}
}

export default Create;

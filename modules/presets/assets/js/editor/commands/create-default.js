export class CreateDefault extends $e.modules.CommandBase {
	validateArgs( args ) {
		this.requireArgument( 'elementId', args );
	}

	async apply( { elementId, name = 'default' } ) {
		const container = elementor.getContainer( elementId );

		// Get all the "styled" settings that differently from the hardcoded defaults.
		const settings = this.getSettingsForSave( container );

		// Save those settings into preset
		const { data } = await $e.data.create( 'presets/index', {
			name,
			element_type: container.settings.attributes.elType,
			widget_type: container.settings.attributes.widgetType,
			is_default: true,
			settings,
		} );
	}

	/**
	 * Get all the settings that should be save in the preset.
	 *
	 * @param container
	 * @returns {{[p: string]: any}}
	 */
	getSettingsForSave( container ) {
		const controls = container.settings.controls;

		const settings = Object.entries( container.settings.toJSON( { remove: 'default' } ) )
			.filter( ( [ controlName ] ) => container.view.isStyleTransferControl( controls[ controlName ] ) );

		return Object.fromEntries( settings );
	}
}

export default Create;

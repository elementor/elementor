export class Create extends $e.modules.CommandBase {
	validateArgs( args ) {
		this.requireArgument( 'elementId', args );
	}

	async apply( { elementId } ) {
		const container = elementor.getContainer( elementId );

		// Get all the "styled" settings that differently from the hardcoded defaults.
		const settings = this.getSettingsForSave( container );

		// Save those settings into preset
		const { data } = await $e.data.create( 'presets/index', {
			element_type: container.settings.attributes.elType,
			widget_type: container.settings.attributes.widgetType,
			default: this.shouldBeDefault(),
			settings,
		} );

		// Link the preset to the container
		$e.run( 'presets/link', { presetId: data.data.id, elementId } );
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

	/**
	 * Is the new preset should be default preset.
	 *
	 * @returns {boolean}
	 */
	shouldBeDefault() {
		// Get all the preset for the specific widget or element if there is no presets, make the current one the default.

		return false;
	}
}

export default Create;

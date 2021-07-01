export class Create extends $e.modules.CommandBase {
	validateArgs( args ) {
		this.requireArgument( 'elementId', args );
	}

	async apply( { elementId } ) {
		const container = elementor.getContainer( elementId );
		const { elType, widgetType } = container.settings.attributes;

		// Get all the "styled" settings that differently from the hardcoded defaults.
		const settings = this.getSettingsForSave( container );

		// Save those settings into preset
		const { data } = await $e.data.create( 'default-values/index', { settings }, { type: widgetType || elType } );

		console.log( data );
	}

	/**
	 * Get all the settings that should be save.
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

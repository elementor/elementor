export class Create extends $e.modules.CommandBase {
	validateArgs( args ) {
		this.requireArgument( 'elementId', args );
	}

	async apply( { elementId } ) {
		const container = elementor.getContainer( elementId );
		const { elType, widgetType } = container.settings.attributes;

		// Get all the "styled" settings that differently from the hardcoded defaults.
		const settings = this.getSettingsForSave( container );

		const type = widgetType || elType;

		const elementsToRecreate = this.getAllElementsForRecreate( type, container );

		// Save those settings into preset
		await $e.data.create( 'default-values/index', { settings }, { type } );

		// Will recreate all the elements with the same type to apply the default values.
		$e.commandsInternal.run( 'document/elements/recreate', { settings: elementsToRecreate } );
	}

	/**
	 * Get all the settings that should be save.
	 *
	 * @param container
	 * @returns {{[p: string]: any}}
	 */
	getSettingsForSave( container ) {
		const controls = container.settings.controls;
		const settingsWithoutDefaults = container.settings.toJSON( { remove: [ 'hard-coded-default' ] } );

		const settings = Object.entries( settingsWithoutDefaults )
			.filter( ( [ controlName ] ) => {
				return '__globals__' === controlName ||
					( controls[ controlName ] && container.view.isStyleTransferControl( controls[ controlName ] ) );
			} );

		return Object.fromEntries( settings );
	}

	/**
	 * Get all the elements that should recreate after the creating the new default.
	 *
	 * @param type
	 * @param targetElement
	 * @returns {{}}
	 */
	getAllElementsForRecreate( type, targetElement ) {
		const elements = {};

		elementor.getPreviewContainer().forEachChildrenRecursive( ( element ) => {
			const currentElementType = element.model.attributes.widgetType || element.model.attributes.elType;

			if ( type !== currentElementType || targetElement.id === element.id ) {
				return;
			}

			elements[ element.id ] = element.model.toJSON( { remove: [ 'default' ] } );
		} );

		return elements;
	}
}

export default Create;

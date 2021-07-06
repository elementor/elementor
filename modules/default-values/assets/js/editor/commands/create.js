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

		const elementsToRecreate = this.getAllElementsForRecreate( type, settings );

		// Save those settings into preset.
		await $e.data.create( 'default-values/index', { settings }, { type } );

		// Update globals.
		if ( settings.__globals__ ) {
			this.assignGlobalsDefaultsToWidgetCache( type, settings.__globals__ );

			elementor.kitManager.renderGlobalsDefaultCSS();
		}

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

		let widgetGlobalDefaults = {};
		const currentDefaultGlobalControls = elementor.widgetsCache[ container.model.attributes.widgetType ].controls;

		if ( currentDefaultGlobalControls ) {
			widgetGlobalDefaults = Object.fromEntries(
				Object.entries( currentDefaultGlobalControls )
					.filter( ( [ , control ] ) => control?.global?.default )
					.map( ( [ key, control ] ) => [ key, control.global.default ] )
			);
		}

		settingsWithoutDefaults.__globals__ = {
			...widgetGlobalDefaults,
			...settingsWithoutDefaults.__globals__,
		};

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
	 * @param newDefaultSettings
	 * @returns {{}}
	 */
	getAllElementsForRecreate( type, newDefaultSettings ) {
		const elements = {};

		elementor.getPreviewContainer().forEachChildrenRecursive( ( element ) => {
			const currentElementType = element.model.attributes.widgetType || element.model.attributes.elType;

			if ( type !== currentElementType ) {
				return;
			}

			const plainObjectElement = element.model.toJSON( { remove: [ 'default' ] } );

			// Globals has special case
			// The globals do not removed by default when using '{remove: [ 'default' ]}' in 'toJSON' method.
			if ( newDefaultSettings.__globals__ && plainObjectElement.settings.__globals__ ) {
				const newDefaultSettingsKeys = Object.keys( newDefaultSettings.__globals__ );

				plainObjectElement.settings.__globals__ = Object.fromEntries(
					Object.entries( plainObjectElement.settings.__globals__ ).filter( ( [ key ] ) => {
						return ! newDefaultSettingsKeys.includes( key );
					} )
				);
			}

			elements[ element.id ] = plainObjectElement;
		} );

		return elements;
	}

	/**
	 * Update widget cache to the new global defaults.
	 *
	 * @param type
	 * @param settings
	 */
	assignGlobalsDefaultsToWidgetCache( type, settings ) {
		if ( ! elementor.widgetsCache[ type ] ) {
			return;
		}

		Object.entries( settings ).forEach( ( [ key, value ] ) => {
			if ( ! elementor.widgetsCache[ type ].controls[ key ] ) {
				return;
			}

			elementor.widgetsCache[ type ].controls[ key ].global.default = value;
		} );
	}
}

export default Create;

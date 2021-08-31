import pipe from 'elementor-utils/pipe';

export default class Base extends $e.modules.CommandBase {
	/**
	 * When finish to create or reset the default values this code will recreate the elements
	 * on the document
	 *
	 * @param {string} type
	 * @param {Object} newSettings
	 * @returns {Promise<void>}
	 */
	async recreateElements( type, newSettings = {} ) {
		// Get all the elements that should recreate (e.g: type = 'heading' it will recreate all the heading)
		const elementsToRecreate = this.getElementsForRecreate( type, newSettings );

		// Fetch new widget config
		await this.refreshWidgetsConfig( type );

		// Will recreate all the elements with the same type to apply the default values.
		await $e.commandsInternal.run( 'document/elements/recreate', { models: elementsToRecreate } );
	}

	/**
	 * Get all the elements that should recreate after the creating the new default.
	 *
	 * @param {string} type
	 * @param {Object} newDefaultSettings
	 * @returns {{}}
	 */
	getElementsForRecreate( type, newDefaultSettings ) {
		const elements = {};

		elementor.getPreviewContainer().children.forEachRecursive( ( element ) => {
			if ( type !== element.settings.get( 'widgetType' ) ) {
				return;
			}

			// The element settings run throw the "pipe" and the methods of the handles append their settings (global values and local values)
			const pipeFunc = pipe(
				...this.component.handlers.map( ( handler ) => handler.appendSettingsForRecreate )
			);

			elements[ element.id ] = pipeFunc(
				element.model.toJSON( { remove: [ 'default' ] } ),
				newDefaultSettings
			);
		} );

		return elements;
	}

	/**
	 * Get the new type from widget config and update the widget cache.
	 *
	 * @param {string} type
	 * @returns {Promise<void>}
	 */
	async refreshWidgetsConfig( type ) {
		const { data: widgetData } = await $e.data.get( 'widgets-config/index', { id: type }, { refresh: true } );

		elementor.addWidgetsCache( { [ type ]: widgetData } );

		// TODO: Maybe in the command?
		elementor.kitManager.renderGlobalsDefaultCSS();
	}

	showLoader() {
		jQuery( '#elementor-preview-loading' ).show();
	}

	hideLoader() {
		jQuery( '#elementor-preview-loading' ).fadeOut( 600 );
	}
}

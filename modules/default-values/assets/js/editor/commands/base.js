import { pipe } from '../utils';

export default class Base extends $e.modules.CommandBase {
	/**
	 * When finish to create or reset the default values this code will recreate the elements
	 * on the document
	 *
	 * @param type
	 * @param newSettings
	 * @returns {Promise<void>}
	 */
	async recreateElements( type, newSettings = {} ) {
		// Get all the elements that should recreate (e.g: type = 'heading' it will recreate all the heading)
		const elementsToRecreate = this.getAllElementsForRecreate( type, newSettings );

		// Fetch new widget config
		await this.refreshWidgetsConfig( type );

		// Will recreate all the elements with the same type to apply the default values.
		$e.commandsInternal.run( 'document/elements/recreate', { models: elementsToRecreate } );
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
			if ( type !== element.settings.get( 'widgetType' ) ) {
				return;
			}

			elements[ element.id ] = pipe(
				...this.component.handlers.map( ( handler ) => handler.appendSettingsForRecreate )
			)( element.model.toJSON( { remove: [ 'default' ] } ), newDefaultSettings );
		} );

		return elements;
	}

	/**
	 * Get the new type from widget config and update the widget cache.
	 *
	 * @param type
	 * @returns {Promise<void>}
	 */
	async refreshWidgetsConfig( type ) {
		const { data: widgetData } = await $e.data.get( 'widgets-config/index', { id: type }, { refresh: true } );

		elementor.addWidgetsCache( { [ type ]: widgetData } );

		// TODO: Maybe in the command?
		elementor.kitManager.renderGlobalsDefaultCSS();
	}
}

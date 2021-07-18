import { pipe } from '../utils';

export class Create extends $e.modules.CommandBase {
	validateArgs( args ) {
		this.requireArgument( 'elementId', args );
	}

	async apply( { elementId } ) {
		const container = elementor.getContainer( elementId );

		if ( container.settings.get( 'elType' ) !== 'widget' ) {
			throw new Error( 'Default values currently support only widgets.' );
		}

		// e.g: heading, button, image.
		const type = container.settings.get( 'widgetType' );

		// Get all the "styled" settings that differently from the hardcoded defaults.
		const settings = this.getSettingsForSave( container );

		// Get all the elements that should recreate (e.g: type = 'heading' it will recreate all the heading)
		const elementsToRecreate = this.getAllElementsForRecreate( type, settings );

		// Save those settings into default entity.
		await $e.data.create( 'default-values/index', { settings }, { type } );

		// Fetch new widget config
		await this.refreshWidgetsConfig( type );

		// Will recreate all the elements with the same type to apply the default values.
		$e.commandsInternal.run( 'document/elements/recreate', { models: elementsToRecreate } );
	}

	/**
	 * Get all the settings that should be save.
	 *
	 * @param container
	 * @returns {{}}
	 */
	getSettingsForSave( container ) {
		return pipe(
			...this.component.handlers.map( ( handler ) => handler.appendSettingsForSave )
		)( {}, container );
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

export default Create;

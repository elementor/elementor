export class Link extends $e.modules.CommandBase {
	validateArgs( args ) {
		this.requireArgument( 'presetId', args );
		this.requireArgument( 'elementId', args );
	}

	async apply( args ) {
		const container = elementor.getContainer( args.elementId );

		// const currentDefaults = await this.getDefaults( container );
		// const currentSettings = container.settings;

		// Update the element preset
		container.model.set( 'presetId', args.presetId );

		const { data } = await $e.data.get( 'presets', { id: args.presetId } );

		const settingsToUpdate = Object.fromEntries(
			Object.entries( data.data.settings )
				.filter( ( [ settingKey ] ) => currentDefaults[ settingKey ] === currentSettings[ settingKey ] )
		);

		$e.run( 'document/elements/settings', { container, settings: settingsToUpdate } );
	}

	/**
	 * @param container
	 * @returns {Promise<*>}
	 */
	async getDefaults( container ) {
		const presetId = container.model.get( 'presetId' );

		if ( ! presetId ) {
			return container.settings.defaults;
		}

		// TODO: Think about it.
		const { data } = await $e.data.get( 'presets', { id: presetId } );

		return data.data.settings;
	}
}

import loadDefaultValues from '../load-default-values';

export default class Create extends $e.modules.CommandBase {
	validateArgs( args = {} ) {
		this.requireContainer();
	}

	async apply( { container } ) {
		$e.internal( 'panel/state-loading' );

		const type = container.model.get( 'widgetType' ) || container.model.get( 'elType' );

		const settings = {
			...this.extractLocalSettings( container ),
			...this.extractSpecialSettings( '__globals__', container ),
			...this.extractSpecialSettings( '__dynamic__', container ),
		};

		try {
			await $e.data.create( 'kit-elements-defaults/index', { settings }, { type } );

			// Refresh Cache.
			// Cannot use {refresh: true} in `get()` because in the hooks there must be a way to get the data
			// in sychronous way, and when using `refresh: true`, the data will not be available in syncronous way.
			loadDefaultValues();

			elementor.notifications.showToast( {
				message: __( 'Default values saved successfully. Please make sure to avoid saving sensetive data like passwords and api keys.', 'elementor' ),
			} );
		} catch ( error ) {
			elementor.notifications.showToast( {
				message: __( 'An error occurred.', 'elementor' ),
			} );

			throw error;
		} finally {
			$e.internal( 'panel/state-ready' );
		}
	}

	extractLocalSettings( container ) {
		const controls = container.settings.controls,
			settingsWithoutDefaults = container.settings.toJSON( { remove: [ 'default' ] } );

		const entries = Object.entries( settingsWithoutDefaults )
			// Remove controls that are not exist.
			.filter( ( [ settingName ] ) => !! controls[ settingName ] );

		return Object.fromEntries( entries );
	}

	extractSpecialSettings( type, container ) {
		const controls = container.settings.controls,
			localSettings = container.settings.toJSON( { remove: [ 'default' ] } ),
			specialSettings = localSettings?.[ type ] || {};

		const entries = Object.entries( specialSettings )
			// Remove controls that have local value.
			.filter( ( [ settingsName ] ) => ! Object.hasOwn( localSettings, settingsName ) )
			// Remove controls that are not exist.
			.filter( ( [ settingName ] ) => !! controls[ settingName ] );

		return {
			[ type ]: Object.fromEntries( entries ),
		};
	}
}

import store from '../store';

export default class Create extends $e.modules.CommandBase {
	validateArgs() {
		this.requireContainer();
	}

	async apply( { container } ) {
		$e.internal( 'panel/state-loading' );

		const elementType = container.model.get( 'widgetType' ) || container.model.get( 'elType' );

		const settings = this.extractLocalSettings( container );

		[ '__dynamic__', '__globals__' ].forEach( ( type ) => {
			const specialSettings = this.extractSpecialSettings( type, container );

			if ( ! Object.keys( specialSettings ).length ) {
				return;
			}

			settings[ type ] = specialSettings;
		} );

		try {
			await store.upsert( elementType, settings );

			elementor.notifications.showToast( {
				message: __( 'Default values saved successfully. Please avoid saving sensetive data like passwords and api keys.', 'elementor' ),
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

		return Object.fromEntries( entries );
	}
}

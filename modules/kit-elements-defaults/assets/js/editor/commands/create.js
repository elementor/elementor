import store from '../store';
import { isPopulatedObject } from '../utils';

export default class Create extends $e.modules.editor.CommandContainerBase {
	validateArgs() {
		this.requireContainer();
	}

	async apply( { container } ) {
		$e.internal( 'panel/state-loading' );

		const elementType = container.model.get( 'widgetType' ) || container.model.get( 'elType' );

		const settings = this.extractLocalSettings( container );

		[ '__dynamic__', '__globals__' ].forEach( ( type ) => {
			const specialSettings = this.extractSpecialSettings( type, container );

			if ( ! isPopulatedObject( specialSettings ) ) {
				return;
			}

			settings[ type ] = specialSettings;
		} );

		try {
			await updateElementDefaults( type, settings );

			elementor.notifications.showToast( {
				message: __( 'Default settings changed.', 'elementor' ),
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
		const { settings } = container,
			settingsWithoutDefaults = settings.toJSON( { remove: [ 'default' ] } );

		const entries = Object.entries( settingsWithoutDefaults )
			// Remove controls that are not exist.
			.filter( ( [ settingName ] ) => !! settings.controls[ settingName ] );

		return Object.fromEntries( entries );
	}

	extractSpecialSettings( type, container ) {
		const { settings } = container,
			localSettings = settings.toJSON( { remove: [ 'default' ] } ),
			specialSettings = localSettings?.[ type ] || {};

		const entries = Object.entries( specialSettings )
			// Remove controls that have local value.
			.filter( ( [ settingsName ] ) => ! Object.prototype.hasOwnProperty.call( localSettings, settingsName ) )
			// Remove controls that are not exist.
			.filter( ( [ settingName ] ) => !! settings.controls[ settingName ] );

		return Object.fromEntries( entries );
	}
}

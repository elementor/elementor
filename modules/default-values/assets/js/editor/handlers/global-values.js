import BaseHandler from './base-handler';

export default class GlobalValues extends BaseHandler {
	appendSettingsForSave( settings, container ) {
		const type = container.model.attributes.widgetType;

		const widgetControls = elementor.widgetsCache[ type ].controls;

		const globalSettings = Object.fromEntries(
			Object.entries( container.settings.attributes?.__globals__ || {} )
				.filter( ( [ , value ] ) => value )
		);

		// Remove all the settings that has a global values assigned.
		for ( const key in globalSettings ) {
			if ( settings.hasOwnProperty( key ) ) {
				delete settings[ key ];
			}
		}

		const settingsKeys = Object.keys( settings );

		// When global is assign to control and it is the default value for the control
		// the values inside the control is empty, so it should also get all the default globals
		// and add them to the settings.
		const widgetGlobalDefaults = Object.fromEntries(
			Object.entries( widgetControls )
				.filter( ( [ , control ] ) => control.global?.default )
				.filter( ( [ key ] ) => ! settingsKeys.includes( key ) ) // Removes all the values that override by local values
				.map( ( [ key, control ] ) => [ key, control.global.default ] )
		);

		if (
			! Object.keys( widgetGlobalDefaults ).length &&
			! Object.keys( globalSettings ).length
		) {
			return settings;
		}

		return {
			...settings,
			__globals__: {
				...widgetGlobalDefaults,
				...globalSettings,
			},
		};
	}

	appendSettingsForRecreate( element, newDefaultSettings ) {
		if ( ! newDefaultSettings.__globals__ || ! element.settings.__globals__ ) {
			return element;
		}

		const newDefaultSettingsKeys = Object.keys( newDefaultSettings.__globals__ );

		// Remove all the global default values from the settings.
		// (default globals should be empty and not directly assign to the control setting)
		element.settings.__globals__ = Object.fromEntries(
			Object.entries( element.settings.__globals__ )
				.filter( ( [ key ] ) => ! newDefaultSettingsKeys.includes( key )
			)
		);

		return element;
	}
}

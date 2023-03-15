import { isPopulatedObject } from './utils';

const SPECIAL_SETTINGS = [ '__dynamic__', '__globals__' ];

export default function extractContainerSettings( container ) {
	const { settings: settingsModel } = container,
		controls = settingsModel.controls,
		settings = settingsModel.toJSON( { remove: [ 'default' ] } );

	const localSettings = extractSettings( settings, controls );

	return {
		...localSettings,
		...extractSpecialSettings( settings, controls, localSettings ),
	};
}

function extractSettings( settings, controls, existingSettings = {} ) {
	const entries = Object.entries( settings )
		.filter( ( [ settingName ] ) =>
			!! controls[ settingName ] &&
			! Object.prototype.hasOwnProperty.call( existingSettings, settingName ),
		);

	return Object.fromEntries( entries );
}

function extractSpecialSettings( settings, controls, localSettings ) {
	return SPECIAL_SETTINGS.reduce( ( acc, type ) => {
		const specialSettings = extractSettings(
			settings?.[ type ] || {},
			controls,
			localSettings,
		);

		if ( ! isPopulatedObject( specialSettings ) ) {
			return acc;
		}

		return {
			...acc,
			[ type ]: specialSettings,
		};
	}, {} );
}

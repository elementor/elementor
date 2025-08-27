import { formatToTitleCase } from './string';

export function buildKitSettingsSummary( siteSettings ) {
	const exportedSettings = Array.isArray( siteSettings )
		? siteSettings
		// eslint-disable-next-line no-unused-vars
		: Object.entries( siteSettings )?.filter( ( [ _, isSelected ] ) => isSelected ).map( ( [ settingKey ] ) => settingKey );

	const formattedSettings = exportedSettings.map( ( setting ) => formatToTitleCase( setting ) );

	return formattedSettings.length > 0 ? formattedSettings.join( ' | ' ) : '';
}

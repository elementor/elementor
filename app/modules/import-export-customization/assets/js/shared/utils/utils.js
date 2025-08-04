import { camelToDash } from './string';
export function buildKitSettingsSummary( siteSettings ) {
	const exportedSettings = Array.isArray( siteSettings )
		? siteSettings
		// eslint-disable-next-line no-unused-vars
		: Object.entries( siteSettings )?.filter( ( [ _, isSelected ] ) => isSelected ).map( ( [ settingKey ] ) => settingKey );

	const summaryTitles = elementorAppConfig[ 'import-export-customization' ]?.summaryTitles?.[ 'site-settings' ] || {};

	const summaryParts = exportedSettings
		.map( ( settingKey ) => summaryTitles[ camelToDash( settingKey ) ] )
		.filter( ( val ) => val );

	return summaryParts.length > 0 ? summaryParts.join( ' | ' ) : '';
}

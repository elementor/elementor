import { __ } from '@wordpress/i18n';
import { formatToTitleCase } from './string';

export function buildKitSettingsSummary( siteSettings ) {
	const exportedSettings = Array.isArray( siteSettings )
		? siteSettings
		: Object.entries( siteSettings )
			.filter( ( [ settingKey, isSelected ] ) => ! settingKey.endsWith( 'Count' ) && isSelected )
			.map( ( [ settingKey ] ) => settingKey );

	const formattedSettings = exportedSettings.map( ( setting ) => {
		if ( 'defaultStyles' === setting ) {
			return __( 'Default Styles', 'elementor' );
		}

		return formatToTitleCase( setting );
	} );

	return formattedSettings.length > 0 ? formattedSettings.join( ' | ' ) : '';
}

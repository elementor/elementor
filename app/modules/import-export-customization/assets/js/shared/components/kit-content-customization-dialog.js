import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import { KitCustomizationDialog } from './kit-customization-dialog';
import { ListSettingSection } from './customization-list-setting-section';
import { SettingSection } from './customization-setting-section';
import { AppsEventTracking } from 'elementor-app/event-track/apps-event-tracking';
import { useKitCustomizationCustomPostTypes } from '../hooks/use-kit-customization-custom-post-types';
import { UpgradeVersionBanner } from './upgrade-version-banner';
import { transformValueForAnalytics } from '../utils/analytics-transformer';

const transformAnalyticsData = ( payload, customPostTypes ) => {
	const optionsArray = [
		{ key: 'customPostTypes', options: customPostTypes },
	];

	const transformed = {};

	for ( const [ key, value ] of Object.entries( payload ) ) {
		transformed[ key ] = transformValueForAnalytics( key, value, optionsArray );
	}

	return transformed;
};

const MEDIA_FORMAT_OPTIONS = {
	LINK: 'link',
	CLOUD: 'cloud',
};

const MEDIA_FORMAT_CONFIG = [
	{
		value: MEDIA_FORMAT_OPTIONS.LINK,
		title: __( 'Link to media', 'elementor' ),
		description: __( 'Stores only the URLs. The export stays light, but files load only while the original site is online.', 'elementor' ),
	},
	{
		value: MEDIA_FORMAT_OPTIONS.CLOUD,
		title: __( 'Save media to the cloud', 'elementor' ),
		description: __( 'All images and files are stored with the template. Keeps everything intact, but the file is larger.', 'elementor' ),
	},
];

export function KitContentCustomizationDialog( {
	open,
	handleClose,
	handleSaveChanges,
	data,
	isImport,
	isOldElementorVersion,
} ) {
	const { customPostTypes } = useKitCustomizationCustomPostTypes( { data } );

	const unselectedValues = useRef( data.analytics?.customization?.content || [] );
	const alertRef = useRef( null );
	const mediaFormatSectionRef = useRef( null );

	const [ settings, setSettings ] = useState( () => {
		if ( data.customization.content ) {
			return data.customization.content;
		}

		return {
			customPostTypes: [],
		};
	} );

	useEffect( () => {
		if ( customPostTypes ) {
			setSettings( ( prevSettings ) => ( {
				...prevSettings,
				customPostTypes: data.customization.content?.customPostTypes || customPostTypes.map( ( { value } ) => value ),
			} ) );
		}
	}, [ customPostTypes, data.customization.content?.customPostTypes ] );

	useEffect( () => {
		if ( open ) {
			setSettings( ( prevState ) => {
				if ( ! data.includes.includes( 'content' ) ) {
					return {
						customPostTypes: [],
					};
				}

				return prevState;
			} );
		}
	}, [ open, data, setSettings ] );

	useEffect( () => {
		if ( open ) {
			AppsEventTracking.sendPageViewsWebsiteTemplates( elementorCommon.eventsManager.config.secondaryLocations.kitLibrary.kitExportCustomizationEdit );
		}
	}, [ open ] );

	const handleSettingsChange = ( settingKey, payload ) => {
		setSettings( ( prev ) => ( {
			...prev,
			[ settingKey ]: payload,
		} ) );
	};

	return (
		<KitCustomizationDialog
			open={ open }
			title={ __( 'Edit content', 'elementor' ) }
			handleClose={ handleClose }
			handleSaveChanges={ () => {
				const transformedAnalytics = transformAnalyticsData( settings, customPostTypes );
				handleSaveChanges( 'content', settings, true, transformedAnalytics );
			} }
		>
			<Stack gap={ 2 }>
				{ isOldElementorVersion && (
					<UpgradeVersionBanner />
				) }
				{ isImport && ! customPostTypes?.length ? (
					<SettingSection
						title={ __( 'Custom post types', 'elementor' ) }
						settingKey="customPostTypes"
						notExported
					/>
				) : (
					<ListSettingSection
						settingKey="customPostTypes"
						title={ __( 'Custom post types', 'elementor' ) }
						onSettingChange={ ( selectedCustomPostTypes ) => {
							handleSettingsChange( 'customPostTypes', selectedCustomPostTypes );
						} }
						settings={ settings.customPostTypes }
						items={ customPostTypes }
					/>
				) }
			</Stack>
		</KitCustomizationDialog>
	);
}

KitContentCustomizationDialog.propTypes = {
	open: PropTypes.bool.isRequired,
	isImport: PropTypes.bool,
	isOldElementorVersion: PropTypes.bool,
	handleClose: PropTypes.func.isRequired,
	handleSaveChanges: PropTypes.func.isRequired,
	data: PropTypes.object.isRequired,
};

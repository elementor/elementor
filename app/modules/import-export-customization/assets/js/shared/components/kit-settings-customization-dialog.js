import { Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { SettingSection } from './customization-setting-section';
import { KitCustomizationDialog } from './kit-customization-dialog';
import { AppsEventTracking } from 'elementor-app/event-track/apps-event-tracking';
import useContextDetection from '../hooks/use-context-detection';

function getInitialState( contextData, isImport ) {
	const data = contextData.data;
	let initialState = data.includes.includes( 'settings' );

	if ( isImport && ! contextData?.isOldExport && ! data?.uploadedData?.manifest?.[ 'site-settings' ]?.theme ) {
		initialState = false;
	}

	return initialState;
}

export function KitSettingsCustomizationDialog( { open, handleClose, handleSaveChanges, data } ) {
	const { isImport, contextData } = useContextDetection();

	const initialState = getInitialState( contextData, isImport );
	const unselectedValues = useRef( data.analytics?.customization?.settings || [] );

	const [ settings, setSettings ] = useState( () => {
		if ( data.customization.settings ) {
			return {
				...data.customization.settings,
				hasOtherEnabledParts: true,
			};
		}

		return {
			theme: initialState,
			hasOtherEnabledParts: true,
		};
	} );

	useEffect( () => {
		if ( open ) {
			if ( data.customization.settings ) {
				setSettings( {
					...data.customization.settings,
					hasOtherEnabledParts: true,
				} );
			} else {
				setSettings( {
					theme: initialState,
					hasOtherEnabledParts: true,
				} );
			}
		}
	}, [ open, data.customization.settings, data?.uploadedData, initialState ] );

	useEffect( () => {
		AppsEventTracking.sendPageViewsWebsiteTemplates( elementorCommon.eventsManager.config.secondaryLocations.kitLibrary.kitExportCustomizationEdit );
	}, [] );

	const handleToggleChange = ( settingKey, isChecked ) => {
		unselectedValues.current = isChecked
			? unselectedValues.current.filter( ( val ) => settingKey !== val )
			: [ ...unselectedValues.current, settingKey ];

		setSettings( ( prev ) => ( {
			...prev,
			[ settingKey ]: ! prev[ settingKey ],
		} ) );
	};

	return (
		<KitCustomizationDialog
			open={ open }
			title={ __( 'Edit settings & configurations', 'elementor' ) }
			handleClose={ handleClose }
			handleSaveChanges={ () => handleSaveChanges( 'settings', settings, unselectedValues.current ) }
		>
			<Stack>
				<SettingSection
					key="theme"
					checked={ settings.theme }
					title={ __( 'Theme', 'elementor' ) }
					description={ __( 'Only public WordPress themes are supported', 'elementor' ) }
					settingKey="theme"
					onSettingChange={ handleToggleChange }
					disabled={ isImport && ! contextData?.data?.uploadedData?.manifest?.[ 'site-settings' ]?.theme }
				/>
			</Stack>
		</KitCustomizationDialog>
	);
}

KitSettingsCustomizationDialog.propTypes = {
	open: PropTypes.bool.isRequired,
	handleClose: PropTypes.func.isRequired,
	handleSaveChanges: PropTypes.func.isRequired,
	data: PropTypes.object.isRequired,
};

import { Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { SettingSection } from './customization-setting-section';
import { SubSetting } from './customization-sub-setting';
import { KitCustomizationDialog } from './kit-customization-dialog';
import { AppsEventTracking } from 'elementor-app/event-track/apps-event-tracking';

export function KitSettingsCustomizationDialog( { open, handleClose, handleSaveChanges, data } ) {
	const isImport = data.hasOwnProperty( 'uploadedData' );

	const siteSettingsRegistry = elementorModules?.importExport?.siteSettingsRegistry;
	const siteSettingsSections = siteSettingsRegistry?.getAll() || [];

	const initialState = data.includes.includes( 'settings' );
	const unselectedValues = useRef( data.analytics?.customization?.settings || [] );

	const [ settings, setSettings ] = useState( () => {
		if ( data.customization.settings ) {
			return data.customization.settings;
		}

		return siteSettingsRegistry.getState( data, initialState );
	} );

	useEffect( () => {
		if ( open ) {
			if ( data.customization.settings ) {
				setSettings( data.customization.settings );
			} else {
				const state = siteSettingsRegistry.getState( data, initialState );

				setSettings( state );
			}
		}
	}, [ open, data.customization.settings, siteSettingsRegistry, data?.uploadedData, initialState ] );

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
				{ siteSettingsSections.map( ( siteSettingsSection ) => {
					if ( siteSettingsSection.children ) {
						return (
							<SettingSection
								key={ siteSettingsSection.key }
								title={ siteSettingsSection.title }
								description={ siteSettingsSection.description }
								hasToggle={ false }
							>
								<Stack>
									{ siteSettingsSection.children.map( ( siteSettingsChildSection ) => {
										return (
											<SubSetting
												key={ siteSettingsChildSection.key }
												label={ siteSettingsChildSection.title }
												description={ siteSettingsChildSection.description }
												settingKey={ siteSettingsChildSection.key }
												onSettingChange={ handleToggleChange }
												checked={ settings[ siteSettingsChildSection.key ] }
												disabled={ isImport && ! data?.uploadedData?.manifest?.[ 'site-settings' ]?.[ siteSettingsChildSection.key ] }
											/>
										);
									} ) }
								</Stack>
							</SettingSection>
						);
					}

					return (
						<SettingSection
							key={ siteSettingsSection.key }
							checked={ settings[ siteSettingsSection.key ] }
							title={ siteSettingsSection.title }
							description={ siteSettingsSection.description }
							settingKey={ siteSettingsSection.key }
							onSettingChange={ handleToggleChange }
							disabled={ isImport && ! data?.uploadedData?.manifest?.[ 'site-settings' ]?.[ siteSettingsSection.key ] }
						/>
					);
				} ) }
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

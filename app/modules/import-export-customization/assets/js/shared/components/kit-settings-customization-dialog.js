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

	const initialState = data.includes.includes( 'settings' );
	const unselectedValues = useRef( data.analytics?.customization?.settings || [] );

	const [ settings, setSettings ] = useState( () => {
		if ( data.customization.settings ) {
			return data.customization.settings;
		}

		if ( isImport ) {
			const {
				theme,
				globalColors,
				globalFonts,
				themeStyleSettings,
				generalSettings,
				experiments,
			} = data?.uploadedData?.manifest?.[ 'site-settings' ] || {};

			return {
				theme,
				globalColors,
				globalFonts,
				themeStyleSettings,
				generalSettings,
				experiments,
			};
		}

		return {
			theme: initialState,
			globalColors: initialState,
			globalFonts: initialState,
			themeStyleSettings: initialState,
			generalSettings: initialState,
			experiments: initialState,
		};
	} );

	useEffect( () => {
		if ( open ) {
			if ( data.customization.settings ) {
				setSettings( data.customization.settings );
			} else {
				const {
					theme,
					globalColors,
					globalFonts,
					themeStyleSettings,
					generalSettings,
					experiments,
				} = data?.uploadedData?.manifest?.[ 'site-settings' ] || {};

				const state = isImport
					? {
						theme,
						globalColors,
						globalFonts,
						themeStyleSettings,
						generalSettings,
						experiments,
					}
					: {
						theme: initialState,
						globalColors: initialState,
						globalFonts: initialState,
						themeStyleSettings: initialState,
						generalSettings: initialState,
						experiments: initialState,
					};

				setSettings( state );
			}
		}
	}, [ open, data.customization.settings, initialState, isImport, data?.uploadedData ] );

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
					checked={ settings.theme }
					title={ __( 'Theme', 'elementor' ) }
					description={ __( 'Only public WordPress themes are supported', 'elementor' ) }
					settingKey="theme"
					onSettingChange={ handleToggleChange }
					disabled={ isImport && ! data?.uploadedData?.manifest?.[ 'site-settings' ]?.theme }
				/>

				<SettingSection
					title={ __( 'Site settings', 'elementor' ) }
					hasToggle={ false }
				>
					<Stack>
						<SubSetting
							label={ __( 'Global colors', 'elementor' ) }
							settingKey="globalColors"
							onSettingChange={ handleToggleChange }
							checked={ settings.globalColors }
							disabled={ isImport && ! data?.uploadedData?.manifest?.[ 'site-settings' ]?.globalColors }
						/>
						<SubSetting
							label={ __( 'Global fonts', 'elementor' ) }
							settingKey="globalFonts"
							onSettingChange={ handleToggleChange }
							checked={ settings.globalFonts }
							disabled={ isImport && ! data?.uploadedData?.manifest?.[ 'site-settings' ]?.globalFonts }
						/>
						<SubSetting
							label={ __( 'Theme style settings', 'elementor' ) }
							settingKey="themeStyleSettings"
							onSettingChange={ handleToggleChange }
							checked={ settings.themeStyleSettings }
							disabled={ isImport && ! data?.uploadedData?.manifest?.[ 'site-settings' ]?.themeStyleSettings }
						/>
					</Stack>
				</SettingSection>

				<SettingSection
					title={ __( 'Settings', 'elementor' ) }
					description={ __( 'Include site identity, background, layout, Lightbox, page transitions, and custom CSS', 'elementor' ) }
					settingKey="generalSettings"
					onSettingChange={ handleToggleChange }
					checked={ settings.generalSettings }
					disabled={ isImport && ! data?.uploadedData?.manifest?.[ 'site-settings' ]?.generalSettings }
				/>

				<SettingSection
					title={ __( 'Experiments', 'elementor' ) }
					description={ __( 'This will apply all experiments that are still active during import', 'elementor' ) }
					settingKey="experiments"
					onSettingChange={ handleToggleChange }
					checked={ settings.experiments }
					disabled={ isImport && ! data?.uploadedData?.manifest?.[ 'site-settings' ]?.experiments }
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

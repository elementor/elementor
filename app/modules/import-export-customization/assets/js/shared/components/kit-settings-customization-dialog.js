import { Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { SettingSection } from './customization-setting-section';
import { SubSetting } from './customization-sub-setting';
import { KitCustomizationDialog } from './kit-customization-dialog';

export function KitSettingsCustomizationDialog( { open, handleClose, handleSaveChanges, data } ) {
	const initialState = data.includes.includes( 'settings' );

	const [ settings, setSettings ] = useState( () => {
		if ( data.customization.settings ) {
			return data.customization.settings;
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
				setSettings( {
					theme: initialState,
					globalColors: initialState,
					globalFonts: initialState,
					themeStyleSettings: initialState,
					generalSettings: initialState,
					experiments: initialState,
				} );
			}
		}
	}, [ open, data.customization.settings, initialState ] );

	const handleToggleChange = ( settingKey ) => {
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
			handleSaveChanges={ () => handleSaveChanges( 'settings', settings ) }
		>
			<Stack>
				<SettingSection
					checked={ settings.theme }
					title={ __( 'Theme', 'elementor' ) }
					description={ __( 'Only public WordPress themes are supported', 'elementor' ) }
					settingKey="theme"
					onSettingChange={ handleToggleChange }
				/>

				<SettingSection
					title={ __( 'Site settings', 'elementor' ) }
					hasToggle={ false }
					onSettingChange={ handleToggleChange }
				>
					<Stack>
						<SubSetting
							label={ __( 'Global colors', 'elementor' ) }
							settingKey="globalColors"
							onSettingChange={ handleToggleChange }
							checked={ settings.globalColors }
						/>
						<SubSetting
							label={ __( 'Global fonts', 'elementor' ) }
							settingKey="globalFonts"
							onSettingChange={ handleToggleChange }
							checked={ settings.globalFonts }
						/>
						<SubSetting
							label={ __( 'Theme style settings', 'elementor' ) }
							settingKey="themeStyleSettings"
							onSettingChange={ handleToggleChange }
							checked={ settings.themeStyleSettings }
						/>
					</Stack>
				</SettingSection>

				<SettingSection
					title={ __( 'Settings', 'elementor' ) }
					description={ __( 'Include site identity, background, layout, Lightbox, page transitions, and custom CSS', 'elementor' ) }
					settingKey="generalSettings"
					onSettingChange={ handleToggleChange }
					checked={ settings.generalSettings }
				/>

				<SettingSection
					title={ __( 'Experiments', 'elementor' ) }
					description={ __( 'This will apply all experiments that are still active during import', 'elementor' ) }
					settingKey="experiments"
					onSettingChange={ handleToggleChange }
					checked={ settings.experiments }
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

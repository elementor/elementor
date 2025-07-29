import { Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { SettingSection } from './customization-setting-section';
import { KitCustomizationDialog } from './kit-customization-dialog';
import { AppsEventTracking } from 'elementor-app/event-track/apps-event-tracking';

export function KitTemplatesCustomizationDialog( { open, handleClose, handleSaveChanges, data } ) {
	const initialState = data.includes.includes( 'templates' );
	const unselectedValues = useRef( data.analytics?.customization?.templates || [] );

	const [ templates, setTemplates ] = useState( () => {
		if ( data.customization.templates ) {
			return data.customization.templates;
		}

		return {
			siteTemplates: initialState,
		};
	} );

	useEffect( () => {
		if ( open ) {
			if ( data.customization.templates ) {
				setTemplates( data.customization.templates );
			} else {
				setTemplates( {
					siteTemplates: initialState,
				} );
			}
		}
	}, [ open, data.customization.templates, initialState ] );

	useEffect( () => {
		AppsEventTracking.sendPageViewsWebsiteTemplates( elementorCommon.eventsManager.config.secondaryLocations.kitLibrary.kitExportCustomizationEdit );
	}, [] );

	const handleToggleChange = ( settingKey, isChecked ) => {
		unselectedValues.current = isChecked
			? unselectedValues.current.filter( ( val ) => settingKey !== val )
			: [ ...unselectedValues.current, settingKey ];

		setTemplates( ( prev ) => ( {
			...prev,
			[ settingKey ]: ! prev[ settingKey ],
		} ) );
	};

	return (
		<KitCustomizationDialog
			open={ open }
			title={ __( 'Edit templates', 'elementor' ) }
			handleClose={ handleClose }
			handleSaveChanges={ () => handleSaveChanges( 'templates', templates, unselectedValues.current ) }
			minHeight="auto"
		>
			<Stack>
				<SettingSection
					checked={ templates.siteTemplates }
					title={ __( 'Site templates', 'elementor' ) }
					settingKey="siteTemplates"
					onSettingChange={ handleToggleChange }
				/>
			</Stack>
		</KitCustomizationDialog>
	);
}

KitTemplatesCustomizationDialog.propTypes = {
	open: PropTypes.bool.isRequired,
	handleClose: PropTypes.func.isRequired,
	handleSaveChanges: PropTypes.func.isRequired,
	data: PropTypes.object.isRequired,
};

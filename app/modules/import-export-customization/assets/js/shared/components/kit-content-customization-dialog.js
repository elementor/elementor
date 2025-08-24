import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import { KitCustomizationDialog } from './kit-customization-dialog';
import { ListSettingSection } from './customization-list-setting-section';
import { AppsEventTracking } from 'elementor-app/event-track/apps-event-tracking';
import { useKitCustomizationCustomPostTypes } from '../hooks/use-kit-customization-custom-post-types';

export function KitContentCustomizationDialog( {
	open,
	handleClose,
	handleSaveChanges,
	data,
} ) {
	const { customPostTypes } = useKitCustomizationCustomPostTypes( { data } );

	const unselectedValues = useRef( data.analytics?.customization?.content || [] );

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
		AppsEventTracking.sendPageViewsWebsiteTemplates( elementorCommon.eventsManager.config.secondaryLocations.kitLibrary.kitExportCustomizationEdit );
	}, [] );

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
			handleSaveChanges={ () => handleSaveChanges( 'content', settings, unselectedValues.current ) }
		>
			<Stack>
				{ customPostTypes.length > 0 && (
					<ListSettingSection
						settingKey="customPostTypes"
						title={ __( 'Custom post types', 'elementor' ) }
						onSettingChange={ ( selectedCustomPostTypes ) => {
							const filteredUnselectedValues = unselectedValues.current.filter( ( value ) => ! customPostTypes.includes( value ) );
							const isAllChecked = selectedCustomPostTypes.length === customPostTypes.length;

							unselectedValues.current = isAllChecked
								? filteredUnselectedValues.filter( ( value ) => value !== 'customPostTypes' )
								: [
									...filteredUnselectedValues,
									...customPostTypes.filter( ( cpt ) => ! selectedCustomPostTypes.includes( cpt ) ).map( ( { value } ) => value ),
									'customPostTypes',
								];
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
	handleClose: PropTypes.func.isRequired,
	handleSaveChanges: PropTypes.func.isRequired,
	data: PropTypes.object.isRequired,
};

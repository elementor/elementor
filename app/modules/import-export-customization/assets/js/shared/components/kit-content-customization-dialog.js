import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Stack, Typography, Alert, SvgIcon } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import { KitCustomizationDialog } from './kit-customization-dialog';
import { ListSettingSection } from './customization-list-setting-section';
import { SettingSection } from './customization-setting-section';
import { AppsEventTracking } from 'elementor-app/event-track/apps-event-tracking';
import { useKitCustomizationCustomPostTypes } from '../hooks/use-kit-customization-custom-post-types';
import { UpgradeVersionBanner } from './upgrade-version-banner';

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

	const renderMediaFormatSection = () => {
		if ( isImport ) {
			return null;
		}

		return (
			<SettingSection
				title={ __( 'Media format', 'elementor' ) }
				settingKey="mediaFormat"
				hasToggle={ false }
			>
				<Alert 
					icon={ 
						<SvgIcon color="info" viewBox="0 0 24 24">
							<path d="M11.8623 14.7549C12.3665 14.8061 12.7598 15.2322 12.7598 15.75C12.7598 16.2678 12.3665 16.6939 11.8623 16.7451L11.7598 16.75H11.75C11.1977 16.75 10.75 16.3023 10.75 15.75C10.75 15.1977 11.1977 14.75 11.75 14.75H11.7598L11.8623 14.7549Z" fill="currentColor"/>
							<path d="M11.75 7C12.1642 7 12.5 7.33579 12.5 7.75V12.75C12.5 13.1642 12.1642 13.5 11.75 13.5C11.3358 13.5 11 13.1642 11 12.75V7.75C11 7.33579 11.3358 7 11.75 7Z" fill="currentColor"/>
							<path fillRule="evenodd" clipRule="evenodd" d="M11.75 2C17.1348 2 21.5 6.36522 21.5 11.75C21.5 17.1348 17.1348 21.5 11.75 21.5C6.36522 21.5 2 17.1348 2 11.75C2 6.36522 6.36522 2 11.75 2ZM11.75 3.5C7.19365 3.5 3.5 7.19365 3.5 11.75C3.5 16.3063 7.19365 20 11.75 20C16.3063 20 20 16.3063 20 11.75C20 7.19365 16.3063 3.5 11.75 3.5Z" fill="currentColor"/>
						</SvgIcon>
					}
					sx={ {
						backgroundColor: 'transparent',
						p: 0
					} }
				>
					<Typography variant="body2" color="text.primary">
						<strong>{ __( 'Note:', 'elementor' ) }</strong> { __( 'The media will be uploaded automatically, just as it was saved during export', 'elementor' ) }
					</Typography>
				</Alert>
			</SettingSection>
		);
	};

	return (
		<KitCustomizationDialog
			open={ open }
			title={ __( 'Edit content', 'elementor' ) }
			handleClose={ handleClose }
			handleSaveChanges={ () => handleSaveChanges( 'content', settings, true, unselectedValues.current ) }
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
				{ renderMediaFormatSection() }
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

import { Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import { useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { SettingSection } from './customization-setting-section';
import { DesignSystemSettingsSection } from './classes-variables-section';
import { KitCustomizationDialog } from './kit-customization-dialog';
import { OverrideConfirmationDialog } from './override-confirmation-dialog';
import { AppsEventTracking } from 'elementor-app/event-track/apps-event-tracking';
import useContextDetection from '../hooks/use-context-detection';
import { useClassesVariablesLimits } from '../hooks/use-classes-variables-limits';
import { UpgradeVersionBanner } from './upgrade-version-banner';
import { transformValueForAnalytics } from '../utils/analytics-transformer';

function isExperimentActive( experimentName ) {
	return !! elementorCommon?.config?.experimentalFeatures?.[ experimentName ];
}

function isClassesFeatureActive() {
	return isExperimentActive( 'e_atomic_elements' );
}

function isVariablesFeatureActive() {
	return isExperimentActive( 'e_atomic_elements' );
}

function isDefaultStylesFeatureActive() {
	return isExperimentActive( 'e_atomic_elements' );
}

const transformAnalyticsData = ( payload ) => {
	const transformed = {};

	for ( const [ key, value ] of Object.entries( payload ) ) {
		transformed[ key ] = transformValueForAnalytics( key, value, [] );
	}

	return transformed;
};

async function fetchManagerUrl( panelId ) {
	const baseUrl = window.wpApiSettings?.root || '/wp-json/';
	const nonce = window.wpApiSettings?.nonce || '';

	const response = await fetch(
		`${ baseUrl }elementor/v1/import-export-customization/manager-url?panel=${ panelId }`,
		{
			headers: {
				'X-WP-Nonce': nonce,
			},
		},
	);

	if ( ! response.ok ) {
		throw new Error( 'Failed to fetch manager URL' );
	}

	const data = await response.json();
	return data.data?.url || data.url;
}

function getInitialState( contextData, isImport ) {
	const data = contextData.data;
	let initialState = data.includes.includes( 'settings' );

	if ( isImport && ! contextData?.isOldExport && ! data?.uploadedData?.manifest?.[ 'site-settings' ]?.theme ) {
		initialState = false;
	}

	return initialState;
}

function isExported( contextData ) {
	if ( contextData?.isOldExport ) {
		return contextData?.data?.uploadedData?.manifest?.theme;
	}

	return contextData?.data?.uploadedData?.manifest?.[ 'site-settings' ]?.theme;
}

function isClassesExported( contextData ) {
	return !! contextData?.data?.uploadedData?.manifest?.[ 'site-settings' ]?.classes;
}

function isVariablesExported( contextData ) {
	return !! contextData?.data?.uploadedData?.manifest?.[ 'site-settings' ]?.variables;
}

function isDefaultStylesExported( contextData ) {
	const siteSettings = contextData?.data?.uploadedData?.manifest?.[ 'site-settings' ];

	if ( undefined === siteSettings?.defaultStyles ) {
		return false;
	}

	return !! siteSettings.defaultStyles;
}

function getDesignSystemSettingsInitialState( contextData, isImport ) {
	const includesSettings = contextData?.data?.includes?.includes( 'settings' );

	return {
		classes: includesSettings && ( ! isImport || isClassesExported( contextData ) ),
		variables: includesSettings && ( ! isImport || isVariablesExported( contextData ) ),
		defaultStyles: includesSettings && ( ! isImport || isDefaultStylesExported( contextData ) ),
		classesOverrideAll: false,
		variablesOverrideAll: false,
	};
}

function getSettingsInitialState( contextData, isImport, showDesignSystemSettingsSection ) {
	return {
		theme: getInitialState( contextData, isImport ),
		...( showDesignSystemSettingsSection ? getDesignSystemSettingsInitialState( contextData, isImport ) : {} ),
	};
}

export function KitSettingsCustomizationDialog( { open, handleClose, handleSaveChanges } ) {
	const { isImport = false, contextData = {} } = useContextDetection() ?? {};
	const { data = null } = contextData;

	const showClassesSection = isClassesFeatureActive();
	const showVariablesSection = isVariablesFeatureActive();
	const showDefaultStylesSection = isDefaultStylesFeatureActive();
	const showDesignSystemSettingsSection = showClassesSection || showVariablesSection || showDefaultStylesSection;

	const settingsInitialState = useMemo(
		() => getSettingsInitialState( contextData, isImport, showDesignSystemSettingsSection ),
		[ contextData?.data?.includes, contextData?.isOldExport, contextData?.data?.uploadedData?.manifest, isImport, showDesignSystemSettingsSection ],
	);

	const {
		existingClassesCount,
		existingVariablesCount,
		classesLimit,
		variablesLimit,
		calculateLimitInfo,
	} = useClassesVariablesLimits( { open, isImport } );

	const importedClassesCount = contextData?.data?.uploadedData?.manifest?.[ 'site-settings' ]?.classesCount ?? 0;
	const importedVariablesCount = contextData?.data?.uploadedData?.manifest?.[ 'site-settings' ]?.variablesCount ?? 0;

	const classesLimitInfo = useMemo(
		() => calculateLimitInfo( existingClassesCount, importedClassesCount, classesLimit ),
		[ existingClassesCount, importedClassesCount, classesLimit, calculateLimitInfo ],
	);

	const variablesLimitInfo = useMemo(
		() => calculateLimitInfo( existingVariablesCount, importedVariablesCount, variablesLimit ),
		[ existingVariablesCount, importedVariablesCount, variablesLimit, calculateLimitInfo ],
	);

	const getInitialSettings = useCallback(
		() => ( {
			...settingsInitialState,
			...( data.customization.settings || {} ),
		} ),
		[ data.customization.settings, settingsInitialState ],
	);

	const [ settings, setSettings ] = useState( () => {
		return getInitialSettings();
	} );

	useEffect( () => {
		if ( open ) {
			setSettings( getInitialSettings() );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ open ] );

	useEffect( () => {
		if ( open ) {
			AppsEventTracking.sendPageViewsWebsiteTemplates( elementorCommon.eventsManager.config.secondaryLocations.kitLibrary.kitExportCustomizationEdit );
		}
	}, [ open ] );

	const handleToggleChange = ( settingKey ) => {
		setSettings( ( prev ) => ( {
			...prev,
			[ settingKey ]: ! prev[ settingKey ],
		} ) );
	};

	const handleClassesVariablesChange = ( settingKey, value ) => {
		setSettings( ( prev ) => ( {
			...prev,
			[ settingKey ]: value,
		} ) );
	};

	const handleReviewClick = useCallback( async ( panelId ) => {
		const transformedAnalytics = transformAnalyticsData( settings );
		handleSaveChanges( 'settings', settings, true, transformedAnalytics );
		handleClose();

		try {
			const url = await fetchManagerUrl( panelId );
			window.open( url, '_blank' );
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.error( `Failed to open ${ panelId }:`, error );
		}
	}, [ settings, handleSaveChanges, handleClose ] );

	const handleClassesReviewClick = useCallback( () => {
		handleReviewClick( 'global-classes-manager' );
	}, [ handleReviewClick ] );

	const handleVariablesReviewClick = useCallback( () => {
		handleReviewClick( 'variables-manager' );
	}, [ handleReviewClick ] );

	const classesNotExported = isImport && ! isClassesExported( contextData );
	const variablesNotExported = isImport && ! isVariablesExported( contextData );
	const defaultStylesNotExported = isImport && ! isDefaultStylesExported( contextData );
	const designSystemSettingsNotExported = classesNotExported && variablesNotExported && defaultStylesNotExported;

	const classesLimitExceeded = isImport && classesLimitInfo.isExceeded;
	const variablesLimitExceeded = isImport && variablesLimitInfo.isExceeded;
	const classesOverLimitCount = classesLimitInfo.overLimitCount;
	const variablesOverLimitCount = variablesLimitInfo.overLimitCount;

	const [ confirmationDialog, setConfirmationDialog ] = useState( {
		open: false,
		type: 'classes',
	} );

	const performSave = useCallback( () => {
		const transformedAnalytics = transformAnalyticsData( settings );
		handleSaveChanges( 'settings', settings, true, transformedAnalytics );
		handleClose();
	}, [ settings, handleSaveChanges, handleClose ] );

	const handleSaveClick = useCallback( () => {
		const classesOverrideEnabled = settings.classesOverrideAll && settings.classes;
		const variablesOverrideEnabled = settings.variablesOverrideAll && settings.variables;

		if ( classesOverrideEnabled && variablesOverrideEnabled ) {
			setConfirmationDialog( { open: true, type: 'both' } );
			return;
		}

		if ( classesOverrideEnabled ) {
			setConfirmationDialog( { open: true, type: 'classes' } );
			return;
		}

		if ( variablesOverrideEnabled ) {
			setConfirmationDialog( { open: true, type: 'variables' } );
			return;
		}

		performSave();
	}, [ settings, performSave ] );

	const handleConfirmationClose = useCallback( () => {
		setConfirmationDialog( { open: false, type: '' } );
	}, [] );

	const handleConfirmationConfirm = useCallback( () => {
		setConfirmationDialog( { open: false, type: '' } );
		performSave();
	}, [ performSave ] );

	return (
		<>
			<KitCustomizationDialog
				open={ open }
				title={ __( 'Edit settings & configurations', 'elementor' ) }
				handleClose={ handleClose }
				handleSaveChanges={ handleSaveClick }
			>
				<Stack gap={ 2 }>
					{ contextData?.isOldElementorVersion && (
						<UpgradeVersionBanner />
					) }
					{ isImport && ! isExported( contextData ) ? (
						<SettingSection
							title={ __( 'Theme', 'elementor' ) }
							settingKey="theme"
							notExported
						/>
					) : (
						<SettingSection
							key="theme"
							checked={ settings.theme }
							title={ __( 'Theme', 'elementor' ) }
							description={ __( 'Only public WordPress themes are supported', 'elementor' ) }
							settingKey="theme"
							onSettingChange={ handleToggleChange }
							disabled={ isImport && ! contextData?.data?.uploadedData?.manifest?.[ 'site-settings' ]?.theme }
						/>
					) }

					{ showDesignSystemSettingsSection && (
						<DesignSystemSettingsSection
							settings={ {
								classes: settings.classes ?? false,
								defaultStyles: settings.defaultStyles ?? false,
								variables: settings.variables ?? false,
								classesOverrideAll: settings.classesOverrideAll ?? false,
								variablesOverrideAll: settings.variablesOverrideAll ?? false,
							} }
							onSettingChange={ handleClassesVariablesChange }
							isImport={ isImport }
							classesExported={ ! classesNotExported && showClassesSection }
							defaultStylesExported={ ! defaultStylesNotExported && showDefaultStylesSection }
							variablesExported={ ! variablesNotExported && showVariablesSection }
							classesLimitExceeded={ classesLimitExceeded }
							variablesLimitExceeded={ variablesLimitExceeded }
							classesOverLimitCount={ classesOverLimitCount }
							variablesOverLimitCount={ variablesOverLimitCount }
							onClassesReviewClick={ handleClassesReviewClick }
							onVariablesReviewClick={ handleVariablesReviewClick }
							notExported={ designSystemSettingsNotExported }
						/>
					) }
				</Stack>
			</KitCustomizationDialog>

			<OverrideConfirmationDialog
				open={ confirmationDialog.open }
				onClose={ handleConfirmationClose }
				onConfirm={ handleConfirmationConfirm }
				type={ confirmationDialog.type }
			/>
		</>
	);
}

KitSettingsCustomizationDialog.propTypes = {
	open: PropTypes.bool.isRequired,
	handleClose: PropTypes.func.isRequired,
	handleSaveChanges: PropTypes.func.isRequired,
};

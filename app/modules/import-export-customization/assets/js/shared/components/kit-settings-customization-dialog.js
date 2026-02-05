import { Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import { useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { SettingSection } from './customization-setting-section';
import { ClassesVariablesSection } from './classes-variables-section';
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
	return isExperimentActive( 'e_classes' ) && isExperimentActive( 'e_atomic_elements' );
}

function isVariablesFeatureActive() {
	return isExperimentActive( 'e_variables' ) && isExperimentActive( 'e_atomic_elements' );
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

function getClassesVariablesInitialState( contextData, isImport ) {
	const includesSettings = contextData?.data?.includes?.includes( 'settings' );

	return {
		classes: includesSettings && ( ! isImport || isClassesExported( contextData ) ),
		variables: includesSettings && ( ! isImport || isVariablesExported( contextData ) ),
		classesOverrideAll: false,
		variablesOverrideAll: false,
	};
}

export function KitSettingsCustomizationDialog( { open, handleClose, handleSaveChanges } ) {
	const { isImport = false, contextData = {} } = useContextDetection() ?? {};
	const { data = null } = contextData;

	const showClassesSection = isClassesFeatureActive();
	const showVariablesSection = isVariablesFeatureActive();
	const showClassesVariablesSection = showClassesSection || showVariablesSection;

	const initialState = useMemo(
		() => getInitialState( contextData, isImport ),
		[ contextData?.data?.includes, contextData?.isOldExport, contextData?.data?.uploadedData?.manifest, isImport ],
	);

	const classesVariablesInitialState = useMemo(
		() => getClassesVariablesInitialState( contextData, isImport ),
		[ contextData?.data?.includes, contextData?.data?.uploadedData?.manifest, isImport ],
	);

	const {
		existingClassesCount,
		existingVariablesCount,
		calculateLimitInfo,
	} = useClassesVariablesLimits( { open, isImport } );

	const importedClassesCount = contextData?.data?.uploadedData?.manifest?.[ 'site-settings' ]?.classesCount ?? 0;
	const importedVariablesCount = contextData?.data?.uploadedData?.manifest?.[ 'site-settings' ]?.variablesCount ?? 0;

	const classesLimitInfo = useMemo(
		() => calculateLimitInfo( existingClassesCount, importedClassesCount, 100 ),
		[ existingClassesCount, importedClassesCount, calculateLimitInfo ],
	);

	const variablesLimitInfo = useMemo(
		() => calculateLimitInfo( existingVariablesCount, importedVariablesCount, 100 ),
		[ existingVariablesCount, importedVariablesCount, calculateLimitInfo ],
	);

	const [ settings, setSettings ] = useState( () => {
		if ( data.customization.settings ) {
			return {
				...data.customization.settings,
			};
		}

		return {
			theme: initialState,
			...( showClassesVariablesSection ? classesVariablesInitialState : {} ),
		};
	} );

	useEffect( () => {
		if ( open ) {
			if ( data.customization.settings ) {
				setSettings( {
					...data.customization.settings,
				} );
			} else {
				setSettings( {
					theme: initialState,
					...( showClassesVariablesSection ? classesVariablesInitialState : {} ),
				} );
			}
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
	const classesVariablesNotExported = classesNotExported && variablesNotExported;

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

					{ showClassesVariablesSection && (
						<ClassesVariablesSection
							settings={ {
								classes: settings.classes ?? false,
								variables: settings.variables ?? false,
								classesOverrideAll: settings.classesOverrideAll ?? false,
								variablesOverrideAll: settings.variablesOverrideAll ?? false,
							} }
							onSettingChange={ handleClassesVariablesChange }
							isImport={ isImport }
							classesExported={ ! classesNotExported && showClassesSection }
							variablesExported={ ! variablesNotExported && showVariablesSection }
							classesLimitExceeded={ classesLimitExceeded }
							variablesLimitExceeded={ variablesLimitExceeded }
							classesOverLimitCount={ classesOverLimitCount }
							variablesOverLimitCount={ variablesOverLimitCount }
							onClassesReviewClick={ handleClassesReviewClick }
							onVariablesReviewClick={ handleVariablesReviewClick }
							notExported={ classesVariablesNotExported }
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

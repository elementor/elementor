import { Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { SettingSection } from './customization-setting-section';
import { ClassesVariablesSection } from './classes-variables-section';
import { KitCustomizationDialog } from './kit-customization-dialog';
import { AppsEventTracking } from 'elementor-app/event-track/apps-event-tracking';
import useContextDetection from '../hooks/use-context-detection';
import { useClassesVariablesLimits } from '../hooks/use-classes-variables-limits';
import { UpgradeVersionBanner } from './upgrade-version-banner';
import { transformValueForAnalytics } from '../utils/analytics-transformer';

/**
 * Check if a specific experiment is active
 *
 * @param {string} experimentName - The name of the experiment to check
 * @return {boolean} Whether the experiment is active
 */
function isExperimentActive( experimentName ) {
	return !! elementorCommon?.config?.experimentalFeatures?.[ experimentName ];
}

/**
 * Check if both e_classes experiment and e_atomic_elements (required dependency) are active
 *
 * @return {boolean} Whether Global Classes feature is available
 */
function isClassesFeatureActive() {
	return isExperimentActive( 'e_classes' ) && isExperimentActive( 'e_atomic_elements' );
}

/**
 * Check if both e_variables experiment and e_atomic_elements (required dependency) are active
 *
 * @return {boolean} Whether Global Variables feature is available
 */
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

/**
 * Get the default state for Classes and Variables settings
 *
 * @param {Object} contextData - The context data from import/export
 * @param {boolean} isImport - Whether this is an import operation
 * @return {Object} Default state for classes and variables
 */
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

	const initialState = getInitialState( contextData, isImport );
	const classesVariablesInitialState = getClassesVariablesInitialState( contextData, isImport );

	const showClassesSection = isClassesFeatureActive();
	const showVariablesSection = isVariablesFeatureActive();
	const showClassesVariablesSection = showClassesSection || showVariablesSection;

	const {
		existingClassesCount,
		existingVariablesCount,
		calculateLimitInfo,
	} = useClassesVariablesLimits( { open, isImport } );

	const importedClassesCount = contextData?.data?.uploadedData?.manifest?.[ 'site-settings' ]?.classesCount ?? 0;
	const importedVariablesCount = contextData?.data?.uploadedData?.manifest?.[ 'site-settings' ]?.variablesCount ?? 0;

	const classesLimitInfo = useMemo(
		() => calculateLimitInfo( existingClassesCount, importedClassesCount, 100 ),
		[ existingClassesCount, importedClassesCount, calculateLimitInfo ]
	);

	const variablesLimitInfo = useMemo(
		() => calculateLimitInfo( existingVariablesCount, importedVariablesCount, 100 ),
		[ existingVariablesCount, importedVariablesCount, calculateLimitInfo ]
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
	}, [ open, data.customization.settings, data?.uploadedData, initialState, showClassesVariablesSection, classesVariablesInitialState ] );

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

	const handleClassesReviewClick = () => {
		const transformedAnalytics = transformAnalyticsData( settings );
		handleSaveChanges( 'settings', settings, true, transformedAnalytics );
		window.open( `${ elementorCommon.config.urls.admin }admin.php?page=elementor-app#/site-editor/global-classes`, '_blank' );
	};

	const handleVariablesReviewClick = () => {
		const transformedAnalytics = transformAnalyticsData( settings );
		handleSaveChanges( 'settings', settings, true, transformedAnalytics );
		window.open( `${ elementorCommon.config.urls.admin }admin.php?page=elementor-app#/site-editor/global-variables`, '_blank' );
	};

	const classesNotExported = isImport && ! isClassesExported( contextData );
	const variablesNotExported = isImport && ! isVariablesExported( contextData );
	const classesVariablesNotExported = classesNotExported && variablesNotExported;

	const classesLimitExceeded = isImport && classesLimitInfo.isExceeded;
	const variablesLimitExceeded = isImport && variablesLimitInfo.isExceeded;
	const classesOverLimitCount = classesLimitInfo.overLimitCount;
	const variablesOverLimitCount = variablesLimitInfo.overLimitCount;

	return (
		<KitCustomizationDialog
			open={ open }
			title={ __( 'Edit settings & configurations', 'elementor' ) }
			handleClose={ handleClose }
			handleSaveChanges={ () => {
				const transformedAnalytics = transformAnalyticsData( settings );
				handleSaveChanges( 'settings', settings, true, transformedAnalytics );
			} }
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

				{/* Classes & Variables Section - appears after Theme when experiments are active */}
				{ showClassesVariablesSection && (
					<ClassesVariablesSection
						settings={ {
							classes: settings.classes ?? true,
							variables: settings.variables ?? true,
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
	);
}

KitSettingsCustomizationDialog.propTypes = {
	open: PropTypes.bool.isRequired,
	handleClose: PropTypes.func.isRequired,
	handleSaveChanges: PropTypes.func.isRequired,
};

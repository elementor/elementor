import { Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import { useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { KitCustomizationDialog } from './kit-customization-dialog';
import { OverrideConfirmationDialog } from './override-confirmation-dialog';
import { AppsEventTracking } from 'elementor-app/event-track/apps-event-tracking';
import useContextDetection from '../hooks/use-context-detection';
import { useClassesVariablesLimits } from '../hooks/use-classes-variables-limits';
import { UpgradeVersionBanner } from './upgrade-version-banner';
import { transformValueForAnalytics } from '../utils/analytics-transformer';
import {
	DefaultStylesSettingsRow,
	DesignSystemLimitAlert,
	GlobalClassesSettingsRow,
	GlobalVariablesSettingsRow,
	SettingsGroupSection,
	ThemeSettingsRow,
} from './settings-customization-sections';
import {
	isAtomicElementsFeatureActive,
} from '../utils';

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

function isThemeExported( contextData ) {
	if ( contextData?.isOldExport ) {
		return contextData?.data?.uploadedData?.manifest?.theme;
	}

	return contextData?.data?.uploadedData?.manifest?.[ 'site-settings' ]?.theme;
}

function getRegisteredRows() {
	return ( window.elementorModules?.importExport?.customizationDialogsRegistry?.get?.( 'settings' )?.children ?? [] )
		.filter( ( row ) => row.isAvailable() )
		.sort( ( first, second ) => first.order - second.order );
}

function getInitialSettings( contextData, isImport, registeredRows ) {
	const includesSettings = contextData?.data?.includes?.includes( 'settings' );
	const customization = contextData?.data?.customization?.settings ?? {};

	return registeredRows.reduce( ( state, row ) => {
		if ( ! row.settingKey ) {
			return state;
		}

		const initialValue = row.getInitialState
			? row.getInitialState( { contextData, includesSettings, isImport } )
			: includesSettings;

		return {
			...state,
			[ row.settingKey ]: row.settingKey in customization ? customization[ row.settingKey ] : initialValue,
		};
	}, {} );
}

export function KitSettingsCustomizationDialog( { open, handleClose, handleSaveChanges } ) {
	const { isImport = false, contextData = {} } = useContextDetection() ?? {};
	const { data = null } = contextData;

	const showDesignSystemSettingsSection = isAtomicElementsFeatureActive();
	const registeredRows = useMemo( () => getRegisteredRows(), [] );
	const rowByKey = useMemo( () => new Map( registeredRows.map( ( row ) => [ row.key, row ] ) ), [ registeredRows ] );

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

	const [ settings, setSettings ] = useState( () => getInitialSettings( contextData, isImport, registeredRows ) );

	useEffect( () => {
		if ( open ) {
			setSettings( getInitialSettings( contextData, isImport, registeredRows ) );
		}
	}, [ contextData, isImport, open, registeredRows ] );

	useEffect( () => {
		if ( open ) {
			AppsEventTracking.sendPageViewsWebsiteTemplates( elementorCommon.eventsManager.config.secondaryLocations.kitLibrary.kitExportCustomizationEdit );
		}
	}, [ open ] );

	const handleToggleChange = ( settingKey, isChecked ) => {
		setSettings( ( prev ) => ( {
			...prev,
			[ settingKey ]: undefined === isChecked ? ! prev[ settingKey ] : isChecked,
		} ) );
	};

	const handleSettingChange = ( settingKey, value ) => {
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

	const classesNotExported = isImport && ! contextData?.data?.uploadedData?.manifest?.[ 'site-settings' ]?.classes;
	const variablesNotExported = isImport && ! contextData?.data?.uploadedData?.manifest?.[ 'site-settings' ]?.variables;
	const defaultStylesNotExported = isImport && ! contextData?.data?.uploadedData?.manifest?.[ 'site-settings' ]?.defaultStyles;
	const designSystemSettingsNotExported = classesNotExported && variablesNotExported && defaultStylesNotExported;

	const classesLimitExceeded = isImport && classesLimitInfo.isExceeded;
	const variablesLimitExceeded = isImport && variablesLimitInfo.isExceeded;
	const classesOverLimitCount = classesLimitInfo.overLimitCount;
	const variablesOverLimitCount = variablesLimitInfo.overLimitCount;

	const hasSiteSettingsRows = rowByKey.has( 'settings/global-colors' ) || rowByKey.has( 'settings/global-fonts' ) || rowByKey.has( 'settings/theme-style-settings' );
	const hasCustomFilesRows = rowByKey.has( 'settings/custom-fonts' ) || rowByKey.has( 'settings/custom-icons' ) || rowByKey.has( 'settings/custom-code' );

	const renderRegisteredRow = ( rowKey ) => {
		const row = rowByKey.get( rowKey );

		if ( ! row ) {
			return null;
		}

		const RowComponent = row.component;

		return (
			<RowComponent
				key={ row.key }
				data={ data }
				contextData={ contextData }
				isImport={ isImport }
				onSettingChange={ handleToggleChange }
				settings={ settings }
			/>
		);
	};

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
					{ rowByKey.has( 'settings/theme' ) && (
						<ThemeSettingsRow
							contextData={ contextData }
							isImport={ isImport }
							onSettingChange={ handleToggleChange }
							settings={ settings }
						/>
					) }

					{ showDesignSystemSettingsSection && (
						<SettingsGroupSection title={ __( 'Classes, variables & default styles', 'elementor' ) }>
							{ ( classesLimitExceeded || variablesLimitExceeded ) && ! designSystemSettingsNotExported && (
								<DesignSystemLimitAlert />
							) }
							{ rowByKey.has( 'settings/global-classes' ) && (
								<GlobalClassesSettingsRow
									classesLimitExceeded={ classesLimitExceeded }
									classesOverLimitCount={ classesOverLimitCount }
									classesReviewClick={ handleClassesReviewClick }
									contextData={ contextData }
									isImport={ isImport }
									onSettingChange={ handleSettingChange }
									settings={ settings }
								/>
							) }
							{ rowByKey.has( 'settings/global-variables' ) && (
								<GlobalVariablesSettingsRow
									contextData={ contextData }
									isImport={ isImport }
									onSettingChange={ handleSettingChange }
									settings={ settings }
									variablesLimitExceeded={ variablesLimitExceeded }
									variablesOverLimitCount={ variablesOverLimitCount }
									variablesReviewClick={ handleVariablesReviewClick }
								/>
							) }
							{ rowByKey.has( 'settings/default-styles' ) && (
								<DefaultStylesSettingsRow
									contextData={ contextData }
									isImport={ isImport }
									onSettingChange={ handleSettingChange }
									settings={ settings }
								/>
							) }
						</SettingsGroupSection>
					) }

					{ hasSiteSettingsRows && (
						<SettingsGroupSection title={ __( 'Site settings', 'elementor' ) }>
							{ renderRegisteredRow( 'settings/global-colors' ) }
							{ renderRegisteredRow( 'settings/global-fonts' ) }
							{ renderRegisteredRow( 'settings/theme-style-settings' ) }
						</SettingsGroupSection>
					) }

					{ renderRegisteredRow( 'settings/general-settings' ) }
					{ renderRegisteredRow( 'settings/experiments' ) }

					{ hasCustomFilesRows && (
						<SettingsGroupSection title={ __( 'Custom files', 'elementor' ) }>
							{ renderRegisteredRow( 'settings/custom-fonts' ) }
							{ renderRegisteredRow( 'settings/custom-icons' ) }
							{ renderRegisteredRow( 'settings/custom-code' ) }
						</SettingsGroupSection>
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

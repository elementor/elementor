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
	getAvailableCustomizationDialogChildren,
	getImportedClassesCount,
	getImportedVariablesCount,
	isAtomicElementsFeatureActive,
	isClassesExported,
	isDefaultStylesExported,
	isVariablesExported,
} from '../utils';
import {
	KIT_SECTIONS,
	KIT_SECTION_ITEMS,
} from '../constants';

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

function getRegisteredRows() {
	return getAvailableCustomizationDialogChildren( KIT_SECTIONS.SETTINGS );
}

function getInitialSettings( contextData, isImport, registeredRows ) {
	const includesSettings = contextData?.data?.includes?.includes( KIT_SECTIONS.SETTINGS );
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

	const importedClassesCount = getImportedClassesCount( contextData );
	const importedVariablesCount = getImportedVariablesCount( contextData );

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
		handleSaveChanges( KIT_SECTIONS.SETTINGS, settings, true, transformedAnalytics );
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

	const hasSiteSettingsRows = rowByKey.has( KIT_SECTION_ITEMS.SETTINGS_GLOBAL_COLORS ) || rowByKey.has( KIT_SECTION_ITEMS.SETTINGS_GLOBAL_FONTS ) || rowByKey.has( KIT_SECTION_ITEMS.SETTINGS_THEME_STYLE_SETTINGS );
	const hasCustomFilesRows = rowByKey.has( KIT_SECTION_ITEMS.SETTINGS_CUSTOM_FONTS ) || rowByKey.has( KIT_SECTION_ITEMS.SETTINGS_CUSTOM_ICONS ) || rowByKey.has( KIT_SECTION_ITEMS.SETTINGS_CUSTOM_CODE );

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
		handleSaveChanges( KIT_SECTIONS.SETTINGS, settings, true, transformedAnalytics );
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
					{ rowByKey.has( KIT_SECTION_ITEMS.SETTINGS_THEME ) && (
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
							{ rowByKey.has( KIT_SECTION_ITEMS.SETTINGS_GLOBAL_CLASSES ) && (
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
							{ rowByKey.has( KIT_SECTION_ITEMS.SETTINGS_GLOBAL_VARIABLES ) && (
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
							{ rowByKey.has( KIT_SECTION_ITEMS.SETTINGS_DEFAULT_STYLES ) && (
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
							{ renderRegisteredRow( KIT_SECTION_ITEMS.SETTINGS_GLOBAL_COLORS ) }
							{ renderRegisteredRow( KIT_SECTION_ITEMS.SETTINGS_GLOBAL_FONTS ) }
							{ renderRegisteredRow( KIT_SECTION_ITEMS.SETTINGS_THEME_STYLE_SETTINGS ) }
						</SettingsGroupSection>
					) }

					{ renderRegisteredRow( KIT_SECTION_ITEMS.SETTINGS_GENERAL_SETTINGS ) }
					{ renderRegisteredRow( KIT_SECTION_ITEMS.SETTINGS_EXPERIMENTS ) }

					{ hasCustomFilesRows && (
						<SettingsGroupSection title={ __( 'Custom files', 'elementor' ) }>
							{ renderRegisteredRow( KIT_SECTION_ITEMS.SETTINGS_CUSTOM_FONTS ) }
							{ renderRegisteredRow( KIT_SECTION_ITEMS.SETTINGS_CUSTOM_ICONS ) }
							{ renderRegisteredRow( KIT_SECTION_ITEMS.SETTINGS_CUSTOM_CODE ) }
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

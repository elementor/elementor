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
import { createRegisteredCustomizationDialogsRegistry } from '../registry/customization-dialogs';
import { transformValueForAnalytics } from '../utils/analytics-transformer';
import {
	SettingsGroupSection,
} from './settings-customization-sections';
import {
	getAvailableCustomizationDialogChildren,
	getCustomizationDialogSnapshot,
	getImportedClassesCount,
	getImportedVariablesCount,
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

function getRegistryChildren( registry, parentKey ) {
	return registry.getAll()
		.filter( ( item ) => item.parentKey === parentKey )
		.sort( ( first, second ) => first.order - second.order );
}

const coreSettingsRegistry = createRegisteredCustomizationDialogsRegistry();

function mergeCoreSettingsEntries( parentKey, registeredEntries ) {
	const coreEntries = getRegistryChildren( coreSettingsRegistry, parentKey );

	if ( ! coreEntries.length ) {
		return registeredEntries;
	}

	const coreEntryByKey = new Set( coreEntries.map( ( entry ) => entry.key ) );
	const registeredEntriesMap = new Map(
		registeredEntries.map( ( entry ) => [ entry.key, entry ] ),
	);

	return [
		...coreEntries.map( ( entry ) => ( {
			...entry,
			...registeredEntriesMap.get( entry.key ),
		} ) ),
		...registeredEntries.filter( ( entry ) => ! coreEntryByKey.has( entry.key ) ),
	].sort( ( first, second ) => first.order - second.order );
}

function getRegisteredSettingsChildren( parentKey ) {
	return mergeCoreSettingsEntries(
		parentKey,
		getAvailableCustomizationDialogChildren( parentKey ),
	);
}

function buildSettingsTree( parentKey = KIT_SECTIONS.SETTINGS ) {
	return getRegisteredSettingsChildren( parentKey ).map( ( item ) => ( {
		...item,
		children: buildSettingsTree( item.key ),
	} ) );
}

function collectSettingRows( tree ) {
	return tree.flatMap( ( item ) => {
		if ( item.children.length ) {
			return collectSettingRows( item.children );
		}

		return item.settingKey ? [ item ] : [];
	} );
}

function getInitialSettings( contextData, isImport, registeredRows ) {
	const includesSettings = contextData?.data?.includes?.includes( KIT_SECTIONS.SETTINGS );
	const customization = contextData?.data?.customization?.settings ?? {};

	const rowDefaults = registeredRows.reduce( ( state, row ) => {
		if ( ! row.settingKey ) {
			return state;
		}

		return {
			...state,
			[ row.settingKey ]: row.getInitialState
				? row.getInitialState( { contextData, includesSettings, isImport } )
				: includesSettings,
		};
	}, {} );

	return { ...rowDefaults, ...customization };
}

export function KitSettingsCustomizationDialog( { open, handleClose, handleSaveChanges } ) {
	const { isImport = false, contextData = {} } = useContextDetection() ?? {};
	const { data = null } = contextData;

	const settingsDialogSnapshot = getCustomizationDialogSnapshot( KIT_SECTIONS.SETTINGS );
	const designSystemDialogSnapshot = getCustomizationDialogSnapshot( KIT_SECTION_ITEMS.SETTINGS_DESIGN_SYSTEM );
	const settingsTreeSignature = JSON.stringify( {
		settings: settingsDialogSnapshot,
		designSystem: designSystemDialogSnapshot,
	} );
	const settingsTree = useMemo( () => buildSettingsTree(), [ settingsTreeSignature ] );
	const registeredRows = useMemo( () => collectSettingRows( settingsTree ), [ settingsTree ] );
	const registeredRowsKey = useMemo(
		() => registeredRows.map( ( row ) => `${ row.key }:${ row.component?.name || '' }` ).join( '|' ),
		[ registeredRows ],
	);
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
	}, [ contextData, isImport, open, registeredRows, registeredRowsKey ] );

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
	const hasThemeRow = rowByKey.has( KIT_SECTION_ITEMS.SETTINGS_THEME );
	const topLevelSettingsKeys = useMemo( () => new Set( settingsTree.map( ( item ) => item.key ) ), [ settingsTree ] );
	const hasSiteSettingsRows = rowByKey.has( KIT_SECTION_ITEMS.SETTINGS_GLOBAL_COLORS ) || rowByKey.has( KIT_SECTION_ITEMS.SETTINGS_GLOBAL_FONTS ) || rowByKey.has( KIT_SECTION_ITEMS.SETTINGS_THEME_STYLE_SETTINGS );
	const hasCustomFilesRows = rowByKey.has( KIT_SECTION_ITEMS.SETTINGS_CUSTOM_FONTS ) || rowByKey.has( KIT_SECTION_ITEMS.SETTINGS_CUSTOM_ICONS ) || rowByKey.has( KIT_SECTION_ITEMS.SETTINGS_CUSTOM_CODE );

	const getRegisteredRowProps = ( rowKey ) => {
		const props = {
			data,
			contextData,
			isImport,
			settings,
		};

		switch ( rowKey ) {
			case KIT_SECTION_ITEMS.SETTINGS_GLOBAL_CLASSES:
				return {
					...props,
					classesLimitExceeded,
					classesOverLimitCount,
					classesReviewClick: handleClassesReviewClick,
					onSettingChange: handleSettingChange,
				};
			case KIT_SECTION_ITEMS.SETTINGS_GLOBAL_VARIABLES:
				return {
					...props,
					onSettingChange: handleSettingChange,
					variablesLimitExceeded,
					variablesOverLimitCount,
					variablesReviewClick: handleVariablesReviewClick,
				};
			case KIT_SECTION_ITEMS.SETTINGS_DEFAULT_STYLES:
				return {
					...props,
					onSettingChange: handleSettingChange,
				};
			default:
				return {
					...props,
					onSettingChange: handleToggleChange,
				};
		}
	};

	const getRegisteredSectionProps = ( sectionKey ) => {
		if ( KIT_SECTION_ITEMS.SETTINGS_DESIGN_SYSTEM === sectionKey ) {
			return {
				isImport,
				classesLimitExceeded,
				variablesLimitExceeded,
				notExported: designSystemSettingsNotExported,
				settings,
				onSettingChange: handleSettingChange,
				classesExported: ! classesNotExported,
				defaultStylesExported: ! defaultStylesNotExported,
				variablesExported: ! variablesNotExported,
				classesOverLimitCount,
				variablesOverLimitCount,
				onClassesReviewClick: handleClassesReviewClick,
				onVariablesReviewClick: handleVariablesReviewClick,
			};
		}

		return {};
	};

	const renderRegisteredRow = ( rowKey ) => {
		const row = rowByKey.get( rowKey );

		if ( ! row?.component || row.isPlaceholder ) {
			return null;
		}

		const RowComponent = row.component;

		return (
			<RowComponent
				key={ row.key }
				{ ...getRegisteredRowProps( rowKey ) }
			/>
		);
	};

	const renderSettingsTreeItem = ( item ) => {
		if ( ! item.children.length ) {
			return renderRegisteredRow( item.key );
		}

		const renderedChildren = item.children
			.map( ( child ) => renderSettingsTreeItem( child ) )
			.filter( Boolean );

		if ( ! renderedChildren.length && item.isPlaceholder ) {
			return null;
		}

		if ( ! item.component ) {
			return renderedChildren;
		}

		const SectionComponent = item.component;

		return (
			<SectionComponent
				key={ item.key }
				{ ...getRegisteredSectionProps( item.key ) }
			>
				{ renderedChildren }
			</SectionComponent>
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
					{ hasThemeRow && renderRegisteredRow( KIT_SECTION_ITEMS.SETTINGS_THEME ) }
					{ topLevelSettingsKeys.has( KIT_SECTION_ITEMS.SETTINGS_DESIGN_SYSTEM ) && renderSettingsTreeItem( settingsTree.find( ( item ) => item.key === KIT_SECTION_ITEMS.SETTINGS_DESIGN_SYSTEM ) ) }

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

import { Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import { useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { KitCustomizationDialog } from './kit-customization-dialog';
import { AppsEventTracking } from 'elementor-app/event-track/apps-event-tracking';
import useContextDetection from '../hooks/use-context-detection';
import { UpgradeVersionBanner } from './upgrade-version-banner';
import { transformValueForAnalytics } from '../utils/analytics-transformer';

function getRegisteredSections() {
	return ( window.elementorModules?.importExport?.customizationDialogsRegistry?.get?.( 'templates' )?.children ?? [] )
		.filter( ( row ) => row.isAvailable() )
		.sort( ( first, second ) => first.order - second.order );
}

function getInitialTemplatesState( contextData, isImport, registeredSections ) {
	const includesTemplates = contextData?.data?.includes?.includes( 'templates' );
	const customization = contextData?.data?.customization?.templates ?? {};

	return registeredSections.reduce( ( state, section ) => {
		if ( ! section.settingKey ) {
			return state;
		}

		const initialValue = section.getInitialState
			? section.getInitialState( { contextData, includesTemplates, isImport } )
			: { enabled: includesTemplates };

		return {
			...state,
			[ section.settingKey ]: customization[ section.settingKey ] ?? initialValue,
		};
	}, {} );
}

const transformAnalyticsData = ( payload ) => {
	const transformed = {};

	for ( const [ key, value ] of Object.entries( payload ) ) {
		transformed[ key ] = transformValueForAnalytics( key, value, [] );
	}

	return transformed;
};

export function KitTemplatesCustomizationDialog( { open, handleClose, handleSaveChanges } ) {
	const { isImport = false, contextData = {} } = useContextDetection() ?? {};
	const { data = null, isOldExport = false, isOldElementorVersion = false } = contextData;
	const registeredSections = useMemo( () => getRegisteredSections(), [] );

	const [ templates, setTemplates ] = useState( () => getInitialTemplatesState( contextData, isImport, registeredSections ) );

	useEffect( () => {
		if ( open ) {
			setTemplates( getInitialTemplatesState( contextData, isImport, registeredSections ) );
		}
	}, [ contextData, isImport, open, registeredSections ] );

	useEffect( () => {
		if ( open ) {
			AppsEventTracking.sendPageViewsWebsiteTemplates( elementorCommon.eventsManager.config.secondaryLocations.kitLibrary.kitExportCustomizationEdit );
		}
	}, [ open ] );

	const handleSectionStateChange = useCallback( ( settingKey, newState, mergeMode = false ) => {
		setTemplates( ( prev ) => ( {
			...prev,
			[ settingKey ]: mergeMode ? { ...prev[ settingKey ], ...newState } : newState,
		} ) );
	}, [] );

	return (
		<KitCustomizationDialog
			open={ open }
			title={ __( 'Edit templates', 'elementor' ) }
			handleClose={ handleClose }
			handleSaveChanges={ () => {
				const hasEnabledCustomization = Object.values( templates ).some( ( sectionState ) => sectionState?.enabled );
				handleSaveChanges( 'templates', templates, hasEnabledCustomization, transformAnalyticsData( templates ) );
				handleClose();
			} }
			minHeight="auto"
		>
			<Stack gap={ 2 }>
				{ isOldElementorVersion && (
					<UpgradeVersionBanner />
				) }
				{ registeredSections.map( ( section ) => {
					const SectionComponent = section.component;

					return (
						<SectionComponent
							key={ section.key }
							data={ data }
							isImport={ isImport }
							isOldExport={ isOldExport }
							onSectionStateChange={ handleSectionStateChange }
							templates={ templates }
						/>
					);
				} ) }
			</Stack>
		</KitCustomizationDialog>
	);
}

KitTemplatesCustomizationDialog.propTypes = {
	open: PropTypes.bool.isRequired,
	handleClose: PropTypes.func.isRequired,
	handleSaveChanges: PropTypes.func.isRequired,
};

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
	const templateRegistry = elementorModules?.importExport?.templateRegistry;
	const templateTypes = templateRegistry?.getAll() || [];
	const isImport = data.hasOwnProperty( 'uploadedData' );

	const [ templates, setTemplates ] = useState( () => {
		if ( data.customization.templates ) {
			return data.customization.templates;
		}

		return templateRegistry?.getState( data, initialState ) || {};
	} );

	const hasTemplatesForExportGroup = ( exportGroup ) => {
		if ( ! isImport || ! data.uploadedData?.manifest?.templates ) {
			return false;
		}

		const uploadedTemplates = data.uploadedData.manifest.templates;
		const exportGroups = elementorAppConfig?.['import-export-customization']?.exportGroups || {};

		for ( const templateId in uploadedTemplates ) {
			const template = uploadedTemplates[ templateId ];
			const templateExportGroup = exportGroups[ template.doc_type ];
			
			if ( templateExportGroup === exportGroup ) {
				return true;
			}
		}

		return false;
	};

	useEffect( () => {
		if ( open ) {
			if ( data.customization.templates ) {
				setTemplates( data.customization.templates );
			} else {
				setTemplates( templateRegistry?.getState( data, initialState ) || {} );
			}
		}
	}, [ open, data.customization.templates, initialState ] );

	useEffect( () => {
		AppsEventTracking.sendPageViewsWebsiteTemplates( elementorCommon.eventsManager.config.secondaryLocations.kitLibrary.kitExportCustomizationEdit );
	}, [] );

	const handleStateChange = ( settingKey, newState, mergeMode = false ) => {
		setTemplates( ( prev ) => {
			if ( mergeMode ) {
				return {
					...prev,
					[ settingKey ]: { ...prev[ settingKey ], ...newState },
				};
			}

			return {
				...prev,
				[ settingKey ]: newState,
			};
		} );
	};

	const handleToggleEnabled = ( settingKey ) => {
		setTemplates( ( prev ) => ( {
			...prev,
			[ settingKey ]: {
				...prev[ settingKey ],
				enabled: ! prev[ settingKey ]?.enabled,
			},
		} ) );
	};

	const renderTemplateSection = ( templateType ) => {
		if ( templateType.component ) {
			const CustomComponent = templateType.component;
			return (
				<CustomComponent
					key={ templateType.key }
					state={ templates[ templateType.key ] }
					disabled={ isImport && ! templates[ templateType.key ]?.enabled && ! hasTemplatesForExportGroup( templateType.exportGroup ) }
					settingKey={ templateType.key }
					onStateChange={ handleStateChange }
					data={ data }
				/>
			);
		}

		return (
			<SettingSection
				key={ templateType.key }
				checked={ templates[ templateType.key ]?.enabled || false }
				disabled={ isImport && ! templates[ templateType.key ]?.enabled && ! hasTemplatesForExportGroup( templateType.exportGroup ) }
				title={ templateType.title }
				description={ templateType.description }
				settingKey={ templateType.key }
				onSettingChange={ handleToggleEnabled }
			/>
		);
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
			{ templateTypes.map( renderTemplateSection ) }
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

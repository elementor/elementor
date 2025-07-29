import { Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { SettingSection } from './customization-setting-section';
import { KitCustomizationDialog } from './kit-customization-dialog';

const getTemplateRegistry = () => {
	return window.elementorModules?.importExport?.templateRegistry;
};

const templateRegistry = ( () => {
	const registry = getTemplateRegistry();

	if ( registry ) {
		registry.register( {
			key: 'siteTemplates',
			title: __( 'Site templates', 'elementor' ),
			order: 0,
			// Uses default object state: { enabled: parentInitialState }
		} );
	}

	return registry;
} )();

export function KitTemplatesCustomizationDialog( { open, handleClose, handleSaveChanges, data } ) {
	const templateTypes = templateRegistry?.getAll() || [];
	const initialState = data.includes.includes( 'templates' );

	const [ templates, setTemplates ] = useState( () => {
		if ( data.customization.templates ) {
			return data.customization.templates;
		}

		return templateRegistry?.getState( data.includes, data.customization, initialState ) || {};
	} );

	useEffect( () => {
		if ( open ) {
			if ( data.customization.templates ) {
				setTemplates( data.customization.templates );
			} else {
				setTemplates( templateRegistry?.getState( data.includes, data.customization, initialState ) || {} );
			}
		}
	}, [ open, data.customization.templates, initialState ] );

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
				enabled: !prev[ settingKey ]?.enabled 
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
			handleSaveChanges={ () => handleSaveChanges( 'templates', templates ) }
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

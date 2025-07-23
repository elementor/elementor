import { Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { SettingSection } from './customization-setting-section';
import { KitCustomizationDialog } from './kit-customization-dialog';

const templateRegistry = window.elementorModules.importExport.templateRegistry;

templateRegistry.register( {
    key: 'siteTemplates',
    title: __( 'Site templates', 'elementor' ),
    order: 0,
    useParentDefault: true
} );

export function KitTemplatesCustomizationDialog( { open, handleClose, handleSaveChanges, data } ) {
	const templateTypes = templateRegistry.getAll();
	const initialState = data.includes.includes( 'templates' );

	const [ templates, setTemplates ] = useState( () => {
		if ( data.customization.templates ) {
			return data.customization.templates;
		}

		return templateRegistry.getState( data.includes, data.customization, initialState );
	} );

	useEffect( () => {
		if ( open ) {
			if ( data.customization.templates ) {
				setTemplates( data.customization.templates );
			} else {
				setTemplates( templateRegistry.getState(data.includes, data.customization, initialState ) );
			}
		}
	}, [ open, data.customization.templates, initialState ] );

	const handleToggleChange = ( settingKey ) => {
		setTemplates( ( prev ) => ( {
			...prev,
			[ settingKey ]: ! prev[ settingKey ],
		} ) );
	};

	const renderTemplateSection = ( templateType ) => {
        if ( templateType.component ) {
            const CustomComponent = templateType.component;
            return (
                <CustomComponent
                    key={ templateType.key }
                    checked={ templates[ templateType.key ] }
                    onSettingChange={ handleToggleChange }
                    data={ data }
                />
            );
        }

        return (
            <SettingSection
                key={ templateType.key }
                checked={ templates[ templateType.key ] }
                title={ templateType.title }
                description={ templateType.description }
                settingKey={ templateType.key }
                onSettingChange={ handleToggleChange }
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

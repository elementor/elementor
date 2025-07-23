import { Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { SettingSection } from './customization-setting-section';
import { KitCustomizationDialog } from './kit-customization-dialog';

export function KitTemplatesCustomizationDialog( { open, handleClose, handleSaveChanges, data } ) {
	const initialState = data.includes.includes( 'templates' );

	const [ templates, setTemplates ] = useState( () => {
		if ( data.customization.templates ) {
			return data.customization.templates;
		}

		return {
			siteTemplates: initialState,
		};
	} );

	useEffect( () => {
		if ( open ) {
			if ( data.customization.templates ) {
				setTemplates( data.customization.templates );
			} else {
				setTemplates( {
					siteTemplates: initialState,
				} );
			}
		}
	}, [ open, data.customization.templates, initialState ] );

	const handleToggleChange = ( settingKey ) => {
		setTemplates( ( prev ) => ( {
			...prev,
			[ settingKey ]: ! prev[ settingKey ],
		} ) );
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
				<SettingSection
					checked={ templates.siteTemplates }
					title={ __( 'Site templates', 'elementor' ) }
					settingKey="siteTemplates"
					onSettingChange={ handleToggleChange }
				/>
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

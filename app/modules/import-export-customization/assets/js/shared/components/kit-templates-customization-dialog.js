import {
	Dialog,
	DialogHeader,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Box,
	Typography,
	Switch,
	Stack,
} from '@elementor/ui';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

export function KitTemplatesCustomizationDialog( { open, handleClose, handleSaveChanges, data } ) {
	const initialState = data.includes.includes( 'templates' );

	const [ settings, setSettings ] = useState( () => {
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
				setSettings( data.customization.templates );
			} else {
				setSettings( {
					siteTemplates: initialState,
				} );
			}
		}
	}, [ open, data.customization.templates, initialState ] );

	const handleToggleChange = ( settingKey ) => {
		setSettings( ( prev ) => ( {
			...prev,
			[ settingKey ]: ! prev[ settingKey ],
		} ) );
	};

	const SettingSection = ( { title, description, children, hasToggle = true, settingKey } ) => (
		<Box key={ settingKey } sx={ { mb: 3, border: 1, borderRadius: 1, borderColor: 'action.focus', p: 2.5 } }>
			<Box sx={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } }>
				<Box>
					<Typography variant="body1" sx={ { fontWeight: 500 } }>
						{ title }
					</Typography>
					{ description && (
						<Typography variant="body1" color="text.secondary" sx={ { fontWeight: 400 } }>
							{ description }
						</Typography>
					) }
				</Box>
				{ hasToggle && (
					<Switch
						checked={ settings[ settingKey ] }
						onChange={ () => handleToggleChange( settingKey ) }
						color="info"
						size="medium"
						sx={ { alignSelf: 'center' } }
					/>
				) }
			</Box>
			{ children && (
				<Box sx={ { mt: 2 } }>
					{ children }
				</Box>
			) }
		</Box>
	);

	SettingSection.propTypes = {
		title: PropTypes.string.isRequired,
		description: PropTypes.string,
		children: PropTypes.node,
		hasToggle: PropTypes.bool,
		settingKey: PropTypes.string,
	};

	const SubSetting = ( { label, settingKey } ) => (
		<Box sx={ {
			display: 'flex',
			justifyContent: 'space-between',
			alignItems: 'center',
			py: 1.5,
		} }>
			<Typography variant="body1" sx={ { fontWeight: 400 } }>
				{ label }
			</Typography>
			<Switch
				checked={ settings[ settingKey ] }
				onChange={ () => handleToggleChange( settingKey ) }
				color="info"
				size="medium"
			/>
		</Box>
	);

	SubSetting.propTypes = {
		label: PropTypes.string.isRequired,
		settingKey: PropTypes.string.isRequired,
	};

	return (
		<Dialog
			open={ open }
			onClose={ handleClose }
			maxWidth="md"
			fullWidth
		>
			<DialogHeader onClose={ handleClose }>
				<DialogTitle>
					{ __( 'Edit templates', 'elementor' ) }
				</DialogTitle>
			</DialogHeader>

			<DialogContent dividers sx={ { p: 3 } }>
				<Stack>
					<SettingSection
						title={ __( 'Site templates', 'elementor' ) }
						settingKey="siteTemplates"
					/>
				</Stack>
			</DialogContent>

			<DialogActions>
				<Button
					onClick={ handleClose }
					color="secondary"
				>
					{ __( 'Cancel', 'elementor' ) }
				</Button>
				<Button
					onClick={ () => {
						handleSaveChanges( 'templates', settings );
						handleClose();
					} }
					variant="contained"
					color="primary"
				>
					{ __( 'Save changes', 'elementor' ) }
				</Button>
			</DialogActions>
		</Dialog>
	);
}

KitTemplatesCustomizationDialog.propTypes = {
	open: PropTypes.bool.isRequired,
	handleClose: PropTypes.func.isRequired,
	handleSaveChanges: PropTypes.func.isRequired,
	data: PropTypes.object.isRequired,
};

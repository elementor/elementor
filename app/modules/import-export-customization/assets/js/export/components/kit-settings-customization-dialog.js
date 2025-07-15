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
import { useExportContext } from '../context/export-context';

export default function KitSettingsCustomizationDialog( { open, handleClose } ) {
	const { data, dispatch } = useExportContext();

	const initialState = data.includes.includes( 'settings' );

	const [ settings, setSettings ] = useState( () => {
		if ( data.customization.settings ) {
			return data.customization.settings;
		}

		return {
			theme: initialState,
			globalColors: initialState,
			globalFonts: initialState,
			themeStyleSettings: initialState,
			generalSettings: initialState,
			experiments: initialState,
		};
	} );

	useEffect( () => {
		if ( open ) {
			if ( data.customization.settings ) {
				setSettings( data.customization.settings );
			} else {
				setSettings( {
					theme: initialState,
					globalColors: initialState,
					globalFonts: initialState,
					themeStyleSettings: initialState,
					generalSettings: initialState,
					experiments: initialState,
				} );
			}
		}
	}, [ open, data.customization.settings, initialState ] );

	const handleToggleChange = ( settingKey ) => {
		setSettings( ( prev ) => ( {
			...prev,
			[ settingKey ]: ! prev[ settingKey ],
		} ) );
	};

	const handleSaveChanges = () => {
		const hasEnabledSettings = Object.values( settings ).some( ( value ) => value );

		dispatch( {
			type: 'SET_CUSTOMIZATION',
			payload: {
				key: 'settings',
				value: settings,
			},
		} );

		if ( hasEnabledSettings ) {
			dispatch( { type: 'ADD_INCLUDE', payload: 'settings' } );
		} else {
			dispatch( { type: 'REMOVE_INCLUDE', payload: 'settings' } );
		}

		handleClose();
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

	return (
		<Dialog
			open={ open }
			onClose={ handleClose }
			maxWidth="md"
			fullWidth
			PaperProps={ {
				sx: {
					minHeight: '600px',
				},
			} }
		>
			<DialogHeader onClose={ handleClose }>
				<DialogTitle>
					{ __( 'Edit settings & configurations', 'elementor' ) }
				</DialogTitle>
			</DialogHeader>

			<DialogContent dividers sx={ { p: 3 } }>
				<Stack>
					<SettingSection
						title={ __( 'Theme', 'elementor' ) }
						description={ __( 'Only public WordPress themes are supported', 'elementor' ) }
						settingKey="theme"
					/>

					<SettingSection
						title={ __( 'Site settings', 'elementor' ) }
						hasToggle={ false }
					>
						<Stack>
							<SubSetting
								label={ __( 'Global colors', 'elementor' ) }
								settingKey="globalColors"
							/>
							<SubSetting
								label={ __( 'Global fonts', 'elementor' ) }
								settingKey="globalFonts"
							/>
							<SubSetting
								label={ __( 'Theme style settings', 'elementor' ) }
								settingKey="themeStyleSettings"
							/>
						</Stack>
					</SettingSection>

					<SettingSection
						title={ __( 'Settings', 'elementor' ) }
						description={ __( 'Include site identity, background, layout, Lightbox, page transitions, and custom CSS', 'elementor' ) }
						settingKey="generalSettings"
					/>

					<SettingSection
						title={ __( 'Experiments', 'elementor' ) }
						description={ __( 'This will apply all experiments that are still active during import', 'elementor' ) }
						settingKey="experiments"
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
					onClick={ handleSaveChanges }
					variant="contained"
					color="primary"
				>
					{ __( 'Save changes', 'elementor' ) }
				</Button>
			</DialogActions>
		</Dialog>
	);
}

KitSettingsCustomizationDialog.propTypes = {
	open: PropTypes.bool.isRequired,
	handleClose: PropTypes.func.isRequired,
};

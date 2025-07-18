import {
	Dialog,
	DialogHeader,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Box,
	Typography,
	Checkbox,
	FormControlLabel,
	CircularProgress,
	Stack,
	Link,
	SvgIcon,
} from '@elementor/ui';
import React from 'react';
import PropTypes from 'prop-types';
import useKitPlugins from '../hooks/use-kit-plugins';

export function KitPluginsCustomizationDialog( { open, handleClose, handleSaveChanges, data } ) {
	const {
		plugins,
		pluginsList,
		isLoading,
		isRequiredPlugin,
		handleToggleChange,
		handleSelectAll,
		getSelectedPlugins,
		isAllSelected,
		isIndeterminate,
	} = useKitPlugins( { open, data } );

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
						checked={ plugins[ settingKey ] }
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

	const SubSetting = ( { label, settingKey, version, pluginUri } ) => {
		const isRequired = isRequiredPlugin( settingKey );
		
		return (
			<Box sx={ { py: 1.5, opacity: isRequired ? 0.6 : 1 } }>
				<FormControlLabel
					control={
						<Checkbox
							checked={ plugins[ settingKey ] }
							onChange={ () => handleToggleChange( settingKey ) }
							color="info"
							size="medium"
							sx={ { py: 0 } }
							disabled={ isRequired }
						/>
					}
					label={ 
						<Typography variant="body1" sx={ { fontWeight: 400, color: isRequired ? 'text.disabled' : 'inherit' } }>
							{ label }
						</Typography> 
					}
				/>
				{ version && (
					<Typography variant="body1" color="text.secondary" sx={ { fontWeight: 400, ml: 4 } }>
						{ pluginUri ? (
							<Link
								href={ pluginUri }
								target="_blank"
								rel="noopener noreferrer"
								color="info.light"
								underline="hover"
								sx={ {
									display: 'inline-flex',
									alignItems: 'center',
									gap: 0.5,
								} }
							>
								{ __( 'Version', 'elementor' ) } { version }
								<SvgIcon
									viewBox="0 0 18 18"
									sx={ { 
										fontSize: 16,
										color: 'info.light',
									} }
								>
									<path
										fillRule="evenodd"
										clipRule="evenodd"
										d="M11 1C11 0.585786 11.3358 0.25 11.75 0.25H16.75C17.1642 0.25 17.5 0.585786 17.5 1V6C17.5 6.41421 17.1642 6.75 16.75 6.75C16.3358 6.75 16 6.41421 16 6V2.81066L7.28033 11.5303C6.98744 11.8232 6.51256 11.8232 6.21967 11.5303C5.92678 11.2374 5.92678 10.7626 6.21967 10.4697L14.9393 1.75H11.75C11.3358 1.75 11 1.41421 11 1ZM0.805456 4.05546C1.32118 3.53973 2.02065 3.25 2.75 3.25H7.75C8.16421 3.25 8.5 3.58579 8.5 4C8.5 4.41421 8.16421 4.75 7.75 4.75H2.75C2.41848 4.75 2.10054 4.8817 1.86612 5.11612C1.6317 5.35054 1.5 5.66848 1.5 6V15C1.5 15.3315 1.6317 15.6495 1.86612 15.8839C2.10054 16.1183 2.41848 16.25 2.75 16.25H11.75C12.0815 16.25 12.3995 16.1183 12.6339 15.8839C12.8683 15.6495 13 15.3315 13 15V10C13 9.58579 13.3358 9.25 13.75 9.25C14.1642 9.25 14.5 9.58579 14.5 10V15C14.5 15.7293 14.2103 16.4288 13.6945 16.9445C13.1788 17.4603 12.4793 17.75 11.75 17.75H2.75C2.02065 17.75 1.32118 17.4603 0.805456 16.9445C0.289731 16.4288 0 15.7293 0 15V6C0 5.27065 0.289731 4.57118 0.805456 4.05546Z"
										fill="currentColor"
									/>
								</SvgIcon>
							</Link>
						) : (
							<>{ __( 'Version', 'elementor' ) } { version }</>
						) }
					</Typography>
				) }
			</Box>
		);
	};

	SubSetting.propTypes = {
		label: PropTypes.string.isRequired,
		settingKey: PropTypes.string.isRequired,
		version: PropTypes.string,
		pluginUri: PropTypes.string,
	};

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
					{ __( 'Edit plugins', 'elementor' ) }
				</DialogTitle>
			</DialogHeader>

			<DialogContent dividers sx={ { p: 3 } }>
				<Stack>
					{ isLoading ? (
						<Stack spacing={ 3 } alignItems="center" sx={ { py: 8 } }>
							<CircularProgress size={ 30 } />
						</Stack>
					) : (
						<SettingSection
							title={ __( 'Plugin name and version', 'elementor' ) }
							hasToggle={ false }
						>
							<Stack>
								<Box sx={ { py: 1.5 } }>
									<FormControlLabel
										control={
											<Checkbox
												checked={ isAllSelected }
												indeterminate={ isIndeterminate }
												onChange={ handleSelectAll }
												color="info"
												size="medium"
												sx={ { py: 0 } }
											/>
										}
										label={ <Typography variant="body1" sx={ { fontWeight: 500 } }>{ __( 'All plugins', 'elementor' ) }</Typography> }
									/>
								</Box>
								{ Object.entries( pluginsList ).map( ( [ pluginKey, pluginData ] ) => (
									<SubSetting
										key={ pluginKey }
										label={ pluginData.name }
										settingKey={ pluginKey }
										version={ pluginData.version }
										pluginUri={ pluginData.pluginUri }
									/>
								) ) }
							</Stack>
						</SettingSection>
					) }
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
						handleSaveChanges( 'plugins', getSelectedPlugins() );
						handleClose();
					} }
					variant="contained"
					color="primary"
					disabled={ isLoading }
				>
					{ __( 'Save changes', 'elementor' ) }
				</Button>
			</DialogActions>
		</Dialog>
	);
}

KitPluginsCustomizationDialog.propTypes = {
	open: PropTypes.bool.isRequired,
	handleClose: PropTypes.func.isRequired,
	handleSaveChanges: PropTypes.func.isRequired,
	data: PropTypes.object.isRequired,
};

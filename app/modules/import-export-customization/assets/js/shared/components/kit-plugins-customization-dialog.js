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
} from '@elementor/ui';
import { ExternalLinkIcon } from './icons';
import { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import useKitPlugins from '../hooks/use-kit-plugins';
import useContextDetection from '../hooks/use-context-detection';
import { AppsEventTracking } from 'elementor-app/event-track/apps-event-tracking';
import { UpgradeVersionBanner } from './upgrade-version-banner';
import { transformValueForAnalytics } from '../utils/analytics-transformer';

const transformAnalyticsData = ( payload ) => {
	const transformed = {};

	for ( const [ key, value ] of Object.entries( payload ) ) {
		transformed[ key ] = transformValueForAnalytics( key, value, [] );
	}

	return transformed;
};

const REQUIRED_PLUGINS = [
	'elementor/elementor',
];

export function KitPluginsCustomizationDialog( { open, handleClose, handleSaveChanges } ) {
	const { isImport = false, contextData = {} } = useContextDetection() ?? {};
	const { data = null, isOldElementorVersion = false } = contextData;

	const { pluginsList: fetchedPluginsList, isLoading: fetchIsLoading } = useKitPlugins( { open: open && ! isImport } );

	const pluginsList = useMemo( () => {
		if ( isImport ) {
			return ( data?.uploadedData?.manifest?.plugins || [] ).reduce( ( acc, plugin ) => {
				acc[ plugin.plugin ] = plugin;

				return acc;
			}, {} );
		}

		return fetchedPluginsList;
	}, [ isImport, data?.uploadedData?.manifest?.plugins, fetchedPluginsList ] );

	const isLoading = isImport ? false : fetchIsLoading;

	const [ plugins, setPlugins ] = useState( {} );

	const initialState = data?.includes?.includes( 'plugins' ) || false;

	useEffect( () => {
		if ( 0 === Object.keys( pluginsList ).length ) {
			return;
		}

		let initialPluginsState = {};

		if ( data?.customization?.plugins ) {
			initialPluginsState = data.customization.plugins;
		} else {
			Object.keys( pluginsList ).forEach( ( pluginKey ) => {
				initialPluginsState[ pluginKey ] = initialState;
			} );
		}

		REQUIRED_PLUGINS.forEach( ( pluginKey ) => {
			if ( initialPluginsState.hasOwnProperty( pluginKey ) ) {
				initialPluginsState[ pluginKey ] = true;
			}
		} );

		setPlugins( initialPluginsState );
	}, [ pluginsList, data?.customization?.plugins, initialState ] );

	const isRequiredPlugin = useCallback( ( pluginKey ) => {
		return REQUIRED_PLUGINS.includes( pluginKey );
	}, [] );

	const nonRequiredPlugins = useMemo( () => {
		return Object.keys( plugins ).filter( ( pluginKey ) => ! isRequiredPlugin( pluginKey ) );
	}, [ plugins, isRequiredPlugin ] );

	const isAllSelected = useMemo( () => {
		return nonRequiredPlugins.length > 0 && nonRequiredPlugins.every( ( pluginKey ) => plugins[ pluginKey ] );
	}, [ nonRequiredPlugins, plugins ] );

	const isIndeterminate = useMemo( () => {
		return nonRequiredPlugins.some( ( pluginKey ) => plugins[ pluginKey ] ) && ! isAllSelected;
	}, [ nonRequiredPlugins, plugins, isAllSelected ] );

	const handleToggleChange = useCallback( ( settingKey ) => {
		if ( isRequiredPlugin( settingKey ) ) {
			return;
		}

		setPlugins( ( prev ) => ( {
			...prev,
			[ settingKey ]: ! prev[ settingKey ],
		} ) );
	}, [ isRequiredPlugin ] );

	const handleSelectAll = useCallback( () => {
		const allNonRequiredSelected = nonRequiredPlugins.every( ( pluginKey ) => plugins[ pluginKey ] );
		const newState = { ...plugins };
		nonRequiredPlugins.forEach( ( pluginKey ) => {
			newState[ pluginKey ] = ! allNonRequiredSelected;
		} );

		REQUIRED_PLUGINS.forEach( ( pluginKey ) => {
			if ( newState.hasOwnProperty( pluginKey ) ) {
				newState[ pluginKey ] = true;
			}
		} );

		setPlugins( newState );
	}, [ plugins, nonRequiredPlugins ] );

	const getPluginsSelection = useCallback( () => {
		const selectedPlugins = {};
		Object.entries( plugins ).forEach( ( [ pluginKey, isSelected ] ) => {
			selectedPlugins[ pluginKey ] = isSelected;
		} );
		return selectedPlugins;
	}, [ plugins ] );

	useEffect( () => {
		if ( open ) {
			AppsEventTracking.sendPageViewsWebsiteTemplates( elementorCommon.eventsManager.config.secondaryLocations.kitLibrary.kitExportCustomizationEdit );
		}
	}, [ open ] );

	const SettingSection = ( { title, description, children, settingKey } ) => (
		<Box key={ settingKey } sx={ { mb: 3, border: 1, borderRadius: 1, borderColor: 'action.focus', p: 2.5 } }>
			<Box sx={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } }>
				<Box>
					<Typography variant="h6">
						{ title }
					</Typography>
					{ description && (
						<Typography variant="body1" color="text.secondary">
							{ description }
						</Typography>
					) }
				</Box>
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
		settingKey: PropTypes.string,
	};

	const SubSetting = ( { label, settingKey, version, pluginUri } ) => {
		const isRequired = isRequiredPlugin( settingKey );

		return (
			<Box sx={ { py: 1.5 } }>
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
								<ExternalLinkIcon />
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
				<Stack gap={ 2 }>
					{ isOldElementorVersion && (
						<UpgradeVersionBanner />
					) }
					{ isLoading ? (
						<Stack spacing={ 3 } alignItems="center" sx={ { py: 8 } }>
							<CircularProgress size={ 30 } />
						</Stack>
					) : (
						<SettingSection
							title={ __( 'Plugin name and version', 'elementor' ) }
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
						const pluginsSelection = getPluginsSelection();
						const hasEnabledCustomization = Object.values( pluginsSelection ).some( Boolean );
						const transformedAnalytics = transformAnalyticsData( pluginsSelection );
						handleSaveChanges( 'plugins', pluginsSelection, hasEnabledCustomization, transformedAnalytics );
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
};

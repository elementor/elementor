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
import { ExternalLinkIcon } from '@elementor/icons';
import { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import useKitPlugins from '../hooks/use-kit-plugins';
import useContextDetection from '../hooks/use-context-detection';
import { AppsEventTracking } from 'elementor-app/event-track/apps-event-tracking';
import { UpgradeVersionBanner } from './upgrade-version-banner';
import { transformValueForAnalytics } from '../utils/analytics-transformer';
import { KIT_SECTIONS } from '../constants';
import { getAvailableCustomizationDialogChildren } from '../utils';

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

const pluginDataPropType = PropTypes.shape( {
	name: PropTypes.string.isRequired,
	version: PropTypes.string,
	pluginUri: PropTypes.string,
} );

export function PluginListSection( {
	handleSelectAll,
	handleToggleChange,
	isAllSelected,
	isIndeterminate,
	isLoading,
	isRequiredPlugin,
	plugins,
	pluginsList,
} ) {
	return (
		<Box sx={ { mb: 3, border: 1, borderRadius: 1, borderColor: 'action.focus', p: 2.5 } }>
			<Typography variant="h6">
				{ __( 'Plugin name and version', 'elementor' ) }
			</Typography>
			{ isLoading ? (
				<Stack spacing={ 3 } alignItems="center" sx={ { py: 8 } }>
					<CircularProgress size={ 30 } />
				</Stack>
			) : (
				<Stack sx={ { mt: 2 } }>
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
					{ Object.entries( pluginsList ).map( ( [ pluginKey, pluginData ] ) => {
						const isRequired = isRequiredPlugin( pluginKey );

						return (
							<Box key={ pluginKey } sx={ { py: 1.5 } }>
								<FormControlLabel
									control={
										<Checkbox
											checked={ !! plugins[ pluginKey ] }
											onChange={ () => handleToggleChange( pluginKey ) }
											color="info"
											size="medium"
											sx={ { py: 0 } }
											disabled={ isRequired }
										/>
									}
									label={
										<Typography variant="body1" sx={ { fontWeight: 400, color: isRequired ? 'text.disabled' : 'inherit' } }>
											{ pluginData.name }
										</Typography>
									}
								/>
								{ pluginData.version && (
									<Typography variant="body1" color="text.secondary" sx={ { fontWeight: 400, ml: 4 } }>
										{ pluginData.pluginUri ? (
											<Link
												href={ pluginData.pluginUri }
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
												{ __( 'Version', 'elementor' ) } { pluginData.version }
												<ExternalLinkIcon />
											</Link>
										) : (
											<>{ __( 'Version', 'elementor' ) } { pluginData.version }</>
										) }
									</Typography>
								) }
							</Box>
						);
					} ) }
				</Stack>
			) }
		</Box>
	);
}

PluginListSection.propTypes = {
	handleSelectAll: PropTypes.func.isRequired,
	handleToggleChange: PropTypes.func.isRequired,
	isAllSelected: PropTypes.bool.isRequired,
	isIndeterminate: PropTypes.bool.isRequired,
	isLoading: PropTypes.bool.isRequired,
	isRequiredPlugin: PropTypes.func.isRequired,
	plugins: PropTypes.objectOf( PropTypes.bool ).isRequired,
	pluginsList: PropTypes.objectOf( pluginDataPropType ).isRequired,
};

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

	const initialState = data?.includes?.includes( KIT_SECTIONS.PLUGINS ) || false;

	useEffect( () => {
		if ( 0 === Object.keys( pluginsList ).length ) {
			return;
		}

		const savedPluginsState = data?.customization?.plugins || {};
		const hasSavedPluginsState = !! data?.customization?.plugins;
		const initialPluginsState = Object.keys( pluginsList ).reduce( ( acc, pluginKey ) => {
			acc[ pluginKey ] = hasSavedPluginsState
				? !! savedPluginsState[ pluginKey ]
				: initialState;

			return acc;
		}, {} );

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

	const registeredSections = getAvailableCustomizationDialogChildren( KIT_SECTIONS.PLUGINS );

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
					{ registeredSections.map( ( section ) => {
						const SectionComponent = section.component;

						return (
							<SectionComponent
								key={ section.key }
								handleSelectAll={ handleSelectAll }
								handleToggleChange={ handleToggleChange }
								isAllSelected={ isAllSelected }
								isIndeterminate={ isIndeterminate }
								isLoading={ isLoading }
								isRequiredPlugin={ isRequiredPlugin }
								plugins={ plugins }
								pluginsList={ pluginsList }
							/>
						);
					} ) }
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
						handleSaveChanges( KIT_SECTIONS.PLUGINS, pluginsSelection, hasEnabledCustomization, transformedAnalytics );
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

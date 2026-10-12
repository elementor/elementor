import { useState, useEffect, Fragment, useMemo } from 'react';
import { Box, Typography, Stack, Checkbox, FormControlLabel, Button, Tooltip } from '@elementor/ui';
import { AlertTriangleFilledIcon } from '@elementor/icons';
import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';
import { AppsEventTracking } from 'elementor-app/event-track/apps-event-tracking';
import kitContentData from '../kit-content-data';
import useContextDetection from '../hooks/use-context-detection';
import { useClassesVariablesLimits } from '../hooks/use-classes-variables-limits';
import { ReExportBanner } from './re-export-banner';
import { UpgradeVersionBanner } from './upgrade-version-banner';
import {
	isAtomicElementsFeatureActive,
} from '../utils';

const kitPartItemPropType = PropTypes.shape( {
	type: PropTypes.string.isRequired,
	checked: PropTypes.bool.isRequired,
	data: PropTypes.shape( {
		title: PropTypes.string.isRequired,
		features: PropTypes.shape( {
			open: PropTypes.arrayOf( PropTypes.string ).isRequired,
			locked: PropTypes.arrayOf( PropTypes.string ),
			tooltip: PropTypes.string,
		} ).isRequired,
	} ).isRequired,
} );

function DefaultKitPartSelectionSection( {
	item,
	DialogComponent,
	isActive,
	disabled,
	isLockedFeaturesNoPro,
	hasSettingsLimitWarning,
	onCheckboxChange,
	onOpenDialog,
	onCloseDialog,
	handleSaveCustomization,
	isImport,
	isOldExport,
	isOldElementorVersion,
	isCloudKitsEligible,
	showMediaFormatValidation,
	renderFeatureDescription,
	renderEditControl,
} ) {
	return (
		<>
			<Box
				data-testid={ `KitPartsSelectionRow-${ item.type }` }
				sx={ {
					mb: 3,
					border: 1,
					borderRadius: 1,
					borderColor: 'action.focus',
					p: 2.5,
				} }
			>
				<Box sx={ { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' } }>
					<Box sx={ { flex: 1, opacity: isLockedFeaturesNoPro ? 0.5 : 1 } }>
						<Box sx={ { display: 'flex', alignItems: 'center' } }>
							<FormControlLabel
								control={
									<Checkbox
										color="info"
										checked={ item.checked }
										onChange={ onCheckboxChange }
										disabled={ disabled }
										sx={ { p: 0, mx: 1 } }
										data-testid={ `KitContentDataSelection-${ item.type }` }
										data-type={ item.type }
									/>
								}
								label={ <Typography color="text.primary" variant="body1" sx={ { fontWeight: 500 } }>{ item.data.title }</Typography> }
								sx={ {
									'& .MuiFormControlLabel-label.Mui-disabled': {
										color: 'text.primary',
									},
								} }
							/>
							{ 'settings' === item.type && hasSettingsLimitWarning && (
								<Tooltip
									title={ __( 'Limit exceeded. Click \'Edit\' to review conflicts or override existing items', 'elementor' ) }
									placement="top"
									arrow
								>
									<AlertTriangleFilledIcon
										sx={ {
											fontSize: 20,
											color: 'warning.main',
											ml: 0.5,
										} }
										aria-hidden
									/>
								</Tooltip>
							) }
						</Box>
						{ renderFeatureDescription( item, isLockedFeaturesNoPro ) }
					</Box>
					{ renderEditControl( item, isLockedFeaturesNoPro, onOpenDialog ) }
				</Box>
			</Box>
			{ DialogComponent && (
				<DialogComponent
					open={ isActive }
					handleClose={ onCloseDialog }
					handleSaveChanges={ handleSaveCustomization }
					isImport={ isImport }
					isOldExport={ isOldExport }
					isOldElementorVersion={ isOldElementorVersion }
					isCloudKitsEligible={ isCloudKitsEligible }
					showMediaFormatValidation={ showMediaFormatValidation }
				/>
			) }
		</>
	);
}

DefaultKitPartSelectionSection.propTypes = {
	item: kitPartItemPropType.isRequired,
	DialogComponent: PropTypes.elementType,
	isActive: PropTypes.bool.isRequired,
	disabled: PropTypes.bool.isRequired,
	isLockedFeaturesNoPro: PropTypes.bool.isRequired,
	hasSettingsLimitWarning: PropTypes.bool.isRequired,
	onCheckboxChange: PropTypes.func.isRequired,
	onOpenDialog: PropTypes.func.isRequired,
	onCloseDialog: PropTypes.func.isRequired,
	handleSaveCustomization: PropTypes.func.isRequired,
	isImport: PropTypes.bool.isRequired,
	isOldExport: PropTypes.bool.isRequired,
	isOldElementorVersion: PropTypes.bool.isRequired,
	isCloudKitsEligible: PropTypes.bool.isRequired,
	showMediaFormatValidation: PropTypes.bool.isRequired,
	renderFeatureDescription: PropTypes.func.isRequired,
	renderEditControl: PropTypes.func.isRequired,
};

export default function KitPartsSelection( { onCheckboxChange, testId, handleSaveCustomization, isCloudKitsEligible = false, showMediaFormatValidation = false } ) {
	const [ activeDialog, setActiveDialog ] = useState( null );
	const { isImport = false, contextData = {} } = useContextDetection() ?? {};
	const { data = null, isOldExport = false, isOldElementorVersion = false } = contextData;

	const showDesignSystemSettingsSection = isAtomicElementsFeatureActive();

	const {
		existingClassesCount,
		existingVariablesCount,
		classesLimit,
		variablesLimit,
		calculateLimitInfo,
	} = useClassesVariablesLimits( { open: true, isImport } );

	const importedClassesCount = contextData?.data?.uploadedData?.manifest?.[ 'site-settings' ]?.classesCount ?? 0;
	const importedVariablesCount = contextData?.data?.uploadedData?.manifest?.[ 'site-settings' ]?.variablesCount ?? 0;
	const isClassesExportedInManifest = !! contextData?.data?.uploadedData?.manifest?.[ 'site-settings' ]?.classes;
	const isVariablesExportedInManifest = !! contextData?.data?.uploadedData?.manifest?.[ 'site-settings' ]?.variables;

	const classesLimitInfo = useMemo(
		() => calculateLimitInfo( existingClassesCount, importedClassesCount, classesLimit ),
		[ existingClassesCount, importedClassesCount, classesLimit, calculateLimitInfo ],
	);
	const variablesLimitInfo = useMemo(
		() => calculateLimitInfo( existingVariablesCount, importedVariablesCount, variablesLimit ),
		[ existingVariablesCount, importedVariablesCount, variablesLimit, calculateLimitInfo ],
	);

	const hasSettingsLimitWarning = showDesignSystemSettingsSection && isImport && (
		( isClassesExportedInManifest && classesLimitInfo.isExceeded ) ||
		( isVariablesExportedInManifest && variablesLimitInfo.isExceeded )
	);

	useEffect( () => {
		if ( showMediaFormatValidation && ! isImport ) {
			setActiveDialog( 'content' );
		}
	}, [ showMediaFormatValidation, isImport ] );

	const isSiteSettingsExported = () => {
		const siteSettings = contextData?.data?.uploadedData?.manifest?.[ 'site-settings' ];
		if ( ! siteSettings ) {
			return false;
		}

		return Object.values( siteSettings ).some( Boolean );
	};

	const isContentSettingsExported = () => {
		const taxonomies = contextData?.data?.uploadedData?.manifest?.taxonomies;
		const content = contextData?.data?.uploadedData?.manifest?.content;
		const wpContent = contextData?.data?.uploadedData?.manifest?.[ 'wp-content' ];
		const customPostTypes = contextData?.data?.uploadedData?.manifest?.[ 'custom-post-type-title' ];

		return taxonomies || content || wpContent || customPostTypes;
	};

	const isExported = ( item ) => {
		switch ( item.type ) {
			case 'settings':
				return isSiteSettingsExported();
			case 'content':
				return isContentSettingsExported();
			default:
				return contextData?.data?.uploadedData?.manifest?.[ item.type ];
		}
	};

	const isDisabled = ( item ) => {
		if ( item.data.features?.locked && ! elementorAppConfig.hasPro ) {
			return true;
		}

		if ( isImport ) {
			return ! isExported( item ) || item.required;
		}

		return item.required && contextData?.data?.includes?.includes( item.type );
	};

	const isEditDisabled = ( item ) => {
		if ( isImport ) {
			const manifestKey = 'settings' === item.type ? 'site-settings' : item.type;
			return ! contextData?.data?.uploadedData?.manifest?.[ manifestKey ];
		}

		return false;
	};

	const getRegistryEntry = ( item ) => {
		return window.elementorModules?.importExport?.customizationDialogsRegistry?.get?.( item.type );
	};

	const renderFeatureDescription = ( item, isLockedFeaturesNoPro ) => {
		const featuresText = [
			item.data.features.open.join( ', ' ),
			item.data.features?.locked?.length > 0 && item.data.features.open.length > 0 ? ', ' : '',
			item.data.features?.locked?.join( ', ' ),
		].join( '' );

		const description = (
			<Typography variant="body2" color="text.secondary" sx={ { mt: 1, ml: 4 } }>
				{ featuresText }
			</Typography>
		);

		return isLockedFeaturesNoPro ? (
			<Tooltip title={ item.data.features?.tooltip || __( 'This feature requires Elementor Pro', 'elementor' ) } arrow placement="top">
				{ description }
			</Tooltip>
		) : description;
	};

	const renderEditControl = ( item, isLockedFeaturesNoPro, onOpenDialog ) => {
		if ( isLockedFeaturesNoPro ) {
			return (
				<Button
					variant="contained"
					color="promotion"
					onClick={ () => {
						AppsEventTracking.sendKitsCloudUpgradeClicked( item.type );
						window.open( 'https://go.elementor.com/go-pro-import-export', '_blank' );
					} }
					startIcon={ <span className="eicon-upgrade-crown"></span> }
					sx={ { alignSelf: 'center' } }
					data-type={ item.type }
					disabled={ isEditDisabled( item ) }
				>
					{ __( 'Upgrade', 'elementor' ) }
				</Button>
			);
		}

		if ( ! isImport ) {
			return (
				<Button
					color="secondary"
					onClick={ onOpenDialog }
					sx={ { alignSelf: 'center' } }
					data-type={ item.type }
					disabled={ isEditDisabled( item ) }
				>
					{ __( 'Edit', 'elementor' ) }
				</Button>
			);
		}

		return isExported( item )
			? (
				<Button
					color="secondary"
					onClick={ onOpenDialog }
					sx={ { alignSelf: 'center' } }
					data-type={ item.type }
					disabled={ isEditDisabled( item ) }
				>
					{ __( 'Edit', 'elementor' ) }
				</Button>
			) : (
				<Typography
					variant="body1"
					color="text.disabled"
					sx={ { alignSelf: 'center' } }
				>
					{ __( 'Not exported', 'elementor' ) }
				</Typography>
			);
	};

	return (
		<Stack spacing={ 2 } data-testid={ testId }>
			{ contextData?.isOldExport && (
				<ReExportBanner />
			) }
			{ contextData?.isOldElementorVersion && (
				<UpgradeVersionBanner />
			) }
			{ kitContentData.map( ( item ) => {
				const registryEntry = getRegistryEntry( item );
				const isLockedFeaturesNoPro = item.data.features?.locked && ! elementorAppConfig.hasPro;
				const disabled = isDisabled( item );
				const DialogComponent = registryEntry?.component || item.dialog;
				const SectionComponent = registryEntry?.section || DefaultKitPartSelectionSection;

				return (
					<Fragment key={ item.type }>
						<SectionComponent
							item={ {
								...item,
								checked: data.includes.includes( item.type ),
							} }
							DialogComponent={ DialogComponent }
							isActive={ activeDialog === item.type }
							disabled={ disabled }
							isLockedFeaturesNoPro={ isLockedFeaturesNoPro }
							hasSettingsLimitWarning={ hasSettingsLimitWarning }
							onCheckboxChange={ () => onCheckboxChange( item.type ) }
							onOpenDialog={ () => setActiveDialog( item.type ) }
							onCloseDialog={ () => setActiveDialog( null ) }
							handleSaveCustomization={ handleSaveCustomization }
							isImport={ isImport }
							isOldExport={ isOldExport }
							isOldElementorVersion={ isOldElementorVersion }
							isCloudKitsEligible={ isCloudKitsEligible }
							showMediaFormatValidation={ showMediaFormatValidation }
							renderFeatureDescription={ renderFeatureDescription }
							renderEditControl={ renderEditControl }
						/>
					</Fragment>
				);
			} ) }
		</Stack>
	);
}

KitPartsSelection.propTypes = {
	onCheckboxChange: PropTypes.func.isRequired,
	testId: PropTypes.string,
	handleSaveCustomization: PropTypes.func.isRequired,
	isCloudKitsEligible: PropTypes.bool,
	showMediaFormatValidation: PropTypes.bool,
};

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

function isExperimentActive( experimentName ) {
	const common = typeof globalThis !== 'undefined' ? globalThis.elementorCommon : undefined;
	return !! common?.config?.experimentalFeatures?.[ experimentName ];
}

function isClassesFeatureActive() {
	return isExperimentActive( 'e_classes' ) && isExperimentActive( 'e_atomic_elements' );
}

function isVariablesFeatureActive() {
	return isExperimentActive( 'e_variables' ) && isExperimentActive( 'e_atomic_elements' );
}

export default function KitPartsSelection( { onCheckboxChange, testId, handleSaveCustomization, isCloudKitsEligible = false, showMediaFormatValidation = false } ) {
	const [ activeDialog, setActiveDialog ] = useState( null );
	const { isImport = false, contextData = {} } = useContextDetection() ?? {};
	const { data = null } = contextData;

	const showClassesSection = isClassesFeatureActive();
	const showVariablesSection = isVariablesFeatureActive();

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

	const hasSettingsLimitWarning = isImport && (
		( showClassesSection && isClassesExportedInManifest && classesLimitInfo.isExceeded ) ||
		( showVariablesSection && isVariablesExportedInManifest && variablesLimitInfo.isExceeded )
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

	const getDialogComponent = ( item ) => {
		const reg = window.elementorModules?.importExport?.customizationDialogsRegistry;
		const registered = reg?.get?.( item.type );
		return registered?.component || item.dialog;
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

	const renderCheckboxControl = ( item, disabled ) => (
		<FormControlLabel
			control={
				<Checkbox
					color="info"
					checked={ data.includes.includes( item.type ) }
					onChange={ () => onCheckboxChange( item.type ) }
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
	);

	const getSectionEditButton = ( item, isLockedFeaturesNoPro ) => {
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
					onClick={ () => setActiveDialog( item.type ) }
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
					onClick={ () => setActiveDialog( item.type ) }
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
				const isLockedFeaturesNoPro = item.data.features?.locked && ! elementorAppConfig.hasPro;
				const disabled = isDisabled( item );
				const DialogComponent = getDialogComponent( item );

				return (
					<Fragment key={ item.type }>
						<Box
							data-testid={ `KitPartsSelectionRow-${ item.type }` }
							key={ item.type }
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
										{ renderCheckboxControl( item, disabled ) }
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
								{ getSectionEditButton( item, isLockedFeaturesNoPro ) }
							</Box>
						</Box>
						{ DialogComponent && (
							<DialogComponent
								open={ activeDialog === item.type }
								handleClose={ () => setActiveDialog( null ) }
								data={ data }
								handleSaveChanges={ handleSaveCustomization }
								isImport={ isImport }
								isOldExport={ contextData.isOldExport }
								isOldElementorVersion={ contextData.isOldElementorVersion }
								isCloudKitsEligible={ isCloudKitsEligible }
								showMediaFormatValidation={ showMediaFormatValidation }
							/>
						) }
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

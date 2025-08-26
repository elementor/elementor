import { useState, Fragment } from 'react';
import { Box, Typography, Stack, Checkbox, FormControlLabel, Button, Tooltip } from '@elementor/ui';
import PropTypes from 'prop-types';
import kitContentData from '../kit-content-data';
import useContextDetection from '../hooks/use-context-detection';

export default function KitPartsSelection( { data, onCheckboxChange, testId, handleSaveCustomization } ) {
	const [ activeDialog, setActiveDialog ] = useState( null );
	const { isImport, contextData } = useContextDetection();

	const isDisabled = ( item ) => {
		if ( item.data.features?.locked && ! elementorAppConfig.hasPro ) {
			return true;
		}

		if ( isImport ) {
			const manifestKey = 'settings' === item.type ? 'site-settings' : item.type;
			return ! data?.uploadedData?.manifest?.[ manifestKey ];
		}

		return item.required && data.includes.includes( item.type );
	};

	const isEditDisabled = ( item ) => {
		if ( isImport ) {
			if ( contextData?.isOldExport && 'settings' === item.type ) {
				return true;
			}

			const manifestKey = 'settings' === item.type ? 'site-settings' : item.type;
			return ! data?.uploadedData?.manifest?.[ manifestKey ];
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
			item.data.features?.locked?.join( ', ' )
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

	const renderCheckboxControl = ( item ) => (
		<FormControlLabel
			control={
				<Checkbox
					color="info"
					checked={ data.includes.includes( item.type ) }
					onChange={ () => onCheckboxChange( item.type ) }
					disabled={ isDisabled( item ) }
					indeterminate={ isImport && isDisabled( item ) }
					sx={ { py: 0 } }
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

	return (
		<Stack spacing={ 2 } data-testid={ testId }>
			{ kitContentData.map( ( item ) => {
				const isLockedFeaturesNoPro = item.data.features?.locked && ! elementorAppConfig.hasPro;
				const DialogComponent = getDialogComponent( item );

				return (
					<Fragment key={ item.type }>
						<Box sx={ { mb: 3, border: 1, borderRadius: 1, borderColor: 'action.focus', p: 2.5 } }>
							<Box sx={ { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' } }>
								<Box sx={ { flex: 1, opacity: isLockedFeaturesNoPro ? 0.5 : 1 } }>
									{ renderCheckboxControl( item ) }
									{ renderFeatureDescription( item, isLockedFeaturesNoPro ) }
								</Box>
								{ isLockedFeaturesNoPro ? (
									<Button
										variant="contained"
										color="promotion"
										onClick={ () => window.open( 'https://go.elementor.com/go-pro-import-export', '_blank' ) }
										startIcon={ <span className="eicon-upgrade-crown"></span> }
										sx={ { alignSelf: 'center' } }
										data-type={ item.type }
										disabled={ isEditDisabled( item ) }
									>
										{ __( 'Upgrade', 'elementor' ) }
									</Button>
								) : (
									<Button
										color="secondary"
										onClick={ () => setActiveDialog( item.type ) }
										sx={ { alignSelf: 'center' } }
										data-type={ item.type }
										disabled={ isEditDisabled( item ) }
									>
										{ __( 'Edit', 'elementor' ) }
									</Button>
								) }
							</Box>
						</Box>
						{ DialogComponent && (
							<DialogComponent
								open={ activeDialog === item.type }
								handleClose={ () => setActiveDialog( null ) }
								data={ data }
								handleSaveChanges={ handleSaveCustomization }
							/>
						) }
					</Fragment>
				);
			} ) }
		</Stack>
	);
}

KitPartsSelection.propTypes = {
	data: PropTypes.object.isRequired,
	onCheckboxChange: PropTypes.func.isRequired,
	handleSaveCustomization: PropTypes.func.isRequired,
	testId: PropTypes.string,
};

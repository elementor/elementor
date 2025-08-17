import * as React from 'react';
import { useState } from 'react';
import { PopoverContent, useBoundProp } from '@elementor/editor-controls';
import { PopoverBody } from '@elementor/editor-editing-panel';
import { PopoverHeader } from '@elementor/editor-ui';
import { ArrowLeftIcon } from '@elementor/icons';
import { Button, CardActions, Divider, FormHelperText, IconButton, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useVariableType } from '../context/variable-type-context';
import { useInitialValue } from '../hooks/use-initial-value';
import { createVariable } from '../hooks/use-prop-variables';
import { trackVariableEvent } from '../utils/tracking';
import { ERROR_MESSAGES, labelHint, mapServerError } from '../utils/validations';
import { LabelField, useLabelError } from './fields/label-field';
import { FormField } from './ui/form-field';

const SIZE = 'tiny';

type Props = {
	onGoBack?: () => void;
	onClose: () => void;
};

export const VariableCreation = ( { onGoBack, onClose }: Props ) => {
	const { icon: VariableIcon, valueField: ValueField, variableType, propTypeUtil } = useVariableType();

	const { setValue: setVariable, path } = useBoundProp( propTypeUtil );
	const { propType } = useBoundProp();

	const initialValue = useInitialValue();

	const [ value, setValue ] = useState( initialValue );
	const [ label, setLabel ] = useState( '' );
	const [ errorMessage, setErrorMessage ] = useState( '' );
	const [ valueFieldError, setValueFieldError ] = useState( '' );

	const { labelFieldError, setLabelFieldError } = useLabelError();

	const resetFields = () => {
		setValue( '' );
		setLabel( '' );
		setErrorMessage( '' );
		setValueFieldError( '' );
	};

	const closePopover = () => {
		resetFields();
		onClose();
	};

	const handleCreateAndTrack = () => {
		createVariable( {
			value,
			label,
			type: propTypeUtil.key,
		} )
			.then( ( key ) => {
				setVariable( key );
				closePopover();
			} )
			.catch( ( error ) => {
				const mappedError = mapServerError( error );
				if ( mappedError && 'label' === mappedError.field ) {
					setLabel( '' );
					setLabelFieldError( {
						value: label,
						message: mappedError.message,
					} );
					return;
				}

				setErrorMessage( ERROR_MESSAGES.UNEXPECTED_ERROR );
			} );

		trackVariableEvent( {
			varType: variableType,
			controlPath: path.join( '.' ),
			action: 'save',
		} );
	};

	const hasEmptyFields = () => {
		if ( '' === label.trim() ) {
			return true;
		}

		if ( 'string' === typeof value ) {
			return '' === value.trim();
		}

		return false === Boolean( value );
	};

	const hasErrors = () => {
		return !! errorMessage;
	};

	const isSubmitDisabled = hasEmptyFields() || hasErrors();

	return (
		<PopoverBody height="auto">
			<PopoverHeader
				icon={
					<>
						{ onGoBack && (
							<IconButton size={ SIZE } aria-label={ __( 'Go Back', 'elementor' ) } onClick={ onGoBack }>
								<ArrowLeftIcon fontSize={ SIZE } />
							</IconButton>
						) }
						<VariableIcon fontSize={ SIZE } />
					</>
				}
				title={ __( 'Create variable', 'elementor' ) }
				onClose={ closePopover }
			/>

			<Divider />

			<PopoverContent p={ 2 }>
				<FormField
					id="variable-label"
					label={ __( 'Name', 'elementor' ) }
					errorMsg={ labelFieldError?.message }
					noticeMsg={ labelHint( label ) }
				>
					<LabelField
						id="variable-label"
						value={ label }
						error={ labelFieldError }
						onChange={ ( newValue ) => {
							setLabel( newValue );
							setErrorMessage( '' );
						} }
						onErrorChange={ ( errorMsg ) => {
							setLabelFieldError( {
								value: label,
								message: errorMsg,
							} );
						} }
					/>
				</FormField>
				<FormField errorMsg={ valueFieldError } label={ __( 'Value', 'elementor' ) }>
					<Typography variant="h5">
						<ValueField
							value={ value }
							onChange={ ( newValue ) => {
								setValue( newValue );
								setErrorMessage( '' );
								setValueFieldError( '' );
							} }
							onValidationChange={ setValueFieldError }
							propType={ propType }
						/>
					</Typography>
				</FormField>

				{ errorMessage && <FormHelperText error>{ errorMessage }</FormHelperText> }
			</PopoverContent>

			<CardActions sx={ { pt: 0.5, pb: 1 } }>
				<Button size="small" variant="contained" disabled={ isSubmitDisabled } onClick={ handleCreateAndTrack }>
					{ __( 'Create', 'elementor' ) }
				</Button>
			</CardActions>
		</PopoverBody>
	);
};

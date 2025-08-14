import * as React from 'react';
import { useState } from 'react';
import { PopoverContent, useBoundProp } from '@elementor/editor-controls';
import { PopoverBody } from '@elementor/editor-editing-panel';
import { PopoverHeader } from '@elementor/editor-ui';
import { Button, CardActions, Divider, FormHelperText } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { PopoverContentRefContextProvider } from '../context/variable-selection-popover.context';
import { useVariableType } from '../context/variable-type-context';
import { restoreVariable, useVariable } from '../hooks/use-prop-variables';
import { ERROR_MESSAGES, mapServerError } from '../utils/validations';
import { LabelField, useLabelError } from './fields/label-field';
import { FormField } from './ui/form-field';

const SIZE = 'tiny';

type Props = {
	variableId: string;
	onClose: () => void;
	onSubmit?: () => void;
};

export const VariableRestore = ( { variableId, onClose, onSubmit }: Props ) => {
	const { icon: VariableIcon, valueField: ValueField, variableType, propTypeUtil } = useVariableType();

	const { setValue: notifyBoundPropChange } = useBoundProp( propTypeUtil );
	const { propType } = useBoundProp();

	const variable = useVariable( variableId );

	if ( ! variable ) {
		throw new Error( `Global ${ variableType } variable not found` );
	}

	const [ errorMessage, setErrorMessage ] = useState( '' );
	const [ valueFieldError, setValueFieldError ] = useState( '' );
	const [ label, setLabel ] = useState( variable.label );
	const [ value, setValue ] = useState( variable.value );

	const { labelFieldError, setLabelFieldError } = useLabelError( {
		value: variable.label,
		message: ERROR_MESSAGES.DUPLICATED_LABEL,
	} );

	const handleRestore = () => {
		restoreVariable( variableId, label, value )
			.then( () => {
				notifyBoundPropChange( variableId );
				onSubmit?.();
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

	const noValueChanged = () => {
		return value === variable.value && label === variable.label;
	};

	const hasErrors = () => {
		return !! errorMessage;
	};

	const isSubmitDisabled = noValueChanged() || hasEmptyFields() || hasErrors();

	return (
		<PopoverContentRefContextProvider>
			<PopoverBody height="auto">
				<PopoverHeader
					icon={ <VariableIcon fontSize={ SIZE } /> }
					title={ __( 'Restore variable', 'elementor' ) }
					onClose={ onClose }
				/>

				<Divider />

				<PopoverContent p={ 2 }>
					<LabelField
						value={ label }
						error={ labelFieldError }
						onChange={ ( newValue ) => {
							setLabel( newValue );
							setErrorMessage( '' );
						} }
					/>
					<FormField errorMsg={ valueFieldError } label={ __( 'Value', 'elementor' ) }>
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
					</FormField>

					{ errorMessage && <FormHelperText error>{ errorMessage }</FormHelperText> }
				</PopoverContent>

				<CardActions sx={ { pt: 0.5, pb: 1 } }>
					<Button size="small" variant="contained" disabled={ isSubmitDisabled } onClick={ handleRestore }>
						{ __( 'Restore', 'elementor' ) }
					</Button>
				</CardActions>
			</PopoverBody>
		</PopoverContentRefContextProvider>
	);
};

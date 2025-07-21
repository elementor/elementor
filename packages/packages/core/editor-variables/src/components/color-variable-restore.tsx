import * as React from 'react';
import { useState } from 'react';
import { PopoverContent, useBoundProp } from '@elementor/editor-controls';
import { PopoverBody } from '@elementor/editor-editing-panel';
import { PopoverHeader } from '@elementor/editor-ui';
import { BrushIcon } from '@elementor/icons';
import { Button, CardActions, Divider, FormHelperText } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { restoreVariable, useVariable } from '../hooks/use-prop-variables';
import { colorVariablePropTypeUtil } from '../prop-types/color-variable-prop-type';
import { ERROR_MESSAGES, mapServerError } from '../utils/validations';
import { ColorField } from './fields/color-field';
import { LabelField, useLabelError } from './fields/label-field';
import { PopoverContentRefContextProvider } from './variable-selection-popover.context';

const SIZE = 'tiny';

type Props = {
	variableId: string;
	onClose: () => void;
	onSubmit?: () => void;
};

export const ColorVariableRestore = ( { variableId, onClose, onSubmit }: Props ) => {
	const { setValue: notifyBoundPropChange } = useBoundProp( colorVariablePropTypeUtil );

	const variable = useVariable( variableId );
	if ( ! variable ) {
		throw new Error( `Global color variable not found` );
	}

	const [ errorMessage, setErrorMessage ] = useState( '' );
	const [ label, setLabel ] = useState( variable.label );
	const [ color, setColor ] = useState( variable.value );

	const { labelFieldError, setLabelFieldError } = useLabelError( {
		value: variable.label,
		message: ERROR_MESSAGES.DUPLICATED_LABEL,
	} );

	const handleRestore = () => {
		restoreVariable( variableId, label, color )
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

	const hasEmptyValues = () => {
		return ! color.trim() || ! label.trim();
	};

	const noValueChanged = () => {
		return color === variable.value && label === variable.label;
	};

	const hasErrors = () => {
		return !! errorMessage;
	};

	const isSubmitDisabled = noValueChanged() || hasEmptyValues() || hasErrors();

	return (
		<PopoverContentRefContextProvider>
			<PopoverBody height="auto">
				<PopoverHeader
					icon={ <BrushIcon fontSize={ SIZE } /> }
					title={ __( 'Restore variable', 'elementor' ) }
					onClose={ onClose }
				/>

				<Divider />

				<PopoverContent p={ 2 }>
					<LabelField
						value={ label }
						error={ labelFieldError }
						onChange={ ( value ) => {
							setLabel( value );
							setErrorMessage( '' );
						} }
					/>
					<ColorField
						value={ color }
						onChange={ ( value ) => {
							setColor( value );
							setErrorMessage( '' );
						} }
					/>

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

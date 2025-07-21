import * as React from 'react';
import { useState } from 'react';
import { PopoverContent, useBoundProp } from '@elementor/editor-controls';
import { PopoverBody } from '@elementor/editor-editing-panel';
import { PopoverHeader } from '@elementor/editor-ui';
import { TextIcon } from '@elementor/icons';
import { Button, CardActions, Divider, FormHelperText } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { restoreVariable, useVariable } from '../hooks/use-prop-variables';
import { fontVariablePropTypeUtil } from '../prop-types/font-variable-prop-type';
import { ERROR_MESSAGES, mapServerError } from '../utils/validations';
import { FontField } from './fields/font-field';
import { LabelField, useLabelError } from './fields/label-field';
import { PopoverContentRefContextProvider } from './variable-selection-popover.context';

const SIZE = 'tiny';

type Props = {
	variableId: string;
	onClose: () => void;
	onSubmit?: () => void;
};

export const FontVariableRestore = ( { variableId, onClose, onSubmit }: Props ) => {
	const { setValue: notifyBoundPropChange } = useBoundProp( fontVariablePropTypeUtil );

	const variable = useVariable( variableId );
	if ( ! variable ) {
		throw new Error( `Global font variable "${ variableId }" not found` );
	}

	const [ errorMessage, setErrorMessage ] = useState( '' );
	const [ fontFamily, setFontFamily ] = useState( variable.value );
	const [ label, setLabel ] = useState( variable.label );

	const { error: labelServerError, setError: setLabelServerError } = useLabelError( {
		value: variable.label,
		message: ERROR_MESSAGES.DUPLICATED_LABEL,
	} );

	const handleUpdate = () => {
		restoreVariable( variableId, label, fontFamily )
			.then( () => {
				notifyBoundPropChange( variableId );
				onSubmit?.();
			} )
			.catch( ( error ) => {
				const mappedError = mapServerError( error );
				if ( mappedError && 'label' === mappedError.field ) {
					setLabel( '' );
					setLabelServerError( {
						value: label,
						message: mappedError.message,
					} );
					return;
				}

				setErrorMessage( ERROR_MESSAGES.UNEXPECTED_ERROR );
			} );
	};

	const hasEmptyValue = () => {
		return ! fontFamily.trim() || ! label.trim();
	};

	const noValueChanged = () => {
		return fontFamily === variable.value && label === variable.label;
	};

	const hasErrors = () => {
		return !! errorMessage;
	};

	const isSubmitDisabled = noValueChanged() || hasEmptyValue() || hasErrors();

	return (
		<PopoverContentRefContextProvider>
			<PopoverBody height="auto">
				<PopoverHeader
					icon={ <TextIcon fontSize={ SIZE } /> }
					title={ __( 'Restore variable', 'elementor' ) }
					onClose={ onClose }
				/>

				<Divider />

				<PopoverContent p={ 2 }>
					<LabelField
						value={ label }
						error={ labelServerError }
						onChange={ ( value ) => {
							setLabel( value );
							setErrorMessage( '' );
						} }
					/>
					<FontField
						value={ fontFamily }
						onChange={ ( value ) => {
							setFontFamily( value );
							setErrorMessage( '' );
						} }
					/>

					{ errorMessage && <FormHelperText error>{ errorMessage }</FormHelperText> }
				</PopoverContent>

				<CardActions sx={ { pt: 0.5, pb: 1 } }>
					<Button size="small" variant="contained" disabled={ isSubmitDisabled } onClick={ handleUpdate }>
						{ __( 'Restore', 'elementor' ) }
					</Button>
				</CardActions>
			</PopoverBody>
		</PopoverContentRefContextProvider>
	);
};

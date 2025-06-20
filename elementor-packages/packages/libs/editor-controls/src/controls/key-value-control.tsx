import * as React from 'react';
import { type ChangeEvent, useMemo, useState } from 'react';
import { keyValuePropTypeUtil } from '@elementor/editor-props';
import { FormHelperText, FormLabel, Grid, TextField } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useBoundProp } from '../bound-prop-context';
import ControlActions from '../control-actions/control-actions';
import { createControl } from '../create-control';

type FieldType = 'key' | 'value';

type KeyValueControlProps = {
	keyName?: string;
	valueName?: string;
	regexKey?: string;
	regexValue?: string;
	validationErrorMessage?: string;
};

export const KeyValueControl = createControl( ( props: KeyValueControlProps = {} ) => {
	const { value, setValue } = useBoundProp( keyValuePropTypeUtil );
	const [ keyError, setKeyError ] = useState< string | null >( null );
	const [ valueError, setValueError ] = useState< string | null >( null );

	const [ sessionState, setSessionState ] = useState( {
		key: value?.key?.value || '',
		value: value?.value?.value || '',
	} );

	const keyLabel = props.keyName || __( 'Key', 'elementor' );
	const valueLabel = props.valueName || __( 'Value', 'elementor' );

	const [ keyRegex, valueRegex, errMsg ] = useMemo< [ RegExp | undefined, RegExp | undefined, string ] >(
		() => [
			props.regexKey ? new RegExp( props.regexKey ) : undefined,
			props.regexValue ? new RegExp( props.regexValue ) : undefined,
			props.validationErrorMessage || __( 'Invalid Format', 'elementor' ),
		],
		[ props.regexKey, props.regexValue, props.validationErrorMessage ]
	);

	const validate = ( newValue: string, fieldType: string ): boolean => {
		if ( fieldType === 'key' && keyRegex ) {
			const isValid = keyRegex.test( newValue );
			setKeyError( isValid ? null : errMsg );
			return isValid;
		} else if ( fieldType === 'value' && valueRegex ) {
			const isValid = valueRegex.test( newValue );
			setValueError( isValid ? null : errMsg );
			return isValid;
		}
		return true;
	};

	const handleChange = ( event: ChangeEvent< HTMLInputElement >, fieldType: FieldType ) => {
		const newValue = event.target.value;

		setSessionState( ( prev ) => ( {
			...prev,
			[ fieldType ]: newValue,
		} ) );

		if ( validate( newValue, fieldType ) ) {
			setValue( {
				...value,
				[ fieldType ]: {
					value: newValue,
					$$type: 'string',
				},
			} );
		} else {
			setValue( {
				...value,
				[ fieldType ]: {
					value: '',
					$$type: 'string',
				},
			} );
		}
	};

	const isKeyInvalid = keyError !== null;
	const isValueInvalid = valueError !== null;

	return (
		<ControlActions>
			<Grid container gap={ 1.5 }>
				<Grid item xs={ 12 }>
					<FormLabel size="tiny">{ keyLabel }</FormLabel>
					<TextField
						// eslint-disable-next-line jsx-a11y/no-autofocus
						autoFocus
						sx={ { pt: 1 } }
						size="tiny"
						fullWidth
						value={ sessionState.key }
						onChange={ ( e: ChangeEvent< HTMLInputElement > ) => handleChange( e, 'key' ) }
						error={ isKeyInvalid }
					/>
					{ isKeyInvalid && <FormHelperText error>{ keyError }</FormHelperText> }
				</Grid>
				<Grid item xs={ 12 }>
					<FormLabel size="tiny">{ valueLabel }</FormLabel>
					<TextField
						sx={ { pt: 1 } }
						size="tiny"
						fullWidth
						value={ sessionState.value }
						onChange={ ( e: ChangeEvent< HTMLInputElement > ) => handleChange( e, 'value' ) }
						disabled={ isKeyInvalid }
						error={ isValueInvalid }
					/>
					{ isValueInvalid && <FormHelperText error>{ valueError }</FormHelperText> }
				</Grid>
			</Grid>
		</ControlActions>
	);
} );

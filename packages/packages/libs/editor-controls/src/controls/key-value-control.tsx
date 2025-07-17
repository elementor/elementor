import * as React from 'react';
import { useMemo, useState } from 'react';
import {
	type CreateOptions,
	isTransformable,
	keyValuePropTypeUtil,
	type PropKey,
	type Props,
	stringPropTypeUtil,
} from '@elementor/editor-props';
import { FormHelperText, FormLabel, Grid } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { PropKeyProvider, PropProvider, useBoundProp } from '../bound-prop-context';
import { createControl } from '../create-control';
import { TextControl } from './text-control';

type KeyValueControlProps = {
	keyName?: string;
	valueName?: string;
	regexKey?: string;
	regexValue?: string;
	validationErrorMessage?: string;
};

export const KeyValueControl = createControl( ( props: KeyValueControlProps = {} ) => {
	const { value, setValue, ...propContext } = useBoundProp( keyValuePropTypeUtil );
	const [ keyError, setKeyError ] = useState< string >( '' );
	const [ valueError, setValueError ] = useState< string >( '' );

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
			setKeyError( isValid ? '' : errMsg );

			return isValid;
		} else if ( fieldType === 'value' && valueRegex ) {
			const isValid = valueRegex.test( newValue );
			setValueError( isValid ? '' : errMsg );

			return isValid;
		}

		return true;
	};

	const handleChange = ( newValue: Props, options?: CreateOptions, meta?: { bind?: PropKey } ) => {
		const fieldType = meta?.bind;

		if ( ! fieldType ) {
			return;
		}

		const newChangedValue = newValue[ fieldType ];

		if ( isTransformable( newChangedValue ) && newChangedValue.$$type === 'dynamic' ) {
			setValue( {
				...value,
				[ fieldType ]: newChangedValue,
			} );

			return;
		}

		const extractedValue = stringPropTypeUtil.extract( newChangedValue );

		setSessionState( ( prev ) => ( {
			...prev,
			[ fieldType ]: extractedValue,
		} ) );

		if ( extractedValue && validate( extractedValue, fieldType ) ) {
			setValue( {
				...value,
				[ fieldType ]: newChangedValue,
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

	return (
		<PropProvider { ...propContext } value={ value } setValue={ handleChange }>
			<Grid container gap={ 1.5 }>
				<Grid item xs={ 12 } display="flex" flexDirection="column">
					<FormLabel size="tiny" sx={ { pb: 1 } }>
						{ keyLabel }
					</FormLabel>
					<PropKeyProvider bind={ 'key' }>
						<TextControl inputValue={ sessionState.key } error={ !! keyError } />
					</PropKeyProvider>
					{ !! keyError && <FormHelperText error>{ keyError }</FormHelperText> }
				</Grid>
				<Grid item xs={ 12 } display="flex" flexDirection="column">
					<FormLabel size="tiny" sx={ { pb: 1 } }>
						{ valueLabel }
					</FormLabel>
					<PropKeyProvider bind={ 'value' }>
						<TextControl
							inputValue={ sessionState.value }
							error={ !! valueError }
							inputDisabled={ !! keyError }
						/>
					</PropKeyProvider>
					{ !! valueError && <FormHelperText error>{ valueError }</FormHelperText> }
				</Grid>
			</Grid>
		</PropProvider>
	);
} );

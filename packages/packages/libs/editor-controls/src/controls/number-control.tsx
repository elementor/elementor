import * as React from 'react';
import { numberPropTypeUtil, type PropType } from '@elementor/editor-props';
import { InputAdornment, Typography } from '@elementor/ui';

import { useBoundProp } from '../bound-prop-context';
import { NumberInput } from '../components/number-input';
import ControlActions from '../control-actions/control-actions';
import { createControl } from '../create-control';

const isEmptyOrNaN = ( value?: string | number | null ) =>
	value === null || value === undefined || value === '' || Number.isNaN( Number( value ) );

const renderSuffix = ( propType: PropType ) => {
	if ( propType.meta?.suffix ) {
		return (
			<InputAdornment position="end">
				<Typography variant="caption" color="text.secondary">
					{ propType.meta.suffix as string }
				</Typography>
			</InputAdornment>
		);
	}
	return <></>;
};

export const NumberControl = createControl(
	( {
		placeholder: labelPlaceholder,
		max = Number.MAX_SAFE_INTEGER,
		min = -Number.MAX_SAFE_INTEGER,
		step = 1,
		shouldForceInt = false,
		startIcon,
		/** When true, disables the input in addition to the bound prop’s edit state (e.g. dependent UI lock). */
		isLocked,
	}: {
		placeholder?: string;
		max?: number;
		min?: number;
		step?: number;
		shouldForceInt?: boolean;
		startIcon?: React.ReactNode;
		isLocked?: boolean;
	} ) => {
		const { value, setValue, placeholder, disabled, restoreValue, propType } = useBoundProp( numberPropTypeUtil );
		const isDisabled = Boolean( disabled || isLocked );

		const handleChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
			const {
				value: eventValue,
				validity: { valid: isInputValid },
			} = event.target;

			let updatedValue;

			if ( isEmptyOrNaN( eventValue ) ) {
				updatedValue = null;
			} else {
				const formattedValue = shouldForceInt ? +parseInt( eventValue ) : Number( eventValue );

				updatedValue = Math.min(
					Math.max( formattedValue, min ?? Number.MIN_SAFE_INTEGER ),
					max ?? Number.MAX_SAFE_INTEGER
				);
			}

			setValue( updatedValue, undefined, { validation: () => isInputValid } );
		};

		return (
			<ControlActions>
				<NumberInput
					size="tiny"
					type="number"
					fullWidth
					disabled={ isDisabled }
					value={ isEmptyOrNaN( value ) ? '' : value }
					onInput={ handleChange }
					onBlur={ restoreValue }
					placeholder={ labelPlaceholder ?? ( isEmptyOrNaN( placeholder ) ? '' : String( placeholder ) ) }
					inputProps={ { step, min } }
					InputProps={ {
						startAdornment: startIcon ? (
							<InputAdornment position="start" disabled={ isDisabled }>
								{ startIcon }
							</InputAdornment>
						) : undefined,
						endAdornment: renderSuffix( propType ),
					} }
				/>
			</ControlActions>
		);
	}
);

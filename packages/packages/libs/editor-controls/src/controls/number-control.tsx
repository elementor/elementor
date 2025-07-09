import * as React from 'react';
import { numberPropTypeUtil } from '@elementor/editor-props';
import { InputAdornment, TextField } from '@elementor/ui';

import { useBoundProp } from '../bound-prop-context';
import ControlActions from '../control-actions/control-actions';
import { createControl } from '../create-control';

const isEmptyOrNaN = ( value?: string | number | null ) =>
	value === null || value === undefined || value === '' || Number.isNaN( Number( value ) );

const RESTRICTED_INPUT_KEYS = [ 'e', 'E', '+', '-' ];

export const NumberControl = createControl(
	( {
		placeholder: labelPlaceholder,
		max = Number.MAX_VALUE,
		min = -Number.MAX_VALUE,
		step = 1,
		shouldForceInt = false,
		startIcon,
	}: {
		placeholder?: string;
		max?: number;
		min?: number;
		step?: number;
		shouldForceInt?: boolean;
		startIcon?: React.ReactNode;
	} ) => {
		const { value, setValue, placeholder, disabled } = useBoundProp( numberPropTypeUtil );

		const handleChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
			const eventValue: string = event.target.value;

			if ( isEmptyOrNaN( eventValue ) ) {
				setValue( null );

				return;
			}

			const formattedValue = shouldForceInt ? +parseInt( eventValue ) : Number( eventValue );

			setValue( Math.min( Math.max( formattedValue, min ), max ) );
		};

		return (
			<ControlActions>
				<TextField
					size="tiny"
					type="number"
					fullWidth
					disabled={ disabled }
					value={ isEmptyOrNaN( value ) ? '' : value }
					onChange={ handleChange }
					placeholder={ labelPlaceholder ?? ( placeholder ? String( placeholder ) : '' ) }
					inputProps={ { step } }
					InputProps={ {
						startAdornment: startIcon ? (
							<InputAdornment position="start" disabled={ disabled }>
								{ startIcon }
							</InputAdornment>
						) : undefined,
					} }
					onKeyDown={ ( event: KeyboardEvent ) => {
						if ( RESTRICTED_INPUT_KEYS.includes( event.key ) ) {
							event.preventDefault();
						}
					} }
				/>
			</ControlActions>
		);
	}
);

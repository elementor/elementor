import * as React from 'react';
import { numberPropTypeUtil } from '@elementor/editor-props';
import { TextField } from '@elementor/ui';

import { useBoundProp } from '../bound-prop-context';
import ControlActions from '../control-actions/control-actions';
import { createControl } from '../create-control';

const isEmptyOrNaN = ( value?: string | number | null ) =>
	value === null || value === undefined || value === '' || Number.isNaN( Number( value ) );

const RESTRICTED_INPUT_KEYS = [ 'e', 'E', '+', '-' ];

export const NumberControl = createControl(
	( {
		placeholder,
		max = Number.MAX_VALUE,
		min = -Number.MAX_VALUE,
		step = 1,
		shouldForceInt = false,
	}: {
		placeholder?: string;
		max?: number;
		min?: number;
		step?: number;
		shouldForceInt?: boolean;
	} ) => {
		const { value, setValue, disabled } = useBoundProp( numberPropTypeUtil );

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
					placeholder={ placeholder }
					inputProps={ { step } }
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

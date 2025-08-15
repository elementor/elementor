import * as React from 'react';
import { numberPropTypeUtil } from '@elementor/editor-props';
import { InputAdornment } from '@elementor/ui';

import { useBoundProp } from '../bound-prop-context';
import { NumberInput } from '../components/number-input';
import ControlActions from '../control-actions/control-actions';
import { createControl } from '../create-control';

const isEmptyOrNaN = ( value?: string | number | null ) =>
	value === null || value === undefined || value === '' || Number.isNaN( Number( value ) );

export const NumberControl = createControl(
	( {
		placeholder: labelPlaceholder,
		max = Number.MAX_VALUE,
		min = -Number.MAX_VALUE,
		step = 'any',
		shouldForceInt = false,
		startIcon,
	}: {
		placeholder?: string;
		max?: number;
		min?: number;
		step?: number | 'any';
		shouldForceInt?: boolean;
		startIcon?: React.ReactNode;
	} ) => {
		const { value, setValue, placeholder, disabled } = useBoundProp( numberPropTypeUtil );

		return (
			<ControlActions>
				<NumberInput
					size="tiny"
					fullWidth
					disabled={ disabled }
					value={ value }
					onChange={ setValue }
					placeholder={ labelPlaceholder ?? ( isEmptyOrNaN( placeholder ) ? '' : String( placeholder ) ) }
					max={ max }
					min={ min }
					step={ step ?? shouldForceInt ? 1 : 'any' }
					inputProps={ { step } }
					InputProps={ {
						startAdornment: startIcon ? (
							<InputAdornment position="start" disabled={ disabled }>
								{ startIcon }
							</InputAdornment>
						) : undefined,
					} }
				/>
			</ControlActions>
		);
	}
);

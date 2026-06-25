import * as React from 'react';
import { spanPropTypeUtil } from '@elementor/editor-props';
import { type SxProps, TextField } from '@elementor/ui';

import { useBoundProp } from '../bound-prop-context';
import ControlActions from '../control-actions/control-actions';
import { createControl } from '../create-control';

export const GridSpanControl = createControl(
	( {
		placeholder: propPlaceholder,
		error,
		inputValue,
		inputDisabled,
		helperText,
		sx,
		ariaLabel,
	}: {
		placeholder?: string;
		error?: boolean;
		inputValue?: string;
		inputDisabled?: boolean;
		helperText?: string;
		sx?: SxProps;
		ariaLabel?: string;
	} ) => {
		const { value, setValue, disabled, placeholder: boundPlaceholder } = useBoundProp( spanPropTypeUtil );
		const handleChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
			const next = event.target.value;
			setValue( next === '' ? null : next );
		};

		const placeholder = propPlaceholder ?? boundPlaceholder ?? `e.g: 'span 2' or '1 / 3'`;

		return (
			<ControlActions>
				<TextField
					size="tiny"
					fullWidth
					disabled={ inputDisabled ?? disabled }
					value={ inputValue ?? value ?? '' }
					onChange={ handleChange }
					placeholder={ placeholder }
					error={ error }
					helperText={ helperText }
					sx={ sx }
					inputProps={ {
						...( ariaLabel ? { 'aria-label': ariaLabel } : {} ),
					} }
				/>
			</ControlActions>
		);
	}
);

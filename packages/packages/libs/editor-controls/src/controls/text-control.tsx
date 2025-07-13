import * as React from 'react';
import { stringPropTypeUtil } from '@elementor/editor-props';
import { type SxProps, TextField } from '@elementor/ui';

import { useBoundProp } from '../bound-prop-context';
import ControlActions from '../control-actions/control-actions';
import { createControl } from '../create-control';

export const TextControl = createControl(
	( {
		placeholder,
		error,
		inputValue,
		inputDisabled,
		sx,
	}: {
		placeholder?: string;
		error?: boolean;
		inputValue?: string;
		inputDisabled?: boolean;
		sx?: SxProps;
	} ) => {
		const { value, setValue, disabled } = useBoundProp( stringPropTypeUtil );
		const handleChange = ( event: React.ChangeEvent< HTMLInputElement > ) => setValue( event.target.value );

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
					sx={ sx }
				/>
			</ControlActions>
		);
	}
);

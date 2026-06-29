import * as React from 'react';
import { urlPropTypeUtil } from '@elementor/editor-props';
import { TextField } from '@elementor/ui';

import { useBoundProp } from '../bound-prop-context';
import ControlActions from '../control-actions/control-actions';
import { createControl } from '../create-control';

export const UrlControl = createControl(
	( { placeholder: propPlaceholder, ariaLabel }: { placeholder?: string; ariaLabel?: string } ) => {
		const { value, setValue, disabled, placeholder: boundPlaceholder } = useBoundProp( urlPropTypeUtil );
		const handleChange = ( event: React.ChangeEvent< HTMLInputElement > ) => setValue( event.target.value );

		const placeholder = propPlaceholder ?? boundPlaceholder ?? undefined;

		return (
			<ControlActions>
				<TextField
					size="tiny"
					fullWidth
					value={ value ?? '' }
					disabled={ disabled }
					onChange={ handleChange }
					placeholder={ placeholder }
					inputProps={ {
						...( ariaLabel ? { 'aria-label': ariaLabel } : {} ),
					} }
				/>
			</ControlActions>
		);
	}
);

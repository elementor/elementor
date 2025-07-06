import * as React from 'react';
import { urlPropTypeUtil } from '@elementor/editor-props';
import { TextField } from '@elementor/ui';

import { useBoundProp } from '../bound-prop-context';
import ControlActions from '../control-actions/control-actions';
import { createControl } from '../create-control';

export const UrlControl = createControl( ( { placeholder }: { placeholder?: string } ) => {
	const { value, setValue, disabled } = useBoundProp( urlPropTypeUtil );
	const handleChange = ( event: React.ChangeEvent< HTMLInputElement > ) => setValue( event.target.value );

	return (
		<ControlActions>
			<TextField
				size="tiny"
				fullWidth
				value={ value ?? '' }
				disabled={ disabled }
				onChange={ handleChange }
				placeholder={ placeholder }
			/>
		</ControlActions>
	);
} );

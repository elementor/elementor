import * as React from 'react';
import { stringPropTypeUtil } from '@elementor/editor-props';
import { TextField } from '@elementor/ui';

import { useBoundProp } from '../bound-prop-context';
import ControlActions from '../control-actions/control-actions';
import { createControl } from '../create-control';

type Props = {
	placeholder?: string;
};

export const TextAreaControl = createControl( ( { placeholder }: Props ) => {
	const { value, setValue, disabled } = useBoundProp( stringPropTypeUtil );

	const handleChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		setValue( event.target.value );
	};

	return (
		<ControlActions>
			<TextField
				size="tiny"
				multiline
				fullWidth
				minRows={ 5 }
				disabled={ disabled }
				value={ value ?? '' }
				onChange={ handleChange }
				placeholder={ placeholder }
			/>
		</ControlActions>
	);
} );

import * as React from 'react';
import { booleanPropTypeUtil } from '@elementor/editor-props';
import { Switch } from '@elementor/ui';

import { useBoundProp } from '../bound-prop-context/use-bound-prop';
import { createControl } from '../create-control';

export const SwitchControl = createControl( () => {
	const { value, setValue, disabled } = useBoundProp( booleanPropTypeUtil );

	const handleChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		setValue( event.target.checked );
	};

	return (
		<div style={ { display: 'flex', justifyContent: 'flex-end' } }>
			<Switch checked={ !! value } onChange={ handleChange } size="small" disabled={ disabled } />
		</div>
	);
} );

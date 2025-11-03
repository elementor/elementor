import * as React from 'react';
import { stringPropTypeUtil } from '@elementor/editor-props';

import { useBoundProp } from '../bound-prop-context';
import { InlineEditor } from '../components/inline-editor';
import ControlActions from '../control-actions/control-actions';
import { createControl } from '../create-control';

export const WysiwygControl = createControl( () => {
	const { value, setValue } = useBoundProp( stringPropTypeUtil );
	const handleChange = ( newValue: unknown ) => setValue( newValue as string );

	return (
		<ControlActions>
			<div>
				<InlineEditor value={ value } setValue={ handleChange } />
			</div>
		</ControlActions>
	);
} );

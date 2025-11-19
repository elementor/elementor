import * as React from 'react';
import { htmlPropTypeUtil } from '@elementor/editor-props';

import { useBoundProp } from '../bound-prop-context';
import { InlineEditor } from '../components/inline-editor';
import ControlActions from '../control-actions/control-actions';
import { createControl } from '../create-control';

export const InlineEditingControl = createControl( () => {
	const { value, setValue } = useBoundProp( htmlPropTypeUtil );
	const handleChange = ( newValue: unknown ) => setValue( newValue as string );

	return (
		<ControlActions>
			<InlineEditor value={ value || '' } setValue={ handleChange } />
		</ControlActions>
	);
} );

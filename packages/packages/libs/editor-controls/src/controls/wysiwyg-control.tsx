import * as React from 'react';
import { stringPropTypeUtil } from '@elementor/editor-props';
import { Box } from '@elementor/ui';

import { useBoundProp } from '../bound-prop-context';
import { InlineEditor } from '../components/inline-editor';
import ControlActions from '../control-actions/control-actions';
import { createControl } from '../create-control';

export const WysiwygControl = createControl( () => {
	const { value, setValue } = useBoundProp( stringPropTypeUtil );
	const handleChange = ( newValue: unknown ) => setValue( newValue as string );

	return (
		<ControlActions>
			<Box>
				<InlineEditor value={ value || '' } setValue={ handleChange } />
			</Box>
		</ControlActions>
	);
} );

import * as React from 'react';
import { type PropType } from '@elementor/editor-props';

import { useControlAdornments } from './control-adornments-context';
import { Stack } from '@elementor/ui';

export function ControlAdornments( {
	customContext,
}: {
	customContext?: {
		path: string[];
		propType: PropType;
	};
} ) {
	const items = useControlAdornments();

	if ( items?.length === 0 ) {
		return null;
	}

	return (
		<Stack direction="row" gap={ 0.5 }>
			{ items.map( ( { Adornment, id } ) => (
				<Adornment key={ id } customContext={ customContext } />
			) ) }
		</Stack>
	);
}

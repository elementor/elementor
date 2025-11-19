import * as React from 'react';
import { type PropType } from '@elementor/editor-props';
import { Stack } from '@elementor/ui';

import { useControlAdornments } from './control-adornments-context';

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

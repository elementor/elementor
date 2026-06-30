import * as React from 'react';
import { type PropType } from '@elementor/editor-props';

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
		<>
			{ items.map( ( { Adornment, id } ) => (
				<Adornment key={ id } customContext={ customContext } />
			) ) }
		</>
	);
}

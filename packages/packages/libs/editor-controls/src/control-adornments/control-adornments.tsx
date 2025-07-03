import * as React from 'react';

import { useControlAdornments } from './control-adornments-context';

export function ControlAdornments() {
	const items = useControlAdornments();

	if ( items?.length === 0 ) {
		return null;
	}

	return (
		<>
			{ items.map( ( { Adornment, id } ) => (
				<Adornment key={ id } />
			) ) }
		</>
	);
}

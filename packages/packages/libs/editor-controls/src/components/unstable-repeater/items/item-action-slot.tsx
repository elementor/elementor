import type * as React from 'react';

import { useRepeaterContext } from '../context/repeater-context';

export const ItemActionSlot = ( { children }: { children: React.ComponentType< { index: number } > } ) => {
	const {
		config: {
			itemActions: { inject },
		},
	} = useRepeaterContext();

	inject( children );

	return null;
};

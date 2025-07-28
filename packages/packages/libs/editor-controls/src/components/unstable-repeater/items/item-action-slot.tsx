import type * as React from 'react';

import { useRepeaterContext } from '../context/repeater-context';

export const ItemActionSlot = ( ( {
	children,
	actionName,
}: {
	children: React.ComponentType< { index: number } >;
	actionName: string;
} ) => {
	const {
		config: {
			itemActions: { inject },
		},
	} = useRepeaterContext();

	inject( children, actionName );

	return null;
} ) as React.FC;

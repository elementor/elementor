import * as React from 'react';
import { Box } from '@elementor/ui';

import { useFloatingPanelDrag } from '../../hooks/use-floating-panel-drag';

type Props = {
	panelId: string;
	children: React.ReactNode;
};

export default function DragHandle( { panelId, children }: Props ) {
	const { onPointerDown, onPointerMove, onPointerUp } = useFloatingPanelDrag( panelId );

	return (
		<Box
			onPointerDown={ onPointerDown }
			onPointerMove={ onPointerMove }
			onPointerUp={ onPointerUp }
			sx={ { cursor: 'move', touchAction: 'none', flex: 1 } }
		>
			{ children }
		</Box>
	);
}

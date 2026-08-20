import * as React from 'react';
import { type ReactNode } from 'react';
import { Box } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useFloatingPanelDrag } from '../../hooks/use-floating-panel-drag';

type Props = {
	panelId: string;
	children: ReactNode;
};

export default function DragHandle( { panelId, children }: Props ) {
	const { onPointerDown, onPointerMove, onPointerUp, onPointerCancel } = useFloatingPanelDrag( panelId );

	return (
		<Box
			role="button"
			aria-label={ __( 'Drag to reposition', 'elementor' ) }
			onPointerDown={ onPointerDown }
			onPointerMove={ onPointerMove }
			onPointerUp={ onPointerUp }
			onPointerCancel={ onPointerCancel }
			sx={ { cursor: 'move', touchAction: 'none', flex: 1 } }
		>
			{ children }
		</Box>
	);
}

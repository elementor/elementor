import * as React from 'react';
import { Box } from '@elementor/ui';

import { useFloatingPanelResize } from '../../hooks/use-floating-panel-resize';
import { type ResizeEdge } from '../../lib/resize-math';

const HANDLE_THICKNESS_PX = 8;

const EDGE_SX: Record< ResizeEdge, object > = {
	'inline-start': {
		insetBlockStart: 0,
		insetBlockEnd: 0,
		insetInlineStart: 0,
		inlineSize: `${ HANDLE_THICKNESS_PX }px`,
		cursor: 'ew-resize',
	},
	'inline-end': {
		insetBlockStart: 0,
		insetBlockEnd: 0,
		insetInlineEnd: 0,
		inlineSize: `${ HANDLE_THICKNESS_PX }px`,
		cursor: 'ew-resize',
	},
	'block-start': {
		insetInlineStart: 0,
		insetInlineEnd: 0,
		insetBlockStart: 0,
		blockSize: `${ HANDLE_THICKNESS_PX }px`,
		cursor: 'ns-resize',
	},
	'block-end': {
		insetInlineStart: 0,
		insetInlineEnd: 0,
		insetBlockEnd: 0,
		blockSize: `${ HANDLE_THICKNESS_PX }px`,
		cursor: 'ns-resize',
	},
};

type Props = {
	panelId: string;
	edge: ResizeEdge;
};

export default function ResizeHandle( { panelId, edge }: Props ) {
	const { onPointerDown, onPointerMove, onPointerUp } = useFloatingPanelResize( panelId, edge );

	return (
		<Box
			data-resize-edge={ edge }
			aria-hidden="true"
			onPointerDown={ onPointerDown }
			onPointerMove={ onPointerMove }
			onPointerUp={ onPointerUp }
			sx={ { position: 'absolute', touchAction: 'none', zIndex: 1, ...EDGE_SX[ edge ] } }
		/>
	);
}
